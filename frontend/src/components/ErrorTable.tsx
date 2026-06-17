import React, { useState, useMemo } from 'react';
import type { ValidationError } from '../types';
import { Search, ChevronLeft, ChevronRight, Download, SlidersHorizontal } from 'lucide-react';

interface ErrorTableProps {
  errors: ValidationError[];
}

export const ErrorTable: React.FC<ErrorTableProps> = ({ errors }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get unique fields and types for filter dropdowns
  const uniqueFields = useMemo(() => {
    const fields = new Set<string>();
    errors.forEach((e) => fields.add(e.field_name));
    return Array.from(fields).sort();
  }, [errors]);

  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    errors.forEach((e) => types.add(e.error_type));
    return Array.from(types).sort();
  }, [errors]);

  // Filter and Search Logic
  const filteredErrors = useMemo(() => {
    let result = [...errors];
    
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          e.field_name.toLowerCase().includes(q) ||
          e.error_type.toLowerCase().includes(q) ||
          e.row_number.toString().includes(q)
      );
    }

    // Field filter
    if (selectedField) {
      result = result.filter((e) => e.field_name === selectedField);
    }

    // Type filter
    if (selectedType) {
      result = result.filter((e) => e.error_type === selectedType);
    }

    return result;
  }, [errors, searchQuery, selectedField, selectedType]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredErrors.length / itemsPerPage);
  const paginatedErrors = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredErrors.slice(start, start + itemsPerPage);
  }, [filteredErrors, currentPage, itemsPerPage]);

  // Update page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedField, selectedType]);

  // Export errors to CSV
  const downloadErrorsCSV = () => {
    const headers = ['Row Number', 'Field Name', 'Error Type', 'Description'];
    const csvRows = [headers.join(',')];

    filteredErrors.forEach((err) => {
      const row = [
        err.row_number,
        `"${err.field_name.replace(/"/g, '""')}"`,
        `"${err.error_type.replace(/"/g, '""')}"`,
        `"${err.description.replace(/"/g, '""')}"`,
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `validation_errors_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full">
      {/* Filters & Search Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by row, field, type or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm text-gray-200 glass-input rounded-xl focus:outline-none"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Field Filter */}
          <select
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs text-gray-300 glass-input rounded-xl focus:outline-none bg-darkBg"
          >
            <option value="">All Columns</option>
            {uniqueFields.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs text-gray-300 glass-input rounded-xl focus:outline-none bg-darkBg"
          >
            <option value="">All Errors</option>
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Download CSV button */}
          <button
            onClick={downloadErrorsCSV}
            disabled={filteredErrors.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="w-full overflow-hidden border border-white/5 rounded-2xl glass-panel">
        <div className="overflow-x-auto">
          <table className="custom-table">
            <thead>
              <tr>
                <th className="w-24">Row Number</th>
                <th className="w-40">Field Name</th>
                <th className="w-44">Error Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {paginatedErrors.length > 0 ? (
                paginatedErrors.map((err, idx) => (
                  <tr key={idx} className="transition duration-150">
                    <td className="font-mono text-indigo-400 text-xs font-semibold">
                      Row {err.row_number}
                    </td>
                    <td>
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/5 border border-white/5 text-gray-300">
                        {err.field_name}
                      </span>
                    </td>
                    <td>
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                        err.error_type === 'MISSING_VALUE' 
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {err.error_type}
                      </span>
                    </td>
                    <td className="text-sm text-gray-300">{err.description}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-sm text-gray-500">
                    No validation errors found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredErrors.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
            <span className="text-xs text-gray-400">
              Showing <span className="font-medium text-gray-200">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium text-gray-200">
                {Math.min(currentPage * itemsPerPage, filteredErrors.length)}
              </span>{' '}
              of <span className="font-medium text-gray-200">{filteredErrors.length}</span> errors
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-gray-400 hover:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    // Only show first, last, current, and surrounding pages
                    if (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-7 h-7 text-xs font-semibold rounded-lg transition ${
                            currentPage === page
                              ? 'bg-indigo-600 text-white shadow-glow'
                              : 'border border-white/5 hover:bg-white/[0.04] text-gray-400 hover:text-gray-200'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === 2 ||
                      page === totalPages - 1
                    ) {
                      return <span key={page} className="text-gray-600 text-xs px-1">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-gray-400 hover:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
