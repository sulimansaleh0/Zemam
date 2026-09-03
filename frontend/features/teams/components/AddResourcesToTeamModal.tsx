'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Car, Users, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/shared/ui/Toast';
import { driverService } from '@/features/drivers/services/driverService';
import { vehicleService } from '@/features/vehicles/services/vehicle.service';
import type { Team } from '../types/team.types';
import type { BackendDriver } from '@/features/drivers/types/driver.types';
import type { BackendVehicle } from '@/features/vehicles/types/vehicle.types';
import { Modal } from '@/shared/ui/Modal';

interface AddResourcesToTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
}

export function AddResourcesToTeamModal({
  isOpen,
  onClose,
  team,
}: AddResourcesToTeamModalProps) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'drivers' | 'vehicles'>('drivers');
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch available drivers (without team)
  const { data: availableDrivers = [], isLoading: isLoadingDrivers } = useQuery({
    queryKey: ['drivers', 'available'],
    queryFn: async () => {
      const res = await driverService.getAvailableDrivers();
      if (!res.success) return [];
      return (res.data?.drivers ?? []).filter((d) => !d.teamId);
    },
    enabled: isOpen,
    staleTime: 1000 * 30,
  });

  // Fetch available vehicles (without team)
  const { data: availableVehicles = [], isLoading: isLoadingVehicles } = useQuery({
    queryKey: ['vehicles', 'available'],
    queryFn: async () => {
      const res = await vehicleService.getAvailableVehicles();
      if (!res.success) return [];
      return (res.data?.vehicles ?? []).filter((v) => !v.teamId);
    },
    enabled: isOpen,
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (isOpen) {
      setSelectedDrivers([]);
      setSelectedVehicles([]);
      setIsSubmitting(false);
      setActiveTab('drivers');
    }
  }, [isOpen, team]);

  if (!team) return null;

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

  const selectAllDrivers = () => {
    if (selectedDrivers.length === availableDrivers.length) {
      setSelectedDrivers([]);
    } else {
      setSelectedDrivers(availableDrivers.map((d) => d._id));
    }
  };

  const selectAllVehicles = () => {
    if (selectedVehicles.length === availableVehicles.length) {
      setSelectedVehicles([]);
    } else {
      setSelectedVehicles(availableVehicles.map((v) => v._id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDrivers.length === 0 && selectedVehicles.length === 0) {
      addToast({
        type: 'warning',
        title: 'تنبيه',
        message: 'يرجى تحديد سائق واحد أو مركبة واحدة على الأقل لإضافتها للفريق',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const promises: Promise<any>[] = [];

      // Assign selected drivers
      selectedDrivers.forEach((driverId) => {
        promises.push(driverService.assignTeam(driverId, team._id));
      });

      // Assign selected vehicles
      selectedVehicles.forEach((vehicleId) => {
        promises.push(vehicleService.assignTeam(vehicleId, team._id));
      });

      const results = await Promise.allSettled(promises);
      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });

      if (failed === 0) {
        addToast({
          type: 'success',
          title: 'تمت الإضافة بنجاح',
          message: `تم تعيين ${selectedDrivers.length} سائقين و ${selectedVehicles.length} مركبات لفريق ${team.name}`,
        });
      } else {
        addToast({
          type: 'info',
          title: 'تم إنجاز جزئي',
          message: `نجحت إضافة ${successful} موارد وفشلت ${failed}`,
        });
      }

      onClose();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'خطأ',
        message: err.message || 'حدث خطأ أثناء إضافة الموارد',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSelected = selectedDrivers.length + selectedVehicles.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="إضافة موارد من المخزون العام"
      description={<>تعيين سائقين ومركبات غير مقيدة لفريق: <strong>{team.name}</strong></>}
      icon={Users}
      iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
      maxWidth="lg"
      preventClose={isSubmitting}
    >
      <div className="flex flex-col max-h-[75vh]">
        {/* Tab switcher */}
        <div className="flex items-center border-b border-[var(--border)] px-6 pt-3 bg-[var(--surface-2)]/20 shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('drivers')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'drivers'
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>السائقين المتاحين</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[var(--surface-2)] text-[var(--text)] font-semibold">
              {availableDrivers.length}
            </span>
            {selectedDrivers.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vehicles')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'vehicles'
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>المركبات المتاحة</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[var(--surface-2)] text-[var(--text)] font-semibold">
              {availableVehicles.length}
            </span>
            {selectedVehicles.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
            )}
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {activeTab === 'drivers' ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[var(--text)]">
                  اختر السائقين لإضافتهم ({selectedDrivers.length} محدد)
                </span>
                {availableDrivers.length > 0 && (
                  <button
                    type="button"
                    onClick={selectAllDrivers}
                    className="text-xs text-[var(--primary)] hover:underline font-semibold cursor-pointer"
                  >
                    {selectedDrivers.length === availableDrivers.length
                      ? 'إلغاء التحديد'
                      : 'تحديد الكل'}
                  </button>
                )}
              </div>

              {isLoadingDrivers ? (
                <div className="flex items-center justify-center p-8 bg-[var(--surface-2)]/30 rounded-xl gap-2 text-xs text-[var(--muted)]">
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--primary)]" />
                  <span>جارٍ تحميل السائقين المتاحين...</span>
                </div>
              ) : availableDrivers.length === 0 ? (
                <div className="p-6 text-center bg-[var(--surface-2)]/30 rounded-xl border border-dashed border-[var(--border)]">
                  <AlertCircle className="w-8 h-8 mx-auto text-[var(--muted)] mb-2 opacity-50" />
                  <p className="text-xs font-semibold text-[var(--text)]">
                    لا يوجد سائقين في المخزون العام حالياً
                  </p>
                  <p className="text-[11px] text-[var(--muted)] mt-1">
                    جميع السائقين معينون لفرق أخرى
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {availableDrivers.map((driver: BackendDriver) => {
                    const isChecked = selectedDrivers.includes(driver._id);
                    return (
                      <label
                        key={driver._id}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-[var(--primary-light)] border-[var(--primary)] text-[var(--primary)] font-semibold'
                            : 'bg-[var(--surface-2)]/40 border-[var(--border)] hover:bg-[var(--surface-2)] text-[var(--text)]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[var(--surface)] flex items-center justify-center text-[var(--primary)] font-bold text-[10px]">
                            {driver.name ? driver.name[0] : driver.email[0]}
                          </div>
                          <div>
                            <div className="font-semibold">
                              {driver.name && driver.name !== 'Default'
                                ? driver.name
                                : driver.email.split('@')[0]}
                            </div>
                            <div className="text-[10px] text-[var(--muted)]" dir="ltr">
                              {driver.email}
                            </div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleDriver(driver._id)}
                          disabled={isSubmitting}
                          className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer w-4 h-4"
                        />
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[var(--text)]">
                  اختر المركبات لإضافتها ({selectedVehicles.length} محدد)
                </span>
                {availableVehicles.length > 0 && (
                  <button
                    type="button"
                    onClick={selectAllVehicles}
                    className="text-xs text-[var(--primary)] hover:underline font-semibold cursor-pointer"
                  >
                    {selectedVehicles.length === availableVehicles.length
                      ? 'إلغاء التحديد'
                      : 'تحديد الكل'}
                  </button>
                )}
              </div>

              {isLoadingVehicles ? (
                <div className="flex items-center justify-center p-8 bg-[var(--surface-2)]/30 rounded-xl gap-2 text-xs text-[var(--muted)]">
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--primary)]" />
                  <span>جارٍ تحميل المركبات المتاحة...</span>
                </div>
              ) : availableVehicles.length === 0 ? (
                <div className="p-6 text-center bg-[var(--surface-2)]/30 rounded-xl border border-dashed border-[var(--border)]">
                  <AlertCircle className="w-8 h-8 mx-auto text-[var(--muted)] mb-2 opacity-50" />
                  <p className="text-xs font-semibold text-[var(--text)]">
                    لا توجد مركبات في المخزون العام حالياً
                  </p>
                  <p className="text-[11px] text-[var(--muted)] mt-1">
                    جميع المركبات مخصصة لفرق أخرى
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {availableVehicles.map((vehicle: BackendVehicle) => {
                    const isChecked = selectedVehicles.includes(vehicle._id);
                    return (
                      <label
                        key={vehicle._id}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 font-semibold'
                            : 'bg-[var(--surface-2)]/40 border-[var(--border)] hover:bg-[var(--surface-2)] text-[var(--text)]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[var(--surface)] flex items-center justify-center text-blue-500">
                            <Car className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold">
                              {vehicle.model} ({vehicle.year})
                            </div>
                            <div className="text-[10px] text-[var(--muted)] font-mono">
                              لوحة الترخيص: {vehicle.plateNumber}
                            </div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleVehicle(vehicle._id)}
                          disabled={isSubmitting}
                          className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer w-4 h-4"
                        />
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-2)]/20 shrink-0">
          <div className="text-xs text-[var(--muted)]">
            الإجمالي المحدد:{' '}
            <span className="font-bold text-[var(--text)]">{totalSelected} عنصر</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || totalSelected === 0}
              className="flex items-center gap-2 px-5 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>إضافة للفريق ({totalSelected})</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
