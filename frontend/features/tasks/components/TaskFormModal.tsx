'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  Info,
  Loader2,
  MapPin,
  Navigation,
  PlusCircle,
  Truck,
  User,
} from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';
import {
  createTaskSchema,
  type CreateTaskFormValues,
} from '../schemas/task.schema';
import type { CreateTaskInput } from '../types/task.types';

interface VehicleOption {
  _id: string;
  model: string;
  plateNumber: number | string;
  status?: string;
  isInTask?: boolean;
  teamId?: string | { _id: string; name?: string };
  driverId?: string | { _id: string; name?: string };
}

interface DriverOption {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  status?: string;
  teamId?: string | { _id: string; name?: string };
}

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskInput) => Promise<void>;
  isLoading: boolean;
  vehicles: VehicleOption[];
  drivers: DriverOption[];
}

const SAUDI_PRESETS = [
  { name: 'مستودعات الرياض المركزية', lat: '24.7136', lng: '46.6753' },
  { name: 'ميناء جدة الإسلامي', lat: '21.4858', lng: '39.1925' },
  { name: 'المنطقة اللوجستية بالدمام', lat: '26.4207', lng: '50.0888' },
  { name: 'المدينة الصناعية الثانية بالرياض', lat: '24.5712', lng: '46.8624' },
];

export function TaskFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  vehicles,
  drivers,
}: TaskFormModalProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      vehicleId: '',
      driverId: '',
      startTime: '',
      pickupLocation: { address: '', lat: '', lng: '' },
      deliveryLocation: { address: '', lat: '', lng: '' },
    },
  });

  const descriptionValue = watch('description') || '';

  // تصفية المركبات المتاحة والنشطة
  const activeVehicles = useMemo(() => {
    return vehicles.filter((v) => v.status === 'active' || !v.status);
  }, [vehicles]);

  // إيجاد المركبة المختارة حالياً
  const currentVehicle = useMemo(() => {
    return activeVehicles.find((v) => v._id === selectedVehicleId);
  }, [activeVehicles, selectedVehicleId]);

  // استخراج معرف فريق المركبة
  const vehicleTeamId = useMemo(() => {
    if (!currentVehicle?.teamId) return null;
    return typeof currentVehicle.teamId === 'object'
      ? currentVehicle.teamId._id
      : currentVehicle.teamId;
  }, [currentVehicle]);

  // تصفية السائقين التابعين لنفس فريق المركبة تلقائياً لمنع خطأ 400
  const compatibleDrivers = useMemo(() => {
    if (!vehicleTeamId) return [];
    return drivers.filter((d) => {
      const driverTeamId =
        typeof d.teamId === 'object' ? d.teamId?._id : d.teamId;
      return driverTeamId === vehicleTeamId;
    });
  }, [drivers, vehicleTeamId]);

  // عند تغيير المركبة، يتم تعيين سائقها التلقائي أو تحديث قائمة السائقين
  const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vId = e.target.value;
    setSelectedVehicleId(vId);
    setValue('vehicleId', vId, { shouldValidate: true });

    const veh = activeVehicles.find((v) => v._id === vId);
    if (veh?.driverId) {
      const dId =
        typeof veh.driverId === 'object' ? veh.driverId._id : veh.driverId;
      setValue('driverId', dId, { shouldValidate: true });
    } else {
      setValue('driverId', '', { shouldValidate: true });
    }
  };

  // إعادة ضبط النموذج عند الإغلاق
  useEffect(() => {
    if (!isOpen) {
      reset();
      setSelectedVehicleId('');
    }
  }, [isOpen, reset]);

  const handleFormSubmit = handleSubmit(async (values) => {
    try {
      const payload: CreateTaskInput = {
        title: values.title?.trim() || undefined,
        description: values.description.trim(),
        vehicleId: values.vehicleId,
        driverId: values.driverId || undefined,
        startTime: new Date(values.startTime).toISOString(),
        pickupLocation: {
          address: values.pickupLocation.address.trim(),
          lat: values.pickupLocation.lat.trim(),
          lng: values.pickupLocation.lng.trim(),
        },
        deliveryLocation: {
          address: values.deliveryLocation.address.trim(),
          lat: values.deliveryLocation.lat.trim(),
          lng: values.deliveryLocation.lng.trim(),
        },
      };

      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error('Error submitting task:', err);
    }
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="إنشاء وتعيين مهمة جديدة"
      description="حدد تفاصيل المهمة والمسار مع تخصيص المركبة والسائق التابعين لنفس الفريق"
      icon={PlusCircle}
      maxWidth="xl"
    >
      <form onSubmit={handleFormSubmit} className="space-y-5" dir="rtl">
        {/* معلومات المهمة الأساسية */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-[var(--zd-text)]">
            عنوان المهمة <span className="text-[var(--zd-muted)] text-[11px]">(اختياري)</span>
          </label>
          <div className="relative">
            <FileText className="absolute right-3 top-3 h-4 w-4 text-[var(--zd-muted)]" />
            <input
              type="text"
              {...register('title')}
              placeholder="مثال: نقل شحنة بضائع إلى مستودع الرياض"
              className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] py-2.5 pr-10 pl-3 text-sm text-[var(--zd-text)] placeholder-[var(--zd-muted)] focus:border-[var(--zd-blue)] focus:outline-none"
            />
          </div>
        </div>

        {/* وصف المهمة */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[var(--zd-text)]">
              وصف المهمة والتعليمات <span className="text-rose-500">*</span>
            </label>
            <span
              className={`text-[11px] font-medium ${
                descriptionValue.length < 15 ? 'text-amber-500' : 'text-emerald-500'
              }`}
            >
              {descriptionValue.length}/15 حرف كحد أدنى
            </span>
          </div>
          <textarea
            rows={3}
            {...register('description')}
            placeholder="اكتب وصفاً دقيقاً للمهمة (يجب ألا يقل عن 15 حرفاً بحسب معايير النظام)..."
            className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] p-3 text-sm text-[var(--zd-text)] placeholder-[var(--zd-muted)] focus:border-[var(--zd-blue)] focus:outline-none"
          />
          {errors.description && (
            <p className="text-xs text-rose-500">{errors.description.message}</p>
          )}
        </div>

        {/* اختيار المركبة والسائق (تطابق الفريق الذكي) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* المركبة */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--zd-text)]">
              المركبة المخصصة <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Truck className="absolute right-3 top-3 h-4 w-4 text-[var(--zd-muted)]" />
              <select
                value={selectedVehicleId}
                onChange={handleVehicleChange}
                className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] py-2.5 pr-10 pl-3 text-sm text-[var(--zd-text)] focus:border-[var(--zd-blue)] focus:outline-none"
              >
                <option value="">اختر المركبة...</option>
                {activeVehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.model} - لوحة: {v.plateNumber}{' '}
                    {v.isInTask ? '(في مهمة)' : ''}
                  </option>
                ))}
              </select>
            </div>
            {errors.vehicleId && (
              <p className="text-xs text-rose-500">{errors.vehicleId.message}</p>
            )}
          </div>

          {/* السائق */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--zd-text)]">
              السائق المسؤول <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute right-3 top-3 h-4 w-4 text-[var(--zd-muted)]" />
              <select
                {...register('driverId')}
                disabled={!selectedVehicleId || compatibleDrivers.length === 0}
                className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] py-2.5 pr-10 pl-3 text-sm text-[var(--zd-text)] disabled:cursor-not-allowed disabled:opacity-50 focus:border-[var(--zd-blue)] focus:outline-none"
              >
                {!selectedVehicleId ? (
                  <option value="">اختر المركبة أولاً لمعاينة سائقي فريقها</option>
                ) : compatibleDrivers.length === 0 ? (
                  <option value="">لا يوجد سائقون نشطون في نفس فريق المركبة</option>
                ) : (
                  <>
                    <option value="">اختر السائق...</option>
                    {compatibleDrivers.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name || d.email} ({d.phone || 'بدون هاتف'})
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
            {errors.driverId && (
              <p className="text-xs text-rose-500">{errors.driverId.message}</p>
            )}
          </div>
        </div>

        {/* تنبيه ذكي لتطابق الفريق */}
        {selectedVehicleId && (
          <div className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 p-2.5 text-xs text-blue-400">
            <Info className="h-4 w-4 shrink-0 text-blue-400" />
            <span>
              {vehicleTeamId
                ? 'تم حصر السائقين المعروضين في نفس فريق المركبة لضمان قبول المهمة بدون تعارض.'
                : 'تنبيه: هذه المركبة غير مرتبطة بفريق تشغيلي، يُفضل تعيينها لفريق أولاً.'}
            </span>
          </div>
        )}

        {/* موعد الانطلاق */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--zd-text)]">
            موعد وتاريخ انطلاق المهمة <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute right-3 top-3 h-4 w-4 text-[var(--zd-muted)]" />
            <input
              type="datetime-local"
              {...register('startTime')}
              className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] py-2.5 pr-10 pl-3 text-sm text-[var(--zd-text)] focus:border-[var(--zd-blue)] focus:outline-none"
            />
          </div>
          {errors.startTime && (
            <p className="text-xs text-rose-500">{errors.startTime.message}</p>
          )}
        </div>

        {/* المسار الجغرافي: الانطلاق والتسليم */}
        <div className="space-y-4 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--zd-text)]">
              بيانات المسار الجغرافي (الانطلاق والتسليم)
            </span>
            <span className="text-[10px] text-[var(--zd-muted)]">إحداثيات وعناوين دقيقة</span>
          </div>

          {/* نقطة الانطلاق */}
          <div className="space-y-2 border-b border-[var(--zd-line)] pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500">
              <MapPin className="h-4 w-4" /> نقطة الانطلاق (Pickup)
            </div>
            <input
              type="text"
              {...register('pickupLocation.address')}
              placeholder="عنوان الانطلاق (مثال: مستودع السلي، الرياض)"
              className="w-full rounded-lg border border-[var(--zd-line)] bg-[var(--zd-surface-2)] px-3 py-2 text-xs text-[var(--zd-text)] focus:border-[var(--zd-blue)] focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                {...register('pickupLocation.lat')}
                placeholder="خط العرض (Lat) مثل 24.7136"
                className="w-full rounded-lg border border-[var(--zd-line)] bg-[var(--zd-surface-2)] px-3 py-1.5 text-xs text-[var(--zd-text)] focus:border-[var(--zd-blue)] focus:outline-none"
              />
              <input
                type="text"
                {...register('pickupLocation.lng')}
                placeholder="خط الطول (Lng) مثل 46.6753"
                className="w-full rounded-lg border border-[var(--zd-line)] bg-[var(--zd-surface-2)] px-3 py-1.5 text-xs text-[var(--zd-text)] focus:border-[var(--zd-blue)] focus:outline-none"
              />
            </div>
            {errors.pickupLocation?.address && (
              <p className="text-[11px] text-rose-500">
                {errors.pickupLocation.address.message}
              </p>
            )}
          </div>

          {/* نقطة التسليم */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-500">
              <Navigation className="h-4 w-4" /> نقطة التسليم والوصول (Delivery)
            </div>
            <input
              type="text"
              {...register('deliveryLocation.address')}
              placeholder="عنوان التسليم (مثال: فرع الملز، الرياض)"
              className="w-full rounded-lg border border-[var(--zd-line)] bg-[var(--zd-surface-2)] px-3 py-2 text-xs text-[var(--zd-text)] focus:border-[var(--zd-blue)] focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                {...register('deliveryLocation.lat')}
                placeholder="خط العرض (Lat) مثل 24.6644"
                className="w-full rounded-lg border border-[var(--zd-line)] bg-[var(--zd-surface-2)] px-3 py-1.5 text-xs text-[var(--zd-text)] focus:border-[var(--zd-blue)] focus:outline-none"
              />
              <input
                type="text"
                {...register('deliveryLocation.lng')}
                placeholder="خط الطول (Lng) مثل 46.7321"
                className="w-full rounded-lg border border-[var(--zd-line)] bg-[var(--zd-surface-2)] px-3 py-1.5 text-xs text-[var(--zd-text)] focus:border-[var(--zd-blue)] focus:outline-none"
              />
            </div>
            {errors.deliveryLocation?.address && (
              <p className="text-[11px] text-rose-500">
                {errors.deliveryLocation.address.message}
              </p>
            )}
          </div>

          {/* أزرار سريعة لتعبئة مواقع تجريبية سريعة */}
          <div className="pt-2">
            <p className="mb-1.5 text-[11px] text-[var(--zd-muted)]">مواقع لوجستية شائعة للتعبئة السريعة:</p>
            <div className="flex flex-wrap gap-1.5">
              {SAUDI_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setValue('pickupLocation.address', preset.name);
                    setValue('pickupLocation.lat', preset.lat);
                    setValue('pickupLocation.lng', preset.lng);
                  }}
                  className="rounded-md border border-[var(--zd-line)] bg-[var(--zd-surface-2)] px-2 py-1 text-[10px] text-[var(--zd-muted)] hover:border-emerald-500 hover:text-emerald-500"
                >
                  انطلاق: {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading || isSubmitting}
            className="rounded-xl border border-[var(--zd-line)] px-4 py-2.5 text-xs font-semibold text-[var(--zd-muted)] hover:bg-[var(--zd-surface-2)] hover:text-[var(--zd-text)]"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-[var(--zd-blue)] px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading || isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>إنشاء وتعيين المهمة</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
