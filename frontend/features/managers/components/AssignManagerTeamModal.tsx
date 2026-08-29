'use client';

import React, { useEffect, useState } from 'react';
import { X, Building2, Users, Loader2 } from 'lucide-react';
import { useAssignManager } from '../hooks/useManagers';
import type { FleetManager } from '../types/manager.types';
import type { Team } from '@/features/teams/types/team.types';

interface AssignManagerTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  manager: FleetManager | null;
  teams: Team[];
}

export function AssignManagerTeamModal({
  isOpen,
  onClose,
  manager,
  teams,
}: AssignManagerTeamModalProps) {
  const assignMutation = useAssignManager();
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedTeamId('');
      setErrorMsg(null);
    }
  }, [isOpen]);

  // Handle ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !assignMutation.isPending) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, assignMutation.isPending, onClose]);

  if (!isOpen || !manager) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId) {
      setErrorMsg('يرجى اختيار فريق لتعيين المدير عليه');
      return;
    }
    setErrorMsg(null);
    try {
      await assignMutation.mutateAsync({
        managerId: manager._id,
        teamId: selectedTeamId,
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
    >
      <div className="relative w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-2)]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text)]">
                تعيين مدير أسطول لفريق
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                ربط المدير <strong>{manager.name || manager.email}</strong> بفريق تشغيلي
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={assignMutation.isPending}
            aria-label="إغلاق النافذة"
            className="p-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[var(--muted)]" />
              اختر الفريق التشغيلي *
            </label>
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
            {errorMsg && <p className="text-xs text-rose-500 mt-1">{errorMsg}</p>}
          </div>

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
              disabled={assignMutation.isPending || !selectedTeamId}
              className="flex items-center gap-2 px-5 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {assignMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>تأكيد التعيين</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
