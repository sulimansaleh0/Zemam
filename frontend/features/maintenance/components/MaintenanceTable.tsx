'use client';

import React from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  Eye,
  FileText,
  Gauge,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Truck,
  User,
  Wrench,
  XCircle,
} from 'lucide-react';
import {
  getMaintenanceStatusConfig,
  getMaintenancePriorityConfig,
  getMaintenanceCategoryConfig,
  formatCostSAR,
} from '../utils/maintenanceHelpers';
import type {
  MaintenanceRecordWithRelations,
  MaintenanceStatus,
  MaintenanceCategory,
} from '../types/maintenance.types';

interface MaintenanceTableProps {
  records: MaintenanceRecordWithRelations[];
  isLoading: boolean;
  activeTab: 'all' | MaintenanceStatus;
  onTabChange: (tab: 'all' | MaintenanceStatus) => void;
  activeCategory: 'all' | MaintenanceCategory;
  onCategoryChange: (cat: 'all' | MaintenanceCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCreate: () => void;
  onViewDetails: (record: MaintenanceRecordWithRelations) => void;
  onVerifyRecord: (record: MaintenanceRecordWithRelations) => void;
}

const STATUS_TABS: { id: 'all' | MaintenanceStatus; label: string }[] = [
  { id: 'all', label: 'جميع السجلات' },
  { id: 'pending', label: 'قيد المراجعة' },
  { id: 'approved', label: 'المعتمدة' },
  { id: 'declined', label: 'المرفوضة' },
];

const CATEGORY_FILTERS: { id: 'all' | MaintenanceCategory; label: string }[] = [
  { id: 'all', label: 'كافة التصنيفات' },
  { id: 'Faults', label: 'أعطال طارئة' },
  { id: 'Periodic Maintenance', label: 'صيانة دورية' },
];

export function MaintenanceTable({
  records,
  isLoading,
  activeTab,
  onTabChange,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  onOpenCreate,
  onViewDetails,
  onVerifyRecord,
}: MaintenanceTableProps) {
  return (
    <div className="space-y-4" dir="rtl">
      {/* ── شريط التحكم والفلترة ── */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* تبويبات الحالة وتصنيف الصيانة */}
        <div className="flex flex-wrap items-center gap-2">
          {/* تبويبات الحالة */}
          <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-[var(--zd-blue)] text-white shadow-sm'
                    : 'text-[var(--zd-muted)] hover:bg-[var(--zd-surface-2)] hover:text-[var(--zd-text)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* فلتر التصنيف (أعطال / دورية) */}
          <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-1">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[var(--zd-surface-2)] text-[var(--zd-text)] font-bold shadow-xs'
                    : 'text-[var(--zd-muted)] hover:text-[var(--zd-text)]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* حقل البحث وزر الإضافة */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-[var(--zd-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث بالمركبة، الوصف، مقدم الطلب..."
              className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] py-2 pr-9 pl-3 text-xs text-[var(--zd-text)] placeholder-[var(--zd-muted)] focus:border-[var(--zd-blue)] focus:outline-none"
            />
          </div>

          <button
            onClick={onOpenCreate}
            className="flex items-center gap-1.5 rounded-xl bg-[var(--zd-blue)] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-600 shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>تسجيل طلب صيانة</span>
          </button>
        </div>
      </div>

      {/* ── الجدول أو الحالة الفارغة ── */}
      <div className="overflow-hidden rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface)] shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[var(--zd-muted)]">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--zd-blue)] border-t-transparent mb-2" />
            <p>جاري تحميل سجلات الصيانة...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center" dir="rtl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--zd-surface-2)] text-[var(--zd-muted)] mb-3">
              <Wrench className="h-7 w-7 opacity-60" />
            </div>
            <h3 className="text-sm font-bold text-[var(--zd-text)]">لا توجد سجلات صيانة</h3>
            <p className="mt-1 text-xs text-[var(--zd-muted)] max-w-sm mx-auto">
              {searchQuery
                ? 'لا توجد نتائج تطابق معايير البحث المحددة.'
                : 'لم يتم تسجيل أي طلبات أو عمليات صيانة بعد في هذا القسم.'}
            </p>
            {!searchQuery && (
              <button
                onClick={onOpenCreate}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[var(--zd-blue)] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-600 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>تسجيل أول طلب صيانة</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-[var(--zd-line)] bg-[var(--zd-surface-2)] text-[var(--zd-muted)] font-semibold">
                  <th className="px-4 py-3.5">البيان والتصنيف</th>
                  <th className="px-4 py-3.5">المركبة</th>
                  <th className="px-4 py-3.5">مقدم الطلب</th>
                  <th className="px-4 py-3.5 text-center">الأولوية</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">العداد (كم)</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">التكلفة</th>
                  <th className="px-4 py-3.5 text-center whitespace-nowrap">مسؤولية السائق</th>
                  <th className="px-4 py-3.5 text-center">الحالة</th>
                  <th className="px-4 py-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--zd-line)]">
                {records.map((record) => {
                  const status = getMaintenanceStatusConfig(record.status);
                  const priority = getMaintenancePriorityConfig(record.priority);
                  const category = getMaintenanceCategoryConfig(record.category);
                  const isPending = record.status === 'pending';

                  return (
                    <tr
                      key={record._id}
                      className="transition-colors hover:bg-[var(--zd-surface-2)]/60"
                    >
                      {/* البيان والتصنيف */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${category.badgeClass}`}
                          >
                            {category.label}
                          </span>
                          {record.images && record.images.length > 0 && (
                            <span className="text-[10px] text-[var(--zd-muted)] bg-[var(--zd-surface-2)] px-1.5 py-0.5 rounded font-mono">
                              📷 {record.images.length}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-[11px] font-medium text-[var(--zd-text)] max-w-xs truncate" title={record.description}>
                          {record.description}
                        </div>
                        <div className="mt-0.5 text-[10px] text-[var(--zd-muted)]">
                          {record.formattedDate}
                        </div>
                      </td>

                      {/* المركبة */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold text-[var(--zd-text)]">
                          <Truck className="h-3.5 w-3.5 text-[var(--zd-blue)]" />
                          <span>{record.vehicleModel}</span>
                        </div>
                        <div className="text-[10px] text-[var(--zd-muted)] mt-0.5">
                          لوحة: {record.vehiclePlate}
                        </div>
                      </td>

                      {/* مقدم الطلب */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-[var(--zd-text)] font-medium">
                          <User className="h-3.5 w-3.5 text-[var(--zd-muted)]" />
                          <span>{record.reporterName}</span>
                        </div>
                        <div className="text-[10px] text-[var(--zd-muted)] mt-0.5">
                          {record.reporterEmail}
                        </div>
                      </td>

                      {/* الأولوية */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${priority.bgClass}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${priority.dotClass}`} />
                          {priority.label}
                        </span>
                      </td>

                      {/* العداد */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[var(--zd-text)]">
                          <Gauge className="h-3 w-3 text-[var(--zd-muted)]" />
                          <span className="font-mono text-[11px]">
                            {record.odoMeter !== undefined && record.odoMeter !== null
                              ? `${Number(record.odoMeter).toLocaleString('ar-EG')} كم`
                              : '—'}
                          </span>
                        </div>
                      </td>

                      {/* التكلفة */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-bold text-[var(--zd-text)]">
                          {formatCostSAR(record.cost)}
                        </span>
                      </td>

                      {/* مسؤولية السائق */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {record.status === 'approved' ? (
                          record.isDriverFault ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-500 border border-rose-500/20">
                              <ShieldAlert className="h-3 w-3" />
                              <span>خطأ سائق</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500 border border-emerald-500/20">
                              <span>استهلاك طبيعي</span>
                            </span>
                          )
                        ) : (
                          <span className="text-[var(--zd-muted)] text-[10px]">قيد المراجعة</span>
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
                        <div className="flex items-center justify-center gap-1.5">
                          {/* عرض التفاصيل */}
                          <button
                            onClick={() => onViewDetails(record)}
                            title="عرض تفاصيل الصيانة والصور"
                            className="rounded-lg p-1.5 text-[var(--zd-muted)] hover:bg-[var(--zd-surface-2)] hover:text-[var(--zd-text)] transition cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* التحقق والاعتماد (متاح للبلاغات المعلقة) */}
                          {isPending && (
                            <button
                              onClick={() => onVerifyRecord(record)}
                              title="اعتماد أو رفض طلب الصيانة"
                              className="inline-flex items-center gap-1 rounded-lg bg-[var(--zd-blue)]/10 px-2.5 py-1 text-[11px] font-bold text-[var(--zd-blue)] hover:bg-[var(--zd-blue)] hover:text-white transition cursor-pointer"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                              <span>مراجعة</span>
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
