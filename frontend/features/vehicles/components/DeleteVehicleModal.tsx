'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import { VehicleWithRelations } from '../types/vehicle.types';
import { useDeleteVehicle } from '../hooks/useVehicles';

interface DeleteVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetVehicle: VehicleWithRelations | null;
}

export function DeleteVehicleModal({
  isOpen,
  onClose,
  targetVehicle,
}: DeleteVehicleModalProps) {
  const deleteVehicleMutation = useDeleteVehicle();

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !targetVehicle) return null;

  const handleConfirmDeleteVehicle = async () => {
    await deleteVehicleMutation.mutateAsync(targetVehicle.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-(--surface) border border-(--border) rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-vehicle-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 text-(--muted) hover:text-(--text) hover:bg-(--surface-2) rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div>
            <h3 id="delete-vehicle-modal-title" className="text-base font-bold text-(--text)">
              تأكيد حذف المركبة
            </h3>
            <p className="text-xs text-(--muted) mt-1 max-w-xs mx-auto leading-relaxed">
              هل أنت متأكد من رغبتك في حذف المركبة التالية من النظام؟ لا يمكن التراجع عن هذه الخطوة.
            </p>
          </div>

          <div className="w-full bg-(--surface-2) border border-(--border) rounded-xl p-3 text-right">
            <div className="text-sm font-bold text-(--text)">{targetVehicle.model}</div>
            <div className="flex items-center justify-between text-xs text-(--muted) mt-1">
              <span>رقم اللوحة: <strong className="font-mono text-(--text)">{targetVehicle.plateNumber}</strong></span>
              <span>السائق: <strong className="text-(--text)">{targetVehicle.driverName}</strong></span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 w-full pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={deleteVehicleMutation.isPending}
              className="flex-1 py-2 text-sm font-medium text-(--muted) hover:text-(--text) hover:bg-(--surface-2) rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleConfirmDeleteVehicle}
              disabled={deleteVehicleMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {deleteVehicleMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span>تأكيد الحذف</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
