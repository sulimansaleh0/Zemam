'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users, UserCheck, Car, Shield, Loader2 } from 'lucide-react';
import { createTeamSchema, CreateTeamFormValues } from '../schemas/team.schema';
import { useCreateTeam, useTeams } from '../hooks/useTeams';
import { useManagers } from '@/features/managers';
import { useDriversList, getDriverTeamId } from '@/features/drivers';
import { useVehicles, getVehicleTeamId } from '@/features/vehicles';
import { Modal } from '@/shared/ui/Modal';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTeamModal({ isOpen, onClose }: CreateTeamModalProps) {
  const createTeamMutation = useCreateTeam();

  const { data: managersList = [] } = useManagers();
  const { data: driversList = [] } = useDriversList();
  const { data: vehiclesList = [] } = useVehicles();
  const { data: teamsList = [] } = useTeams();

  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);

  // Only show managers, drivers, and vehicles not yet assigned to an active team
  const availableManagers = managersList.filter(
    (m) => !m.teamId || !teamsList.some((t) => t._id === m.teamId)
  );
  const availableDrivers = driversList.filter((d) => {
    const dTeamId = getDriverTeamId(d.teamId);
    return !dTeamId || !teamsList.some((t) => t._id === dTeamId);
  });
  const availableVehicles = vehiclesList.filter((v) => {
    const vTeamId = getVehicleTeamId(v.teamId);
    return !vTeamId || !teamsList.some((t) => t._id === vTeamId);
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTeamFormValues>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: '',
      managerId: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ name: '', managerId: '' });
      setSelectedDrivers([]);
      setSelectedVehicles([]);
    }
  }, [isOpen, reset]);

  const isPending = createTeamMutation.isPending || isSubmitting;

  const toggleDriver = (id: string) => {
    setSelectedDrivers((prev) =>
      prev.includes(id) ? prev.filter((dId) => dId !== id) : [...prev, id]
    );
  };

  const toggleVehicle = (id: string) => {
    setSelectedVehicles((prev) =>
      prev.includes(id) ? prev.filter((vId) => vId !== id) : [...prev, id]
    );
  };

  const onSubmit = async (values: CreateTeamFormValues) => {
    if (isPending) return;
    try {
      await createTeamMutation.mutateAsync({
        name: values.name.trim(),
        managerId: values.managerId || undefined,
        driversIds: selectedDrivers.length > 0 ? selectedDrivers : undefined,
        vehiclesIds: selectedVehicles.length > 0 ? selectedVehicles : undefined,
      });
      onClose();
    } catch {
      // Handled by Toast in hook
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="إنشاء فريق تشغيلي جديد"
      description="تنظيم الأسطول والسائقين وإسنادهم لمدير فريق"
      icon={Users}
      iconClassName="bg-[var(--primary-light)] text-[var(--primary)]"
      maxWidth="lg"
      preventClose={isPending}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
        {/* Team Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text)]">
            اسم الفريق * <span className="text-[10px] text-[var(--muted)]">(حرفين على الأقل)</span>
          </label>
          <input
            type="text"
            {...register('name')}
            disabled={isPending}
            placeholder="مثال: فريق الرياض، فريق المنطقة الغربية، فريق العمليات..."
            className={`w-full px-3.5 py-2 text-sm bg-[var(--surface-2)] border rounded-xl text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-1 transition-colors ${
              errors.name
                ? 'border-rose-500 focus:border-rose-500'
                : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]'
            }`}
          />
          {errors.name && (
            <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Manager Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[var(--muted)]" />
            مدير الفريق المسند (اختياري)
          </label>
          <select
            {...register('managerId')}
            disabled={isPending}
            className="w-full px-3.5 py-2 text-sm bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] transition-colors cursor-pointer"
          >
            <option value="">-- بدون مدير حالياً (تعيين لاحقاً) --</option>
            {availableManagers.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name || m.email} ({m.email})
              </option>
            ))}
          </select>
        </div>

        {/* Drivers Selection */}
        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-semibold text-[var(--text)] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[var(--muted)]" />
              إضافة سائقين للفريق (اختياري)
            </span>
            <span className="text-[11px] text-[var(--muted)]">
              تم اختيار: {selectedDrivers.length}
            </span>
          </label>
          {availableDrivers.length === 0 ? (
            <p className="text-xs text-[var(--muted)] p-3 bg-[var(--surface-2)]/50 rounded-xl border border-[var(--border)]">
              لا يوجد سائقين غير معينين حالياً. يمكنك إضافة سائقين لاحقاً.
            </p>
          ) : (
            <div className="max-h-32 overflow-y-auto space-y-1 p-2 bg-[var(--surface-2)]/40 rounded-xl border border-[var(--border)]">
              {availableDrivers.map((d) => {
                const isChecked = selectedDrivers.includes(d._id);
                return (
                  <label
                    key={d._id}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-[var(--primary-light)] text-[var(--primary)] font-semibold'
                        : 'hover:bg-[var(--surface-2)] text-[var(--text)]'
                    }`}
                  >
                    <span>{d.name && d.name !== 'Default' ? d.name : d.email}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleDriver(d._id)}
                      disabled={isPending}
                      className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Vehicles Selection */}
        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-semibold text-[var(--text)] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-[var(--muted)]" />
              إضافة مركبات للفريق (اختياري)
            </span>
            <span className="text-[11px] text-[var(--muted)]">
              تم اختيار: {selectedVehicles.length}
            </span>
          </label>
          {availableVehicles.length === 0 ? (
            <p className="text-xs text-[var(--muted)] p-3 bg-[var(--surface-2)]/50 rounded-xl border border-[var(--border)]">
              لا توجد مركبات غير معينة حالياً. يمكنك إضافة مركبات لاحقاً.
            </p>
          ) : (
            <div className="max-h-32 overflow-y-auto space-y-1 p-2 bg-[var(--surface-2)]/40 rounded-xl border border-[var(--border)]">
              {availableVehicles.map((v) => {
                const isChecked = selectedVehicles.includes(v._id);
                return (
                  <label
                    key={v._id}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'hover:bg-[var(--surface-2)] text-[var(--text)]'
                    }`}
                  >
                    <span>
                      {v.model} ({v.year}) - لوحة: {v.plateNumber}
                    </span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleVehicle(v._id)}
                      disabled={isPending}
                      className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>إنشاء الفريق</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
