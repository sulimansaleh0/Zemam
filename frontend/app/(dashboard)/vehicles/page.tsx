'use client';

import React, { useState } from 'react';
import { Truck, Plus, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { Sidebar, Header, useDashboard } from '@/features/dashboard';
import {
  useVehicles,
  useRemoveVehicleFromTeam,
  useUnassignDriver,
  VehiclesTable,
  VehicleFormModal,
  AssignDriverModal,
  DeleteVehicleModal,
  AssignVehicleToTeamModal,
  ConfirmDeleteVehicleModal,
  VehicleStatsCards,
  VehicleWithRelations,
} from '@/features/vehicles';

export default function VehiclesPage() {
  const { userName, menuOpen, setMenuOpen, logout } = useDashboard();
  const {
    data: vehiclesList = [],
    isLoading: isLoadingVehicles,
    isError: isVehiclesError,
    error: vehiclesError,
    refetch: refetchVehicles,
    isRefetching: isRefetchingVehicles,
  } = useVehicles();

  const removeTeamMutation = useRemoveVehicleFromTeam();
  const unassignDriverMutation = useUnassignDriver();

  // Modal states
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [selectedVehicleForAssign, setSelectedVehicleForAssign] =
    useState<VehicleWithRelations | null>(null);
  const [selectedVehicleForStatusChange, setSelectedVehicleForStatusChange] =
    useState<VehicleWithRelations | null>(null);
  const [selectedVehicleForTeam, setSelectedVehicleForTeam] =
    useState<VehicleWithRelations | null>(null);
  const [selectedVehicleForDelete, setSelectedVehicleForDelete] =
    useState<VehicleWithRelations | null>(null);

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
            onSearchChange={() => {}}
            userName={userName}
          />

          <div className="mx-auto max-w-[1540px] px-4 py-6 sm:px-7 sm:py-8 lg:px-10 space-y-6">
            {/* ── Page Header Hero ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--primary)] mb-1">
                  <Truck className="w-4 h-4" />
                  <span>إدارة الأسطول والعمليات</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
                  سجل المركبات والأسطول{' '}
                  {!isLoadingVehicles && (
                    <span className="mr-1 font-manrope text-lg font-semibold text-[var(--primary)]">
                      {vehiclesList.length}
                    </span>
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
                  عرض وتتبع كامل لمركبات الأسطول، حالتها التشغيلية، وتعيينات السائقين
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => refetchVehicles()}
                  disabled={isRefetchingVehicles || isLoadingVehicles}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                  title="تحديث البيانات"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isRefetchingVehicles ? 'animate-spin' : ''}`}
                  />
                  <span>تحديث</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddVehicleModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold shadow-xs hover:opacity-95 transition-opacity cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة مركبة</span>
                </button>
              </div>
            </div>

            {/* ── Error State ── */}
            {isVehiclesError && !isLoadingVehicles && (
              <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-2xl border border-rose-500/25 bg-rose-500/5 p-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[var(--text)]">
                    تعذّر تحميل بيانات المركبات
                  </h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {vehiclesError instanceof Error
                      ? vehiclesError.message
                      : 'حدث خطأ أثناء الاتصال بالسيرفر'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => refetchVehicles()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>إعادة المحاولة</span>
                </button>
              </div>
            )}

            {/* ── Loading Skeleton ── */}
            {isLoadingVehicles && (
              <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-[var(--muted)]">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
                <p className="text-xs">جارٍ تحميل بيانات أسطول المركبات...</p>
              </div>
            )}

            {/* ── Main Content ── */}
            {!isLoadingVehicles && !isVehiclesError && (
              <>
                {/* Stats Cards */}
                <VehicleStatsCards vehicles={vehiclesList} />

                {/* Vehicles Table */}
                <VehiclesTable
                  vehiclesData={vehiclesList}
                  isLoadingVehicles={isLoadingVehicles}
                  onAddVehicleClick={() => setIsAddVehicleModalOpen(true)}
                  onAssignDriverClick={(vehicle) => setSelectedVehicleForAssign(vehicle)}
                  onChangeStatusClick={(vehicle) => setSelectedVehicleForStatusChange(vehicle)}
                  onAssignTeamClick={(vehicle) => setSelectedVehicleForTeam(vehicle)}
                  onRemoveTeamClick={async (vehicle) => {
                    await removeTeamMutation.mutateAsync(vehicle._id);
                  }}
                  onUnassignDriverClick={async (vehicle) => {
                    if (vehicle.driverId) {
                      await unassignDriverMutation.mutateAsync(vehicle.driverId);
                    }
                  }}
                  onDeleteVehicleClick={(vehicle) => setSelectedVehicleForDelete(vehicle)}
                />
              </>
            )}

            {/* ── Page Footer ── */}
            <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-5 text-[10px] text-[var(--muted)] transition-colors">
              <span>زمام لإدارة الأساطيل والعمليات اللوجستية</span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                البيانات متصلة مباشرة بالخادم
              </span>
            </footer>
          </div>
        </div>
      </div>

      {/* ── Add Vehicle Modal ── */}
      <VehicleFormModal
        isOpen={isAddVehicleModalOpen}
        onClose={() => setIsAddVehicleModalOpen(false)}
      />

      {/* ── Assign Driver Modal ── */}
      <AssignDriverModal
        isOpen={Boolean(selectedVehicleForAssign)}
        onClose={() => setSelectedVehicleForAssign(null)}
        targetVehicle={selectedVehicleForAssign}
      />

      {/* ── Assign Vehicle to Team Modal ── */}
      <AssignVehicleToTeamModal
        isOpen={Boolean(selectedVehicleForTeam)}
        onClose={() => setSelectedVehicleForTeam(null)}
        vehicle={selectedVehicleForTeam}
      />

      {/* ── Change Vehicle Status Modal ── */}
      <DeleteVehicleModal
        isOpen={Boolean(selectedVehicleForStatusChange)}
        onClose={() => setSelectedVehicleForStatusChange(null)}
        targetVehicle={selectedVehicleForStatusChange}
      />

      {/* ── Confirm Delete Vehicle Modal ── */}
      <ConfirmDeleteVehicleModal
        isOpen={Boolean(selectedVehicleForDelete)}
        onClose={() => setSelectedVehicleForDelete(null)}
        targetVehicle={selectedVehicleForDelete}
      />
    </main>
  );
}
