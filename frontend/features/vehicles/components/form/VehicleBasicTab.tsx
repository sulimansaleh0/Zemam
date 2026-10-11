'use client';

import React from 'react';
import { Car, Calendar, Hash, CheckCircle2 } from 'lucide-react';
import type { UseFormRegister, FieldErrors, UseFormSetValue } from 'react-hook-form';
import type { VehicleFormValues } from '../../schemas/vehicle.schema';

interface VehicleBasicTabProps {
  register: UseFormRegister<VehicleFormValues>;
  errors: FieldErrors<VehicleFormValues>;
  selectedVehicleType?: VehicleFormValues['vehicleType'];
  setValue: UseFormSetValue<VehicleFormValues>;
  disabled?: boolean;
}

const VEHICLE_CATEGORIES = [
  { id: 'normal', label: 'سيارة خاصة (خفيف)', desc: 'تتطلب رخصة قيادة خفيف فما فوق' },
  { id: 'van', label: 'فان / حافلة (متوسط)', desc: 'تتطلب رخصة متوسط أو ثقيل' },
  { id: 'truck', label: 'شاحنة نقل (ثقيل)', desc: 'تتطلب رخصة قيادة ثقيل حصراً' },
] as const;

export function VehicleBasicTab({
  register,
  errors,
  selectedVehicleType,
  setValue,
  disabled = false,
}: VehicleBasicTabProps) {
  return (
    <div className="space-y-4">
      {/* Model */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
          اسم وموديل المركبة <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <Car className="w-4 h-4 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="مثال: تويوتا هايلوكس أو مرسيدس آكتروس"
            required
            {...register('model')}
            disabled={disabled}
            className={`w-full pr-10 pl-3 py-2.5 rounded-xl border bg-[var(--surface)] text-xs text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all ${
              errors.model ? 'border-rose-500' : 'border-[var(--border)]'
            }`}
          />
        </div>
        {errors.model && (
          <span className="text-[11px] text-rose-500 mt-1 block">
            {errors.model.message}
          </span>
        )}
      </div>

      {/* Year & Plate Number Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Year */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
            سنة الصنع <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              placeholder="2024"
              min="1900"
              max={new Date().getFullYear()}
              required
              {...register('year')}
              disabled={disabled}
              className={`w-full pr-10 pl-3 py-2.5 rounded-xl border bg-[var(--surface)] text-xs text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all ${
                errors.year ? 'border-rose-500' : 'border-[var(--border)]'
              }`}
            />
          </div>
          {errors.year && (
            <span className="text-[11px] text-rose-500 mt-1 block">
              {errors.year.message}
            </span>
          )}
        </div>

        {/* Plate Number */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
            رقم اللوحة (رقمي) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Hash className="w-4 h-4 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="1234 أو أ ب ج 1234"
              dir="ltr"
              required
              {...register('plateNumber')}
              disabled={disabled}
              className={`w-full pr-10 pl-3 py-2.5 rounded-xl border bg-[var(--surface)] text-xs text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all ${
                errors.plateNumber ? 'border-rose-500' : 'border-[var(--border)]'
              }`}
            />
          </div>
          {errors.plateNumber && (
            <span className="text-[11px] text-rose-500 mt-1 block">
              {errors.plateNumber.message}
            </span>
          )}
        </div>
      </div>

      {/* Vehicle Type */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text)] mb-2">
          فئة ونوع المركبة (المطابقة لرخص القيادة) <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {VEHICLE_CATEGORIES.map((cat) => {
            const isSelected = selectedVehicleType === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() =>
                  setValue('vehicleType', cat.id as VehicleFormValues['vehicleType'], {
                    shouldValidate: true,
                  })
                }
                className={`p-3 rounded-xl border text-right cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]'
                    : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[var(--text)]">{cat.label}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />}
                </div>
                <p className="text-[10px] text-[var(--muted)] leading-tight">{cat.desc}</p>
              </div>
            );
          })}
        </div>
        {errors.vehicleType && (
          <span className="text-[11px] text-rose-500 mt-1 block">
            {errors.vehicleType.message}
          </span>
        )}
      </div>
    </div>
  );
}
