'use client';

import React, { useState } from 'react';
import {
  History,
  Fuel,
  Wrench,
  Gauge,
  Calendar,
  Coins,
  ClipboardList,
  Loader2,
} from 'lucide-react';
import { FuelDetailModal, type FuelRecordWithRelations } from '@/features/fuel';
import {
  MaintenanceDetailModal,
  getMaintenanceCategoryConfig,
  getMaintenanceStatusConfig,
  formatCostSAR,
  type MaintenanceRecordWithRelations,
} from '@/features/maintenance';

interface VehicleTaskItem {
  _id: string;
  description: string;
  driverName?: string;
  formattedStartTime?: string;
  status: string;
}

interface VehicleHistorySectionProps {
  fuelRecords: FuelRecordWithRelations[];
  isLoadingFuel?: boolean;
  isFuelError?: boolean;
  maintenanceRecords: MaintenanceRecordWithRelations[];
  isLoadingMaintenance?: boolean;
  isMaintenanceError?: boolean;
  tasks: VehicleTaskItem[];
  isLoadingTasks?: boolean;
  isTasksError?: boolean;
}

export function VehicleHistorySection({
  fuelRecords,
  isLoadingFuel = false,
  isFuelError = false,
  maintenanceRecords,
  isLoadingMaintenance = false,
  isMaintenanceError = false,
  tasks,
  isLoadingTasks = false,
  isTasksError = false,
}: VehicleHistorySectionProps) {
  const [activeHistoryTab, setActiveHistoryTab] = useState<'fuel' | 'maintenance'>('fuel');
  const [selectedFuelRecord, setSelectedFuelRecord] = useState<FuelRecordWithRelations | null>(null);
  const [selectedMaintenanceRecord, setSelectedMaintenanceRecord] = useState<MaintenanceRecordWithRelations | null>(null);

  return (
    <>
      {/* ── Fuel & Maintenance History Tabs ── */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xs">
        <div className="flex flex-col gap-3 border-b border-[var(--border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--text)]">
            <History className="h-4 w-4 text-[var(--primary)]" />
            سجل الوقود والصيانة
          </h2>
          <div className="flex w-fit gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-1">
            <button
              type="button"
              onClick={() => setActiveHistoryTab('fuel')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                activeHistoryTab === 'fuel'
                  ? 'bg-[var(--primary)] text-white shadow-xs'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              <Fuel className="h-3.5 w-3.5" />
              الوقود ({fuelRecords.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveHistoryTab('maintenance')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                activeHistoryTab === 'maintenance'
                  ? 'bg-[var(--primary)] text-white shadow-xs'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              <Wrench className="h-3.5 w-3.5" />
              الصيانة ({maintenanceRecords.length})
            </button>
          </div>
        </div>

        {activeHistoryTab === 'fuel' ? (
          isLoadingFuel ? (
            <p className="px-5 py-6 text-xs text-[var(--muted)]">جارٍ تحميل سجلات الوقود...</p>
          ) : isFuelError ? (
            <p className="px-5 py-6 text-xs text-rose-500">تعذر تحميل سجلات الوقود.</p>
          ) : fuelRecords.length === 0 ? (
            <p className="px-5 py-6 text-xs text-[var(--muted)]">لا توجد سجلات وقود لهذه المركبة.</p>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {fuelRecords.map((record) => (
                <button
                  key={record._id}
                  type="button"
                  onClick={() => setSelectedFuelRecord(record)}
                  aria-label={`عرض تفاصيل تعبئة الوقود: ${record.qty} لتر`}
                  className="flex w-full flex-col gap-3 px-5 py-4 text-right transition-colors hover:bg-[var(--surface-2)]/60 cursor-pointer sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-[var(--text)]">تعبئة وقود · {record.qty} لتر</span>
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                          record.status === 'approved'
                            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
                            : record.status === 'declined'
                            ? 'border-rose-500/20 bg-rose-500/10 text-rose-500'
                            : 'border-amber-500/20 bg-amber-500/10 text-amber-600'
                        }`}
                      >
                        {record.status === 'approved' ? 'معتمدة' : record.status === 'declined' ? 'مرفوضة' : 'قيد المراجعة'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[var(--muted)]">
                      <span className="flex items-center gap-1">
                        <Gauge className="h-3.5 w-3.5" />
                        {Number(record.odometer).toLocaleString('ar-SA')} كم
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {record.formattedDate}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-black text-[var(--text)]">
                    {Number(record.cost).toLocaleString('ar-SA')} ر.س
                  </span>
                </button>
              ))}
            </div>
          )
        ) : isLoadingMaintenance ? (
          <p className="px-5 py-6 text-xs text-[var(--muted)]">جارٍ تحميل سجلات الصيانة...</p>
        ) : isMaintenanceError ? (
          <p className="px-5 py-6 text-xs text-rose-500">تعذر تحميل سجلات الصيانة.</p>
        ) : maintenanceRecords.length === 0 ? (
          <p className="px-5 py-6 text-xs text-[var(--muted)]">لا توجد سجلات صيانة لهذه المركبة.</p>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {maintenanceRecords.map((record) => {
              const category = getMaintenanceCategoryConfig(record.category);
              const status = getMaintenanceStatusConfig(record.status);
              return (
                <button
                  key={record._id}
                  type="button"
                  onClick={() => setSelectedMaintenanceRecord(record)}
                  aria-label={`عرض تفاصيل سجل الصيانة: ${record.description}`}
                  className="flex w-full flex-col gap-3 px-5 py-4 text-right transition-colors hover:bg-[var(--surface-2)]/60 cursor-pointer sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="max-w-xl truncate text-xs font-bold text-[var(--text)]">{record.description}</span>
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${category.badgeClass}`}>{category.label}</span>
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${status.bgClass}`}>{status.label}</span>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] text-[var(--muted)]">
                      <Calendar className="h-3.5 w-3.5" />
                      {record.formattedDate}
                    </span>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-sm font-black text-[var(--text)]">
                    <Coins className="h-3.5 w-3.5 text-[var(--muted)]" />
                    {formatCostSAR(record.cost)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Vehicle Tasks Section ── */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xs">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--text)]">
            <ClipboardList className="h-4 w-4 text-[var(--primary)]" />
            مهام المركبة
          </h2>
          {isLoadingTasks && <Loader2 className="h-4 w-4 animate-spin text-[var(--muted)]" />}
        </div>
        {isTasksError ? (
          <p className="px-5 py-6 text-xs text-rose-500">تعذر تحميل مهام المركبة.</p>
        ) : isLoadingTasks ? (
          <p className="px-5 py-6 text-xs text-[var(--muted)]">جارٍ تحميل المهام...</p>
        ) : tasks.length === 0 ? (
          <p className="px-5 py-6 text-xs text-[var(--muted)]">لا توجد مهام مسجلة لهذه المركبة.</p>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {tasks.map((task) => (
              <article key={task._id} className="grid gap-2 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="min-w-0">
                  <h3 className="truncate text-xs font-semibold text-[var(--text)]">
                    {task.description}
                  </h3>
                  <p className="mt-1 text-[11px] text-[var(--muted)]">
                    {task.driverName || 'بدون سائق'} · {task.formattedStartTime}
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-[var(--text)]">
                  {task.status === 'pending'
                    ? 'قيد الانتظار'
                    : task.status === 'inprogress'
                    ? 'قيد التنفيذ'
                    : task.status === 'finished'
                    ? 'مكتملة'
                    : 'مرفوضة'}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ── History Modals ── */}
      <FuelDetailModal
        isOpen={Boolean(selectedFuelRecord)}
        onClose={() => setSelectedFuelRecord(null)}
        record={selectedFuelRecord}
      />

      <MaintenanceDetailModal
        isOpen={Boolean(selectedMaintenanceRecord)}
        onClose={() => setSelectedMaintenanceRecord(null)}
        record={selectedMaintenanceRecord}
      />
    </>
  );
}
