'use client';

import React, { useEffect } from 'react';
import { Trash2, X, Loader2, AlertCircle } from 'lucide-react';
import type { VehicleWithRelations } from '../types/vehicle.types';
import { useDeleteVehicle } from '../hooks/useVehicles';

interface ConfirmDeleteVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetVehicle: VehicleWithRelations | null;
}

export function ConfirmDeleteVehicleModal({
  isOpen,
  onClose,
  targetVehicle,
}: ConfirmDeleteVehicleModalProps) {
  const deleteMutation = useDeleteVehicle();

  // Handle ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !deleteMutation.isPending) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, deleteMutation.isPending, onClose]);

  if (!isOpen || !targetVehicle) return null;

  const handleConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(targetVehicle._id);
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
    >
      <div className="relative w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text)]">حذف المركبة من الأسطول</h3>
            <p className="text-xs text-[var(--muted)]">
              {targetVehicle.model} ({targetVehicle.year}) - لوحة: {targetVehicle.plateNumber}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            هل أنت متأكد من رغبتك في حذف هذه المركبة؟ سيتم فك ارتباطها عن السائق والفريق ونقلها إلى سجل المحذوفات.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleteMutation.isPending}
            className="flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>تأكيد الحذف</span>
          </button>
        </div>
      </div>
    </div>
  );
}
