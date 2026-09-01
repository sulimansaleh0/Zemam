'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserCheck, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { Sidebar, Header, useDashboard } from '@/features/dashboard';
import {
  useManagers,
  useChangeManagerStatus,
  useDisableManager,
  ManagersTable,
  CreateManagerModal,
  DeleteManagerModal,
  AssignManagerTeamModal,
  ManagerStatsCards,
  type FleetManager,
} from '@/features/managers';
import { useTeams } from '@/features/teams';

export default function ManagersPage() {
  const router = useRouter();
  const { user, userName, menuOpen, setMenuOpen, logout } = useDashboard();

  const isFleetManager =
    user?.role === 'fleet_manager' || user?.role === 'fleet-manager';

  const {
    data: managersList = [],
    isLoading: isLoadingManagers,
    isError: isManagersError,
    error: managersError,
    refetch: refetchManagers,
    isRefetching: isRefetchingManagers,
  } = useManagers();

  const { data: teamsList = [] } = useTeams();

  const changeStatusMutation = useChangeManagerStatus();
  const disableTeamMutation = useDisableManager();

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedManagerForDelete, setSelectedManagerForDelete] = useState<{
    manager: FleetManager;
    teamName?: string;
  } | null>(null);
  const [selectedManagerForAssign, setSelectedManagerForAssign] = useState<FleetManager | null>(
    null
  );
  const [selectedTeamIdForCreate, setSelectedTeamIdForCreate] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (isFleetManager) {
      router.replace('/dashboard');
    }
  }, [isFleetManager, router]);

  if (isFleetManager) {
    return null;
  }

  const handleOpenAdd = (teamId?: string) => {
    setSelectedTeamIdForCreate(teamId);
    setIsCreateModalOpen(true);
  };

  const handleOpenDelete = (manager: FleetManager, teamName?: string) => {
    setSelectedManagerForDelete({ manager, teamName });
  };

  const handleToggleStatus = (manager: FleetManager) => {
    const currentActive = (manager.status || 'active').toLowerCase() === 'active';
    changeStatusMutation.mutate({
      managerId: manager._id,
      status: currentActive ? 'inactive' : 'active',
    });
  };

  const handleDisableTeam = (manager: FleetManager) => {
    disableTeamMutation.mutate(manager._id);
  };

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
                  <UserCheck className="w-4 h-4" />
                  <span>الإدارة والكوادر البشرية</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
                  مدراء الأساطيل
                </h1>
                <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
                  إدارة حسابات مدراء الأساطيل وتعيينهم على الفرق التشغيلية ومتابعة صلاحياتهم
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => refetchManagers()}
                  disabled={isRefetchingManagers}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                  title="تحديث البيانات"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isRefetchingManagers ? 'animate-spin' : ''}`}
                  />
                  <span>تحديث</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenAdd()}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة مدير أسطول</span>
                </button>
              </div>
            </div>

            {/* ── Error Banner ── */}
            {isManagersError && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>
                    {(managersError as Error)?.message || 'فشل في تحميل بيانات مدراء الأساطيل.'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => refetchManagers()}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  إعادة المحاولة
                </button>
              </div>
            )}

            {/* ── Summary Metrics ── */}
            <ManagerStatsCards managers={managersList} teams={teamsList} />

            {/* ── Managers Table ── */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[var(--text)]">قائمة مدراء الأساطيل</h2>
                  <p className="text-xs text-[var(--muted)]">إدارة المدراء والفرق المسندة إليهم وحالة الحسابات</p>
                </div>
              </div>

              <ManagersTable
                managers={managersList}
                teams={teamsList}
                isLoading={isLoadingManagers}
                onAddClick={() => handleOpenAdd()}
                onDeleteClick={handleOpenDelete}
                onAssignTeamClick={(manager) => setSelectedManagerForAssign(manager)}
                onDisableTeamClick={handleDisableTeam}
                onToggleStatusClick={handleToggleStatus}
              />
            </section>

            {/* ── Footer ── */}
            <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-5 text-[10px] text-[var(--muted)] transition-colors">
              <span>نظام زمام لإدارة الأساطيل والذمم المالية</span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> اتصال قاعدة البيانات نشط
              </span>
            </footer>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <CreateManagerModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedTeamIdForCreate(undefined);
        }}
        teams={teamsList}
        initialTeamId={selectedTeamIdForCreate}
      />

      <DeleteManagerModal
        isOpen={Boolean(selectedManagerForDelete)}
        onClose={() => setSelectedManagerForDelete(null)}
        manager={selectedManagerForDelete?.manager || null}
        teamName={selectedManagerForDelete?.teamName}
      />

      <AssignManagerTeamModal
        isOpen={Boolean(selectedManagerForAssign)}
        onClose={() => setSelectedManagerForAssign(null)}
        manager={selectedManagerForAssign}
        teams={teamsList}
      />
    </main>
  );
}
