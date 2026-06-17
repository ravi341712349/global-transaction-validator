import axios from 'axios';
import type { Settings, ValidationSummary, HistoryItem } from './types';

// Dev server runs on port 8000 by default, fallback to window origin in prod
export const API_BASE_URL = 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
});

export const api = {
  uploadFile: async (file: File, onProgress: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await client.post<HistoryItem>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },

  validateFile: async (fileId: string) => {
    const response = await client.post<ValidationSummary>('/validate', { file_id: fileId });
    return response.data;
  },

  cleanFile: async (fileId: string) => {
    const response = await client.post<{
      status: string;
      cleaned_file_link: string;
      invalid_file_link: string;
      zip_file_link: string;
    }>('/clean', { file_id: fileId });
    return response.data;
  },

  splitFile: async (fileId: string, chunkSize?: number) => {
    const response = await client.post<{
      status: string;
      split_files_links: string[];
      zip_file_link: string;
    }>('/split', { file_id: fileId, chunk_size: chunkSize });
    return response.data;
  },

  getSettings: async () => {
    const response = await client.get<Settings>('/settings');
    return response.data;
  },

  updateSettings: async (settings: Settings) => {
    const response = await client.post<{ status: string; message: string }>('/settings', settings);
    return response.data;
  },

  getHistory: async () => {
    const response = await client.get<HistoryItem[]>('/history');
    return response.data;
  },

  getDownloadUrl: (link: string) => {
    // If link is a relative download link e.g. /download/file.csv, prepend baseURL
    return `${API_BASE_URL}${link}`;
  },

  getSampleCsvUrl: () => {
    return `${API_BASE_URL}/sample-csv`;
  }
};
