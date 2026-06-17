export interface PhoneRules {
  [key: string]: number;
}

export interface Settings {
  phone_rules: PhoneRules;
  date_formats: string[];
  time_formats: string[];
  allowed_payment_modes: string[];
  chunk_size: number;
}

export interface ValidationError {
  row_number: number;
  field_name: string;
  error_type: string;
  description: string;
}

export interface ValidationSummary {
  file_id: string;
  filename: string;
  total_records: number;
  valid_records: number;
  invalid_records: number;
  success_rate: number;
  total_errors: number;
  errors: ValidationError[];
  errors_by_field: { [key: string]: number };
  errors_by_type: { [key: string]: number };
  country_stats: { [key: string]: number };
}

export interface HistoryItem {
  file_id: string;
  filename: string;
  size_bytes: number;
  total_rows: number;
  upload_time: string;
  status: 'Uploaded' | 'Validated' | 'Processed' | 'Failed';
  success_rate?: number;
  total_errors?: number;
  cleaned_file_link?: string;
  invalid_file_link?: string;
  split_files_links?: string[];
  zip_file_link?: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
