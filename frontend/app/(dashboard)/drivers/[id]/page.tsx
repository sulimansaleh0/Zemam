'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UsersRound,
  ChevronRight,
  UserCheck,
  UserX,
  Trash2,
  Car,
  Building2,
  Mail,
  Calendar,
  Unlink,
  Link2,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  ClipboardCheck,
  Wrench,
  Fuel,
} from 'lucide-react';
import { Sidebar, Header, useDashboard } from '@/features/dashboard';
import {
  useDriversList,
  useChangeDriverStatus,
  useDeleteDriver,
  useAssignVehicleToDriver,
  useUnassignVehicleFromDriver,
  useRemoveDriverFromTeam,
  AssignVehicleModal,
  AssignDriverToTeamModal,
  DriverDeleteModal,
  PerformanceChart,
  ActivityContent,
  type Driver,
} from '@/features/drivers';
import { useTeams } from '@/features/teams';
import { getDriverDisplayName, formatRelativeDate } from '@/features/drivers/utils/driverHelpers';
import { DriverAvatar } from '@/features/drivers/components/DriverAvatar';
import { StatusPill } from '@/features/drivers/components/StatusPill';

type ActivityTab = 'المهام' | 'البلاغات' | 'الوقود';

const TAB_ITEMS: { label: ActivityTab; icon: React.ElementType }[] = [
  { label: 'المهام', icon: ClipboardCheck },
  { label: 'البلاغات', icon: Wrench },
  { label: 'الوقود', icon: Fuel },
];

export default function DriverDetailPage() {
  const params = useParams();
  const router = useRouter();
  const driverId = String(params?.id || '');

  const { userName, menuOpen, setMenuOpen, logout } = useDashboard();

  // Queries
  const { data: drivers = [], isLoading, isError, error } = useDriversList();
  const { data: teamsList = [] } = useTeams();

  // Mutations
  const changeStatusMutation = useChangeDriverStatus();
  const deleteMutation = useDeleteDriver();
  const assignVehicleMutation = useAssignVehicleToDriver();
  const unassignVehicleMutation = useUnassignVehicleFromDriver();
  const removeTeamMutation = useRemoveDriverFromTeam();

  // Tab & Modals
  const [tab, setTab] = useState<ActivityTab>('المهام');
  const [isAssignVehicleOpen, setIsAssignVehicleOpen] = useState(false);
  const [isAssignTeamOpen, setIsAssignTeamOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Find target driver
  const driver = useMemo(() => {
    return drivers.find((d) => d._id === driverId) || null;
  }, [drivers, driverId]);

  // Team lookup
  const teamObj = useMemo(() => {
    if (!driver?.teamId) return null;
    return teamsList.find((t) => t._id === driver.teamId) || null;
  }, [teamsList, driver?.teamId]);

  if (isLoading) {
    return (
      <main className="zamam-dashboard min-h-[100dvh] flex items-center justify-center bg-[var(--background)]" dir="rtl">
        <div className="flex flex-col items-center gap-3 text-[var(--muted)]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
          <p className="text-xs">جارٍ تحميل تفاصيل السائق...</p>
        </div>
      </main>
    );
  }

  if (isError || !driver) {
    return (
      <main className="zamam-dashboard min-h-[100dvh] flex items-center justify-center p-6 bg-[var(--background)]" dir="rtl">
        <div className="max-w-md w-full p-8 text-center bg-[var(--surface)] border border-rose-500/20 rounded-2xl space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-[var(--text)]">السائق غير موجود</h2>
          <p className="text-xs text-[var(--muted)]">
            {error instanceof Error ? error.message : 'تعذّر العثور على السائق المطلوب أو قد تم حذفه'}
          </p>
          <Link
            href="/drivers"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white text-xs font-bold rounded-xl"
          >
            <ChevronRight className="w-4 h-4" />
            <span>العودة لقائمة السائقين</span>
          </Link>
        </div>
      </main>
    );
  }

  const displayName = getDriverDisplayName(driver);
  const isActive = driver.status === 'active';

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
                  <Link href="/drivers" className="hover:text-[var(--primary)] transition-colors">
                    إدارة السائقين
                  </Link>
                  <span>/</span>
                  <span className="text-[var(--primary)]">{displayName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <DriverAvatar driver={driver} size="lg" />
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
                      {displayName}
                    </h1>
                    <div className="flex items-center gap-3 text-xs text-[var(--muted)] mt-1">
                      <span className="font-mono" dir="ltr">{driver.email}</span>
                      <span>•</span>
                      <StatusPill status={driver.status} />
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
                    changeStatusMutation.mutate({ id: driver._id, status: nextStatus });
                  }}
                  disabled={changeStatusMutation.isPending}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer disabled:opacity-50 ${
                    isActive
                      ? 'border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                      : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                >
                  {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                  <span>{isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف السائق</span>
                </button>
              </div>
            </div>

            {/* ── Driver Cards Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Basic Info */}
              <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
                <span className="text-xs font-bold text-[var(--muted)] flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-blue-500" />
                  البيانات الأساسية
                </span>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[var(--muted)] block">البريد الإلكتروني:</span>
                    <span className="font-semibold text-[var(--text)] font-mono" dir="ltr">
                      {driver.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--muted)] block">تاريخ الانضمام:</span>
                    <span className="font-semibold text-[var(--text)]">
                      {formatRelativeDate(driver.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--muted)] block">حالة الحساب:</span>
                    <span className="font-semibold text-[var(--text)]">
                      {isActive ? 'نشط ويعمل' : 'معطل مؤقتاً'}
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
                        await removeTeamMutation.mutateAsync(driver._id);
                      }}
                      disabled={removeTeamMutation.isPending}
                      className="p-1 rounded-lg text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer"
                      title="فك الارتباط عن الفريق"
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
                      <span>تعيين</span>
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
                      في المخزون العام (غير مقيد بفريق)
                    </span>
                  )}
                </div>
              </div>

              {/* Card 3: Vehicle */}
              <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--muted)] flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-emerald-500" />
                    المركبة المعينة
                  </span>
                  {driver.assignedVehicle ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setIsAssignVehicleOpen(true)}
                        className="text-[11px] text-[var(--primary)] hover:underline font-semibold cursor-pointer"
                      >
                        تغيير
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await unassignVehicleMutation.mutateAsync(driver._id);
                        }}
                        disabled={unassignVehicleMutation.isPending}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="فك ارتباط المركبة"
                      >
                        <Unlink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAssignVehicleOpen(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] text-xs font-semibold hover:bg-[var(--primary)] hover:text-white transition-colors cursor-pointer"
                    >
                      <Car className="w-3 h-3" />
                      <span>تعيين</span>
                    </button>
                  )}
                </div>
                <div className="space-y-1 text-xs">
                  {driver.assignedVehicle ? (
                    <>
                      <div className="font-bold text-sm text-[var(--text)]">
                        {driver.assignedVehicle.model} ({driver.assignedVehicle.year})
                      </div>
                      <div className="font-mono text-xs text-[var(--muted)]">
                        لوحة: {driver.assignedVehicle.plateNumber}
                      </div>
                    </>
                  ) : (
                    <span className="text-xs text-[var(--muted)] italic block pt-2">
                      لا توجد مركبة معينة حالياً
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Performance Chart ── */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
              <h3 className="text-sm font-bold text-[var(--text)] mb-3">مؤشر الأداء والمهام</h3>
              <PerformanceChart />
            </div>

            {/* ── Activity Tabs ── */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[var(--text)]">سجل النشاط والعمليات</h3>
                  <p className="text-xs text-[var(--muted)]">المهام والبلاغات ومصروفات الوقود</p>
                </div>

                {/* Tab selector */}
                <div className="flex gap-1 rounded-xl bg-[var(--surface-2)] p-1">
                  {TAB_ITEMS.map(({ label, icon: Icon }) => (
                    <button
                      key={label}
                      onClick={() => setTab(label)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        tab === label
                          ? 'bg-[var(--primary)] text-white shadow-xs'
                          : 'text-[var(--muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <ActivityContent tab={tab} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Assign Vehicle Modal ── */}
      {isAssignVehicleOpen && (
        <AssignVehicleModal
          driver={driver}
          onClose={() => setIsAssignVehicleOpen(false)}
          onAssign={async (vehicleId) => {
            await assignVehicleMutation.mutateAsync({
              driverId: driver._id,
              vehicleId,
            });
            setIsAssignVehicleOpen(false);
          }}
          isLoading={assignVehicleMutation.isPending}
        />
      )}

      {/* ── Assign Team Modal ── */}
      {isAssignTeamOpen && (
        <AssignDriverToTeamModal
          isOpen={true}
          driver={driver}
          onClose={() => setIsAssignTeamOpen(false)}
        />
      )}

      {/* ── Delete Driver Modal ── */}
      {isDeleteOpen && (
        <DriverDeleteModal
          driver={driver}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={async () => {
            await deleteMutation.mutateAsync(driver._id);
            setIsDeleteOpen(false);
            router.push('/drivers');
          }}
          isLoading={deleteMutation.isPending}
        />
      )}
    </main>
  );
}
