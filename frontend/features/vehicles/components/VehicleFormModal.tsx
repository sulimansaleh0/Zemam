'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Car,
  Calendar,
  Hash,
  UserCheck,
  Users,
  Loader2,
  Fuel,
  Gauge,
  FileText,
  Shield,
  Building,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { vehicleFormSchema, VehicleFormValues } from '../schemas/vehicle.schema';
import { useCreateVehicle, useAvailableDrivers, useAssignDriver } from '../hooks/useVehicles';
import { useTeams } from '@/features/teams';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getVehicleTeamId, getVehicleTeamName } from '../utils/vehicleHelpers';
import { checkDriverVehicleEligibility } from '@/features/drivers/utils/licenseEligibility';
import { Modal } from '@/shared/ui/Modal';

interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'basic' | 'specs' | 'docs' | 'assign';

export function VehicleFormModal({ isOpen, onClose }: VehicleFormModalProps) {
  const { user } = useAuth();
  const isFleetManager =
    user?.role === 'fleet_manager' || user?.role === 'fleet-manager';

  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [formError, setFormError] = useState<string | null>(null);
  const { data: teamsList = [], isLoading: isLoadingTeams } = useTeams();
  const { drivers: availableDrivers = [], isLoading: isLoadingDrivers } = useAvailableDrivers();
  const createVehicleMutation = useCreateVehicle();
  const assignDriverMutation = useAssignDriver();

  const userTeamId = getVehicleTeamId(user?.teamId);
  const userTeamName =
    getVehicleTeamName(user?.teamId, teamsList) || 'فريقك التشغيلي';

  // If fleet manager, filter drivers to only their team
  const filteredDrivers = isFleetManager && userTeamId
    ? availableDrivers.filter((d) => {
        const dTeamId = getVehicleTeamId(d.teamId);
        return String(dTeamId) === String(userTeamId);
      })
    : availableDrivers;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      model: '',
      year: new Date().getFullYear(),
      plateNumber: '',
      vehicleType: 'normal',
      tankCapacity: 60,
      fuelType: 'بنزين 91',
      currentOdometer: 0,
      expectedFuelEfficiency: 12,
      licenseNumber: '',
      licenseExpiry: '',
      insuranceCompany: '',
      insuranceNumber: '',
      insuranceType: 'comprehensive',
      insuranceExpiry: '',
      teamId: isFleetManager && userTeamId ? userTeamId : '',
      driverId: '',
    },
  });

  const selectedVehicleType = watch('vehicleType') || 'normal';
  const selectedDriverId = watch('driverId');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('basic');
      setFormError(null);
      reset({
        model: '',
        year: new Date().getFullYear(),
        plateNumber: '',
        vehicleType: 'normal',
        tankCapacity: 60,
        fuelType: 'بنزين 91',
        currentOdometer: 0,
        expectedFuelEfficiency: 12,
        licenseNumber: '',
        licenseExpiry: '',
        insuranceCompany: '',
        insuranceNumber: '',
        insuranceType: 'comprehensive',
        insuranceExpiry: '',
        teamId: isFleetManager && userTeamId ? userTeamId : '',
        driverId: '',
      });
    }
  }, [isOpen, isFleetManager, userTeamId, reset]);

  // Check driver eligibility for selected vehicle type
  const selectedDriverObj = filteredDrivers.find((d) => d._id === selectedDriverId);
  const driverEligibility = selectedDriverObj
    ? checkDriverVehicleEligibility(selectedDriverObj, { vehicleType: selectedVehicleType })
    : null;

  const isPending =
    createVehicleMutation.isPending || assignDriverMutation.isPending || isSubmitting;

  const onSubmit = async (values: VehicleFormValues) => {
    if (isPending) return;
    setFormError(null);
    try {
      const assignedTeamId = isFleetManager && userTeamId ? userTeamId : (values.teamId || undefined);

      const newVehicle = await createVehicleMutation.mutateAsync({
        model: values.model.trim(),
        year: Number(values.year),
        plateNumber: String(values.plateNumber).trim(),
        vehicleType: values.vehicleType,
        tankCapacity: values.tankCapacity ? Number(values.tankCapacity) : undefined,
        fuelType: values.fuelType,
        currentOdometer: Number(values.currentOdometer) || 0,
        expectedFuelEfficiency: Number(values.expectedFuelEfficiency) || 12,
        licenseNumber: values.licenseNumber?.trim() || undefined,
        licenseExpiry: values.licenseExpiry ? new Date(values.licenseExpiry).toISOString() : undefined,
        insuranceCompany: values.insuranceCompany?.trim() || undefined,
        insuranceNumber: values.insuranceNumber?.trim() || undefined,
        insuranceType: values.insuranceType,
        insuranceExpiry: values.insuranceExpiry ? new Date(values.insuranceExpiry).toISOString() : undefined,
        teamId: assignedTeamId,
      });

      // إذا اختار المستخدم سائقاً أثناء إنشاء المركبة وكان مؤهلاً، نقوم بتعيينه فوراً
      if (values.driverId && newVehicle?._id) {
        if (!driverEligibility || driverEligibility.eligible) {
          await assignDriverMutation.mutateAsync({
            vehicleId: newVehicle._id,
            driverId: values.driverId,
          });
        }
      }

      onClose();
    } catch (err: any) {
      setFormError(err?.message || 'تعذر تسجيل المركبة، يرجى التحقق من البيانات والمحاولة مجدداً');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="إضافة مركبة جديدة للأسطول"
      description="أدخل مواصفات المركبة وبيانات الاستمارة والتأمين وتعيين الفريق والسائق"
      icon={Car}
      iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
      maxWidth="max-w-2xl"
      preventClose={isPending}
      aria-labelledby="vehicle-modal-title"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        {formError && (
          <div className="mx-6 mt-4 flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-400 animate-in fade-in duration-150">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <p className="font-medium leading-relaxed">{formError}</p>
          </div>
        )}
        {/* Navigation Tabs */}
        <div className="flex border-b border-[var(--border)] bg-[var(--surface-2)]/30 px-6 pt-3 gap-2 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'basic'
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>1. الهيكل واللوحة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'specs'
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <Fuel className="w-3.5 h-3.5" />
            <span>2. الوقود والعداد</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('docs')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'docs'
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>3. الرخصة والتأمين</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('assign')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'assign'
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>4. الفريق والسائق</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
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
                    {...register('model')}
                    disabled={isPending}
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
                      {...register('year')}
                      disabled={isPending}
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
                      type="number"
                      placeholder="1234"
                      dir="ltr"
                      {...register('plateNumber')}
                      disabled={isPending}
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

              {/* Vehicle Type (Arab hierarchy) */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-2">
                  فئة ونوع المركبة (المطابقة لرخص القيادة)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'normal', label: 'سيارة خاصة (خفيف)', desc: 'تتطلب رخصة قيادة خفيف فما فوق' },
                    { id: 'van', label: 'فان / حافلة (متوسط)', desc: 'تتطلب رخصة متوسط أو ثقيل' },
                    { id: 'truck', label: 'شاحنة نقل (ثقيل)', desc: 'تتطلب رخصة قيادة ثقيل حصراً' },
                  ].map((cat) => {
                    const isSelected = selectedVehicleType === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setValue('vehicleType', cat.id as any)}
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
              </div>
            </div>
          )}

          {/* TAB 2: SPECS, FUEL & ODOMETER */}
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Fuel Type */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
                    نوع الوقود المعتمد
                  </label>
                  <div className="relative">
                    <Fuel className="w-4 h-4 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      {...register('fuelType')}
                      className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all cursor-pointer"
                    >
                      <option value="بنزين 91">بنزين 91</option>
                      <option value="بنزين 95">بنزين 95</option>
                      <option value="ديزل">ديزل</option>
                      <option value="هجين (هايبرد)">هجين (هايبرد)</option>
                      <option value="كهربائي">كهربائي</option>
                    </select>
                  </div>
                </div>

                {/* Tank Capacity */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
                    سعة خزان الوقود (لتر)
                  </label>
                  <div className="relative">
                    <Fuel className="w-4 h-4 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      placeholder="60"
                      {...register('tankCapacity')}
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
                {/* Current Odometer */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
                    قراءة العداد الحالية (كم)
                  </label>
                  <div className="relative">
                    <Gauge className="w-4 h-4 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      placeholder="0"
                      {...register('currentOdometer')}
                      className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                    />
                  </div>
                  {errors.currentOdometer && (
                    <span className="text-[11px] text-rose-500 mt-1 block">
                      {errors.currentOdometer.message}
                    </span>
                  )}
                </div>

                {/* Expected Fuel Efficiency */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
                    كفاءة الاستهلاك المتوقعة (كم/لتر)
                  </label>
                  <div className="relative">
                    <Gauge className="w-4 h-4 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="12"
                      {...register('expectedFuelEfficiency')}
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
          )}

          {/* TAB 3: REGISTRATION & INSURANCE */}
          {activeTab === 'docs' && (
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
                      رقم رخصة السير
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: 987654321"
                      {...register('licenseNumber')}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--muted)] mb-1">
                      تاريخ انتهاء الاستمارة
                    </label>
                    <input
                      type="date"
                      {...register('licenseExpiry')}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                    />
                  </div>
                </div>
              </div>

              {/* Insurance */}
              <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/40 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--text)]">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>بيانات وثيقة التأمين</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--muted)] mb-1">
                      شركة التأمين
                    </label>
                    <div className="relative">
                      <Building className="w-3.5 h-3.5 text-[var(--muted)] absolute right-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="مثال: التعاونية أو تكافل الراجحي"
                        {...register('insuranceCompany')}
                        className="w-full pr-8 pl-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--muted)] mb-1">
                      نوع التأمين
                    </label>
                    <select
                      {...register('insuranceType')}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                    >
                      <option value="comprehensive">تأمين شامل</option>
                      <option value="third_party">ضد الغير (إلزامي)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--muted)] mb-1">
                      رقم وثيقة التأمين
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: POL-2024-889"
                      {...register('insuranceNumber')}
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
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ASSIGN TEAM & DRIVER */}
          {activeTab === 'assign' && (
            <div className="space-y-4">
              {/* Assign Team */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
                  الفريق التشغيلي {isFleetManager ? '(فريقك)' : '(اختياري)'}
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  {isFleetManager ? (
                    <input
                      type="text"
                      readOnly
                      value={userTeamName}
                      className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-xs font-semibold text-[var(--text)] cursor-not-allowed opacity-90"
                    />
                  ) : (
                    <select
                      {...register('teamId')}
                      disabled={isPending || isLoadingTeams}
                      className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all cursor-pointer"
                    >
                      <option value="">المستودع العام (بدون فريق حالياً)</option>
                      {teamsList.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Assign Driver */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
                  السائق المسؤول (اختياري مع فحص الأهلية)
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    {...register('driverId')}
                    disabled={isPending || isLoadingDrivers}
                    className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all cursor-pointer"
                  >
                    <option value="">بدون سائق حالياً (تعيين لاحقاً)</option>
                    {filteredDrivers.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name !== 'Default' ? d.name : d.email.split('@')[0]} ({d.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Driver Eligibility Alert */}
                {selectedDriverObj && driverEligibility && (
                  <div
                    className={`mt-2 p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                      driverEligibility.eligible
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {driverEligibility.eligible ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>السائق مؤهل رسمياً لقيادة هذه الفئة من المركبات.</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{driverEligibility.reason || 'السائق غير مؤهل لقيادة هذا النوع من المركبات.'}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-[var(--border)] bg-[var(--surface-2)]/20">
          <div className="flex items-center gap-2">
            {activeTab !== 'basic' && (
              <button
                type="button"
                onClick={() => {
                  if (activeTab === 'assign') setActiveTab('docs');
                  else if (activeTab === 'docs') setActiveTab('specs');
                  else if (activeTab === 'specs') setActiveTab('basic');
                }}
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] rounded-xl transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                <span>السابق</span>
              </button>
            )}
            {activeTab !== 'assign' && (
              <button
                type="button"
                onClick={() => {
                  if (activeTab === 'basic') setActiveTab('specs');
                  else if (activeTab === 'specs') setActiveTab('docs');
                  else if (activeTab === 'docs') setActiveTab('assign');
                }}
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-xl transition-colors cursor-pointer"
              >
                <span>التالي</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جارٍ الحفظ...</span>
                </>
              ) : (
                <span>تسجيل المركبة</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
