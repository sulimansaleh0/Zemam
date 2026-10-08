'use client';

import React from 'react';
import {
  CheckCheck,
  CheckCircle2,
  Clock,
  Fuel,
  History,
  Shield,
  MapPin,
  Calendar,
  AlertTriangle,
  Gauge,
  ExternalLink,
} from 'lucide-react';
import type { TaskWithRelations } from '@/features/tasks';
import type { FuelRecordWithRelations } from '@/features/fuel';
import type { ScoreAuditItem } from '../../types/driver.types';

interface DriverActivityTabsProps {
  activeTab: 'tasks' | 'fuel' | 'audit';
  setActiveTab: (tab: 'tasks' | 'fuel' | 'audit') => void;
  driverTasks: TaskWithRelations[];
  driverFuelRecords: FuelRecordWithRelations[];
  scoreHistory: ScoreAuditItem[];
  onSelectTask: (task: TaskWithRelations) => void;
}

export function DriverActivityTabs({
  activeTab,
  setActiveTab,
  driverTasks,
  driverFuelRecords,
  scoreHistory,
  onSelectTask,
}: DriverActivityTabsProps) {
  return (
    <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h3 className="text-base font-bold text-[var(--text)]">
            سجل النشاط والعمليات الميدانية الحقيقية
          </h3>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            سجل المهام المنفذة، فواتير تعبئة الوقود، وسجل تدقيق نقاط التقييم
          </p>
        </div>

        {/* Tab selector */}
        <div className="flex gap-1.5 rounded-2xl bg-[var(--surface-2)] p-1 border border-[var(--border)]">
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'tasks'
                ? 'bg-[var(--primary)] text-white shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>المهام ({driverTasks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fuel')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'fuel'
                ? 'bg-[var(--primary)] text-white shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <Fuel className="w-3.5 h-3.5" />
            <span>فواتير الوقود ({driverFuelRecords.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-[var(--primary)] text-white shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>سجل التدقيق والتقييم</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Real Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          {driverTasks.length > 0 ? (
            driverTasks.map((task) => {
              const isFinished = task.status === 'finished';
              const isDelayed =
                isFinished && task.finishedAt && task.expectedEndTime
                  ? new Date(task.finishedAt).getTime() >
                    new Date(task.expectedEndTime).getTime()
                  : task.status === 'inprogress' && task.expectedEndTime
                  ? new Date().getTime() >
                    new Date(task.expectedEndTime).getTime()
                  : false;

              const isOnTime =
                isFinished && task.finishedAt && task.expectedEndTime
                  ? new Date(task.finishedAt).getTime() <=
                    new Date(task.expectedEndTime).getTime()
                  : false;

              return (
                <button
                  type="button"
                  key={task._id}
                  onClick={() => onSelectTask(task)}
                  aria-label={`عرض تفاصيل المهمة: ${task.description.slice(0, 60)}`}
                  className="w-full text-right p-4 rounded-2xl bg-[var(--surface-2)]/40 border border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[var(--surface-2)]/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)] transition cursor-pointer"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[var(--text)]">
                        {task.description}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          task.status === 'finished'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : task.status === 'inprogress'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {task.status === 'finished'
                          ? 'مكتملة'
                          : task.status === 'inprogress'
                          ? 'قيد التنفيذ'
                          : 'قيد الانتظار'}
                      </span>

                      {isOnTime && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          في الموعد المحدد (SLA)
                        </span>
                      )}

                      {isDelayed && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                          <AlertTriangle className="w-3 h-3" />
                          تجاوزت الموعد
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[var(--muted)] max-w-xl truncate">
                      {task.description}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-[var(--muted)]">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <MapPin className="w-3.5 h-3.5" />
                        {task.pickupLocation?.address || 'نقطة الانطلاق'}
                      </span>
                      <span>←</span>
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                        <MapPin className="w-3.5 h-3.5" />
                        {task.deliveryLocation?.address || 'نقطة الوصول'}
                      </span>
                    </div>
                  </div>

                  <div className="text-left shrink-0 text-xs font-mono space-y-1">
                    <div className="flex items-center gap-1 text-[var(--text)]">
                      <Calendar className="w-3.5 h-3.5 text-[var(--muted)]" />
                      <span>
                        {task.startTime
                          ? new Date(task.startTime).toLocaleDateString('ar-SA')
                          : '—'}
                      </span>
                    </div>
                    {task.expectedEndTime && (
                      <div className="text-[10px] text-amber-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          المتوقع:{' '}
                          {new Date(task.expectedEndTime).toLocaleTimeString('ar-SA', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-[var(--muted)] space-y-2">
              <CheckCheck className="w-8 h-8 text-[var(--muted)] opacity-30 mx-auto" />
              <p>لا توجد مهام منجزة أو مسندة لهذا السائق حتى الآن.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Fuel Receipts */}
      {activeTab === 'fuel' && (
        <div className="space-y-3">
          {driverFuelRecords.length > 0 ? (
            driverFuelRecords.map((fuel) => (
              <div
                key={fuel._id}
                className="p-4 rounded-2xl bg-[var(--surface-2)]/40 border border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[var(--surface-2)]/70 transition"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[var(--text)]">
                      تعبئة وقود · {fuel.qty} لتر
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        fuel.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {fuel.status === 'approved' ? 'معتمدة' : 'قيد التدقيق'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        fuel.isFullTank
                          ? 'bg-sky-500/10 text-sky-500'
                          : 'bg-slate-500/10 text-slate-500'
                      }`}
                    >
                      {fuel.isFullTank ? 'تانك كامل (FULL)' : 'غير ممتلئ (NOT FULL)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
                    <span className="flex items-center gap-1 font-mono">
                      <Gauge className="w-3.5 h-3.5 text-amber-500" />
                      العداد: {fuel.odometer?.toLocaleString()} كم
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      {new Date(fuel.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                </div>

                <div className="text-left shrink-0">
                  <div className="text-lg font-black text-[var(--text)] font-mono">
                    {Number(fuel.cost).toLocaleString('ar-SA')} ر.س
                  </div>
                  {fuel.image && (
                    <a
                      href={fuel.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-[var(--primary)] hover:underline flex items-center gap-1 justify-end mt-1"
                    >
                      <span>معاينة الفاتورة</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-[var(--muted)] space-y-2">
              <Fuel className="w-8 h-8 text-[var(--muted)] opacity-30 mx-auto" />
              <p>لا توجد فواتير أو إيصالات وقود مسجلة لهذا السائق.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Score Audit Trail */}
      {activeTab === 'audit' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 shrink-0 text-amber-500" />
            <span>
              سجل الشفافية الرقمي: يتم تسجيل كافة التغيرات على نقاط تقييم السائق تلقائياً لضمان النزاهة والمصداقية التشغيلية.
            </span>
          </div>

          {scoreHistory.length > 0 ? (
            scoreHistory.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[var(--surface-2)]/40 border border-[var(--border)] flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-black font-mono ${
                        item.pointsChange > 0
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {item.pointsChange > 0 ? `+${item.pointsChange}` : item.pointsChange} نقطة
                    </span>
                    <span className="text-[11px] font-bold text-[var(--muted)]">
                      {item.category === 'task'
                        ? 'المهام ومواعيد التسليم'
                        : item.category === 'maintenance'
                        ? 'الصيانة والتشغيل'
                        : 'استهلاك الوقود'}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text)] font-medium leading-relaxed">
                    {item.reason}
                  </p>
                </div>

                <div className="text-[10px] text-[var(--muted)] font-mono shrink-0 pt-1">
                  {item.date || item.createdAt
                    ? new Date(item.date || item.createdAt!).toLocaleDateString('ar-SA')
                    : '—'}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-[var(--muted)] space-y-2">
              <History className="w-8 h-8 text-[var(--muted)] opacity-30 mx-auto" />
              <p>لا توجد سجلات تعديل أو خصم نقاط مسجلة لهذا السائق.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
