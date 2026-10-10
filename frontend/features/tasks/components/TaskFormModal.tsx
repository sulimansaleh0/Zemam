'use client';

import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  Loader2,
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
  teamId?: string | { _id: string; name?: string } | null;
  driverId?: string | { _id: string; name?: string } | null;
}

interface DriverOption {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  status?: string;
  teamId?: string | { _id: string; name?: string } | null;
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

  const [formError, setFormError] = useState<string | null>(null);
  const [manualTeamId, setManualTeamId] = useState<string | null>(null);

  // حساب القيم المبدئية للنموذج عند الفتح أو التعديل دون الحاجة لـ useEffect
  const formValues = useMemo<CreateTaskFormValues>(() => {
    if (!initialTask) {
      return {
        description: '',
        vehicleId: '',
        driverId: '',
        startTime: '',
        expectedEndTime: '',
        pickupLocation: { address: '', lat: '', lng: '' },
        deliveryLocation: { address: '', lat: '', lng: '' },
      };
    }

    const vId =
      typeof initialTask.vehicleId === 'object' && initialTask.vehicleId !== null
        ? initialTask.vehicleId._id
        : String(initialTask.vehicleId || '');

    const dId =
      typeof initialTask.driverId === 'object' && initialTask.driverId !== null
        ? initialTask.driverId._id
        : String(initialTask.driverId || '');

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

    return {
      description: initialTask.description || '',
      vehicleId: vId,
      driverId: dId,
      startTime: formattedTime,
      expectedEndTime: formattedEndTime,
      pickupLocation: initialTask.pickupLocation || { address: '', lat: '', lng: '' },
      deliveryLocation: initialTask.deliveryLocation || { address: '', lat: '', lng: '' },
    };
  }, [initialTask]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    values: formValues,
    resetOptions: {
      keepDirtyValues: false,
    },
  });

  const descriptionValue = watch('description') || '';
  const selectedVehicleId = watch('vehicleId') || '';
  const pickupLocation = watch('pickupLocation') || { address: '', lat: '', lng: '' };
  const deliveryLocation = watch('deliveryLocation') || { address: '', lat: '', lng: '' };

  const handlePickupChange = (loc: LocationPoint) => {
    setValue('pickupLocation', loc, { shouldValidate: true });
  };

  const handleDeliveryChange = (loc: LocationPoint) => {
    setValue('deliveryLocation', loc, { shouldValidate: true });
  };

  // المركبة المختارة حالياً
  const currentVehicle = useMemo(() => {
    return vehicles.find((v) => v._id === selectedVehicleId);
  }, [vehicles, selectedVehicleId]);

  // استخراج معرف فريق المهمة المبدئي في وضع التعديل
  const initialTaskTeamId = useMemo(() => {
    if (!initialTask?.teamId) return '';
    return typeof initialTask.teamId === 'object' && initialTask.teamId !== null
      ? initialTask.teamId._id
      : String(initialTask.teamId);
  }, [initialTask]);

  // الفريق الفعال المعتمد
  const effectiveTeamId = useMemo(() => {
    if (manualTeamId !== null) return manualTeamId;
    if (initialTaskTeamId) return initialTaskTeamId;
    if (currentVehicle?.teamId) {
      return typeof currentVehicle.teamId === 'object' && currentVehicle.teamId !== null
        ? currentVehicle.teamId._id
        : String(currentVehicle.teamId);
    }
    return '';
  }, [manualTeamId, initialTaskTeamId, currentVehicle]);

  // تصفية المركبات النشطة المطابقة للفريق المختار إن وجد
  const activeVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const isActive = v.status === 'active' || !v.status;
      if (!isActive) return false;
      if (effectiveTeamId) {
        const vTeamId =
          typeof v.teamId === 'object' && v.teamId !== null ? v.teamId._id : v.teamId;
        return vTeamId === effectiveTeamId;
      }
      return true;
    });
  }, [vehicles, effectiveTeamId]);

  // تصفية السائقين التابعين لنفس الفريق التشغيلي
  const compatibleDrivers = useMemo(() => {
    if (!effectiveTeamId) return [];
    return drivers.filter((d) => {
      const driverTeamId =
        typeof d.teamId === 'object' && d.teamId !== null ? d.teamId._id : d.teamId;
      return driverTeamId === effectiveTeamId;
    });
  }, [drivers, effectiveTeamId]);

  // معالجة تغيير الفريق يدوياً
  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tId = e.target.value;
    setManualTeamId(tId);

    if (currentVehicle) {
      const vTeamId =
        typeof currentVehicle.teamId === 'object' && currentVehicle.teamId !== null
          ? currentVehicle.teamId._id
          : currentVehicle.teamId;
      if (vTeamId && vTeamId !== tId) {
        setValue('vehicleId', '', { shouldValidate: true });
        setValue('driverId', '', { shouldValidate: true });
      }
    }
  };

  // معالجة اختيار المركبة وتحديث السائق التلقائي إن وُجد
  const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vId = e.target.value;
    setValue('vehicleId', vId, { shouldValidate: true });

    const veh = vehicles.find((v) => v._id === vId);
    if (veh) {
      const vTeamId =
        typeof veh.teamId === 'object' && veh.teamId !== null ? veh.teamId._id : veh.teamId;
      if (vTeamId && !manualTeamId) {
        setManualTeamId(vTeamId);
      }
      if (veh.driverId) {
        const dId =
          typeof veh.driverId === 'object' && veh.driverId !== null
            ? veh.driverId._id
            : veh.driverId;
        setValue('driverId', dId, { shouldValidate: true });
      } else {
        setValue('driverId', '', { shouldValidate: true });
      }
    } else {
      setValue('driverId', '', { shouldValidate: true });
    }
  };

  const handleCloseModal = () => {
    setFormError(null);
    setManualTeamId(null);
    reset();
    onClose();
  };

  const handleFormSubmit = handleSubmit(async (values) => {
    setFormError(null);

    if (isAdmin && !effectiveTeamId) {
      setFormError('يرجى تحديد الفريق المسؤول عن المهمة أولاً');
      return;
    }

    try {
      const payload: CreateTaskInput = {
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
      handleCloseModal();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ المهمة';
      setFormError(message);
    }
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
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

        {/* جسم النموذج القابل للتمرير */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ── العمود الأول: تفاصيل المهمة والموارد (5 أعمدة) ── */}
            <div className="lg:col-span-5 space-y-4">
              {/* وصف المهمة */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[var(--zd-text)]">
                    وصف المهمة والتعليمات <span className="text-rose-500">*</span>
                  </label>
                  <span
                    className={`text-[10px] font-medium ${
                      descriptionValue.length < 10 ? 'text-amber-500' : 'text-emerald-500'
                    }`}
                  >
                    {descriptionValue.length}/10 أحرف كحد أدنى
                  </span>
                </div>
                <textarea
                  rows={3}
                  {...register('description')}
                  placeholder="اكتب وصفاً تفصيلياً للمهمة وتعليمات التسليم..."
                  className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] p-3 text-xs text-[var(--zd-text)] placeholder-[var(--zd-muted)] focus:border-[var(--zd-blue)] focus:outline-none transition resize-none"
                />
                {errors.description && (
                  <p className="text-xs text-rose-500">{errors.description.message}</p>
                )}
              </div>

              {/* اختيار الفريق للأدمن */}
              {isAdmin && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--zd-text)]">
                    الفريق التشغيلي المسؤول <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Users className="absolute right-3 top-3 h-4 w-4 text-[var(--zd-muted)] pointer-events-none" />
                    <select
                      value={effectiveTeamId}
                      onChange={handleTeamChange}
                      className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] py-2.5 pr-10 pl-3 text-xs text-[var(--zd-text)] focus:border-[var(--zd-blue)] focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="">— اختر الفريق المسؤول عن المهمة —</option>
                      {teams.map((team) => (
                        <option key={team._id} value={team._id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* اختيار المركبة */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--zd-text)]">
                  المركبة المخصصة للمهمة <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Truck className="absolute right-3 top-3 h-4 w-4 text-[var(--zd-muted)] pointer-events-none" />
                  <select
                    value={selectedVehicleId}
                    onChange={handleVehicleChange}
                    className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] py-2.5 pr-10 pl-3 text-xs text-[var(--zd-text)] focus:border-[var(--zd-blue)] focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="">— اختر مركبة من الأسطول —</option>
                    {activeVehicles.map((vehicle) => {
                      const isBusy = vehicle.isInTask;
                      return (
                        <option
                          key={vehicle._id}
                          value={vehicle._id}
                          disabled={Boolean(isBusy && vehicle._id !== initialTask?.vehicleId)}
                        >
                          {vehicle.model} (لوحة: {vehicle.plateNumber})
                          {isBusy ? ' [مشغولة بمهمة]' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
                {errors.vehicleId && (
                  <p className="text-xs text-rose-500">{errors.vehicleId.message}</p>
                )}
              </div>

              {/* اختيار السائق */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[var(--zd-text)]">
                    السائق المكلف بالرحلة
                  </label>
                  <span className="text-[10px] text-[var(--zd-muted)]">(اختياري)</span>
                </div>
                <div className="relative">
                  <User className="absolute right-3 top-3 h-4 w-4 text-[var(--zd-muted)] pointer-events-none" />
                  <select
                    {...register('driverId')}
                    className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] py-2.5 pr-10 pl-3 text-xs text-[var(--zd-text)] focus:border-[var(--zd-blue)] focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="">— تعيين سائق لاحقاً —</option>
                    {compatibleDrivers.map((driver) => (
                      <option key={driver._id} value={driver._id}>
                        {driver.name || driver.email} {driver.phone ? `(${driver.phone})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* موعد الانطلاق */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--zd-text)]">
                  موعد وتاريخ انطلاق المهمة <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-3 h-4 w-4 text-[var(--zd-muted)] pointer-events-none" />
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
                  <Clock className="absolute right-3 top-3 h-4 w-4 text-[var(--zd-muted)] pointer-events-none" />
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
              onClick={handleCloseModal}
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
