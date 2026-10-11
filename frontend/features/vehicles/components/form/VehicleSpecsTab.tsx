'use client';

import React from 'react';
import { Fuel, Gauge } from 'lucide-react';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { VehicleFormValues } from '../../schemas/vehicle.schema';

interface VehicleSpecsTabProps {
  register: UseFormRegister<VehicleFormValues>;
  errors: FieldErrors<VehicleFormValues>;
  disabled?: boolean;
}

const FUEL_TYPES = [
  'بنزين 91',
  'بنزين 95',
  'ديزل',
  'هجين',
  'كهربائي',
];

export function VehicleSpecsTab({
  register,
  errors,
  disabled = false,
}: VehicleSpecsTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Fuel Type */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
            نوع الوقود المعتمد <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Fuel className="w-4 h-4 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              {...register('fuelType')}
              required
              disabled={disabled}
              className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all cursor-pointer"
            >
              <option value="">اختر نوع الوقود</option>
              {FUEL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type === 'هجين' ? 'هجين (هايبرد)' : type}
                </option>
              ))}
            </select>
          </div>
          {errors.fuelType && (
            <span className="text-[11px] text-rose-500 mt-1 block">
              {errors.fuelType.message}
            </span>
          )}
        </div>

        {/* Tank Capacity */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
            سعة خزان الوقود (لتر) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Fuel className="w-4 h-4 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              placeholder="60"
              min="1"
              required
              {...register('tankCapacity')}
              disabled={disabled}
              className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
            />
          </div>
          {errors.tankCapacity && (
            <span className="text-[11px] text-rose-500 mt-1 block">
              {errors.tankCapacity.message}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Expected Fuel Efficiency */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
            كفاءة الاستهلاك المتوقعة (كم/لتر) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Gauge className="w-4 h-4 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              step="0.1"
              placeholder="12"
              min="0.1"
              required
              {...register('expectedFuelEfficiency')}
              disabled={disabled}
              className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
            />
          </div>
          {errors.expectedFuelEfficiency && (
            <span className="text-[11px] text-rose-500 mt-1 block">
              {errors.expectedFuelEfficiency.message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
