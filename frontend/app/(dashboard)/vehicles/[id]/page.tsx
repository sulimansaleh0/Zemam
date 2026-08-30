'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Car,
  ChevronRight,
  UserCheck,
  User,
  Power,
  Trash2,
  Building2,
  Calendar,
  Unlink,
  Link2,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Activity,
  FileText,
  Wrench,
  Fuel,
} from 'lucide-react';
import { Sidebar, Header, useDashboard } from '@/features/dashboard';
import {
  useVehicles,
  useChangeVehicleStatus,
  useRemoveVehicleFromTeam,
  useUnassignDriver,
  AssignDriverModal,
  AssignVehicleToTeamModal,
  ConfirmDeleteVehicleModal,
  VehicleStatusBadge,
  type VehicleWithRelations,
} from '@/features/vehicles';
import { useTeams } from '@/features/teams';

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = String(params?.id || '');

  const { userName, menuOpen, setMenuOpen, logout } = useDashboard();

  // Queries
  const { data: vehicles = [], isLoading, isError, error } = useVehicles();
  const { data: teamsList = [] } = useTeams();

  // Mutations
  const changeStatusMutation = useChangeVehicleStatus();
  const removeTeamMutation = useRemoveVehicleFromTeam();
  const unassignDriverMutation = useUnassignDriver();

  // Modals
  const [isAssignDriverOpen, setIsAssignDriverOpen] = useState(false);
  const [isAssignTeamOpen, setIsAssignTeamOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Find vehicle
  const vehicle = useMemo(() => {
    return vehicles.find((v) => v._id === vehicleId) || null;
  }, [vehicles, vehicleId]);

  // Team lookup
  const teamObj = useMemo(() => {
    if (!vehicle?.teamId) return null;
    const tId = typeof vehicle.teamId === 'object' ? (vehicle.teamId as any)._id : vehicle.teamId;
    return teamsList.find((t) => t._id === tId) || null;
  }, [teamsList, vehicle?.teamId]);

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

  const isActive = vehicle.status === 'active';

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
                  onClick={() => {
                    const nextStatus = isActive ? 'inactive' : 'active';
                    changeStatusMutation.mutate({ id: vehicle._id, status: nextStatus });
                  }}
                  disabled={changeStatusMutation.isPending}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Specs */}
              <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
                <span className="text-xs font-bold text-[var(--muted)] flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-blue-500" />
                  مواصفات المركبة
                </span>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[var(--muted)] block">الموديل وسنة الصنع:</span>
                    <span className="font-bold text-sm text-[var(--text)]">
                      {vehicle.model} ({vehicle.year})
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--muted)] block">رقم لوحة الترخيص:</span>
                    <span className="font-mono font-bold text-sm text-[var(--text)]" dir="ltr">
                      {vehicle.plateNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--muted)] block">الحالة التشغيلية:</span>
                    <span className="font-semibold text-[var(--text)]">
                      {vehicle.isInTask ? 'في مهمة حالياً' : 'متاحة للتشغيل'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Team */}
              <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--muted)] flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-indigo-500" />
                    الفريق التشغيلي
                  </span>
                  {teamObj ? (
                    <button
                      type="button"
                      onClick={async () => {
                        await removeTeamMutation.mutateAsync(vehicle._id);
                      }}
                      disabled={removeTeamMutation.isPending}
                      className="p-1 rounded-lg text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer"
                      title="فك الارتباط ونقلها للمستودع العام"
                    >
                      <Unlink className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAssignTeamOpen(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] text-xs font-semibold hover:bg-[var(--primary)] hover:text-white transition-colors cursor-pointer"
                    >
                      <Link2 className="w-3 h-3" />
                      <span>تعيين لفريق</span>
                    </button>
                  )}
                </div>
                <div className="space-y-1 text-xs">
                  {teamObj ? (
                    <>
                      <Link
                        href={`/teams/${teamObj._id}`}
                        className="font-bold text-sm text-[var(--text)] hover:text-[var(--primary)] hover:underline block"
                      >
                        {teamObj.name}
                      </Link>
                      <span className="text-[11px] text-[var(--muted)]">فريق تشغيلي مسند</span>
                    </>
                  ) : (
                    <span className="text-xs text-[var(--muted)] italic block pt-2">
                      في المستودع العام (غير مقيدة بفريق)
                    </span>
                  )}
                </div>
              </div>

              {/* Card 3: Driver */}
              <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--muted)] flex items-center gap-1.5">
                    <User className="w-4 h-4 text-emerald-500" />
                    السائق المعين
                  </span>
                  {vehicle.driverId ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setIsAssignDriverOpen(true)}
                        className="text-[11px] text-[var(--primary)] hover:underline font-semibold cursor-pointer"
                      >
                        تغيير
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await unassignDriverMutation.mutateAsync(vehicle._id);
                        }}
                        disabled={unassignDriverMutation.isPending}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="فك ارتباط السائق"
                      >
                        <Unlink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAssignDriverOpen(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] text-xs font-semibold hover:bg-[var(--primary)] hover:text-white transition-colors cursor-pointer"
                    >
                      <UserCheck className="w-3 h-3" />
                      <span>تعيين سائق</span>
                    </button>
                  )}
                </div>
                <div className="space-y-1 text-xs">
                  {vehicle.driverId ? (
                    <>
                      <div className="font-bold text-sm text-[var(--text)]">
                        {vehicle.driverName || 'سائق معين'}
                      </div>
                      {vehicle.driverEmail && (
                        <div className="font-mono text-xs text-[var(--muted)]" dir="ltr">
                          {vehicle.driverEmail}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-[var(--muted)] italic block pt-2">
                      لا يوجد سائق معين حالياً
                    </span>
                  )}
                </div>
              </div>
            </div>

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
        onClose={() => {
          setIsDeleteOpen(false);
          router.push('/vehicles');
        }}
        targetVehicle={vehicle}
      />
    </main>
  );
}
