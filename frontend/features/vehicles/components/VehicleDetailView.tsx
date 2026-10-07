'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Car,
  ChevronRight,
  Power,
  Trash2,
  AlertCircle,
  Loader2,
  Edit2,
} from 'lucide-react';
import { Sidebar, Header } from '@/features/dashboard';
import { useTasks } from '@/features/tasks';
import { useFuel } from '@/features/fuel';
import { useMaintenance } from '@/features/maintenance';
import { useVehicleDetailPage } from '../hooks/useVehicleDetailPage';
import { VehicleDetailCards } from './VehicleDetailCards';
import { VehicleOperationalOverview } from './VehicleOperationalOverview';
import { VehicleHistorySection } from './VehicleHistorySection';
import { AssignDriverModal } from './AssignDriverModal';
import { AssignVehicleToTeamModal } from './AssignVehicleToTeamModal';
import { ConfirmDeleteVehicleModal } from './ConfirmDeleteVehicleModal';
import { VehicleStatusBadge } from './VehicleStatusBadge';
import { EditVehicleModal } from './EditVehicleModal';
import type { UpdateVehicleInput } from '../types/vehicle.types';

interface VehicleDetailViewProps {
  vehicleId: string;
}

export function VehicleDetailView({ vehicleId }: VehicleDetailViewProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

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

  const handleUpdateVehicle = async (_vId: string, updatedData: UpdateVehicleInput) => {
    try {
      await updateVehicleOnBackend(updatedData);
      setIsEditOpen(false);
    } catch {
      // Toast error is handled by mutation hook
    }
  };

  return (
    <main className="zamam-dashboard zd-grid min-h-[100dvh] text-[var(--zd-text)]" dir="rtl">
      <div className="flex min-h-[100dvh]">
        <Sidebar
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          userName={userName}
          onLogout={logout}
        />

        {menuOpen && (
          <button
            aria-label="إغلاق القائمة"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden"
          />
        )}

        <div className="min-w-0 flex-1">
          <Header
            onMenu={() => setMenuOpen(true)}
            searchQuery=""
            onSearchChange={() => {}}
            userName={userName}
          />

          <div className="mx-auto max-w-[1540px] px-4 py-6 sm:px-7 sm:py-8 lg:px-10 space-y-6">
            {/* ── Breadcrumb ── */}
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
              <Link href="/vehicles" className="hover:text-[var(--primary)] transition-colors">
                سجل المركبات
              </Link>
              <ChevronRight className="w-3.5 h-3.5 rotate-180 opacity-50" />
              <span className="text-[var(--text)]">
                {isLoading ? 'جارٍ التحميل...' : vehicle ? `${vehicle.model} (${vehicle.plateNumber})` : 'تفاصيل المركبة'}
              </span>
            </div>

            {/* ── Loading State ── */}
            {isLoading && (
              <div className="flex min-h-[350px] flex-col items-center justify-center gap-3 text-[var(--muted)]">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
                <p className="text-xs">جارٍ تحميل تفاصيل وسجلات المركبة...</p>
              </div>
            )}

            {/* ── Error State ── */}
            {isError && !isLoading && (
              <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-2xl border border-rose-500/25 bg-rose-500/5 p-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[var(--text)]">تعذّر العثور على المركبة</h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {error instanceof Error ? error.message : 'المركبة غير موجودة أو تم حذفها مسبقاً.'}
                  </p>
                </div>
                <Link
                  href="/vehicles"
                  className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold"
                >
                  العودة لسجل المركبات
                </Link>
              </div>
            )}

            {/* ── Vehicle Details Content ── */}
            {!isLoading && !isError && vehicle && (
              <>
                {/* ── Hero Title Card ── */}
                <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0 border border-[var(--primary)]/20 shadow-xs">
                      <Car className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-xl sm:text-2xl font-black text-[var(--text)] tracking-tight">
                          {vehicle.model}
                        </h1>
                        <VehicleStatusBadge status={vehicle.status} isInTask={vehicle.isInTask} />
                      </div>
                      <p className="text-xs text-[var(--muted)] mt-1 font-mono">
                        موديل: {vehicle.year} · لوحة: {vehicle.plateNumber}
                      </p>
                    </div>
                  </div>

                  {/* Actions Header */}
                  <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setIsEditOpen(true)}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-xs font-semibold text-[var(--text)] hover:border-[var(--primary)] transition-all cursor-pointer shadow-xs"
                      title="تعديل المواصفات والرخص"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>تعديل المواصفات</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleStatus}
                      disabled={isChangingStatus || vehicle.status === 'in_maintenance'}
                      className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 ${
                        isActive
                          ? 'border border-rose-500/20 bg-rose-500/10 text-rose-600 hover:bg-rose-500/15'
                          : 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15'
                      }`}
                    >
                      {isChangingStatus ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Power className="w-3.5 h-3.5" />
                      )}
                      <span>{isActive ? 'تعطيل المركبة' : 'تفعيل المركبة'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsDeleteOpen(true)}
                      disabled={vehicle.isInTask || vehicle.status === 'in_maintenance'}
                      className="p-2 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-40"
                      title="حذف المركبة نهائياً"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Maintenance Warning Banner */}
                {(vehicle.status === 'in_maintenance' || vehicle.isInTask) && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
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
                <VehicleOperationalOverview
                  stats={vehicleStats || null}
                  isLoading={isLoadingStats}
                />

                {/* ── Fuel, Maintenance & Tasks History Section ── */}
                <VehicleHistorySection
                  fuelRecords={vehicleFuelRecords}
                  isLoadingFuel={isLoadingFuel}
                  isFuelError={isFuelError}
                  maintenanceRecords={vehicleMaintenanceRecords}
                  isLoadingMaintenance={isLoadingMaintenance}
                  isMaintenanceError={isMaintenanceError}
                  tasks={vehicleTasks}
                  isLoadingTasks={isLoadingTasks}
                  isTasksError={isTasksError}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <AssignDriverModal
        isOpen={isAssignDriverOpen}
        onClose={() => setIsAssignDriverOpen(false)}
        targetVehicle={vehicle || null}
      />

      <AssignVehicleToTeamModal
        isOpen={isAssignTeamOpen}
        onClose={() => setIsAssignTeamOpen(false)}
        vehicle={vehicle || null}
      />

      <ConfirmDeleteVehicleModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        targetVehicle={vehicle || null}
      />

      <EditVehicleModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        vehicle={vehicle || null}
        onUpdate={handleUpdateVehicle}
        isLoading={isUpdating}
      />
    </main>
  );
}
