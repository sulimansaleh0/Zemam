'use client';

import React from 'react';
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Eye,
  FileText,
  MapPin,
  Navigation,
  Pencil,
  Phone,
  Plus,
  Search,
  Truck,
  User,
  XCircle,
} from 'lucide-react';
import { getTaskStatusConfig } from '../utils/taskHelpers';
import type { TaskStatus, TaskWithRelations } from '../types/task.types';

interface TasksTableProps {
  tasks: TaskWithRelations[];
  isLoading: boolean;
  activeTab: 'all' | TaskStatus;
  onTabChange: (tab: 'all' | TaskStatus) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCreate: () => void;
  onViewDetails: (task: TaskWithRelations) => void;
  onEditTask?: (task: TaskWithRelations) => void;
  onDeclineTask: (task: TaskWithRelations) => void;
}

const TABS: { id: 'all' | TaskStatus; label: string }[] = [
  { id: 'all', label: 'جميع المهام' },
  { id: 'pending', label: 'قيد الانتظار' },
  { id: 'inprogress', label: 'قيد التنفيذ' },
  { id: 'finished', label: 'المكتملة' },
  { id: 'declined', label: 'الملغية' },
];

export function TasksTable({
  tasks,
  isLoading,
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onOpenCreate,
  onViewDetails,
  onEditTask,
  onDeclineTask,
}: TasksTableProps) {
  return (
    <div className="space-y-4" dir="rtl">
      {/* شريط التحكم: التبويبات، البحث، وزر الإضافة */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* التبويبات */}
        <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[var(--zd-blue)] text-white shadow-sm'
                  : 'text-[var(--zd-muted)] hover:bg-[var(--zd-surface-2)] hover:text-[var(--zd-text)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* البحث والإضافة */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-[var(--zd-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث بالعنوان، السائق، المركبة..."
              className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] py-2 pr-9 pl-3 text-xs text-[var(--zd-text)] placeholder-[var(--zd-muted)] focus:border-[var(--zd-blue)] focus:outline-none"
            />
          </div>

          <button
            onClick={onOpenCreate}
            className="flex items-center gap-1.5 rounded-xl bg-[var(--zd-blue)] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-600 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>مهمة جديدة</span>
          </button>
        </div>
      </div>

      {/* الجدول أو الحالة الفارغة */}
      <div className="overflow-hidden rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface)] shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[var(--zd-muted)]">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--zd-blue)] border-t-transparent mb-2" />
            <p>جاري تحميل قائمة المهام...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center" dir="rtl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--zd-surface-2)] text-[var(--zd-muted)] mb-3">
              <Clock className="h-7 w-7 opacity-60" />
            </div>
            <h3 className="text-sm font-bold text-[var(--zd-text)]">لا توجد مهام حالياً</h3>
            <p className="mt-1 text-xs text-[var(--zd-muted)] max-w-sm mx-auto">
              {searchQuery
                ? 'لا توجد نتائج مطابقة لبحثك، جرب استخدام كلمات بحث مختلفة.'
                : 'لم يتم إنشاء أي مهام تشغيلية بعد. يمكنك البدء بإنشاء مهمتك الأولى الآن.'}
            </p>
            {!searchQuery && (
              <button
                onClick={onOpenCreate}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[var(--zd-blue)] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-600"
              >
                <Plus className="h-4 w-4" />
                <span>إنشاء أول مهمة</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-[var(--zd-line)] bg-[var(--zd-surface-2)] text-[var(--zd-muted)] font-semibold">
                  <th className="px-4 py-3.5">المهمة</th>
                  <th className="px-4 py-3.5">المركبة</th>
                  <th className="px-4 py-3.5">السائق</th>
                  <th className="px-4 py-3.5">الفريق</th>
                  <th className="px-4 py-3.5">موعد الانطلاق</th>
                  <th className="px-4 py-3.5">المسار</th>
                  <th className="px-4 py-3.5 text-center">الحالة</th>
                  <th className="px-4 py-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--zd-line)]">
                {tasks.map((task) => {
                  const status = getTaskStatusConfig(task.status);
                  const canDecline = task.status === 'pending' || task.status === 'inprogress';

                  return (
                    <tr
                      key={task._id}
                      className="transition-colors hover:bg-[var(--zd-surface-2)]/60"
                    >
                      {/* المهمة */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-[var(--zd-text)]">
                          {task.title || 'مهمة نقل وتشغيل'}
                        </div>
                        <div className="mt-0.5 text-[11px] text-[var(--zd-muted)] max-w-xs truncate">
                          {task.description}
                        </div>
                      </td>

                      {/* المركبة */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-[var(--zd-text)] font-semibold">
                          <Truck className="h-3.5 w-3.5 text-[var(--zd-muted)]" />
                          <span>{task.vehicleModel}</span>
                        </div>
                        <div className="text-[10px] text-[var(--zd-muted)]">
                          لوحة: {task.vehiclePlate}
                        </div>
                      </td>

                      {/* السائق */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-[var(--zd-text)] font-semibold">
                          <User className="h-3.5 w-3.5 text-[var(--zd-muted)]" />
                          <span>{task.driverName}</span>
                        </div>
                        <div className="text-[10px] text-[var(--zd-muted)]">
                          {task.driverPhone}
                        </div>
                      </td>

                      {/* الفريق */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-[var(--zd-muted)] font-medium">
                        {task.teamName}
                      </td>

                      {/* موعد الانطلاق */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[var(--zd-text)]">
                          <Calendar className="h-3 w-3 text-[var(--zd-muted)]" />
                          <span>{task.formattedStartTime}</span>
                        </div>
                      </td>

                      {/* المسار */}
                      <td className="px-4 py-3.5 max-w-xs truncate text-[11px]">
                        <span className="text-emerald-500 font-medium">
                          {task.pickupLocation?.address || '—'}
                        </span>
                        <span className="mx-1 text-[var(--zd-muted)]">←</span>
                        <span className="text-blue-500 font-medium">
                          {task.deliveryLocation?.address || '—'}
                        </span>
                      </td>

                      {/* الحالة */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${status.bgClass}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`} />
                          {status.label}
                        </span>
                      </td>

                      {/* الإجراءات */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onViewDetails(task)}
                            title="عرض تفاصيل المهمة"
                            className="rounded-lg p-1.5 text-[var(--zd-muted)] hover:bg-[var(--zd-surface)] hover:text-[var(--zd-text)] cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* زر التعديل — متاح حصرياً للمهام المعلقة pending */}
                          {task.status === 'pending' && onEditTask && (
                            <button
                              onClick={() => onEditTask(task)}
                              title="تعديل المهمة (متاحة في حالة الانتظار)"
                              className="rounded-lg p-1.5 text-[var(--zd-muted)] hover:bg-[var(--zd-blue)]/10 hover:text-[var(--zd-blue)] transition cursor-pointer"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}

                          {canDecline && (
                            <button
                              onClick={() => onDeclineTask(task)}
                              title="إلغاء المهمة"
                              className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
