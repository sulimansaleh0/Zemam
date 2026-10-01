'use client';

import React from 'react';
import { AlertTriangle, Loader2, XCircle } from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';
import type { TaskWithRelations } from '../types/task.types';

interface DeclineTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
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
  const [reason, setReason] = React.useState('');

  React.useEffect(() => {
    if (isOpen) setReason('');
  }, [isOpen]);

  if (!task) return null;

  const handleConfirm = () => {
    onConfirm(reason.trim() || 'تم الإلغاء بواسطة مدير الأسطول');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="إلغاء / رفض المهمة"
      description="يرجى كتابة سبب الإلغاء وتأكيد رغبتك في إيقاف هذه المهمة"
      icon={AlertTriangle}
      iconClassName="bg-rose-500/10 text-rose-500"
      maxWidth="md"
    >
      <div className="p-6 space-y-4" dir="rtl">
        <p className="text-xs text-[var(--zd-muted)] leading-relaxed">
          هل أنت متأكد من إلغاء المهمة{' '}
          <span className="font-bold text-[var(--zd-text)]">
            "{task.title || task.description.slice(0, 30) + '...'}"
          </span>
          ؟ سيتم إيقاف المهمة فوراً وتحرير المركبة لتصبح متاحة.
        </p>

        {/* حقل سبب الإلغاء */}
        <div className="space-y-1.5 text-right">
          <label className="text-xs font-semibold text-[var(--zd-text)] block">
            سبب إلغاء المهمة <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="اكتب سبب الإلغاء (مثال: تعطل مفاجئ في المركبة، اعتذار العميل، تغيير جدول النقل...)"
            className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] p-3 text-xs text-[var(--zd-text)] placeholder-[var(--zd-muted)] focus:border-rose-500 focus:outline-none"
          />
        </div>

        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2.5 text-[11px] text-rose-400">
          تنبيه: سيتم حفظ سبب الإلغاء في سجل المهمة ولا يمكن التراجع عن هذا الإجراء.
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-[var(--zd-line)] px-4 py-2 text-xs font-semibold text-[var(--zd-muted)] hover:bg-[var(--zd-surface-2)] hover:text-[var(--zd-text)] transition cursor-pointer"
          >
            تراجع
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
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
