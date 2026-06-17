import pandas as pd
import numpy as np
import re
import os
import math
from datetime import datetime
from typing import Dict, List, Tuple, Any

def normalize_string_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Removes leading/trailing whitespaces and hidden characters from all string columns."""
    df = df.copy()
    for col in df.columns:
        if df[col].dtype == 'object':
            # Convert to string, replace NaN/None with empty string, strip whitespace
            df[col] = df[col].astype(str).str.replace(r'[\r\n\t\x00-\x1F\x7F-\x9F]', '', regex=True).str.strip()
            # Replace string "nan" or "None" with empty string
            df[col] = df[col].replace({"nan": "", "None": "", "NaN": ""})
    return df

def map_payment_mode(val: str) -> str:
    """Standardizes variations of payment modes to their official name."""
    if not isinstance(val, str):
        return ""
    val_clean = val.lower().replace(" ", "").replace("-", "").replace("_", "")
    
    mapping = {
        "creditcard": "Credit Card",
        "debitcard": "Debit Card",
        "upi": "UPI",
        "paynow": "PayNow",
        "paypal": "PayPal",
        "wallet": "Wallet",
        "cash": "Cash",
        "netbanking": "Net Banking"
    }
    
    return mapping.get(val_clean, val) # Fallback to original value if no match

def validate_dataframe(df: pd.DataFrame, settings: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Validates a pandas DataFrame based on rules defined in the settings dictionary.
    Returns:
      - A list of error records (each with row_number, field_name, error_type, description)
      - A dictionary of validation statistics and aggregated analytics
    """
    errors = []
    total_records = len(df)
    
    if total_records == 0:
        return [], {
            "total_records": 0,
            "valid_records": 0,
            "invalid_records": 0,
            "success_rate": 100.0,
            "total_errors": 0,
            "errors_by_field": {},
            "errors_by_type": {},
            "country_stats": {}
        }
    
    # 1. Strip and clean basic string representation (non-modifying, just for checking)
    df_clean = normalize_string_columns(df)
    
    # Keep track of invalid row indices to count valid/invalid records
    invalid_rows = set()
    
    # Track statistics
    errors_by_field = {}
    errors_by_type = {}
    
    def log_error(row_idx: int, field: str, err_type: str, desc: str):
        row_num = row_idx + 2 # Excel row is 1-indexed and has a header (index 0 is row 2)
        errors.append({
            "row_number": row_num,
            "field_name": field,
            "error_type": err_type,
            "description": desc
        })
        invalid_rows.add(row_idx)
        errors_by_field[field] = errors_by_field.get(field, 0) + 1
        errors_by_type[err_type] = errors_by_type.get(err_type, 0) + 1

    # Pre-parse date/time configurations
    date_formats = settings.get("date_formats", ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"])
    time_formats = settings.get("time_formats", ["HH:MM", "HH:MM:SS"])
    phone_rules = settings.get("phone_rules", {"IN": 10, "SG": 8, "US": 10, "UK": 10})
    allowed_payments = [p.lower() for p in settings.get("allowed_payment_modes", [])]
    
    # Order ID uniqueness check
    order_ids = df_clean.get("order_id", pd.Series("", index=df.index)).astype(str)
    duplicate_order_mask = order_ids.duplicated(keep=False) & (order_ids != "")
    
    # Country-wise transaction metrics (using clean country codes)
    country_codes = df_clean.get("country_code", pd.Series("", index=df.index)).astype(str)
    country_counts = country_codes.value_counts().to_dict()
    
    # Row-by-row validation (optimized checks)
    for idx, row in df_clean.iterrows():
        # --- ORDER ID VALIDATION ---
        order_id = str(row.get("order_id", ""))
        if not order_id:
            log_error(idx, "order_id", "MISSING_VALUE", "Order ID is empty or missing.")
        elif duplicate_order_mask.loc[idx]:
            log_error(idx, "order_id", "DUPLICATE_ERROR", f"Duplicate Order ID: {order_id} exists multiple times in file.")
        elif not re.match(r"^ORD\d+$", order_id):
            log_error(idx, "order_id", "FORMAT_ERROR", f"Order ID '{order_id}' does not match pattern '^ORD\\d+$'.")
            
        # --- DATE VALIDATION ---
        order_date = str(row.get("order_date", ""))
        if not order_date:
            log_error(idx, "order_date", "MISSING_VALUE", "Order Date is empty.")
        else:
            # Check date formats
            date_valid = False
            format_map = {
                "YYYY-MM-DD": "%Y-%m-%d",
                "DD/MM/YYYY": "%d/%m/%Y",
                "MM/DD/YYYY": "%m/%d/%Y"
            }
            for fmt_name in date_formats:
                fmt = format_map.get(fmt_name, fmt_name)
                try:
                    datetime.strptime(order_date, fmt)
                    date_valid = True
                    break
                except ValueError:
                    continue
            if not date_valid:
                log_error(idx, "order_date", "FORMAT_ERROR", f"Date '{order_date}' does not match allowed formats: {', '.join(date_formats)}.")

        # --- TIME VALIDATION ---
        order_time = str(row.get("order_time", ""))
        if not order_time:
            log_error(idx, "order_time", "MISSING_VALUE", "Order Time is empty.")
        else:
            time_valid = False
            format_map = {
                "HH:MM": "%H:%M",
                "HH:MM:SS": "%H:%M:%S"
            }
            for fmt_name in time_formats:
                fmt = format_map.get(fmt_name, fmt_name)
                try:
                    datetime.strptime(order_time, fmt)
                    time_valid = True
                    break
                except ValueError:
                    continue
            if not time_valid:
                log_error(idx, "order_time", "FORMAT_ERROR", f"Time '{order_time}' does not match allowed formats: {', '.join(time_formats)}.")

        # --- CUSTOMER NAME ---
        customer_name = str(row.get("customer_name", ""))
        if not customer_name:
            log_error(idx, "customer_name", "MISSING_VALUE", "Customer Name is empty.")

        # --- COUNTRY CODE & PHONE NUMBER ---
        country_code = str(row.get("country_code", ""))
        phone = str(row.get("phone_number", ""))
        
        if not country_code:
            log_error(idx, "country_code", "MISSING_VALUE", "Country Code is empty.")
        if not phone:
            log_error(idx, "phone_number", "MISSING_VALUE", "Phone number is empty.")
        else:
            # Only numeric digits
            if not phone.isdigit():
                log_error(idx, "phone_number", "FORMAT_ERROR", f"Phone number '{phone}' contains non-numeric characters.")
            elif country_code in phone_rules:
                expected_len = phone_rules[country_code]
                if len(phone) != expected_len:
                    log_error(idx, "phone_number", "FORMAT_ERROR", f"Phone number length for {country_code} should be {expected_len} digits (got {len(phone)}).")
            # If country code not configured, we just require it to be numeric (which was checked above)

        # --- PRODUCT ID ---
        product_id = str(row.get("product_id", ""))
        if not product_id:
            log_error(idx, "product_id", "MISSING_VALUE", "Product ID is empty.")

        # --- QUANTITY ---
        qty_val = row.get("quantity")
        try:
            qty = int(qty_val) if pd.notna(qty_val) and str(qty_val).strip() != "" else None
            if qty is None:
                log_error(idx, "quantity", "MISSING_VALUE", "Quantity is missing.")
            elif qty <= 0:
                log_error(idx, "quantity", "VALUE_ERROR", f"Quantity must be greater than 0 (got {qty}).")
        except (ValueError, TypeError):
            log_error(idx, "quantity", "FORMAT_ERROR", f"Quantity '{qty_val}' is not a valid integer.")
            qty = None

        # --- UNIT PRICE ---
        price_val = row.get("unit_price")
        try:
            price = float(price_val) if pd.notna(price_val) and str(price_val).strip() != "" else None
            if price is None:
                log_error(idx, "unit_price", "MISSING_VALUE", "Unit price is missing.")
            elif price <= 0:
                log_error(idx, "unit_price", "VALUE_ERROR", f"Unit price must be greater than 0 (got {price}).")
        except (ValueError, TypeError):
            log_error(idx, "unit_price", "FORMAT_ERROR", f"Unit price '{price_val}' is not a valid decimal number.")
            price = None

        # --- PAYMENT MODE ---
        payment = str(row.get("payment_mode", ""))
        if not payment:
            log_error(idx, "payment_mode", "MISSING_VALUE", "Payment mode is empty.")
        else:
            # Try to standardize it first. If standard version matches allowed, we count it as cleanable.
            # However, for pure validation, if it doesn't match and cannot be mapped, we flag it.
            std_payment = map_payment_mode(payment)
            if std_payment.lower() not in allowed_payments:
                log_error(idx, "payment_mode", "VALUE_ERROR", f"Payment mode '{payment}' is not in allowed payment modes list.")

        # --- TOTAL AMOUNT VALIDATION ---
        total_val = row.get("total_amount")
        try:
            total = float(total_val) if pd.notna(total_val) and str(total_val).strip() != "" else None
            if total is None:
                log_error(idx, "total_amount", "MISSING_VALUE", "Total amount is missing.")
            elif total <= 0:
                log_error(idx, "total_amount", "VALUE_ERROR", f"Total amount must be greater than 0 (got {total}).")
            elif qty is not None and price is not None:
                expected_total = qty * price
                # Avoid float precision mismatch
                if not math.isclose(total, expected_total, rel_tol=1e-5, abs_tol=0.01):
                    log_error(idx, "total_amount", "CALCULATION_ERROR", f"Total Amount {total} does not match expected {expected_total} (Qty {qty} x Price {price}).")
        except (ValueError, TypeError):
            log_error(idx, "total_amount", "FORMAT_ERROR", f"Total amount '{total_val}' is not a valid decimal number.")

    # Calculate summary statistics
    invalid_records_count = len(invalid_rows)
    valid_records_count = total_records - invalid_records_count
    success_rate = round((valid_records_count / total_records) * 100, 2) if total_records > 0 else 100.0
    
    # Filter country counts to exclude empty
    country_stats = {k: v for k, v in country_counts.items() if k}

    summary = {
        "total_records": total_records,
        "valid_records": valid_records_count,
        "invalid_records": invalid_records_count,
        "success_rate": success_rate,
        "total_errors": len(errors),
        "errors_by_field": errors_by_field,
        "errors_by_type": errors_by_type,
        "country_stats": country_stats
    }
    
    return errors, summary

def clean_dataframe(df: pd.DataFrame, settings: Dict[str, Any]) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Cleans the dataframe by standardizing columns:
      - Trims whitespace and hidden characters.
      - Standardizes payment modes.
      - Standardizes date formatting to YYYY-MM-DD.
      - Standardizes time formatting to HH:MM:SS.
      - Eliminates fully empty rows.
    Returns:
      - cleaned_df: Cleaned dataframe containing rows that are valid post-cleaning.
      - invalid_df: Dataframe containing rows that could not be cleaned (still fail rules).
    """
    if len(df) == 0:
        return df.copy(), df.copy()

    # Eliminate fully empty rows
    df_temp = df.dropna(how='all')
    
    # Trim and normalize string fields
    df_temp = normalize_string_columns(df_temp)
    
    date_formats = settings.get("date_formats", ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"])
    time_formats = settings.get("time_formats", ["HH:MM", "HH:MM:SS"])
    
    # Maps for format parsing
    date_format_map = {
        "YYYY-MM-DD": "%Y-%m-%d",
        "DD/MM/YYYY": "%d/%m/%Y",
        "MM/DD/YYYY": "%m/%d/%Y"
    }
    time_format_map = {
        "HH:MM": "%H:%M",
        "HH:MM:SS": "%H:%M:%S"
    }
    
    # Copy to avoid SettingWithCopyWarning
    df_temp = df_temp.copy()
    
    # 1. Bulk clean payment modes
    if "payment_mode" in df_temp.columns:
        df_temp["payment_mode"] = df_temp["payment_mode"].apply(map_payment_mode)
        
    # 2. Bulk clean dates
    if "order_date" in df_temp.columns:
        def standardize_date(val):
            val_str = str(val).strip()
            if not val_str:
                return ""
            for fmt_name in date_formats:
                fmt = date_format_map.get(fmt_name, fmt_name)
                try:
                    dt = datetime.strptime(val_str, fmt)
                    return dt.strftime("%Y-%m-%d")
                except ValueError:
                    continue
            return val # return original if cannot parse (will fail validation)
        df_temp["order_date"] = df_temp["order_date"].apply(standardize_date)
        
    # 3. Bulk clean times
    if "order_time" in df_temp.columns:
        def standardize_time(val):
            val_str = str(val).strip()
            if not val_str:
                return ""
            for fmt_name in time_formats:
                fmt = time_format_map.get(fmt_name, fmt_name)
                try:
                    tm = datetime.strptime(val_str, fmt)
                    return tm.strftime("%H:%M:%S")
                except ValueError:
                    continue
            return val
        df_temp["order_time"] = df_temp["order_time"].apply(standardize_time)
        
    # 4. Validate the standardized dataframe in bulk to find remaining invalid rows
    errors, _ = validate_dataframe(df_temp, settings)
    
    # Convert error row numbers back to 0-based indices
    # Row number in error is idx + 2. So index is error["row_number"] - 2
    invalid_indices = {err["row_number"] - 2 for err in errors}
    
    cleaned_rows = []
    invalid_rows = []
    
    # Split into clean and invalid rows based on index
    for idx, row in df_temp.iterrows():
        if idx in invalid_indices:
            invalid_rows.append(row)
        else:
            cleaned_rows.append(row)
            
    cleaned_df = pd.DataFrame(cleaned_rows, columns=df.columns) if cleaned_rows else pd.DataFrame(columns=df.columns)
    invalid_df = pd.DataFrame(invalid_rows, columns=df.columns) if invalid_rows else pd.DataFrame(columns=df.columns)
    
    return cleaned_df, invalid_df

def split_dataframe(df: pd.DataFrame, chunk_size: int) -> List[pd.DataFrame]:
    """Splits a DataFrame into multiple chunks of chunk_size rows."""
    if len(df) == 0:
        return [df]
    
    chunks = []
    num_chunks = math.ceil(len(df) / chunk_size)
    for i in range(num_chunks):
        start = i * chunk_size
        end = start + chunk_size
        chunks.append(df.iloc[start:end])
    return chunks
