'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Users, Loader2 } from 'lucide-react';
import { useAssignDriverToTeam } from '../hooks/useDrivers';
import { useTeams } from '@/features/teams';
import { getDriverDisplayName } from '../utils/driverHelpers';
import { Modal } from '@/shared/ui/Modal';
import type { Driver } from '../types/driver.types';

interface AssignDriverToTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: Driver | null;
}

export function AssignDriverToTeamModal({
  isOpen,
  onClose,
  driver,
}: AssignDriverToTeamModalProps) {
  const { data: teams = [], isLoading: isLoadingTeams } = useTeams();
  const assignMutation = useAssignDriverToTeam();
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedTeamId('');
      setErrorMsg(null);
    }
  }, [isOpen, driver]);

  if (!driver) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId) {
      setErrorMsg('يرجى اختيار فريق من القائمة');
      return;
    }
    setErrorMsg(null);

    try {
      await assignMutation.mutateAsync({
        driverId: driver._id,
        teamId: selectedTeamId,
      });
      onClose();
    } catch {
      // Notification is handled in the mutation hook
    }
  };

  const driverName = getDriverDisplayName(driver);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تعيين السائق لفريق تشغيلي"
      description={<>السائق: <strong>{driverName}</strong></>}
      icon={Building2}
      iconClassName="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
      maxWidth="md"
      preventClose={assignMutation.isPending}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[var(--muted)]" />
            اختر الفريق التشغيلي *
          </label>
          {isLoadingTeams ? (
            <div className="flex items-center justify-center p-4 bg-[var(--surface-2)]/40 rounded-xl border border-[var(--border)] text-xs text-[var(--muted)] gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--primary)]" />
              <span>جارٍ جلب الفرق...</span>
            </div>
          ) : teams.length === 0 ? (
            <p className="text-xs text-[var(--muted)] p-3 bg-[var(--surface-2)]/50 rounded-xl border border-[var(--border)]">
              لا توجد فرق تشغيلية متاحة حالياً. يرجى إنشاء فريق أولاً.
            </p>
          ) : (
            <select
              value={selectedTeamId}
              onChange={(e) => {
                setSelectedTeamId(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              disabled={assignMutation.isPending}
              className="w-full px-3.5 py-2 text-sm bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] transition-colors cursor-pointer"
            >
              <option value="">-- اختر الفريق من القائمة --</option>
              {teams.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
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
            disabled={assignMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={assignMutation.isPending || !selectedTeamId || teams.length === 0}
            className="flex items-center gap-2 px-5 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {assignMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>تأكيد التعيين</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
