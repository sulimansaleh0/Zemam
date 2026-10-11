'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Eye,
  Pencil,
  Plus,
  Truck,
  User,
  XCircle,
} from 'lucide-react';
import { TablePagination } from '@/shared/ui';
import { getTaskStatusConfig, formatTaskDateTime } from '../utils/taskHelpers';
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
  page?: number;
  totalPages?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
}

import { TaskTableToolbar } from './TaskTableToolbar';

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
  page,
  totalPages,
  totalCount,
  onPageChange,
}: TasksTableProps) {
  return (
    <div className="space-y-4" dir="rtl">
      {/* شريط التحكم: التبويبات، البحث، وزر الإضافة */}
      <TaskTableToolbar
        activeTab={activeTab}
        onTabChange={onTabChange}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onOpenCreate={onOpenCreate}
      />

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
                  <th className="px-4 py-3.5">الوصف</th>
                  <th className="px-4 py-3.5">المركبة</th>
                  <th className="px-4 py-3.5">السائق</th>
                  <th className="px-4 py-3.5">الفريق</th>
                  <th className="px-4 py-3.5">موعد الانطلاق</th>
                  <th className="px-4 py-3.5 text-center">الحالة</th>
                  <th className="px-4 py-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--zd-line)]">
                {tasks.map((task) => {
                  const status = getTaskStatusConfig(task.status);
                  const canDecline = task.status === 'pending' || task.status === 'inprogress';
                  const vehicleId = typeof task.vehicleId === 'object' ? task.vehicleId?._id : task.vehicleId;
                  const driverId = typeof task.driverId === 'object' ? task.driverId?._id : task.driverId;

                  return (
                    <tr
                      key={task._id}
                      className="transition-colors hover:bg-[var(--zd-surface-2)]/60"
                    >
                      {/* الوصف */}
                      <td className="px-4 py-3.5">
                        <div className="text-[11px] font-medium text-[var(--zd-text)] max-w-xs truncate">
                          {task.description}
                        </div>
                      </td>

                      {/* المركبة */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-[var(--zd-text)] font-semibold">
                          <Truck className="h-3.5 w-3.5 text-[var(--zd-muted)]" />
                          {vehicleId ? (
                            <Link href={`/vehicles/${vehicleId}`} className="hover:text-[var(--zd-blue)] hover:underline">
                              {task.vehicleModel}
                            </Link>
                          ) : <span>{task.vehicleModel}</span>}
                        </div>
                        <div className="text-[10px] text-[var(--zd-muted)]">
                          لوحة: {task.vehiclePlate}
                        </div>
                      </td>

                      {/* السائق */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-[var(--zd-text)] font-semibold">
                          <User className="h-3.5 w-3.5 text-[var(--zd-muted)]" />
                          {driverId ? (
                            <Link href={`/drivers/${driverId}`} className="hover:text-[var(--zd-blue)] hover:underline">
                              {task.driverName}
                            </Link>
                          ) : <span>{task.driverName}</span>}
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
                        {task.expectedEndTime && (
                          <div className="flex items-center gap-1 text-[10px] text-[var(--zd-muted)] mt-0.5">
                            <Clock className="h-2.5 w-2.5 text-blue-400" />
                            <span>التسليم: {formatTaskDateTime(task.expectedEndTime)}</span>
                          </div>
                        )}
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

        {/* الترقيم */}
        {page && totalPages && totalPages > 1 && !isLoading && (
          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalCount ?? tasks.length}
            hasNextPage={page < totalPages}
            hasPrevPage={page > 1}
            onPageChange={(p) => onPageChange?.(p)}
            itemLabel="مهمة"
          />
        )}
      </div>
    </div>
  );
}
