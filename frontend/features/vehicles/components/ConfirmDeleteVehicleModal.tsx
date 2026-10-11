'use client';

import React from 'react';
import { Trash2, AlertCircle } from 'lucide-react';
import type { VehicleWithRelations, BackendVehicle } from '../types/vehicle.types';
import { useDeleteVehicle } from '../hooks/useVehicles';
import { ConfirmActionModal } from '@/shared/ui';

interface ConfirmDeleteVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetVehicle: BackendVehicle | VehicleWithRelations | null;
}

export function ConfirmDeleteVehicleModal({
  isOpen,
  onClose,
  targetVehicle,
}: ConfirmDeleteVehicleModalProps) {
  const deleteMutation = useDeleteVehicle();

  if (!targetVehicle) return null;

  const isInTask = Boolean(targetVehicle.isInTask);
  const isMaintenance = targetVehicle.status === 'in_maintenance';
  const isBlockedFromDelete = isInTask || isMaintenance;

  const handleConfirm = async () => {
    if (isBlockedFromDelete) return;
    try {
      await deleteMutation.mutateAsync(targetVehicle._id);
      onClose();
    } catch {
      // Handled by toast
    }
  };

  return (
    <ConfirmActionModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="حذف المركبة من الأسطول"
      description={`${targetVehicle.model} (${targetVehicle.year}) - لوحة: ${targetVehicle.plateNumber}`}
      confirmText={isBlockedFromDelete ? '' : 'تأكيد الحذف'}
      cancelText={isBlockedFromDelete ? 'إغلاق' : 'إلغاء'}
      variant="danger"
      icon={Trash2}
      isPending={deleteMutation.isPending}
      disabled={isBlockedFromDelete}
    >
      {isBlockedFromDelete ? (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
          <div className="space-y-1">
            <p className="font-bold text-sm">لا يمكن حذف هذه المركبة حالياً</p>
            <p className="leading-relaxed">
              {isInTask
                ? 'المركبة مرتبطة بمهمة تشغيلية نشطة حالياً. يرجى إتمام المهمة أو إلغاؤها أولاً قبل محاولة الحذف.'
                : 'المركبة قيد الصيانة حالياً. يرجى إغلاق سجل الصيانة واعتماد اكتمالها قبل الحذف.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            هل أنت متأكد من رغبتك في حذف هذه المركبة؟ سيتم فك ارتباطها عن السائق والفريق ونقلها إلى سجل المحذوفات.
          </p>
        </div>
      )}
    </ConfirmActionModal>
  );
}
