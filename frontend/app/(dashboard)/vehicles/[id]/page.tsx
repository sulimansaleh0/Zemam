'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/ui/Toast';
import { VEHICLE_QUERY_KEYS } from '@/features/vehicles/hooks/useVehicles';
import {
  Car,
  ChevronRight,
  Power,
  Trash2,
  AlertCircle,
  Loader2,
  Activity,
  Wrench,
  Fuel,
  Gauge,
  Calendar,
  Coins,
  History,
  Edit2,
  ClipboardList,
} from 'lucide-react';
import { Sidebar, Header } from '@/features/dashboard';
import { useTasks } from '@/features/tasks';
import { FuelDetailModal, useFuel, type FuelRecordWithRelations } from '@/features/fuel';
import {
  MaintenanceDetailModal,
  getMaintenanceCategoryConfig,
  getMaintenanceStatusConfig,
  useMaintenance,
  formatCostSAR,
  type MaintenanceRecordWithRelations,
} from '@/features/maintenance';
import {
  useVehicleDetailPage,
  VehicleDetailCards,
  AssignDriverModal,
  AssignVehicleToTeamModal,
  ConfirmDeleteVehicleModal,
  VehicleStatusBadge,
  EditVehicleModal,
} from '@/features/vehicles';

export default function VehicleDetailPage() {
  const params = useParams();
  const vehicleId = String(params?.id || '');
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeHistoryTab, setActiveHistoryTab] = useState<'fuel' | 'maintenance'>('fuel');
  const [selectedFuelRecord, setSelectedFuelRecord] = useState<FuelRecordWithRelations | null>(null);
  const [selectedMaintenanceRecord, setSelectedMaintenanceRecord] = useState<MaintenanceRecordWithRelations | null>(null);
  const { data: vehicleTasks = [], isLoading: isLoadingTasks, isError: isTasksError } = useTasks(vehicleId);
  const {
    data: vehicleFuelRecords = [],
    isLoading: isLoadingFuel,
    isError: isFuelError,
  } = useFuel({ vehicleId });
  const {
    data: vehicleMaintenanceRecords = [],
    isLoading: isLoadingMaintenance,
    isError: isMaintenanceError,
  } = useMaintenance({ vehicleId });

  const {
    vehicle,
    teamObj,
    isActive,
    vehicleStats,
    isLoadingStats,
    isLoading,
    isError,
    error,
    isAssignDriverOpen,
    setIsAssignDriverOpen,
    isAssignTeamOpen,
    setIsAssignTeamOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    isUpdating,
    isChangingStatus,
    isRemovingTeam,
    isUnassigningDriver,
    handleToggleStatus,
    handleUpdateVehicle: updateVehicleOnBackend,
    handleRemoveTeam,
    handleUnassignDriver,
    userName,
    menuOpen,
    setMenuOpen,
    logout,
  } = useVehicleDetailPage(vehicleId);

  const handleUpdateVehicle = async (vId: string, updatedData: any) => {
    try {
      await updateVehicleOnBackend(updatedData);
      setIsEditOpen(false);
    } catch {
      // Toast is handled by hook
    }
  };

  if (isLoading) {
    return (
      <main className="zamam-dashboard min-h-[100dvh] flex items-center justify-center bg-[var(--background)]" dir="rtl">
        <div className="flex flex-col items-center gap-3 text-[var(--muted)]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
          <p className="text-xs">جارٍ تحميل تفاصيل المركبة...</p>
        </div>
      </main>
    );
  }

  if (isError || !vehicle) {
    return (
      <main className="zamam-dashboard min-h-[100dvh] flex items-center justify-center p-6 bg-[var(--background)]" dir="rtl">
        <div className="max-w-md w-full p-8 text-center bg-[var(--surface)] border border-rose-500/20 rounded-2xl space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-[var(--text)]">المركبة غير موجودة</h2>
          <p className="text-xs text-[var(--muted)]">
            {error instanceof Error ? error.message : 'تعذّر العثور على المركبة المطلوبة أو قد تم حذفها'}
          </p>
          <Link
            href="/vehicles"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white text-xs font-bold rounded-xl"
          >
            <ChevronRight className="w-4 h-4" />
            <span>العودة لقائمة المركبات</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="zamam-dashboard zd-grid min-h-[100dvh] text-[var(--zd-text)]" dir="rtl">
      <div className="flex min-h-[100dvh]">
        {/* ── Sidebar ── */}
        <Sidebar
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          userName={userName}
          onLogout={logout}
        />

        {/* ── Mobile Overlay ── */}
        {menuOpen && (
          <button
            aria-label="إغلاق القائمة"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* ── Main Content Area ── */}
        <div className="min-w-0 flex-1">
          <Header
            onMenu={() => setMenuOpen(true)}
            searchQuery=""
            onSearchChange={() => { }}
            userName={userName}
          />

          <div className="mx-auto max-w-[1540px] px-4 py-6 sm:px-7 sm:py-8 lg:px-10 space-y-6">
            {/* ── Breadcrumb & Hero ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)] mb-1">
                  <Link href="/vehicles" className="hover:text-[var(--primary)] transition-colors">
                    سجل المركبات
                  </Link>
                  <span>/</span>
                  <span className="text-[var(--primary)]">
                    {vehicle.model} ({vehicle.year})
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center font-bold text-lg border border-[var(--primary)]/20 shadow-xs">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
                      {vehicle.model} ({vehicle.year})
                    </h1>
                    <div className="flex items-center gap-3 text-xs text-[var(--muted)] mt-1">
                      <span className="font-mono bg-[var(--surface-2)] px-2 py-0.5 rounded border border-[var(--border)] font-bold text-[var(--text)]" dir="ltr">
                        لوحة: {vehicle.plateNumber}
                      </span>
                      <span>•</span>
                      <VehicleStatusBadge status={vehicle.status} isInTask={vehicle.isInTask} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--text)] transition-colors cursor-pointer shadow-xs"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[var(--primary)]" />
                  <span>تعديل المواصفات والرخص</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleStatus}
                  disabled={isChangingStatus || vehicle.status === 'in_maintenance'}
                  title={vehicle.status === 'in_maintenance' ? 'لا يمكن تغيير الحالة قبل مراجعة طلب الصيانة' : undefined}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${isActive
                    ? 'border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                    : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>
                    {vehicle.status === 'in_maintenance'
                      ? 'بانتظار مراجعة الصيانة'
                      : isActive ? 'تعطيل المركبة' : 'تفعيل المركبة'}
                  </span>
                </button>

                {(() => {
                  const isDeleteBlocked = Boolean(vehicle.isInTask) || vehicle.status === 'in_maintenance';
                  return (
                    <button
                      type="button"
                      onClick={() => setIsDeleteOpen(true)}
                      title={isDeleteBlocked ? 'لا يمكن حذف المركبة أثناء وجودها في مهمة أو قيد الصيانة' : undefined}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${isDeleteBlocked
                        ? 'border-neutral-300 dark:border-neutral-700 text-[var(--muted)] opacity-60'
                        : 'border-rose-500/20 text-rose-500 hover:bg-rose-500/10'
                        }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف المركبة</span>
                      {isDeleteBlocked && <span className="text-[10px] text-amber-500 font-bold">(محمية)</span>}
                    </button>
                  );
                })()}
              </div>
            </div>

            {/* Protection Banner if vehicle is in task or maintenance */}
            {(Boolean(vehicle.isInTask) || vehicle.status === 'in_maintenance') && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2.5 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                <span>
                  {vehicle.status === 'in_maintenance'
                    ? 'لا يمكن تغيير حالة المركبة حتى تتم مراجعة طلب الصيانة.'
                    : 'هذه المركبة محمية تلقائياً من الحذف نظراً لأنها في مهمة تشغيلية جارية حالياً.'}
                </span>
              </div>
            )}

            {/* ── Info Cards Grid ── */}
            <VehicleDetailCards
              vehicle={vehicle}
              teamObj={teamObj}
              onOpenAssignTeam={() => setIsAssignTeamOpen(true)}
              onRemoveTeam={handleRemoveTeam}
              isRemovingTeam={isRemovingTeam}
              onOpenAssignDriver={() => setIsAssignDriverOpen(true)}
              onUnassignDriver={handleUnassignDriver}
              isUnassigningDriver={isUnassigningDriver}
            />

            {/* ── Operational Status Overview ── */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[var(--text)]">السجلات التشغيلية للمركبة (بيانات حية)</h3>
                {isLoadingStats && (
                  <span className="text-[10px] text-[var(--muted)] flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    جارٍ جلب السجلات...
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-[var(--surface-2)]/50 border border-[var(--border)] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[var(--muted)] block">المسافة التشغيلية المقطوعة</span>
                    <span className="text-lg font-bold text-[var(--text)] font-mono">
                      {vehicleStats ? `${vehicleStats.distance.toLocaleString('ar-SA')} كم` : '0 كم'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-2)]/50 border border-[var(--border)] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
                    <Fuel className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[var(--muted)] block">إجمالي استهلاك الوقود</span>
                    <span className="text-lg font-bold text-[var(--text)] font-mono">
                      {vehicleStats ? `${vehicleStats.totalFuel.toLocaleString('ar-SA')} لتر` : '0 لتر'}
                    </span>
                    {vehicleStats && vehicleStats.totalFuelCost > 0 && (
                      <span className="text-[10px] text-[var(--muted)] block">
                        ({vehicleStats.totalFuelCost.toLocaleString('ar-SA')} ر.س)
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-2)]/50 border border-[var(--border)] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[var(--muted)] block">مصروفات الصيانة المعتمدة</span>
                    <span className="text-lg font-bold text-[var(--text)] font-mono">
                      {vehicleStats ? `${vehicleStats.totalMaintenanceCost.toLocaleString('ar-SA')} ر.س` : '0 ر.س'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-2)]/50 border border-[var(--border)] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Gauge className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[var(--muted)] block">معدل كفاءة الوقود المحققة</span>
                    <span className="text-lg font-bold text-[var(--text)] font-mono">
                      {vehicleStats && vehicleStats.fuelEfficiency > 0
                        ? `${vehicleStats.fuelEfficiency.toFixed(1)} كم/لتر`
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

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
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${activeHistoryTab === 'fuel'
                      ? 'bg-[var(--primary)] text-white shadow-xs'
                      : 'text-[var(--muted)] hover:text-[var(--text)]'
                      }`}
                  >
                    <Fuel className="h-3.5 w-3.5" />
                    الوقود ({vehicleFuelRecords.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveHistoryTab('maintenance')}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${activeHistoryTab === 'maintenance'
                      ? 'bg-[var(--primary)] text-white shadow-xs'
                      : 'text-[var(--muted)] hover:text-[var(--text)]'
                      }`}
                  >
                    <Wrench className="h-3.5 w-3.5" />
                    الصيانة ({vehicleMaintenanceRecords.length})
                  </button>
                </div>
              </div>

              {activeHistoryTab === 'fuel' ? (
                isLoadingFuel ? (
                  <p className="px-5 py-6 text-xs text-[var(--muted)]">جارٍ تحميل سجلات الوقود...</p>
                ) : isFuelError ? (
                  <p className="px-5 py-6 text-xs text-rose-500">تعذر تحميل سجلات الوقود.</p>
                ) : vehicleFuelRecords.length === 0 ? (
                  <p className="px-5 py-6 text-xs text-[var(--muted)]">لا توجد سجلات وقود لهذه المركبة.</p>
                ) : (
                  <div className="divide-y divide-[var(--border)]">
                    {vehicleFuelRecords.map((record) => (
                      <button
                        key={record._id}
                        type="button"
                        onClick={() => setSelectedFuelRecord(record)}
                        aria-label={`عرض تفاصيل تعبئة الوقود: ${record.qty} لتر`}
                        className="flex w-full flex-col gap-3 px-5 py-4 text-right transition-colors hover:bg-[var(--surface-2)]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[var(--primary)] sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-[var(--text)]">تعبئة وقود · {record.qty} لتر</span>
                            <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${record.status === 'approved'
                              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
                              : record.status === 'declined'
                                ? 'border-rose-500/20 bg-rose-500/10 text-rose-500'
                                : 'border-amber-500/20 bg-amber-500/10 text-amber-600'
                              }`}>
                              {record.status === 'approved' ? 'معتمدة' : record.status === 'declined' ? 'مرفوضة' : 'قيد المراجعة'}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[var(--muted)]">
                            <span className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5" />{Number(record.odometer).toLocaleString('ar-SA')} كم</span>
                            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{record.formattedDate}</span>
                          </div>
                        </div>
                        <span className="shrink-0 text-sm font-black text-[var(--text)]">{Number(record.cost).toLocaleString('ar-SA')} ر.س</span>
                      </button>
                    ))}
                  </div>
                )
              ) : isLoadingMaintenance ? (
                <p className="px-5 py-6 text-xs text-[var(--muted)]">جارٍ تحميل سجلات الصيانة...</p>
              ) : isMaintenanceError ? (
                <p className="px-5 py-6 text-xs text-rose-500">تعذر تحميل سجلات الصيانة.</p>
              ) : vehicleMaintenanceRecords.length === 0 ? (
                <p className="px-5 py-6 text-xs text-[var(--muted)]">لا توجد سجلات صيانة لهذه المركبة.</p>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {vehicleMaintenanceRecords.map((record) => {
                    const category = getMaintenanceCategoryConfig(record.category);
                    const status = getMaintenanceStatusConfig(record.status);
                    return (
                      <button
                        key={record._id}
                        type="button"
                        onClick={() => setSelectedMaintenanceRecord(record)}
                        aria-label={`عرض تفاصيل سجل الصيانة: ${record.description}`}
                        className="flex w-full flex-col gap-3 px-5 py-4 text-right transition-colors hover:bg-[var(--surface-2)]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[var(--primary)] sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="max-w-xl truncate text-xs font-bold text-[var(--text)]">{record.description}</span>
                            <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${category.badgeClass}`}>{category.label}</span>
                            <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${status.bgClass}`}>{status.label}</span>
                          </div>
                          <span className="flex items-center gap-1 text-[11px] text-[var(--muted)]"><Calendar className="h-3.5 w-3.5" />{record.formattedDate}</span>
                        </div>
                        <span className="flex shrink-0 items-center gap-1 text-sm font-black text-[var(--text)]"><Coins className="h-3.5 w-3.5 text-[var(--muted)]" />{formatCostSAR(record.cost)}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

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
              ) : vehicleTasks.length === 0 ? (
                <p className="px-5 py-6 text-xs text-[var(--muted)]">لا توجد مهام مسجلة لهذه المركبة.</p>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {vehicleTasks.map((task) => (
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
                        {task.status === 'pending' ? 'قيد الانتظار' : task.status === 'inprogress' ? 'قيد التنفيذ' : task.status === 'finished' ? 'مكتملة' : 'مرفوضة'}
                      </span>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

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

      {/* ── Assign Driver Modal ── */}
      <AssignDriverModal
        isOpen={isAssignDriverOpen}
        onClose={() => setIsAssignDriverOpen(false)}
        targetVehicle={vehicle}
      />

      {/* ── Assign Team Modal ── */}
      <AssignVehicleToTeamModal
        isOpen={isAssignTeamOpen}
        onClose={() => setIsAssignTeamOpen(false)}
        vehicle={vehicle}
      />

      {/* ── Delete Vehicle Modal ── */}
      <ConfirmDeleteVehicleModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        targetVehicle={vehicle}
      />

      {/* ── Edit Vehicle Modal ── */}
      <EditVehicleModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        vehicle={vehicle}
        onUpdate={handleUpdateVehicle}
        isLoading={isUpdating}
      />
    </main>
  );
}
