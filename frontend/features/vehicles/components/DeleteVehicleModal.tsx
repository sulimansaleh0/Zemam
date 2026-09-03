'use client';

import React from 'react';
import { AlertTriangle, Loader2, PowerOff, CheckCircle2 } from 'lucide-react';
import type { VehicleWithRelations } from '../types/vehicle.types';
import { useChangeVehicleStatus } from '../hooks/useVehicles';
import { Modal } from '@/shared/ui/Modal';

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

  if (!targetVehicle) return null;

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCurrentlyActive ? 'تعطيل المركبة' : 'تفعيل المركبة'}
      description={
        isCurrentlyActive
          ? 'هل أنت متأكد من رغبتك في تعطيل هذه المركبة؟ ستصبح غير متاحة لتعيين المهام.'
          : 'هل تريد إعادة تفعيل هذه المركبة وإتاحتها للعمل والمهام من جديد؟'
      }
      icon={isCurrentlyActive ? AlertTriangle : CheckCircle2}
      iconClassName={
        isCurrentlyActive
          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
      }
      maxWidth="md"
      preventClose={changeStatusMutation.isPending}
    >
      <div className="p-6 space-y-4">
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

        <div className="flex items-center justify-end gap-3 w-full pt-2">
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
    </Modal>
  );
}
