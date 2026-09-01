'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Shield, Loader2, AlertCircle, Plus } from 'lucide-react';
import { useAvailableManagers, useAssignManager } from '@/features/managers';
import type { Team } from '../types/team.types';
import { Modal } from '@/shared/ui/Modal';

interface AssignTeamManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  onAddNewManagerClick?: () => void;
}

export function AssignTeamManagerModal({
  isOpen,
  onClose,
  team,
  onAddNewManagerClick,
}: AssignTeamManagerModalProps) {
  const { data: availableManagers = [], isLoading: isLoadingManagers } = useAvailableManagers();
  const assignManagerMutation = useAssignManager();
  const isSubmitting = assignManagerMutation.isPending;

  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedManagerId('');
      setErrorMsg(null);
    }
  }, [isOpen, team]);

  if (!team) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedManagerId) {
      setErrorMsg('يرجى اختيار مدير من القائمة');
      return;
    }
    setErrorMsg(null);

    try {
      await assignManagerMutation.mutateAsync({
        managerId: selectedManagerId,
        teamId: team._id,
      });
      onClose();
    } catch {
      // Handled by Toast in hook
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تعيين مدير أسطول للفريق"
      description={<>فريق: <strong>{team.name}</strong></>}
      icon={UserCheck}
      iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      maxWidth="md"
      preventClose={isSubmitting}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[var(--muted)]" />
              اختر المدير المتاح (غير مسند لفريق) *
            </label>
            {onAddNewManagerClick && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAddNewManagerClick();
                }}
                className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <Plus className="w-3 h-3" />
                <span>إنشاء حساب مدير جديد</span>
              </button>
            )}
          </div>

          {isLoadingManagers ? (
            <div className="flex items-center justify-center p-6 bg-[var(--surface-2)]/40 rounded-xl border border-[var(--border)] text-xs text-[var(--muted)] gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--primary)]" />
              <span>جارٍ جلب المدراء المتاحين...</span>
            </div>
          ) : availableManagers.length === 0 ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>لا يوجد مدراء أساطيل متاحين حالياً بدون فريق.</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                جميع مدراء الأساطيل مسندون لفرق أخرى، أو لم يتم إنشاء حسابات بعد.
              </p>
              {onAddNewManagerClick && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onAddNewManagerClick();
                  }}
                  className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إنشاء حساب مدير جديد الآن</span>
                </button>
              )}
            </div>
          ) : (
            <select
              value={selectedManagerId}
              onChange={(e) => {
                setSelectedManagerId(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2 text-sm bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] transition-colors cursor-pointer"
            >
              <option value="">-- اختر مديراً من القائمة المتاحة --</option>
              {availableManagers.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name ? `${m.name} (${m.email})` : m.email}
                </option>
              ))}
            </select>
          )}

          {errorMsg && <p className="text-xs text-rose-500 mt-1">{errorMsg}</p>}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !selectedManagerId || availableManagers.length === 0}
            className="flex items-center gap-2 px-5 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>تأكيد التعيين</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
