'use client';

import { useEffect, useState } from 'react';
import { Car, Loader2, X, CheckCircle2 } from 'lucide-react';
import type { Driver } from '../types/driver.types';
import { useAvailableVehicles } from '../hooks/useDrivers';
import { getDriverDisplayName } from '../utils/driverHelpers';

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

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isLoading, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-vehicle-title"
    >
      <div className="w-full max-w-[480px] overflow-hidden rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface)] shadow-2xl animate-in zoom-in-95 duration-200">
        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-[var(--zd-line)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--zd-teal)]/10 text-[var(--zd-teal)]">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="assign-vehicle-title"
                className="text-[15px] font-bold text-[var(--zd-text)]"
              >
                تعيين مركبة للسائق
              </h2>
              <p className="mt-0.5 text-[10px] text-[var(--zd-muted)]">
                اختر المركبة التي سيقودها السائق <strong>{displayName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            aria-label="إغلاق"
            className="zd-focus rounded-lg p-1.5 text-[var(--zd-muted)] transition-colors hover:bg-[var(--zd-surface-2)] disabled:opacity-50 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

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
                اختر المركبة من الأسطول <span className="text-[var(--zd-red)]">*</span>
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
                  disabled={isLoading || isLoadingVehicles}
                  className="zd-focus h-11 w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-input-bg)] pr-10 pl-3 text-[12px] text-[var(--zd-text)] outline-none transition-colors disabled:opacity-60 cursor-pointer"
                >
                  <option value="">-- اختر المركبة من القائمة --</option>
                  {vehicles.map((v) => {
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

              {errorMsg && (
                <p role="alert" className="mt-1.5 text-[10px] font-medium text-[var(--zd-red)]">
                  {errorMsg}
                </p>
              )}
            </div>

            {/* Note */}
            <div className="rounded-xl bg-[var(--zd-surface-2)] px-4 py-3 text-[10px] leading-5 text-[var(--zd-muted)]">
              <b className="text-[var(--zd-text)]">تنبيه:</b> إذا اخترت مركبة معينة لسائق آخر، سيتم نقل المركبة تلقائياً وفك ارتباطها عن السائق السابق.
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
              disabled={isLoading || !selectedVehicleId}
              className="zd-focus flex items-center gap-2 rounded-xl bg-[var(--zd-blue)] px-5 py-2 text-[11px] font-semibold text-white shadow-xs transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isLoading ? 'جارٍ التعيين...' : 'تأكيد التعيين'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
