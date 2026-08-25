'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, X, Loader2, PowerOff, CheckCircle2 } from 'lucide-react';
import type { VehicleWithRelations } from '../types/vehicle.types';
import { useChangeVehicleStatus } from '../hooks/useVehicles';

interface ChangeVehicleStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetVehicle: VehicleWithRelations | null;
}

export function DeleteVehicleModal({
  isOpen,
  onClose,
  targetVehicle,
}: ChangeVehicleStatusModalProps) {
  const changeStatusMutation = useChangeVehicleStatus();

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !changeStatusMutation.isPending) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, changeStatusMutation.isPending, onClose]);

  if (!isOpen || !targetVehicle) return null;

  const isCurrentlyActive = targetVehicle.status === 'active';
  const newStatus = isCurrentlyActive ? 'inactive' : 'active';

  const handleConfirm = async () => {
    try {
      await changeStatusMutation.mutateAsync({
        id: targetVehicle._id,
        status: newStatus,
      });
      onClose();
    } catch {
      // Handled by toast
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-vehicle-modal-title"
    >
      <div className="relative w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-6">
        <button
          type="button"
          onClick={onClose}
          disabled={changeStatusMutation.isPending}
          aria-label="إغلاق النافذة"
          className="absolute top-4 left-4 p-1.5 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isCurrentlyActive
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {isCurrentlyActive ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </div>

          <div>
            <h3 id="status-vehicle-modal-title" className="text-base font-bold text-[var(--text)]">
              {isCurrentlyActive ? 'تعطيل المركبة' : 'تفعيل المركبة'}
            </h3>
            <p className="text-xs text-[var(--muted)] mt-1 max-w-xs mx-auto leading-relaxed">
              {isCurrentlyActive
                ? 'هل أنت متأكد من رغبتك في تعطيل هذه المركبة؟ ستصبح غير متاحة لتعيين المهام.'
                : 'هل تريد إعادة تفعيل هذه المركبة وإتاحتها للعمل والمهام من جديد؟'}
            </p>
          </div>

          <div className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3.5 text-right space-y-1">
            <div className="text-sm font-bold text-[var(--text)]">{targetVehicle.model}</div>
            <div className="flex items-center justify-between text-xs text-[var(--muted)] pt-1">
              <span>
                رقم اللوحة: <strong className="font-mono text-[var(--text)]">{targetVehicle.plateNumber}</strong>
              </span>
              <span>
                سنة الصنع: <strong className="text-[var(--text)]">{targetVehicle.year}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 w-full pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={changeStatusMutation.isPending}
              className="flex-1 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={changeStatusMutation.isPending}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer ${
                isCurrentlyActive
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {changeStatusMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isCurrentlyActive ? (
                <PowerOff className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>{isCurrentlyActive ? 'تأكيد التعطيل' : 'تأكيد التفعيل'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
