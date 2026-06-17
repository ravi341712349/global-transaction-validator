from pydantic import BaseModel, Field
from typing import Dict, List, Optional

class PhoneRulesSchema(BaseModel):
    IN: int = Field(default=10, description="Digit length for India")
    SG: int = Field(default=8, description="Digit length for Singapore")
    US: int = Field(default=10, description="Digit length for USA")
    UK: int = Field(default=10, description="Digit length for UK")

    class Config:
        extra = "allow" # Allow custom countries to be added

class SettingsSchema(BaseModel):
    phone_rules: Dict[str, int] = Field(..., description="Map of country code to phone digit length")
    date_formats: List[str] = Field(..., description="Allowed date formats")
    time_formats: List[str] = Field(..., description="Allowed time formats")
    allowed_payment_modes: List[str] = Field(..., description="Allowed payment modes")
    chunk_size: int = Field(default=10000, description="Max rows per split file")

class FileMetadata(BaseModel):
    file_id: str
    filename: str
    size_bytes: int
    total_rows: int
    upload_time: str

class ValidationError(BaseModel):
    row_number: int
    field_name: str
    error_type: str
    description: str

class ValidationResponse(BaseModel):
    file_id: str
    filename: str
    total_records: int
    valid_records: int
    invalid_records: int
    success_rate: float
    total_errors: int
    errors: List[ValidationError]
    errors_by_field: Dict[str, int]
    errors_by_type: Dict[str, int]
    country_stats: Dict[str, int]

class ProcessingHistoryItem(BaseModel):
    file_id: str
    filename: str
    size_bytes: int
    total_rows: int
    upload_time: str
    status: str # "Uploaded", "Validated", "Processed", "Failed"
    success_rate: Optional[float] = None
    total_errors: Optional[int] = None
    cleaned_file_link: Optional[str] = None
    invalid_file_link: Optional[str] = None
    split_files_links: Optional[List[str]] = None
    zip_file_link: Optional[str] = None
