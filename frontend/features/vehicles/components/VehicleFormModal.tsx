'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Car, Calendar, Hash, Radio, Building2, Users, UserCheck, Loader2 } from 'lucide-react';
import { vehicleFormSchema, VehicleFormValues } from '../schemas/vehicle.schema';
import { VehicleWithRelations } from '../types/vehicle.types';
import { useVehicleOptions, useCreateVehicle, useUpdateVehicle } from '../hooks/useVehicles';

interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVehicleData?: VehicleWithRelations | null;
}

export function VehicleFormModal({
  isOpen,
  onClose,
  initialVehicleData,
}: VehicleFormModalProps) {
  const isEditMode = Boolean(initialVehicleData);
  const { companies, teams, drivers, isLoadingOptions } = useVehicleOptions();

  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();

  const isSubmittingVehicle =
    createVehicleMutation.isPending || updateVehicleMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: vehicleFormErrors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      model: '',
      year: new Date().getFullYear(),
      plateNumber: undefined,
      gpsDeviceId: '',
      gpsUniqueId: '',
      companyId: '',
      teamId: '',
      driverId: '',
    },
  });

  // Reset form when modal opens or initialVehicleData changes
  useEffect(() => {
    if (isOpen) {
      if (initialVehicleData) {
        reset({
          model: initialVehicleData.model,
          year: initialVehicleData.year,
          plateNumber: initialVehicleData.plateNumber,
          gpsDeviceId: initialVehicleData.gpsDeviceId,
          gpsUniqueId: initialVehicleData.gpsUniqueId,
          companyId: initialVehicleData.companyId,
          teamId: initialVehicleData.teamId,
          driverId: initialVehicleData.driverId,
        });
      } else {
        reset({
          model: '',
          year: new Date().getFullYear(),
          plateNumber: undefined,
          gpsDeviceId: '',
          gpsUniqueId: '',
          companyId: companies[0]?.id || '',
          teamId: teams[0]?.id || '',
          driverId: drivers[0]?.id || '',
        });
      }
    }
  }, [isOpen, initialVehicleData, reset, companies, teams, drivers]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const onSubmitVehicleForm = async (vehicleFormValues: VehicleFormValues) => {
    if (isEditMode && initialVehicleData) {
      await updateVehicleMutation.mutateAsync({
        vehicleId: initialVehicleData.id,
        vehicleInput: vehicleFormValues,
      });
    } else {
      await createVehicleMutation.mutateAsync(vehicleFormValues);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-(--surface) border border-(--border) rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vehicle-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-(--border) bg-(--surface-2)/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-(--primary-light) text-(--primary) flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 id="vehicle-modal-title" className="text-base font-bold text-(--text)">
                {isEditMode ? 'تعديل بيانات المركبة' : 'إضافة مركبة جديدة إلى الأسطول'}
              </h2>
              <p className="text-xs text-(--muted) mt-0.5">
                {isEditMode
                  ? 'تحديث تفاصيل المركبة وجهاز التتبع والسائق المسؤول'
                  : 'أدخل تفاصيل المركبة ورقم اللوحة وجهاز التتبع للبدء'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmitVehicleForm)} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Model */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-[var(--muted)]" />
                اسم وموديل المركبة *
              </label>
              <input
                type="text"
                {...register('model')}
                placeholder="مثال: تويوتا هايلوكس دبل، مرسيدس أكتروس..."
                className={`w-full px-3.5 py-2 text-sm bg-[var(--surface-2)] border rounded-xl text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-1 transition-colors ${
                  vehicleFormErrors.model
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]'
                }`}
              />
              {vehicleFormErrors.model && (
                <p className="text-xs text-rose-500 mt-1">{vehicleFormErrors.model.message}</p>
              )}
            </div>

            {/* Year */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[var(--muted)]" />
                سنة الصنع (Year) *
              </label>
              <input
                type="number"
                {...register('year')}
                placeholder="2024"
                className={`w-full px-3.5 py-2 text-sm bg-[var(--surface-2)] border rounded-xl text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-1 transition-colors ${
                  vehicleFormErrors.year
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]'
                }`}
              />
              {vehicleFormErrors.year && (
                <p className="text-xs text-rose-500 mt-1">{vehicleFormErrors.year.message}</p>
              )}
            </div>

            {/* Plate Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-[var(--muted)]" />
                رقم اللوحة (Plate Number) *
              </label>
              <input
                type="number"
                {...register('plateNumber')}
                placeholder="مثال: 4892"
                className={`w-full px-3.5 py-2 text-sm bg-[var(--surface-2)] border rounded-xl text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-1 transition-colors font-mono ${
                  vehicleFormErrors.plateNumber
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]'
                }`}
              />
              {vehicleFormErrors.plateNumber && (
                <p className="text-xs text-rose-500 mt-1">{vehicleFormErrors.plateNumber.message}</p>
              )}
            </div>

            {/* GPS Device ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-500" />
                معرف جهاز التتبع (GPS Device ID) *
              </label>
              <input
                type="text"
                {...register('gpsDeviceId')}
                placeholder="مثال: GPS-TK103-A01"
                className={`w-full px-3.5 py-2 text-sm bg-[var(--surface-2)] border rounded-xl text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-1 transition-colors font-mono ${
                  vehicleFormErrors.gpsDeviceId
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]'
                }`}
              />
              {vehicleFormErrors.gpsDeviceId && (
                <p className="text-xs text-rose-500 mt-1">{vehicleFormErrors.gpsDeviceId.message}</p>
              )}
            </div>

            {/* GPS Unique ID (IMEI) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-500" />
                المعرف الفريد (IMEI / Unique ID) *
              </label>
              <input
                type="text"
                {...register('gpsUniqueId')}
                placeholder="مثال: IMEI-867543029182341"
                className={`w-full px-3.5 py-2 text-sm bg-[var(--surface-2)] border rounded-xl text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-1 transition-colors font-mono ${
                  vehicleFormErrors.gpsUniqueId
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]'
                }`}
              />
              {vehicleFormErrors.gpsUniqueId && (
                <p className="text-xs text-rose-500 mt-1">{vehicleFormErrors.gpsUniqueId.message}</p>
              )}
            </div>

            {/* Company */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[var(--muted)]" />
                الشركة التابعة *
              </label>
              <select
                {...register('companyId')}
                disabled={isLoadingOptions}
                className={`w-full px-3.5 py-2 text-sm bg-[var(--surface-2)] border rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 transition-colors cursor-pointer ${
                  vehicleFormErrors.companyId
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]'
                }`}
              >
                <option value="">-- اختر الشركة --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {vehicleFormErrors.companyId && (
                <p className="text-xs text-rose-500 mt-1">{vehicleFormErrors.companyId.message}</p>
              )}
            </div>

            {/* Team */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[var(--muted)]" />
                الفريق المسؤول *
              </label>
              <select
                {...register('teamId')}
                disabled={isLoadingOptions}
                className={`w-full px-3.5 py-2 text-sm bg-[var(--surface-2)] border rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 transition-colors cursor-pointer ${
                  vehicleFormErrors.teamId
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]'
                }`}
              >
                <option value="">-- اختر الفريق --</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {vehicleFormErrors.teamId && (
                <p className="text-xs text-rose-500 mt-1">{vehicleFormErrors.teamId.message}</p>
              )}
            </div>

            {/* Driver */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[var(--primary)]" />
                تعيين السائق المسؤول *
              </label>
              <select
                {...register('driverId')}
                disabled={isLoadingOptions}
                className={`w-full px-3.5 py-2 text-sm bg-[var(--surface-2)] border rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 transition-colors cursor-pointer ${
                  vehicleFormErrors.driverId
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]'
                }`}
              >
                <option value="">-- اختر السائق من القائمة --</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.phone})
                  </option>
                ))}
              </select>
              {vehicleFormErrors.driverId && (
                <p className="text-xs text-rose-500 mt-1">{vehicleFormErrors.driverId.message}</p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmittingVehicle}
              className="px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmittingVehicle}
              className="flex items-center gap-2 px-5 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmittingVehicle && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditMode ? 'حفظ التعديلات' : 'إضافة المركبة'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
