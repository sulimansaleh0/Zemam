'use client';

import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Eye,
  Gauge,
  Plus,
  ShieldCheck,
  Truck,
  User,
  Wrench,
} from 'lucide-react';
import { TablePagination } from '@/shared/ui/TablePagination';
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
  PaginationInfo,
} from '../types/maintenance.types';
import type { BackendVehicle } from '@/features/vehicles';
import { MaintenanceTableToolbar } from './MaintenanceTableToolbar';

interface MaintenanceTableProps {
  records: MaintenanceRecordWithRelations[];
  pagination?: PaginationInfo;
  isLoading: boolean;
  activeTab: 'all' | MaintenanceStatus;
  onTabChange: (tab: 'all' | MaintenanceStatus) => void;
  activeCategory: 'all' | MaintenanceCategory;
  onCategoryChange: (cat: 'all' | MaintenanceCategory) => void;
  selectedVehicleId: string;
  onVehicleChange: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onPageChange?: (page: number) => void;
  onOpenCreate: () => void;
  onViewDetails: (record: MaintenanceRecordWithRelations) => void;
  onVerifyRecord: (record: MaintenanceRecordWithRelations) => void;
  vehicles?: BackendVehicle[];
}

export function MaintenanceTable({
  records,
  pagination,
  isLoading,
  activeTab,
  onTabChange,
  activeCategory,
  onCategoryChange,
  selectedVehicleId,
  onVehicleChange,
  searchQuery,
  onSearchChange,
  onPageChange,
  onOpenCreate,
  onViewDetails,
  onVerifyRecord,
  vehicles = [],
}: MaintenanceTableProps) {
  return (
    <div className="space-y-4" dir="rtl">
      {/* ── شريط التحكم والفلترة المستخرج ── */}
      <MaintenanceTableToolbar
        activeTab={activeTab}
        onTabChange={onTabChange}
        activeCategory={activeCategory}
        onCategoryChange={onCategoryChange}
        selectedVehicleId={selectedVehicleId}
        onVehicleChange={onVehicleChange}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onOpenCreate={onOpenCreate}
        vehicles={vehicles}
      />

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
                  const vehicleId = typeof record.vehicleId === 'object' ? record.vehicleId?._id : record.vehicleId;
                  const reporter = typeof record.reportedBy === 'object' ? record.reportedBy : null;
                  const driver = typeof record.driverId === 'object' ? record.driverId : null;
                  const reporterIsDriver = reporter?.role === 'driver';
                  const linkedDriver = reporterIsDriver ? reporter : driver;

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
                          {vehicleId ? (
                            <Link href={`/vehicles/${vehicleId}`} className="hover:text-[var(--zd-blue)] hover:underline">
                              {record.vehicleModel}
                            </Link>
                          ) : (
                            <span>{record.vehicleModel}</span>
                          )}
                        </div>
                        <div className="text-[10px] text-[var(--zd-muted)] mt-0.5">
                          لوحة: {record.vehiclePlate}
                        </div>
                      </td>

                      {/* مقدم الطلب */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-[var(--zd-text)] font-medium">
                          <User className="h-3.5 w-3.5 text-[var(--zd-muted)]" />
                          {reporterIsDriver && reporter ? (
                            <Link href={`/drivers/${reporter._id}`} className="hover:text-[var(--zd-blue)] hover:underline">
                              {record.reporterName}
                            </Link>
                          ) : (
                            <span>{record.reporterName}</span>
                          )}
                        </div>
                        {linkedDriver && (
                          <div className="text-[10px] text-[var(--zd-muted)] mt-0.5">
                            السائق: {linkedDriver.name}
                          </div>
                        )}
                      </td>

                      {/* الأولوية */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${priority.bgClass}`}
                        >
                          {priority.label}
                        </span>
                      </td>

                      {/* العداد */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-mono text-[11px] text-[var(--zd-text)]">
                          <Gauge className="h-3.5 w-3.5 text-[var(--zd-muted)]" />
                          <span>{record.odoMeter ? record.odoMeter.toLocaleString('en-US') : '—'}</span>
                        </div>
                      </td>

                      {/* التكلفة */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-bold text-[11px] text-[var(--zd-text)]">
                          {formatCostSAR(record.cost)}
                        </span>
                      </td>

                      {/* مسؤولية السائق */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {record.status === 'approved' ? (
                          record.isDriverFault ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-500 border border-amber-500/20">
                              <AlertTriangle className="h-3 w-3" />
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

        {/* ── ترقيم الصفحات الموحد من السيرفر ── */}
        {pagination && onPageChange && (
          <div className="border-t border-[var(--zd-line)] p-3">
            <TablePagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              onPageChange={onPageChange}
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
              itemLabel="طلب صيانة"
            />
          </div>
        )}
      </div>
    </div>
  );
}
