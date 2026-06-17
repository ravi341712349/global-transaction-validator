import os
import uuid
import zipfile
import pandas as pd
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException, Body, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from typing import Dict, List, Any

# Internal modules
from storage import (
    save_uploaded_file, get_upload_path, get_processed_path,
    read_settings, write_settings, read_history, add_history_entry
)
from engine import validate_dataframe, clean_dataframe, split_dataframe
from schemas import SettingsSchema, ValidationResponse, ValidationError

app = FastAPI(
    title="Global Transaction Validator API",
    description="Production-ready CSV transaction validation, cleaning, and chunk splitting service.",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 500 * 1024 * 1024 # 500MB

# Helper to find file metadata from file_id in history
def find_file_in_history(file_id: str) -> Dict[str, Any]:
    history = read_history()
    for item in history:
        if item.get("file_id") == file_id:
            return item
    raise HTTPException(status_code=404, detail="File ID not found in processing history.")

@app.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_file(file: UploadFile = File(...)):
    # 1. Validate file extension
    if not file.filename.lower().endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")
    
    file_id = str(uuid.uuid4())
    safe_filename = f"{file_id}_{file.filename}"
    upload_path = get_upload_path(safe_filename)
    
    # 2. Stream upload to disk to save memory (Max 500MB validation)
    total_bytes = 0
    try:
        with open(upload_path, "wb") as buffer:
            while True:
                chunk = await file.read(1024 * 1024) # Read in 1MB chunks
                if not chunk:
                    break
                total_bytes += len(chunk)
                if total_bytes > MAX_FILE_SIZE:
                    # Clean up file and raise size limit error
                    buffer.close()
                    if os.path.exists(upload_path):
                        os.remove(upload_path)
                    raise HTTPException(status_code=413, detail="File size exceeds maximum limit of 500MB.")
                buffer.write(chunk)
    except Exception as e:
        if not isinstance(e, HTTPException):
            if os.path.exists(upload_path):
                os.remove(upload_path)
            raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
        raise e
        
    # 3. Read total rows in the CSV
    try:
        # We read in chunks of 50,000 to count rows memory-efficiently
        row_count = 0
        for chunk in pd.read_csv(upload_path, chunksize=50000, usecols=[0]):
            row_count += len(chunk)
    except Exception as e:
        if os.path.exists(upload_path):
            os.remove(upload_path)
        raise HTTPException(status_code=400, detail=f"Invalid CSV structure: {str(e)}")

    # 4. Save metadata to history
    metadata = {
        "file_id": file_id,
        "filename": file.filename,
        "size_bytes": total_bytes,
        "total_rows": row_count,
        "upload_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "status": "Uploaded"
    }
    add_history_entry(metadata)
    
    return metadata

@app.post("/validate", response_model=ValidationResponse)
async def validate_file(payload: Dict[str, str] = Body(...)):
    file_id = payload.get("file_id")
    if not file_id:
        raise HTTPException(status_code=400, detail="file_id is required.")
        
    metadata = find_file_in_history(file_id)
    safe_filename = f"{file_id}_{metadata['filename']}"
    file_path = get_upload_path(safe_filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Uploaded file missing on server.")
        
    settings = read_settings()
    
    # Load and validate file
    try:
        df = pd.read_csv(file_path)
        errors, summary = validate_dataframe(df, settings)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error validating file: {str(e)}")
        
    # Update history with validation details
    metadata.update({
        "status": "Validated",
        "success_rate": summary["success_rate"],
        "total_errors": summary["total_errors"]
    })
    add_history_entry(metadata)
    
    return {
        "file_id": file_id,
        "filename": metadata["filename"],
        "total_records": summary["total_records"],
        "valid_records": summary["valid_records"],
        "invalid_records": summary["invalid_records"],
        "success_rate": summary["success_rate"],
        "total_errors": summary["total_errors"],
        "errors": errors,
        "errors_by_field": summary["errors_by_field"],
        "errors_by_type": summary["errors_by_type"],
        "country_stats": summary["country_stats"]
    }

@app.post("/clean")
async def clean_file(payload: Dict[str, str] = Body(...)):
    file_id = payload.get("file_id")
    if not file_id:
        raise HTTPException(status_code=400, detail="file_id is required.")
        
    metadata = find_file_in_history(file_id)
    safe_filename = f"{file_id}_{metadata['filename']}"
    file_path = get_upload_path(safe_filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Uploaded file missing on server.")
        
    settings = read_settings()
    
    # Clean the CSV
    try:
        df = pd.read_csv(file_path)
        cleaned_df, invalid_df = clean_dataframe(df, settings)
        
        # Save results
        cleaned_filename = f"cleaned_{safe_filename}"
        invalid_filename = f"invalid_{safe_filename}"
        cleaned_path = get_processed_path(cleaned_filename)
        invalid_path = get_processed_path(invalid_filename)
        
        cleaned_df.to_csv(cleaned_path, index=False)
        invalid_df.to_csv(invalid_path, index=False)
        
        # Generate ZIP package containing both
        zip_filename = f"processed_{file_id}.zip"
        zip_path = get_processed_path(zip_filename)
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            if len(cleaned_df) > 0:
                zip_file.write(cleaned_path, arcname=f"cleaned_{metadata['filename']}")
            if len(invalid_df) > 0:
                zip_file.write(invalid_path, arcname=f"invalid_{metadata['filename']}")
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error cleaning file: {str(e)}")
        
    # Update history with links
    metadata.update({
        "status": "Processed",
        "cleaned_file_link": f"/download/cleaned_{safe_filename}",
        "invalid_file_link": f"/download/invalid_{safe_filename}",
        "zip_file_link": f"/download/{zip_filename}"
    })
    add_history_entry(metadata)
    
    return {
        "status": "Success",
        "cleaned_file_link": metadata["cleaned_file_link"],
        "invalid_file_link": metadata["invalid_file_link"],
        "zip_file_link": metadata["zip_file_link"]
    }

@app.post("/split")
async def split_file(payload: Dict[str, Any] = Body(...)):
    file_id = payload.get("file_id")
    custom_chunk = payload.get("chunk_size")
    
    if not file_id:
        raise HTTPException(status_code=400, detail="file_id is required.")
        
    metadata = find_file_in_history(file_id)
    safe_filename = f"{file_id}_{metadata['filename']}"
    
    # We prefer the cleaned version to split. If it was already cleaned, use it.
    cleaned_filename = f"cleaned_{safe_filename}"
    cleaned_path = get_processed_path(cleaned_filename)
    
    source_path = cleaned_path if os.path.exists(cleaned_path) else get_upload_path(safe_filename)
    
    if not os.path.exists(source_path):
        raise HTTPException(status_code=404, detail="File missing on server. Run /clean first.")
        
    settings = read_settings()
    chunk_size = int(custom_chunk) if custom_chunk else settings.get("chunk_size", 10000)
    
    try:
        df = pd.read_csv(source_path)
        chunks = split_dataframe(df, chunk_size)
        
        split_links = []
        base_name, ext = os.path.splitext(metadata['filename'])
        
        # If there are split files, let's write them
        for i, chunk_df in enumerate(chunks):
            part_name = f"split_{file_id}_{base_name}_part_{i+1}{ext}"
            part_path = get_processed_path(part_name)
            chunk_df.to_csv(part_path, index=False)
            split_links.append(f"/download/{part_name}")
            
        # Append split files to ZIP package if ZIP already exists, or create new ZIP
        zip_filename = f"processed_{file_id}.zip"
        zip_path = get_processed_path(zip_filename)
        
        # Write/Update ZIP file with the split parts
        with zipfile.ZipFile(zip_path, 'a' if os.path.exists(zip_path) else 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for i, chunk_df in enumerate(chunks):
                part_name = f"split_{file_id}_{base_name}_part_{i+1}{ext}"
                part_path = get_processed_path(part_name)
                # Overwrite/Add in ZIP
                zip_file.write(part_path, arcname=f"{base_name}_part_{i+1}{ext}")
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error splitting file: {str(e)}")
        
    metadata.update({
        "status": "Processed",
        "split_files_links": split_links,
        "zip_file_link": f"/download/{zip_filename}"
    })
    add_history_entry(metadata)
    
    return {
        "status": "Success",
        "split_files_links": split_links,
        "zip_file_link": metadata["zip_file_link"]
    }

@app.get("/sample-csv")
async def get_sample_csv():
    import random
    rows = []
    
    customers = ["John Doe", "Alice Tan", "Rahul Sharma", "Emily Smith", "David Jones", "Yuki Tanaka", "Chen Wei", "Sarah Connor"]
    countries = ["IN", "SG", "US", "UK"]
    phone_prefixes = {"IN": "98765", "SG": "8123", "US": "2025", "UK": "7700"}
    phone_lens = {"IN": 10, "SG": 8, "US": 10, "UK": 10}
    
    products = [
        {"id": "PROD001", "name": "Laptop", "price": 50000.0},
        {"id": "PROD002", "name": "Mouse", "price": 1000.0},
        {"id": "PROD003", "name": "Keyboard", "price": 2500.0},
        {"id": "PROD004", "name": "Monitor", "price": 15000.0},
        {"id": "PROD005", "name": "Headphones", "price": 5000.0}
    ]
    
    payment_modes = ["Credit Card", "PayNow", "UPI", "PayPal", "Wallet", "Cash", "Net Banking"]
    unstd_payments = {
        "Credit Card": ["credit card", "CreditCard", "credit-card"],
        "PayNow": ["paynow", "Pay-Now", "pay_now"],
        "UPI": ["upi", "Upi"],
        "Net Banking": ["netbanking", "net-banking", "NetBanking"]
    }
    
    random.seed(42)
    
    for i in range(1, 25001):
        # Introduce duplicate Order IDs
        if i > 1 and i % 500 == 0:
            order_id = f"ORD{i-1:05d}"
        else:
            order_id = f"ORD{i:05d}"
            
        # Introduce date format anomalies
        if i % 600 == 0:
            order_date = "2026/13/45"
        elif i % 400 == 0:
            order_date = "15-01-2026"
        else:
            fmt_idx = i % 3
            day = (i % 28) + 1
            month = (i % 12) + 1
            if fmt_idx == 0:
                order_date = f"2026-{month:02d}-{day:02d}"
            elif fmt_idx == 1:
                order_date = f"{day:02d}/{month:02d}/2026"
            else:
                order_date = f"{month:02d}/{day:02d}/2026"
                
        # Introduce time format anomalies
        if i % 700 == 0:
            order_time = "25:61"
        else:
            hr = (i % 24)
            mn = (i % 60)
            sc = (i % 60)
            if i % 2 == 0:
                order_time = f"{hr:02d}:{mn:02d}:{sc:02d}"
            else:
                order_time = f"{hr:02d}:{mn:02d}"
                
        customer_name = customers[i % len(customers)]
        country = countries[i % len(countries)]
        prefix = phone_prefixes[country]
        rem_len = phone_lens[country] - len(prefix)
        phone = prefix + "".join(str((i + j) % 10) for j in range(rem_len))
        
        # Introduce phone number length anomalies
        if i % 800 == 0:
            phone = phone[:-2]
            
        product = products[i % len(products)]
        product_id = product["id"]
        product_name = product["name"]
        unit_price = product["price"]
        qty = (i % 5) + 1
        
        pm = payment_modes[i % len(payment_modes)]
        # Introduce unstandardized payment methods for cleaner testing
        if pm in unstd_payments and i % 10 == 0:
            pm = random.choice(unstd_payments[pm])
            
        total = qty * unit_price
        # Introduce calculations mismatch anomalies
        if i % 900 == 0:
            total += 50.0
            
        rows.append({
            "order_id": order_id,
            "order_date": order_date,
            "order_time": order_time,
            "customer_name": customer_name,
            "country_code": country,
            "phone_number": phone,
            "product_id": product_id,
            "product_name": product_name,
            "quantity": qty,
            "unit_price": unit_price,
            "payment_mode": pm,
            "total_amount": total
        })
        
    df = pd.DataFrame(rows)
    sample_path = get_processed_path("sample_transactions.csv")
    df.to_csv(sample_path, index=False)
    
    return FileResponse(
        sample_path, 
        media_type="text/csv", 
        filename="sample_transactions.csv"
    )

@app.get("/history")
async def get_history():
    return read_history()

@app.get("/settings", response_model=SettingsSchema)
async def get_settings():
    return read_settings()

@app.post("/settings", status_code=status.HTTP_200_OK)
async def update_settings(payload: SettingsSchema):
    write_settings(payload.model_dump())
    return {"status": "Success", "message": "Settings updated successfully."}

@app.get("/download/{file}")
async def download_file(file: str):
    # Prevent directory traversal attacks
    if ".." in file or "/" in file or "\\" in file:
        raise HTTPException(status_code=400, detail="Invalid filename.")
        
    processed_path = get_processed_path(file)
    upload_path = get_upload_path(file)
    
    if os.path.exists(processed_path):
        return FileResponse(processed_path, filename=file.split("_", 1)[-1] if "_" in file else file)
    elif os.path.exists(upload_path):
        return FileResponse(upload_path, filename=file.split("_", 1)[-1] if "_" in file else file)
        
    raise HTTPException(status_code=404, detail="Requested file not found on server.")
