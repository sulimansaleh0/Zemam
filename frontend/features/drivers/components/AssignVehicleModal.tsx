'use client';

import { useState } from 'react';
import { Car, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { Driver } from '../types/driver.types';
import { useAvailableVehicles } from '../hooks/useDrivers';
import { getDriverDisplayName, getDriverTeamId } from '../utils/driverHelpers';
import { Modal } from '@/shared/ui/Modal';

interface AssignVehicleModalProps {
  driver: Driver;
  onClose: () => void;
  onAssign: (vehicleId: string) => Promise<void>;
  isLoading: boolean;
}

export function AssignVehicleModal({
  driver,
  onClose,
  onAssign,
  isLoading,
}: AssignVehicleModalProps) {
  const { data: vehicles = [], isLoading: isLoadingVehicles } = useAvailableVehicles();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    driver.assignedVehicle?._id || ''
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const displayName = getDriverDisplayName(driver);
  const driverTeamId = getDriverTeamId(driver.teamId);
  const hasTeam = Boolean(driverTeamId);

  // تصفية المركبات المتاحة في نفس فريق السائق فقط
  const teamVehicles = vehicles.filter((v) => {
    const vTeamId = getDriverTeamId(v.teamId);
    return Boolean(vTeamId && driverTeamId && String(vTeamId) === String(driverTeamId));
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasTeam) {
      setErrorMsg('يجب تعيين السائق على فريق تشغيلي أولاً للتمكن من ربط مركبة به');
      return;
    }
    if (!selectedVehicleId) {
      setErrorMsg('يرجى اختيار مركبة من القائمة');
      return;
    }
    setErrorMsg(null);
    try {
      await onAssign(selectedVehicleId);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'فشل تعيين المركبة');
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="تعيين مركبة للسائق"
      description={<>اختر المركبة التي سيقودها السائق <strong>{displayName}</strong></>}
      icon={Car}
      iconClassName="bg-[var(--zd-teal)]/10 text-[var(--zd-teal)]"
      maxWidth="max-w-[480px]"
      preventClose={isLoading}
      aria-labelledby="assign-vehicle-title"
    >
      {/* ── Warning if driver has no team ── */}
      {!hasTeam && (
        <div className="border-b border-amber-500/20 bg-amber-500/10 px-6 py-3 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">السائق غير منضم لأي فريق تشغيلي حالياً</p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400/80 mt-0.5">
              حسب قواعد النظام، يجب إضافة السائق إلى فريق تشغيلي أولاً لربط مركبة من نفس الفريق به.
            </p>
          </div>
        </div>
      )}

      {/* ── Current Assignment Notice ── */}
      {driver.assignedVehicle && (
        <div className="border-b border-[var(--zd-line)] bg-[var(--zd-surface-2)]/40 px-6 py-3">
          <div className="flex items-center gap-2 text-[11px] text-[var(--zd-muted)]">
            <CheckCircle2 className="h-3.5 w-3.5 text-[var(--zd-teal)] shrink-0" />
            <span>المركبة الحالية:</span>
            <strong className="text-[var(--zd-text)] font-semibold">
              {driver.assignedVehicle.model} ({driver.assignedVehicle.year})
            </strong>
            <span className="font-mono text-[10px] bg-[var(--zd-surface)] px-1.5 py-0.5 rounded border border-[var(--zd-line)] text-[var(--zd-text)]">
              لوحة: {driver.assignedVehicle.plateNumber}
            </span>
          </div>
        </div>
      )}

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="p-6 space-y-4">
          <div>
            <label
              htmlFor="vehicle-select"
              className="mb-1.5 block text-[11px] font-semibold text-[var(--zd-text)]"
            >
              اختر المركبة من فريق السائق <span className="text-[var(--zd-red)]">*</span>
            </label>
            <div className="relative">
              <Car className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--zd-muted)] pointer-events-none" />
              <select
                id="vehicle-select"
                value={selectedVehicleId}
                onChange={(e) => {
                  setSelectedVehicleId(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                disabled={isLoading || isLoadingVehicles || !hasTeam}
                className="zd-focus h-11 w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-input-bg)] pr-10 pl-3 text-[12px] text-[var(--zd-text)] outline-none transition-colors disabled:opacity-60 cursor-pointer"
              >
                <option value="">-- اختر المركبة من القائمة --</option>
                {teamVehicles.map((v) => {
                  const isCurrentlyAssignedToThis = v.driverId === driver._id;
                  const isAssignedToOther = v.driverId && !isCurrentlyAssignedToThis;

                  return (
                    <option key={v._id} value={v._id}>
                      {v.model} ({v.year}) — لوحة: {v.plateNumber}{' '}
                      {isCurrentlyAssignedToThis
                        ? '✓ (معينة له حالياً)'
                        : isAssignedToOther
                        ? '⚠️ (معينة لسائق آخر)'
                        : '• (متاحة)'}
                    </option>
                  );
                })}
              </select>
            </div>

            {hasTeam && teamVehicles.length === 0 && !isLoadingVehicles && (
              <p className="mt-2 text-xs text-[var(--muted)] p-2.5 rounded-xl bg-[var(--surface-2)]/50 border border-[var(--border)]">
                لا توجد مركبات مسجلة في فريق هذا السائق حالياً. يمكنك إضافة مركبات للفريق من صفحة المركبات.
              </p>
            )}

            {errorMsg && (
              <p role="alert" className="mt-1.5 text-[10px] font-medium text-[var(--zd-red)]">
                {errorMsg}
              </p>
            )}
          </div>

          <div className="rounded-xl bg-[var(--zd-surface-2)] px-4 py-3 text-[10px] leading-5 text-[var(--zd-muted)]">
            <b className="text-[var(--zd-text)]">تنبيه:</b> إذا اخترت مركبة معينة لسائق آخر في نفس الفريق، سيتم نقل المركبة تلقائياً وفك ارتباطها عن السائق السابق.
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex justify-end gap-2 border-t border-[var(--zd-line)] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="zd-focus rounded-xl border border-[var(--zd-line)] px-4 py-2 text-[11px] font-semibold text-[var(--zd-muted)] transition-colors hover:text-[var(--zd-text)] disabled:opacity-50 cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isLoading || !selectedVehicleId || !hasTeam}
            className="zd-focus flex items-center gap-2 rounded-xl bg-[var(--zd-blue)] px-5 py-2 text-[11px] font-semibold text-white shadow-xs transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isLoading ? 'جارٍ التعيين...' : 'تأكيد التعيين'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
