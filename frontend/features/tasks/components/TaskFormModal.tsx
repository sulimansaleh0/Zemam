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
  Pencil,
  PlusCircle,
  Truck,
  User,
  Users,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Modal } from '@/shared/ui/Modal';
import {
  createTaskSchema,
  type CreateTaskFormValues,
} from '../schemas/task.schema';
import type { CreateTaskInput, LocationPoint, TaskWithRelations } from '../types/task.types';
import { TaskRouteMapPicker } from './TaskRouteMapPicker';

interface TeamOption {
  _id: string;
  name: string;
}

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
  teams?: TeamOption[];
  initialTask?: TaskWithRelations | null;
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
  teams = [],
  initialTask,
}: TaskFormModalProps) {
  const { user } = useAuth();
  const isAdmin = user?.role !== 'fleet-manager' && user?.role !== 'fleet_manager';

  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

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
      expectedEndTime: '',
      pickupLocation: { address: '', lat: '', lng: '' },
      deliveryLocation: { address: '', lat: '', lng: '' },
    },
  });

  const descriptionValue = watch('description') || '';
  const pickupLocation = watch('pickupLocation') || { address: '', lat: '', lng: '' };
  const deliveryLocation = watch('deliveryLocation') || { address: '', lat: '', lng: '' };

  const handlePickupChange = (loc: LocationPoint) => {
    setValue('pickupLocation', loc, { shouldValidate: true });
  };

  const handleDeliveryChange = (loc: LocationPoint) => {
    setValue('deliveryLocation', loc, { shouldValidate: true });
  };

  // إيجاد المركبة المختارة حالياً
  const currentVehicle = useMemo(() => {
    return vehicles.find((v) => v._id === selectedVehicleId);
  }, [vehicles, selectedVehicleId]);

  // استخراج معرف فريق المركبة
  const vehicleTeamId = useMemo(() => {
    if (!currentVehicle?.teamId) return null;
    return typeof currentVehicle.teamId === 'object'
      ? currentVehicle.teamId._id
      : currentVehicle.teamId;
  }, [currentVehicle]);

  // المعرف الفعال للفريق
  const effectiveTeamId = useMemo(() => {
    return selectedTeamId || vehicleTeamId || '';
  }, [selectedTeamId, vehicleTeamId]);

  // تصفية المركبات المتاحة والنشطة مع مراعاة الفريق المختار إن وجد
  const activeVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const isActive = v.status === 'active' || !v.status;
      if (!isActive) return false;
      if (selectedTeamId) {
        const vTeamId = typeof v.teamId === 'object' ? v.teamId?._id : v.teamId;
        return vTeamId === selectedTeamId;
      }
      return true;
    });
  }, [vehicles, selectedTeamId]);

  // تصفية السائقين التابعين لنفس الفريق التشغيلي تلقائياً لمنع خطأ 400
  const compatibleDrivers = useMemo(() => {
    if (!effectiveTeamId) return [];
    return drivers.filter((d) => {
      const driverTeamId =
        typeof d.teamId === 'object' ? d.teamId?._id : d.teamId;
      return driverTeamId === effectiveTeamId;
    });
  }, [drivers, effectiveTeamId]);

  // عند تغيير الفريق يدوياً من الأدمن
  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tId = e.target.value;
    setSelectedTeamId(tId);

    // إذا تغير الفريق وكانت المركبة الحالية لا تنتمي للفريق الجديد، يتم تفريغ الاختيار
    if (currentVehicle) {
      const vTeamId =
        typeof currentVehicle.teamId === 'object'
          ? currentVehicle.teamId._id
          : currentVehicle.teamId;
      if (vTeamId && vTeamId !== tId) {
        setSelectedVehicleId('');
        setValue('vehicleId', '', { shouldValidate: true });
        setValue('driverId', '', { shouldValidate: true });
      }
    }
  };

  // عند تغيير المركبة، يتم تعيين سائقها التلقائي أو تحديث قائمة السائقين وتحديث الفريق إن لم يكن محدداً
  const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vId = e.target.value;
    setSelectedVehicleId(vId);
    setValue('vehicleId', vId, { shouldValidate: true });

    const veh = vehicles.find((v) => v._id === vId);
    if (veh) {
      const vTeamId = typeof veh.teamId === 'object' ? veh.teamId?._id : veh.teamId;
      if (vTeamId && !selectedTeamId) {
        setSelectedTeamId(vTeamId);
      }
      if (veh.driverId) {
        const dId =
          typeof veh.driverId === 'object' ? veh.driverId._id : veh.driverId;
        setValue('driverId', dId, { shouldValidate: true });
      } else {
        setValue('driverId', '', { shouldValidate: true });
      }
    } else {
      setValue('driverId', '', { shouldValidate: true });
    }
  };

  // ملء النموذج في وضع التعديل، أو إعادة ضبطه عند الإغلاق
  useEffect(() => {
    if (isOpen && initialTask) {
      const vId =
        typeof initialTask.vehicleId === 'object'
          ? initialTask.vehicleId._id
          : initialTask.vehicleId;
      const dId =
        typeof initialTask.driverId === 'object'
          ? initialTask.driverId._id
          : initialTask.driverId || '';
      const tId =
        typeof initialTask.teamId === 'object'
          ? (initialTask.teamId as any)?._id
          : initialTask.teamId || '';

      setSelectedVehicleId(vId);
      setSelectedTeamId(tId);

      let formattedTime = '';
      if (initialTask.startTime) {
        try {
          const d = new Date(initialTask.startTime);
          const offset = d.getTimezoneOffset() * 60000;
          formattedTime = new Date(d.getTime() - offset).toISOString().slice(0, 16);
        } catch {
          formattedTime = '';
        }
      }

      let formattedEndTime = '';
      if (initialTask.expectedEndTime) {
        try {
          const d = new Date(initialTask.expectedEndTime);
          const offset = d.getTimezoneOffset() * 60000;
          formattedEndTime = new Date(d.getTime() - offset).toISOString().slice(0, 16);
        } catch {
          formattedEndTime = '';
        }
      }

      reset({
        title: initialTask.title || '',
        description: initialTask.description || '',
        vehicleId: vId,
        driverId: dId,
        startTime: formattedTime,
        expectedEndTime: formattedEndTime,
        pickupLocation: initialTask.pickupLocation || { address: '', lat: '', lng: '' },
        deliveryLocation: initialTask.deliveryLocation || { address: '', lat: '', lng: '' },
      });
    } else if (!isOpen) {
      reset({
        title: '',
        description: '',
        vehicleId: '',
        driverId: '',
        startTime: '',
        expectedEndTime: '',
        pickupLocation: { address: '', lat: '', lng: '' },
        deliveryLocation: { address: '', lat: '', lng: '' },
      });
      setSelectedVehicleId('');
      setSelectedTeamId('');
    }
    setFormError(null);
  }, [isOpen, initialTask, reset]);

  const handleFormSubmit = handleSubmit(async (values) => {
    setFormError(null);

    if (isAdmin && !effectiveTeamId) {
      setFormError('يرجى تحديد الفريق المسؤول عن المهمة أولاً');
      return;
    }

    try {
      const payload: CreateTaskInput = {
        title: values.title?.trim() || undefined,
        description: values.description.trim(),
        teamId: effectiveTeamId || undefined,
        vehicleId: values.vehicleId,
        driverId: values.driverId || undefined,
        startTime: new Date(values.startTime).toISOString(),
        expectedEndTime: values.expectedEndTime ? new Date(values.expectedEndTime).toISOString() : undefined,
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
    } catch (err: any) {
      setFormError(err?.message || 'حدث خطأ أثناء حفظ المهمة');
    }
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTask ? 'تعديل بيانات المهمة' : 'إنشاء وتعيين مهمة جديدة'}
      description={
        initialTask
          ? 'تعديل بيانات المهمة والمسار وتعيين السائق طالما أنها لا تزال قيد الانتظار'
          : 'حدد تفاصيل المهمة والمسار مع تخصيص المركبة والسائق التابعين لنفس الفريق'
      }
      icon={initialTask ? Pencil : PlusCircle}
      maxWidth="5xl"
    >
      <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden" dir="rtl">
        {formError && (
          <div className="mx-5 mt-4 sm:mx-6 flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-400 animate-in fade-in duration-150">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <p className="font-medium leading-relaxed">{formError}</p>
          </div>
        )}
        {/* الجسم القابل للتمرير */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ── العمود الأول: بيانات وتفاصيل المهمة (5 أعمدة) ── */}
            <div className="lg:col-span-5 space-y-4">
              {/* عنوان المهمة */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--zd-text)]">
                  عنوان المهمة <span className="text-[var(--zd-muted)] text-[11px]">(اختياري)</span>
                </label>
                <div className="relative">
                  <FileText className="absolute right-3 top-3 h-4 w-4 text-[var(--zd-muted)]" />
                  <input
                    type="text"
                    {...register('title')}
                    placeholder="مثال: نقل شحنة بضائع إلى مستودع الرياض"
                    className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] py-2.5 pr-10 pl-3 text-xs text-[var(--zd-text)] placeholder-[var(--zd-muted)] focus:border-[var(--zd-blue)] focus:outline-none"
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
                    className={`text-[10px] font-medium ${
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
                  className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] p-3 text-xs text-[var(--zd-text)] placeholder-[var(--zd-muted)] focus:border-[var(--zd-blue)] focus:outline-none"
                />
                {errors.description && (
                  <p className="text-xs text-rose-500">{errors.description.message}</p>
                )}
              </div>

              {/* الفريق المسؤول (للأدمن أو عند وجود قائمة فرق) */}
              {(isAdmin || teams.length > 0) && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[var(--zd-text)]">
                      الفريق المسؤول {isAdmin && <span className="text-rose-500">*</span>}
                    </label>
                    {selectedTeamId && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTeamId('');
                          setSelectedVehicleId('');
                          setValue('vehicleId', '', { shouldValidate: true });
                          setValue('driverId', '', { shouldValidate: true });
                        }}
                        className="text-[10px] text-[var(--zd-muted)] hover:text-rose-400 transition cursor-pointer"
                      >
                        إلغاء التحديد
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Users className="absolute right-3 top-3 h-4 w-4 text-[var(--zd-muted)]" />
                    <select
                      value={selectedTeamId}
                      onChange={handleTeamChange}
                      className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] py-2.5 pr-10 pl-3 text-xs text-[var(--zd-text)] focus:border-[var(--zd-blue)] focus:outline-none"
                    >
                      <option value="">
                        {isAdmin ? 'اختر الفريق التشغيلي المسؤول...' : 'تصفية حسب الفريق (اختياري)...'}
                      </option>
                      {teams.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {isAdmin && !selectedTeamId && (
                    <p className="text-[10px] text-amber-500">
                      يجب تحديد الفريق لتصفية المركبات والسائقين التابعين له
                    </p>
                  )}
                </div>
              )}

              {/* المركبة المخصصة */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--zd-text)]">
                  المركبة المخصصة <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Truck className="absolute right-3 top-3 h-4 w-4 text-[var(--zd-muted)]" />
                  <select
                    value={selectedVehicleId}
                    onChange={handleVehicleChange}
                    className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] py-2.5 pr-10 pl-3 text-xs text-[var(--zd-text)] focus:border-[var(--zd-blue)] focus:outline-none"
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

              {/* السائق المسؤول */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--zd-text)]">
                  السائق المسؤول <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-3 h-4 w-4 text-[var(--zd-muted)]" />
                  <select
                    {...register('driverId')}
                    disabled={!selectedVehicleId || compatibleDrivers.length === 0}
                    className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] py-2.5 pr-10 pl-3 text-xs text-[var(--zd-text)] disabled:cursor-not-allowed disabled:opacity-50 focus:border-[var(--zd-blue)] focus:outline-none"
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

              {/* تنبيه ذكي لتطابق الفريق */}
              {effectiveTeamId ? (
                <div className="flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5 text-[11px] text-blue-400">
                  <Info className="h-4 w-4 shrink-0 text-blue-400" />
                  <span>
                    تم قصر السائقين والمركبات على نفس الفريق التشغيلي لضمان قبول المهمة.
                  </span>
                </div>
              ) : (
                selectedVehicleId && (
                  <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5 text-[11px] text-amber-400">
                    <Info className="h-4 w-4 shrink-0 text-amber-400" />
                    <span>تنبيه: هذه المركبة غير مرتبطة بفريق تشغيلي حالياً.</span>
                  </div>
                )
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
                    className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] py-2.5 pr-10 pl-3 text-xs text-[var(--zd-text)] focus:border-[var(--zd-blue)] focus:outline-none"
                  />
                </div>
                {errors.startTime && (
                  <p className="text-xs text-rose-500">{errors.startTime.message}</p>
                )}
              </div>

              {/* موعد التسليم المتوقع */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--zd-text)]">
                  الوقت المتوقع للتسليم <span className="text-[var(--zd-muted)] text-[11px]">(اختياري)</span>
                </label>
                <div className="relative">
                  <Clock className="absolute right-3 top-3 h-4 w-4 text-[var(--zd-muted)]" />
                  <input
                    type="datetime-local"
                    {...register('expectedEndTime')}
                    className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] py-2.5 pr-10 pl-3 text-xs text-[var(--zd-text)] focus:border-[var(--zd-blue)] focus:outline-none"
                  />
                </div>
                {errors.expectedEndTime && (
                  <p className="text-xs text-rose-500">{errors.expectedEndTime.message}</p>
                )}
              </div>
            </div>

            {/* ── العمود الثاني: الخريطة التفاعلية وتحديد المسار (7 أعمدة) ── */}
            <div className="lg:col-span-7 space-y-3">
              <TaskRouteMapPicker
                pickupLocation={pickupLocation}
                deliveryLocation={deliveryLocation}
                onPickupChange={handlePickupChange}
                onDeliveryChange={handleDeliveryChange}
              />

              {(errors.pickupLocation?.address || errors.deliveryLocation?.address) && (
                <p className="text-xs text-rose-500 text-center font-medium bg-rose-500/10 border border-rose-500/20 rounded-xl p-2">
                  {errors.pickupLocation?.address?.message || errors.deliveryLocation?.address?.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── شريط الأزرار الثابت بالأسفل ── */}
        <div className="shrink-0 border-t border-[var(--zd-line)] bg-[var(--zd-surface-2)]/40 px-6 py-3.5 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-[var(--zd-muted)] flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-[var(--zd-blue)] shrink-0" />
            <span>تأكد من إكمال جميع الحقول الإلزامية وتحديد نقطتي المسار على الخريطة</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading || isSubmitting}
              className="rounded-xl border border-[var(--zd-line)] px-4 py-2 text-xs font-semibold text-[var(--zd-muted)] hover:bg-[var(--zd-surface-2)] hover:text-[var(--zd-text)] transition cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-[var(--zd-blue)] px-5 py-2 text-xs font-bold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {isLoading || isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{initialTask ? 'حفظ التعديلات' : 'إنشاء وتعيين المهمة'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
