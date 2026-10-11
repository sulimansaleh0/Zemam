'use client';

import React from 'react';
import { FileText, Shield } from 'lucide-react';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { VehicleFormValues } from '../../schemas/vehicle.schema';

interface VehicleDocsTabProps {
  register: UseFormRegister<VehicleFormValues>;
  errors: FieldErrors<VehicleFormValues>;
  disabled?: boolean;
}

export function VehicleDocsTab({
  register,
  errors,
  disabled = false,
}: VehicleDocsTabProps) {
  return (
    <div className="space-y-4">
      {/* License / Istimara */}
      <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/40 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--text)]">
          <FileText className="w-4 h-4 text-amber-500" />
          <span>بيانات رخصة السير (الاستمارة)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[var(--muted)] mb-1">
              رقم رخصة السير <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="مثال: 987654321"
              required
              {...register('licenseNumber')}
              disabled={disabled}
              className={`w-full px-3 py-2 rounded-lg border bg-[var(--surface)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 ${
                errors.licenseNumber ? 'border-rose-500' : 'border-[var(--border)]'
              }`}
            />
            {errors.licenseNumber && (
              <span className="text-[11px] text-rose-500 mt-1 block">
                {errors.licenseNumber.message}
              </span>
            )}
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[var(--muted)] mb-1">
              تاريخ انتهاء الاستمارة <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              {...register('licenseExpiry')}
              disabled={disabled}
              className={`w-full px-3 py-2 rounded-lg border bg-[var(--surface)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 ${
                errors.licenseExpiry ? 'border-rose-500' : 'border-[var(--border)]'
              }`}
            />
            {errors.licenseExpiry && (
              <span className="text-[11px] text-rose-500 mt-1 block">
                {errors.licenseExpiry.message}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Insurance */}
      <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/40 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--text)]">
          <Shield className="w-4 h-4 text-blue-500" />
          <span>وثيقة التأمين (اختياري)</span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-[var(--muted)] mb-1">
              شركة التأمين
            </label>
            <div className="relative">
              <Shield className="w-3.5 h-3.5 text-[var(--muted)] absolute right-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="مثال: التعاونية، تكافل الراجحي، ملاذ"
                {...register('insuranceCompany')}
                disabled={disabled}
                className="w-full pr-8 pl-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--muted)] mb-1">
                رقم وثيقة التأمين
              </label>
              <input
                type="text"
                placeholder="مثال: POL-2024-889"
                {...register('insuranceNumber')}
                disabled={disabled}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--muted)] mb-1">
                تاريخ انتهاء التأمين
              </label>
              <input
                type="date"
                {...register('insuranceExpiry')}
                disabled={disabled}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
