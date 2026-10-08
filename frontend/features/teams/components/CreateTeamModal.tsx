'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users, UserCheck, Car, Shield, Loader2 } from 'lucide-react';
import { createTeamSchema, CreateTeamFormValues } from '../schemas/team.schema';
import { useCreateTeam } from '../hooks/useTeamMutations';
import { useTeams } from '../hooks/useTeams';
import { useManagers } from '@/features/managers';
import { useDriversList, getDriverTeamId } from '@/features/drivers';
import { useVehicles, getVehicleTeamId } from '@/features/vehicles';
import { Modal } from '@/shared/ui/Modal';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function CreateTeamForm({ onClose }: { onClose: () => void }) {
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
    formState: { errors, isSubmitting },
  } = useForm<CreateTeamFormValues>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: '',
      managerId: '',
    },
  });

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
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
      {/* Team Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[var(--text)]">
          اسم الفريق التشغيلي *
        </label>
        <input
          type="text"
          {...register('name')}
          placeholder="مثال: فريق الرياض الشمالي، فريق الصيانة السريعة"
          disabled={isPending}
          className="w-full px-3.5 py-2 text-sm bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] transition-colors disabled:opacity-50"
        />
        {errors.name && (
          <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Fleet Manager */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-[var(--muted)]" />
          <span>مدير الأسطول المسؤول (اختياري)</span>
        </label>
        <select
          {...register('managerId')}
          disabled={isPending}
          className="w-full px-3.5 py-2 text-sm bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] transition-colors cursor-pointer disabled:opacity-50"
        >
          <option value="">-- بدون مدير حالياً (يمكن تعيينه لاحقاً) --</option>
          {availableManagers.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name ? `${m.name} (${m.email})` : m.email}
            </option>
          ))}
        </select>
        {errors.managerId && (
          <p className="text-xs text-rose-500 mt-1">
            {errors.managerId.message}
          </p>
        )}
      </div>

      {/* Initial Drivers Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[var(--muted)]" />
            <span>السائقون المتاحون ({availableDrivers.length})</span>
          </label>
          <span className="text-[11px] text-[var(--muted)] font-medium">
            محدد: {selectedDrivers.length}
          </span>
        </div>

        <div className="max-h-36 overflow-y-auto border border-[var(--border)] rounded-xl p-2 bg-[var(--surface-2)]/50 divide-y divide-[var(--border)]">
          {availableDrivers.length === 0 ? (
            <p className="text-xs text-center text-[var(--muted)] py-3">
              لا يوجد سائقون متاحون بدون فريق حالياً
            </p>
          ) : (
            availableDrivers.map((driver) => {
              const isChecked = selectedDrivers.includes(driver._id);
              return (
                <label
                  key={driver._id}
                  className="flex items-center gap-2.5 py-1.5 px-2 hover:bg-[var(--surface-2)] rounded-lg cursor-pointer text-xs transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleDriver(driver._id)}
                    disabled={isPending}
                    className="w-3.5 h-3.5 rounded text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
                  />
                  <span className="font-medium text-[var(--text)]">
                    {driver.name}
                  </span>
                  <span className="text-[10px] text-[var(--muted)] mr-auto">
                    {driver.phone || driver.email}
                  </span>
                </label>
              );
            })
          )}
        </div>
      </div>

      {/* Initial Vehicles Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
            <Car className="w-3.5 h-3.5 text-[var(--muted)]" />
            <span>المركبات المتاحة ({availableVehicles.length})</span>
          </label>
          <span className="text-[11px] text-[var(--muted)] font-medium">
            محدد: {selectedVehicles.length}
          </span>
        </div>

        <div className="max-h-36 overflow-y-auto border border-[var(--border)] rounded-xl p-2 bg-[var(--surface-2)]/50 divide-y divide-[var(--border)]">
          {availableVehicles.length === 0 ? (
            <p className="text-xs text-center text-[var(--muted)] py-3">
              لا توجد مركبات متاحة بدون فريق حالياً
            </p>
          ) : (
            availableVehicles.map((vehicle) => {
              const isChecked = selectedVehicles.includes(vehicle._id);
              return (
                <label
                  key={vehicle._id}
                  className="flex items-center gap-2.5 py-1.5 px-2 hover:bg-[var(--surface-2)] rounded-lg cursor-pointer text-xs transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleVehicle(vehicle._id)}
                    disabled={isPending}
                    className="w-3.5 h-3.5 rounded text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
                  />
                  <span className="font-medium text-[var(--text)]">
                    {vehicle.plateNumber}
                  </span>
                  <span className="text-[10px] text-[var(--muted)] mr-auto">
                    {vehicle.model} ({vehicle.year})
                  </span>
                </label>
              );
            })
          )}
        </div>
      </div>

      {/* Actions */}
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
  );
}

export function CreateTeamModal({ isOpen, onClose }: CreateTeamModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="إنشاء فريق تشغيلي جديد"
      description="تنظيم الأسطول والسائقين وإسنادهم لمدير فريق"
      icon={Users}
      iconClassName="bg-[var(--primary-light)] text-[var(--primary)]"
      maxWidth="md"
    >
      <CreateTeamForm onClose={onClose} />
    </Modal>
  );
}
