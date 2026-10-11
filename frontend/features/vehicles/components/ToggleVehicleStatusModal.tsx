'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { VehicleWithRelations, BackendVehicle } from '../types/vehicle.types';
import { useChangeVehicleStatus } from '../hooks/useVehicles';
import { ConfirmActionModal } from '@/shared/ui';

interface ToggleVehicleStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetVehicle: BackendVehicle | VehicleWithRelations | null;
}

/**
 * نافذة تأكيد تغيير حالة المركبة (تفعيل أو تعطيل)
 */
export function ToggleVehicleStatusModal({
  isOpen,
  onClose,
  targetVehicle,
}: ToggleVehicleStatusModalProps) {
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
      // Error is caught and displayed by the mutation's toast and optimistic rollback
    }
  };

  return (
    <ConfirmActionModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title={isCurrentlyActive ? 'تعطيل المركبة' : 'تفعيل المركبة'}
      description={
        isCurrentlyActive
          ? 'هل أنت متأكد من رغبتك في تعطيل هذه المركبة؟ ستصبح غير متاحة لتعيين المهام حتى يعاد تفعيلها.'
          : 'هل تريد إعادة تفعيل هذه المركبة وإتاحتها للعمل والمهام التشغيلية من جديد؟'
      }
      confirmText={isCurrentlyActive ? 'تأكيد التعطيل' : 'تأكيد التفعيل'}
      variant={isCurrentlyActive ? 'danger' : 'success'}
      icon={isCurrentlyActive ? AlertTriangle : CheckCircle2}
      isPending={changeStatusMutation.isPending}
    >
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
    </ConfirmActionModal>
  );
}
