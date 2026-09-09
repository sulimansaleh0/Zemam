'use client';

import React from 'react';
import { AlertTriangle, Loader2, XCircle } from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';
import type { TaskWithRelations } from '../types/task.types';

interface DeclineTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
  task: TaskWithRelations | null;
}

export function DeclineTaskModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  task,
}: DeclineTaskModalProps) {
  if (!task) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="إلغاء / رفض المهمة"
      description="يرجى تأكيد رغبتك في إلغاء هذه المهمة التشغيلية"
      icon={AlertTriangle}
      iconClassName="bg-rose-500/10 text-rose-500"
      maxWidth="md"
    >
      <div className="p-6 space-y-4 text-center" dir="rtl">
        <p className="text-sm text-[var(--zd-muted)] leading-relaxed">
          هل أنت متأكد من إلغاء المهمة{' '}
          <span className="font-bold text-[var(--zd-text)]">
            "{task.title || task.description.slice(0, 30) + '...'}"
          </span>
          ؟ سيتم إيقاف المهمة وتحرير المركبة لتصبح متاحة للمهام الأخرى.
        </p>

        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
          تنبيه: لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.
        </div>

        <div className="flex items-center justify-center gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-[var(--zd-line)] px-5 py-2.5 text-xs font-semibold text-[var(--zd-muted)] hover:bg-[var(--zd-surface-2)] hover:text-[var(--zd-text)]"
          >
            تراجع
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-rose-700 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>جاري الإلغاء...</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                <span>تأكيد إلغاء المهمة</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
