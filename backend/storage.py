import os
import json
import shutil
from typing import Dict, List, Any

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
STORAGE_DIR = os.path.join(BASE_DIR, "storage")
UPLOADS_DIR = os.path.join(STORAGE_DIR, "uploads")
PROCESSED_DIR = os.path.join(STORAGE_DIR, "processed")

# Ensure directories exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(STORAGE_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

SETTINGS_PATH = os.path.join(DATA_DIR, "settings.json")
HISTORY_PATH = os.path.join(DATA_DIR, "history.json")

def get_upload_path(filename: str) -> str:
    return os.path.join(UPLOADS_DIR, filename)

def get_processed_path(filename: str) -> str:
    return os.path.join(PROCESSED_DIR, filename)

def save_uploaded_file(file_content: bytes, filename: str) -> str:
    path = get_upload_path(filename)
    with open(path, "wb") as f:
        f.write(file_content)
    return path

def read_settings() -> Dict[str, Any]:
    if not os.path.exists(SETTINGS_PATH):
        # Default settings if file does not exist
        default_settings = {
            "phone_rules": {"IN": 10, "SG": 8, "US": 10, "UK": 10},
            "date_formats": ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"],
            "time_formats": ["HH:MM", "HH:MM:SS"],
            "allowed_payment_modes": [
                "UPI", "Credit Card", "Debit Card", "PayNow", "PayPal", "Wallet", "Cash", "Net Banking"
            ],
            "chunk_size": 10000
        }
        write_settings(default_settings)
        return default_settings
    
    with open(SETTINGS_PATH, "r") as f:
        return json.load(f)

def write_settings(settings: Dict[str, Any]) -> None:
    with open(SETTINGS_PATH, "w") as f:
        json.dump(settings, f, indent=2)

def read_history() -> List[Dict[str, Any]]:
    if not os.path.exists(HISTORY_PATH):
        write_history([])
        return []
    with open(HISTORY_PATH, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def write_history(history: List[Dict[str, Any]]) -> None:
    with open(HISTORY_PATH, "w") as f:
        json.dump(history, f, indent=2)

def add_history_entry(entry: Dict[str, Any]) -> None:
    history = read_history()
    # Check if entry already exists (by file_id or filename) and update it, else append
    for idx, item in enumerate(history):
        if item.get("file_id") == entry.get("file_id"):
            history[idx] = entry
            write_history(history)
            return
    history.insert(0, entry) # Prepend to show latest first
    write_history(history)
