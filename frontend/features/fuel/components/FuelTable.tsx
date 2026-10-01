'use client';

import React from 'react';
import {
  AlertTriangle,
  Calendar,
  Droplet,
  Eye,
  Fuel,
  Gauge,
  Plus,
  Search,
  ShieldCheck,
  Truck,
  User,
} from 'lucide-react';
import {
  getFuelStatusConfig,
  formatCostSAR,
  formatLiters,
  formatEfficiency,
} from '../utils/fuelHelpers';
import type {
  FuelRecordWithRelations,
  FuelIssueType,
  FuelStatus,
} from '../types/fuel.types';
import type { BackendVehicle } from '@/features/vehicles';

interface FuelTableProps {
  records: FuelRecordWithRelations[];
  isLoading: boolean;
  activeTab: 'all' | FuelStatus;
  onTabChange: (tab: 'all' | FuelStatus) => void;
  selectedVehicleId: string;
  onVehicleChange: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCreate: () => void;
  onViewDetails: (record: FuelRecordWithRelations) => void;
  onVerifyRecord: (record: FuelRecordWithRelations) => void;
  vehicles: BackendVehicle[];
}

const STATUS_TABS: { id: 'all' | FuelStatus; label: string }[] = [
  { id: 'all', label: 'جميع الإيصالات' },
  { id: 'pending', label: 'قيد المراجعة' },
  { id: 'approved', label: 'المعتمدة' },
  { id: 'declined', label: 'المرفوضة' },
];

function getFuelIssueLabel(issueType?: FuelIssueType): string {
  switch (issueType) {
    case 'high_consumption':
      return 'استهلاك مرتفع';
    case 'possible_leak':
      return 'اشتباه تسرب';
    case 'efficiency_deviation':
      return 'كفاءة غير متوقعة';
    default:
      return 'تنبيه كفاءة الوقود';
  }
}

export function FuelTable({
  records,
  isLoading,
  activeTab,
  onTabChange,
  selectedVehicleId,
  onVehicleChange,
  searchQuery,
  onSearchChange,
  onOpenCreate,
  onViewDetails,
  onVerifyRecord,
  vehicles,
}: FuelTableProps) {
  return (
    <div className="space-y-4" dir="rtl">
      {/* ── شريط التحكم والفلترة ── */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* التبويبات وفلتر المركبات */}
        <div className="flex flex-wrap items-center gap-2">
          {/* تبويبات الحالة */}
          <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[var(--zd-blue)] text-white shadow-sm'
                    : 'text-[var(--zd-muted)] hover:bg-[var(--zd-surface-2)] hover:text-[var(--zd-text)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* فلتر المركبات */}
          <select
            value={selectedVehicleId}
            onChange={(e) => onVehicleChange(e.target.value)}
            className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] px-3 py-1.5 text-xs text-[var(--zd-text)] focus:border-[var(--zd-blue)] focus:outline-none"
          >
            <option value="all">كافة المركبات</option>
            {vehicles.map((v) => (
              <option key={v._id} value={v._id}>
                {v.model} ({v.plateNumber})
              </option>
            ))}
          </select>
        </div>

        {/* حقل البحث وزر الإضافة */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-[var(--zd-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث بالمركبة، السائق، أو التنبيه..."
              className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] py-2 pr-9 pl-3 text-xs text-[var(--zd-text)] placeholder-[var(--zd-muted)] focus:border-[var(--zd-blue)] focus:outline-none"
            />
          </div>

          <button
            onClick={onOpenCreate}
            className="flex items-center gap-1.5 rounded-xl bg-[var(--zd-blue)] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-600 shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>تسجيل إيصال وقود</span>
          </button>
        </div>
      </div>

      {/* ── الجدول أو الحالة الفارغة ── */}
      <div className="overflow-hidden rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface)] shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[var(--zd-muted)]">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--zd-blue)] border-t-transparent mb-2" />
            <p>جاري تحميل سجلات الوقود...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center" dir="rtl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--zd-surface-2)] text-[var(--zd-muted)] mb-3">
              <Fuel className="h-7 w-7 opacity-60" />
            </div>
            <h3 className="text-sm font-bold text-[var(--zd-text)]">لا توجد سجلات وقود</h3>
            <p className="mt-1 text-xs text-[var(--zd-muted)] max-w-sm mx-auto">
              {searchQuery || selectedVehicleId !== 'all'
                ? 'لا توجد نتائج تطابق معايير الفلترة المحددة.'
                : 'لم يتم توثيق أي إيصالات وقود بعد. يمكنك البدء بتسجيل الإيصال الأول الآن.'}
            </p>
            {!searchQuery && selectedVehicleId === 'all' && (
              <button
                onClick={onOpenCreate}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[var(--zd-blue)] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-600 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>تسجيل أول إيصال</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-[var(--zd-line)] bg-[var(--zd-surface-2)] text-[var(--zd-muted)] font-semibold">
                  <th className="px-4 py-3.5">المركبة</th>
                  <th className="px-4 py-3.5">مقدم الإيصال</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">الكمية والتكلفة</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">قراءة العداد</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">الكفاءة والكمية المضافة</th>
                  <th className="px-4 py-3.5 text-center">الحالة</th>
                  <th className="px-4 py-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--zd-line)]">
                {records.map((record) => {
                  const status = getFuelStatusConfig(record.status);
                  const isPending = record.status === 'pending';
                  const fuelIssueLabel = getFuelIssueLabel(record.fuelIssueType);

                  return (
                    <tr
                      key={record._id}
                      className={`transition-colors hover:bg-[var(--zd-surface-2)]/60 ${
                        record.fuelIssue ? 'bg-rose-500/5' : ''
                      }`}
                    >
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

                      {/* مقدم الإيصال */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-[var(--zd-text)] font-medium">
                          <User className="h-3.5 w-3.5 text-[var(--zd-muted)]" />
                          <span>{record.userName}</span>
                        </div>
                        <div className="text-[10px] text-[var(--zd-muted)] mt-0.5 flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-[var(--zd-muted)]" />
                          <span>{record.formattedDate}</span>
                        </div>
                      </td>

                      {/* الكمية والتكلفة */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-[var(--zd-text)]">
                          {formatCostSAR(record.cost)}
                        </div>
                        <div className="text-[10px] text-[var(--zd-muted)] flex items-center gap-1 mt-0.5">
                          <Droplet className="h-3 w-3 text-cyan-400" />
                          <span>{formatLiters(record.qty)}</span>
                          <span className="opacity-70">
                            ({record.pricePerLiter > 0 ? record.pricePerLiter.toFixed(2) : 0} ر.س/لتر)
                          </span>
                        </div>
                      </td>

                      {/* العداد ونوع التعبئة */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[var(--zd-text)] font-mono text-[11px]">
                          <Gauge className="h-3 w-3 text-[var(--zd-muted)]" />
                          <span>{Number(record.odometer).toLocaleString('ar-EG')} كم</span>
                        </div>
                        <div className="mt-1">
                          {record.isFullTank ? (
                            <span className="inline-flex items-center rounded border border-cyan-500/20 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-bold text-cyan-400">
                              تعبئة كاملة (Full)
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded bg-[var(--zd-surface-2)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--zd-muted)]">
                              تعبئة جزئية
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {record.fuelIssue ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-500">
                              <AlertTriangle className="h-3 w-3" />
                              <span>{fuelIssueLabel}</span>
                            </span>
                            {record.fuelEfficiency && (
                              <p className="font-mono text-[10px] text-rose-400">
                                الكفاءة: {formatEfficiency(record.fuelEfficiency)}
                              </p>
                            )}
                          </div>
                        ) : record.fuelEfficiency ? (
                          <div>
                            <span className="inline-flex items-center rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                              {formatEfficiency(record.fuelEfficiency)}
                            </span>
                            {record.distanceSinceLastFull && (
                              <p className="mt-0.5 text-[10px] text-[var(--zd-muted)]">
                                قطعت: {record.distanceSinceLastFull.toLocaleString('ar-EG')} كم
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-[var(--zd-muted)]">
                            {record.isFullTank ? 'تتطلب تعبئة كاملة سابقة' : 'تعبئة جزئية'}
                          </span>
                        )}
                        <div className="mt-1 font-bold text-emerald-500">
                          +{formatLiters(record.qty)}
                        </div>
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
                          {/* عرض التفاصيل والإيصال */}
                          <button
                            onClick={() => onViewDetails(record)}
                            title="عرض تفاصيل الإيصال والفاتورة"
                            className="rounded-lg p-1.5 text-[var(--zd-muted)] hover:bg-[var(--zd-surface-2)] hover:text-[var(--zd-text)] transition cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* مراجعة واعتماد (متاح للبلاغات المعلقة) */}
                          {isPending && (
                            <button
                              onClick={() => onVerifyRecord(record)}
                              title="اعتماد أو رفض إيصال الوقود"
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
