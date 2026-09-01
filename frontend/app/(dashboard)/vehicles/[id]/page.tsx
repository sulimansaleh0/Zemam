'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
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
} from 'lucide-react';
import { Sidebar, Header } from '@/features/dashboard';
import {
  useVehicleDetailPage,
  VehicleDetailCards,
  AssignDriverModal,
  AssignVehicleToTeamModal,
  ConfirmDeleteVehicleModal,
  VehicleStatusBadge,
} from '@/features/vehicles';

export default function VehicleDetailPage() {
  const params = useParams();
  const vehicleId = String(params?.id || '');

  const {
    vehicle,
    teamObj,
    isActive,
    isLoading,
    isError,
    error,
    isAssignDriverOpen,
    setIsAssignDriverOpen,
    isAssignTeamOpen,
    setIsAssignTeamOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    isChangingStatus,
    isRemovingTeam,
    isUnassigningDriver,
    handleToggleStatus,
    handleRemoveTeam,
    handleUnassignDriver,
    userName,
    menuOpen,
    setMenuOpen,
    logout,
  } = useVehicleDetailPage(vehicleId);

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
            onSearchChange={() => {}}
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
                  onClick={handleToggleStatus}
                  disabled={isChangingStatus}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer disabled:opacity-50 ${
                    isActive
                      ? 'border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                      : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{isActive ? 'تعطيل المركبة' : 'تفعيل المركبة'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف المركبة</span>
                </button>
              </div>
            </div>

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
              <h3 className="text-base font-bold text-[var(--text)]">السجلات التشغيلية للمركبة</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-[var(--surface-2)]/50 border border-[var(--border)] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[var(--muted)] block">المهام المنجزة</span>
                    <span className="text-lg font-bold text-[var(--text)]">—</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-2)]/50 border border-[var(--border)] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[var(--muted)] block">سجلات الصيانة</span>
                    <span className="text-lg font-bold text-[var(--text)]">—</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-2)]/50 border border-[var(--border)] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
                    <Fuel className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[var(--muted)] block">سجلات الوقود</span>
                    <span className="text-lg font-bold text-[var(--text)]">—</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </main>
  );
}
