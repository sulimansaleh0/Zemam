'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Loader2,
  Mail,
  UserPlus,
  Users,
  User,
  Phone,
  FileText,
  Calendar,
  Truck,
  Car,
  CheckCircle2,
  ShieldCheck,
  Building,
  AlertCircle,
} from 'lucide-react';
import { createDriverSchema, type CreateDriverFormValues } from '../schemas/driver.schema';
import { useTeams } from '@/features/teams';
import { useVehicles } from '@/features/vehicles';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getDriverTeamId, getDriverTeamName } from '../utils/driverHelpers';
import { Modal } from '@/shared/ui/Modal';

interface DriverModalProps {
  onClose: () => void;
  onSave: (data: CreateDriverFormValues) => Promise<void>;
  isLoading: boolean;
}

export function DriverModal({ onClose, onSave, isLoading }: DriverModalProps) {
  const { user } = useAuth();
  const isFleetManager =
    user?.role === 'fleet_manager' || user?.role === 'fleet-manager';
  const { data: teamsList = [], isLoading: isLoadingTeams } = useTeams();
  const { data: vehiclesList = [], isLoading: isLoadingVehicles } = useVehicles();

  const userTeamId = getDriverTeamId(user?.teamId);
  const userTeamName =
    getDriverTeamName(user?.teamId, teamsList) || 'فريقك التشغيلي';

  // State for selected license types
  const [selectedLicenseTypes, setSelectedLicenseTypes] = useState<('normal' | 'van' | 'truck')[]>([
    'normal',
  ]);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateDriverFormValues>({
    resolver: zodResolver(createDriverSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      teamId: isFleetManager && userTeamId ? userTeamId : '',
      vehicleId: '',
      licenseNumber: '',
      licenseTypes: ['normal'],
      licenseExpiry: '',
    },
  });

  const selectedTeamId = watch('teamId') || (isFleetManager ? userTeamId : '');

  // Filter vehicles: available (no driver assigned) and matching team if selected
  const availableVehicles = vehiclesList.filter((v) => {
    // If already has driver, exclude
    if (v.driverId) return false;
    if (selectedTeamId) {
      const vTeam = typeof v.teamId === 'object' && v.teamId !== null ? v.teamId._id : v.teamId;
      return String(vTeam) === String(selectedTeamId);
    }
    return true;
  });

  const toggleLicenseType = (type: 'normal' | 'van' | 'truck') => {
    let updated: ('normal' | 'van' | 'truck')[];
    if (selectedLicenseTypes.includes(type)) {
      if (selectedLicenseTypes.length === 1) return; // Must have at least one
      updated = selectedLicenseTypes.filter((t) => t !== type);
    } else {
      updated = [...selectedLicenseTypes, type];
    }
    setSelectedLicenseTypes(updated);
    setValue('licenseTypes', updated);
  };

  const onSubmit = handleSubmit(async (data) => {
    if (isLoading || isSubmitting) return;
    setFormError(null);
    try {
      await onSave({
        email: data.email.trim(),
        name: data.name?.trim() || undefined,
        phone: data.phone?.trim() || undefined,
        teamId: isFleetManager && userTeamId ? userTeamId : (data.teamId || undefined),
        vehicleId: data.vehicleId || undefined,
        licenseNumber: data.licenseNumber?.trim() || undefined,
        licenseTypes: selectedLicenseTypes,
        licenseExpiry: data.licenseExpiry || undefined,
      });
    } catch (error: any) {
      const msg = error instanceof Error ? error.message : 'حدث خطأ، حاول مرة أخرى';
      setFormError(msg);
      if (msg.toLowerCase().includes('email') || msg.includes('البريد')) {
        setError('email', { message: msg });
      }
    }
  });

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="إضافة سائق جديد للأسطول"
      description="أدخل بيانات السائق، فئات رخصة القيادة، والتعيين الميداني بالأسطول"
      icon={UserPlus}
      iconClassName="bg-[var(--zd-blue)]/10 text-[var(--zd-blue)]"
      maxWidth="max-w-[580px]"
      preventClose={isLoading || isSubmitting}
      aria-labelledby="add-driver-title"
    >
      <form onSubmit={onSubmit} noValidate className="p-6 space-y-5">
        {formError && (
          <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-400 animate-in fade-in duration-150">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <p className="font-medium leading-relaxed">{formError}</p>
          </div>
        )}
        {/* Section 1: Personal and Account info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--zd-text)] pb-1 border-b border-[var(--zd-line)]">
            <User className="w-3.5 h-3.5 text-[var(--zd-blue)]" />
            <span>1. البيانات الشخصية والحساب</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Name field */}
            <div>
              <label
                htmlFor="driver-name"
                className="mb-1 block text-[11px] font-semibold text-[var(--zd-text)]"
              >
                اسم السائق الكامل (اختياري)
              </label>
              <input
                id="driver-name"
                type="text"
                placeholder="مثال: تركي الشمري"
                {...register('name')}
                disabled={isLoading || isSubmitting}
                className="zd-focus h-10 w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-input-bg)] px-3 text-[12px] text-[var(--zd-text)] outline-none transition-colors"
              />
            </div>

            {/* Phone field */}
            <div>
              <label
                htmlFor="driver-phone"
                className="mb-1 block text-[11px] font-semibold text-[var(--zd-text)]"
              >
                رقم الجوال (اختياري)
              </label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--zd-muted)]" />
                <input
                  id="driver-phone"
                  type="tel"
                  dir="ltr"
                  placeholder="05xxxxxxxx"
                  {...register('phone')}
                  disabled={isLoading || isSubmitting}
                  className="zd-focus h-10 w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-input-bg)] pr-9 pl-3 text-[12px] text-[var(--zd-text)] outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Email field */}
          <div>
            <label
              htmlFor="driver-email"
              className="mb-1 block text-[11px] font-semibold text-[var(--zd-text)]"
            >
              البريد الإلكتروني المهني <span className="text-[var(--zd-red)]">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--zd-muted)]" />
              <input
                id="driver-email"
                type="email"
                dir="ltr"
                autoComplete="email"
                placeholder="driver@company.com"
                {...register('email')}
                disabled={isLoading || isSubmitting}
                className={`zd-focus h-10 w-full rounded-xl border bg-[var(--zd-input-bg)] pr-9 pl-3 text-[12px] text-[var(--zd-text)] outline-none transition-colors disabled:opacity-60 ${
                  errors.email
                    ? 'border-[var(--zd-red)] focus:border-[var(--zd-red)]'
                    : 'border-[var(--zd-line)] focus:border-[var(--zd-blue)]'
                }`}
              />
            </div>
            {errors.email && (
              <p role="alert" className="mt-1 text-[10px] font-medium text-[var(--zd-red)]">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        {/* Section 2: Driver License & Arab Hierarchy */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--zd-text)] pb-1 border-b border-[var(--zd-line)]">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>2. رخصة القيادة والاعتماد النظامي</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* License Number */}
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[var(--zd-text)]">
                رقم رخصة القيادة
              </label>
              <div className="relative">
                <FileText className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--zd-muted)]" />
                <input
                  type="text"
                  placeholder="مثال: 1098765432"
                  {...register('licenseNumber')}
                  disabled={isLoading || isSubmitting}
                  className="zd-focus h-10 w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-input-bg)] pr-9 pl-3 text-[12px] text-[var(--zd-text)] outline-none transition-colors"
                />
              </div>
            </div>

            {/* License Expiry Date */}
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[var(--zd-text)]">
                تاريخ انتهاء رخصة القيادة
              </label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--zd-muted)]" />
                <input
                  type="date"
                  {...register('licenseExpiry')}
                  disabled={isLoading || isSubmitting}
                  className="zd-focus h-10 w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-input-bg)] pr-9 pl-3 text-[12px] text-[var(--zd-text)] outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* License Categories Multi-select */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-[var(--zd-text)]">
              فئات القيادة المصرح له بها (وفق النظام المروري):
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'normal', label: 'خفيف (سيارات)', desc: 'سيارات صغيرة وسيدان' },
                { id: 'van', label: 'متوسط (حافلات)', desc: 'فان، حافلات ركاب' },
                { id: 'truck', label: 'ثقيل (شاحنات)', desc: 'قاطرات، شاحنات نقل' },
              ].map((cat) => {
                const isSelected = selectedLicenseTypes.includes(cat.id as any);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleLicenseType(cat.id as any)}
                    className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[var(--zd-blue)] bg-[var(--zd-blue)]/10 ring-1 ring-[var(--zd-blue)]'
                        : 'border-[var(--zd-line)] bg-[var(--zd-surface)] hover:bg-[var(--zd-surface-2)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] font-bold text-[var(--zd-text)]">
                        {cat.label}
                      </span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--zd-blue)]" />}
                    </div>
                    <p className="text-[9px] text-[var(--zd-muted)] leading-tight">{cat.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 3: Operational Assignment */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--zd-text)] pb-1 border-b border-[var(--zd-line)]">
            <Building className="w-3.5 h-3.5 text-emerald-500" />
            <span>3. التعيين الميداني والأسطول</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Team selection */}
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[var(--zd-text)]">
                الفريق التشغيلي {isFleetManager ? '(فريقك)' : '(اختياري)'}
              </label>
              <div className="relative">
                <Users className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--zd-muted)]" />
                {isFleetManager ? (
                  <input
                    type="text"
                    readOnly
                    value={userTeamName}
                    className="h-10 w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] pr-9 pl-3 text-[11px] font-semibold text-[var(--zd-text)] cursor-not-allowed opacity-90"
                  />
                ) : (
                  <select
                    {...register('teamId')}
                    disabled={isLoading || isSubmitting || isLoadingTeams}
                    className="zd-focus h-10 w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-input-bg)] pr-9 pl-3 text-[11px] text-[var(--zd-text)] outline-none transition-colors cursor-pointer"
                  >
                    <option value="">بدون فريق (كادر حر)</option>
                    {teamsList.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Vehicle selection */}
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[var(--zd-text)]">
                إسناد مركبة أولية (اختياري)
              </label>
              <div className="relative">
                <Car className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--zd-muted)]" />
                <select
                  {...register('vehicleId')}
                  disabled={isLoading || isSubmitting || isLoadingVehicles}
                  className="zd-focus h-10 w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-input-bg)] pr-9 pl-3 text-[11px] text-[var(--zd-text)] outline-none transition-colors cursor-pointer"
                >
                  <option value="">بدون مركبة حالياً (تعيين لاحقاً)</option>
                  {availableVehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.model} - لوحة {v.plateNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--zd-line)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading || isSubmitting}
            className="zd-focus rounded-xl border border-[var(--zd-line)] px-4 py-2 text-[11px] font-semibold text-[var(--zd-text)] transition-colors hover:bg-[var(--zd-surface-2)] cursor-pointer disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="zd-focus flex items-center gap-2 rounded-xl bg-[var(--zd-blue)] px-5 py-2 text-[11px] font-semibold text-white shadow-[0_9px_22px_rgba(37,99,235,.2)] transition-opacity hover:opacity-95 cursor-pointer disabled:opacity-50"
          >
            {isLoading || isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>جارٍ الإضافة...</span>
              </>
            ) : (
              <span>إضافة السائق</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
