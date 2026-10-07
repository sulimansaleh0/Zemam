'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  onPageChange: (page: number) => void;
  itemLabel?: string;
  className?: string;
}

export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  hasNextPage = currentPage < totalPages,
  hasPrevPage = currentPage > 1,
  onPageChange,
  itemLabel = 'عنصر',
  className = '',
}: TablePaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div
      className={`p-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted)] ${className}`}
    >
      <div>
        صفحة {currentPage} من {totalPages}
        {totalItems !== undefined && ` (إجمالي ${totalItems} ${itemLabel})`}
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={!hasPrevPage}
          className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-2)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
          title="الصفحة الأولى"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-2)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
          title="الصفحة السابقة"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-2)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
          title="الصفحة التالية"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage}
          className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-2)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
          title="الصفحة الأخيرة"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
