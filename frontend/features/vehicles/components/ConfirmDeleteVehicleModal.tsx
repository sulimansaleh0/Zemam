'use client';

import React from 'react';
import { Trash2, Loader2, AlertCircle } from 'lucide-react';
import type { VehicleWithRelations } from '../types/vehicle.types';
import { useDeleteVehicle } from '../hooks/useVehicles';
import { Modal } from '@/shared/ui/Modal';

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

  if (!targetVehicle) return null;

  const handleConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(targetVehicle._id);
      onClose();
    } catch {
      // Handled by toast
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="حذف المركبة من الأسطول"
      description={`${targetVehicle.model} (${targetVehicle.year}) - لوحة: ${targetVehicle.plateNumber}`}
      icon={Trash2}
      iconClassName="bg-rose-500/10 text-rose-500"
      maxWidth="md"
      preventClose={deleteMutation.isPending}
    >
      <div className="p-6 space-y-4">
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
    </Modal>
  );
}
