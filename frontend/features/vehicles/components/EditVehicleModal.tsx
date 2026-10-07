'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Car,
  FileText,
  Shield,
  Fuel,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';
import { editVehicleSchema, EditVehicleFormValues } from '../schemas/vehicle.schema';
import type { BackendVehicle, VehicleWithRelations } from '../types/vehicle.types';

interface EditVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleWithRelations | BackendVehicle | null;
  onUpdate: (vehicleId: string, updatedData: Partial<BackendVehicle>) => Promise<void>;
  isLoading: boolean;
}

export function EditVehicleModal({
  isOpen,
  onClose,
  vehicle,
  onUpdate,
  isLoading,
}: EditVehicleModalProps) {
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditVehicleFormValues>({
    resolver: zodResolver(editVehicleSchema),
    defaultValues: {
      model: '',
      year: new Date().getFullYear(),
      plateNumber: '',
      vehicleType: 'normal',
      tankCapacity: 60,
      fuelType: 'بنزين 91',
      expectedFuelEfficiency: 12,
      licenseNumber: '',
      licenseExpiry: '',
      insuranceNumber: '',
      insuranceCompany: '',
      insuranceExpiry: '',
    },
  });

  const selectedVehicleType = watch('vehicleType');

  useEffect(() => {
    if (vehicle && isOpen) {
      reset({
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        plateNumber: String(vehicle.plateNumber || ''),
        vehicleType: (vehicle.vehicleType as 'normal' | 'van' | 'truck') || 'normal',
        tankCapacity: vehicle.tankCapacity || 60,
        fuelType: (vehicle.fuelType as EditVehicleFormValues['fuelType']) || 'بنزين 91',
        expectedFuelEfficiency: vehicle.expectedFuelEfficiency || 12,
        licenseNumber: vehicle.licenseNumber || '',
        licenseExpiry: vehicle.licenseExpiry ? vehicle.licenseExpiry.split('T')[0] : '',
        insuranceNumber: vehicle.insuranceNumber || '',
        insuranceCompany: vehicle.insuranceCompany || '',
        insuranceExpiry: vehicle.insuranceExpiry ? vehicle.insuranceExpiry.split('T')[0] : '',
      });
      setFormError(null);
    }
  }, [vehicle, isOpen, reset]);

  if (!vehicle) return null;

  const onSubmit = async (values: EditVehicleFormValues) => {
    setFormError(null);
    try {
      await onUpdate(vehicle._id, {
        model: values.model.trim(),
        year: Number(values.year),
        plateNumber: values.plateNumber.trim(),
        vehicleType: values.vehicleType,
        tankCapacity: Number(values.tankCapacity),
        fuelType: values.fuelType,
        expectedFuelEfficiency: Number(values.expectedFuelEfficiency),
        licenseNumber: values.licenseNumber.trim(),
        licenseExpiry: new Date(values.licenseExpiry).toISOString(),
        ...(values.insuranceNumber?.trim() ? { insuranceNumber: values.insuranceNumber.trim() } : {}),
        ...(values.insuranceCompany?.trim() ? { insuranceCompany: values.insuranceCompany.trim() } : {}),
        ...(values.insuranceExpiry ? { insuranceExpiry: new Date(values.insuranceExpiry).toISOString() } : {}),
      });
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'حدث خطأ أثناء تعديل بيانات المركبة');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تعديل بيانات ورخص وتأمين المركبة"
      description={`تحديث بيانات المركبة: ${vehicle.model} - لوحة: ${vehicle.plateNumber}`}
      icon={Car}
      iconClassName="bg-[var(--zd-blue)]/10 text-[var(--zd-blue)]"
      maxWidth="max-w-[700px]"
      preventClose={isLoading}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Section 1: الأساسيات والتصنيف */}
          <div className="space-y-3">
            <h4 className="font-bold text-[var(--text)] flex items-center gap-1.5 text-sm pb-1 border-b border-[var(--border)]">
              <Car className="w-4 h-4 text-blue-500" />
              <span>البيانات الأساسية وتصنيف المركبة</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-[var(--muted)] block mb-1">الموديل والطراز *</label>
                <input
                  type="text"
                  {...register('model')}
                  placeholder="مثال: تويوتا هايلوكس"
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
                {errors.model && <p className="text-[11px] text-rose-500 mt-1">{errors.model.message}</p>}
              </div>

              <div>
                <label className="font-semibold text-[var(--muted)] block mb-1">سنة الصنع *</label>
                <input
                  type="number"
                  {...register('year', { valueAsNumber: true })}
                  min={1990}
                  max={new Date().getFullYear() + 1}
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] font-mono"
                />
                {errors.year && <p className="text-[11px] text-rose-500 mt-1">{errors.year.message}</p>}
              </div>

              <div>
                <label className="font-semibold text-[var(--muted)] block mb-1">رقم اللوحة *</label>
                <input
                  type="text"
                  {...register('plateNumber')}
                  placeholder="مثال: أ ب ج 1234"
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] font-mono"
                />
                {errors.plateNumber && <p className="text-[11px] text-rose-500 mt-1">{errors.plateNumber.message}</p>}
              </div>

              <div className="sm:col-span-3">
                <label className="font-semibold text-[var(--muted)] block mb-1">تصنيف فئة المركبة *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'normal', label: 'سيارة ركوب خاصة (خفيف)', desc: 'يقودها رخصة خفيف أو متوسط أو ثقيل' },
                    { value: 'van', label: 'حافلة صغيرة / فان (متوسط)', desc: 'يقودها رخصة متوسط أو ثقيل فقط' },
                    { value: 'truck', label: 'شاحنة نقل بضائع (ثقيل)', desc: 'تتطلب حصراً رخصة نقل ثقيل' },
                  ].map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      disabled={isLoading}
                      onClick={() => setValue('vehicleType', t.value as 'normal' | 'van' | 'truck', { shouldValidate: true })}
                      className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                        selectedVehicleType === t.value
                          ? 'bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)] font-bold shadow-xs'
                          : 'bg-[var(--surface-2)]/40 border-[var(--border)] text-[var(--muted)] hover:border-[var(--muted)]'
                      }`}
                    >
                      <div className="text-xs font-semibold text-[var(--text)]">{t.label}</div>
                      <div className="text-[10px] text-[var(--muted)] mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
                {errors.vehicleType && <p className="text-[11px] text-rose-500 mt-1">{errors.vehicleType.message}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: خزان الوقود والعداد */}
          <div className="space-y-3">
            <h4 className="font-bold text-[var(--text)] flex items-center gap-1.5 text-sm pb-1 border-b border-[var(--border)]">
              <Fuel className="w-4 h-4 text-amber-500" />
              <span>مواصفات الوقود ومعدل الكفاءة</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-[var(--muted)] block mb-1">سعة خزان الوقود (لتر) *</label>
                <input
                  type="number"
                  {...register('tankCapacity', { valueAsNumber: true })}
                  min={1}
                  max={2000}
                  disabled={isLoading}
                  placeholder="مثلاً: 60"
                  className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] font-mono"
                />
                {errors.tankCapacity && <p className="text-[11px] text-rose-500 mt-1">{errors.tankCapacity.message}</p>}
              </div>

              <div>
                <label className="font-semibold text-[var(--muted)] block mb-1">نوع الوقود المعتمد *</label>
                <select
                  {...register('fuelType')}
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] cursor-pointer"
                >
                  <option value="بنزين 91">بنزين 91</option>
                  <option value="بنزين 95">بنزين 95</option>
                  <option value="ديزل">ديزل (Diesel)</option>
                  <option value="هجين">هجين (Hybrid)</option>
                  <option value="كهربائي">كهربائي (EV)</option>
                </select>
                {errors.fuelType && <p className="text-[11px] text-rose-500 mt-1">{errors.fuelType.message}</p>}
              </div>

              <div>
                <label className="font-semibold text-[var(--muted)] block mb-1">الكفاءة المتوقعة (كم/لتر) *</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('expectedFuelEfficiency', { valueAsNumber: true })}
                  min={0.1}
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] font-mono"
                />
                {errors.expectedFuelEfficiency && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.expectedFuelEfficiency.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: رخصة السير / الاستمارة والتأمين */}
          <div className="space-y-3">
            <h4 className="font-bold text-[var(--text)] flex items-center gap-1.5 text-sm pb-1 border-b border-[var(--border)]">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>بيانات رخصة السير (الاستمارة) ووثيقة التأمين</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* الاستمارة */}
              <div className="p-3.5 rounded-xl bg-[var(--surface-2)]/50 border border-[var(--border)] space-y-2.5">
                <div className="font-bold text-[var(--text)] flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-purple-500" />
                  <span>رخصة السير (الاستمارة)</span>
                </div>

                <div>
                  <label className="font-semibold text-[var(--muted)] block mb-1">رقم الاستمارة *</label>
                  <input
                    type="text"
                    {...register('licenseNumber')}
                    placeholder="رقم الوثيقة الرسمية"
                    disabled={isLoading}
                    className="w-full px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] font-mono"
                  />
                  {errors.licenseNumber && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.licenseNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-[var(--muted)] block mb-1">تاريخ انتهاء الاستمارة *</label>
                  <input
                    type="date"
                    {...register('licenseExpiry')}
                    disabled={isLoading}
                    className="w-full px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] font-mono cursor-pointer"
                  />
                  {errors.licenseExpiry && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.licenseExpiry.message}</p>
                  )}
                </div>
              </div>

              {/* التأمين */}
              <div className="p-3.5 rounded-xl bg-[var(--surface-2)]/50 border border-[var(--border)] space-y-2.5">
                <div className="font-bold text-[var(--text)] flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span>وثيقة التأمين</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-[var(--muted)] block mb-1">رقم الوثيقة</label>
                    <input
                      type="text"
                      {...register('insuranceNumber')}
                      placeholder="رقم التأمين"
                      disabled={isLoading}
                      className="w-full px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[var(--muted)] block mb-1">شركة التأمين</label>
                    <input
                      type="text"
                      {...register('insuranceCompany')}
                      placeholder="مثال: التعاونية"
                      disabled={isLoading}
                      className="w-full px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-[var(--muted)] block mb-1">تاريخ انتهاء التأمين</label>
                  <input
                    type="date"
                    {...register('insuranceExpiry')}
                    disabled={isLoading}
                    className="w-full px-2 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] font-mono cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[var(--border)] bg-[var(--surface)] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-xl transition-colors cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--primary)] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>حفظ التعديلات وتحديث السجلات</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
