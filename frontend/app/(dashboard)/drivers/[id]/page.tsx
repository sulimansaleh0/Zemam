'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight,
  UserCheck,
  UserX,
  Trash2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Sidebar, Header } from '@/features/dashboard';
import {
  useDriverDetailPage,
  DriverAvatar,
  StatusPill,
  DriverDetailCards,
  PerformanceChart,
  ActivityContent,
  ACTIVITY_TAB_ITEMS,
  AssignVehicleModal,
  AssignDriverToTeamModal,
  DriverDeleteModal,
} from '@/features/drivers';

export default function DriverDetailPage() {
  const params = useParams();
  const driverId = String(params?.id || '');

  const {
    driver,
    displayName,
    isActive,
    teamObj,
    isLoading,
    isError,
    error,
    tab,
    setTab,
    isAssignVehicleOpen,
    setIsAssignVehicleOpen,
    isAssignTeamOpen,
    setIsAssignTeamOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    handleToggleStatus,
    handleDelete,
    handleAssignVehicle,
    handleUnassignVehicle,
    handleRemoveTeam,
    isChangingStatus,
    isDeleting,
    isAssigningVehicle,
    isUnassigningVehicle,
    isRemovingTeam,
    userName,
    menuOpen,
    setMenuOpen,
    logout,
  } = useDriverDetailPage(driverId);

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
                  onClick={handleToggleStatus}
                  disabled={isChangingStatus}
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
            <DriverDetailCards
              driver={driver}
              teamObj={teamObj}
              onOpenAssignTeam={() => setIsAssignTeamOpen(true)}
              onRemoveTeam={handleRemoveTeam}
              isRemovingTeam={isRemovingTeam}
              onOpenAssignVehicle={() => setIsAssignVehicleOpen(true)}
              onUnassignVehicle={handleUnassignVehicle}
              isUnassigningVehicle={isUnassigningVehicle}
            />

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
                  {ACTIVITY_TAB_ITEMS.map(({ label, icon: Icon }) => (
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
          onAssign={handleAssignVehicle}
          isLoading={isAssigningVehicle}
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
          onConfirm={handleDelete}
          isLoading={isDeleting}
        />
      )}
    </main>
  );
}
