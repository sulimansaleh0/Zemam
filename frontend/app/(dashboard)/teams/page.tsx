'use client';

import React, { useState, useMemo } from 'react';
import { Users, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { Sidebar, Header, useDashboard } from '@/features/dashboard';
import {
  useTeams,
  TeamsTable,
  CreateTeamModal,
  EditTeamModal,
  DeleteTeamModal,
  AssignTeamManagerModal,
  AddResourcesToTeamModal,
  TeamStatsCards,
  type Team,
} from '@/features/teams';
import {
  CreateManagerModal,
  DeleteManagerModal,
  type FleetManager,
} from '@/features/managers';
import { useVehicles } from '@/features/vehicles';

export default function TeamsPage() {
  const { user, userName, menuOpen, setMenuOpen, logout } = useDashboard();

  const {
    data: teamsList = [],
    isLoading: isLoadingTeams,
    isError: isTeamsError,
    error: teamsError,
    refetch: refetchTeams,
    isRefetching: isRefetchingTeams,
  } = useTeams();

  const { data: vehiclesList = [] } = useVehicles();

  // Calculate vehicle count per team
  const vehicleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    vehiclesList.forEach((v) => {
      if (v.teamId) {
        counts[v.teamId] = (counts[v.teamId] || 0) + 1;
      }
    });
    return counts;
  }, [vehiclesList]);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTeamForEdit, setSelectedTeamForEdit] = useState<Team | null>(null);
  const [selectedTeamForDelete, setSelectedTeamForDelete] = useState<Team | null>(null);

  // Fleet Manager Modal states
  const [isAssignManagerModalOpen, setIsAssignManagerModalOpen] = useState(false);
  const [isCreateManagerModalOpen, setIsCreateManagerModalOpen] = useState(false);
  const [selectedTeamForManager, setSelectedTeamForManager] = useState<Team | null>(null);
  const [selectedManagerForDelete, setSelectedManagerForDelete] = useState<{
    manager: FleetManager;
    teamName?: string;
  } | null>(null);

  // Add Resources (Drivers & Vehicles) Modal state
  const [selectedTeamForResources, setSelectedTeamForResources] = useState<Team | null>(null);

  const handleOpenAdd = () => setIsCreateModalOpen(true);
  const handleOpenEdit = (team: Team) => setSelectedTeamForEdit(team);
  const handleOpenDelete = (team: Team) => setSelectedTeamForDelete(team);

  const handleOpenAssignManager = (team: Team) => {
    setSelectedTeamForManager(team);
    setIsAssignManagerModalOpen(true);
  };

  const handleOpenAddResources = (team: Team) => {
    setSelectedTeamForResources(team);
  };

  const handleOpenRemoveManager = (managerId: string, teamName: string) => {
    setSelectedManagerForDelete({
      manager: { _id: managerId, email: 'مدير الفريق', status: 'active' },
      teamName,
    });
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
                  <Users className="w-4 h-4" />
                  <span>الهيكل الإداري والتشغيلي</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
                  إدارة الفرق التشغيلية
                </h1>
                <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
                  إنشاء وإدارة الفرق التشغيلية وتعيين مدراء الأساطيل وتوزيع المركبات
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => refetchTeams()}
                  disabled={isRefetchingTeams}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                  title="تحديث البيانات"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isRefetchingTeams ? 'animate-spin' : ''}`}
                  />
                  <span>تحديث</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إنشاء فريق جديد</span>
                </button>
              </div>
            </div>

            {/* ── Error Banner ── */}
            {isTeamsError && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>
                    {(teamsError as Error)?.message || 'فشل في تحميل بيانات الفرق.'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => refetchTeams()}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  إعادة المحاولة
                </button>
              </div>
            )}

            {/* ── Summary Metrics ── */}
            <TeamStatsCards teams={teamsList} totalVehicles={vehiclesList.length} />

            {/* ── Teams Table ── */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[var(--text)]">قائمة الفرق</h2>
                  <p className="text-xs text-[var(--muted)]">استعراض وتعديل وإدارة الفرق وتعيين المدراء</p>
                </div>
              </div>

              <TeamsTable
                teams={teamsList}
                isLoading={isLoadingTeams}
                companyName={user?.name || undefined}
                vehicleCounts={vehicleCounts}
                onAddClick={handleOpenAdd}
                onEditClick={handleOpenEdit}
                onDeleteClick={handleOpenDelete}
                onAssignManagerClick={handleOpenAssignManager}
                onAddResourcesClick={handleOpenAddResources}
                onRemoveManagerClick={handleOpenRemoveManager}
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
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <EditTeamModal
        isOpen={Boolean(selectedTeamForEdit)}
        onClose={() => setSelectedTeamForEdit(null)}
        team={selectedTeamForEdit}
      />

      <DeleteTeamModal
        isOpen={Boolean(selectedTeamForDelete)}
        onClose={() => setSelectedTeamForDelete(null)}
        team={selectedTeamForDelete}
        assignedVehiclesCount={
          selectedTeamForDelete ? vehicleCounts[selectedTeamForDelete._id] ?? 0 : 0
        }
      />

      {/* ── Assign Existing / Available Manager Modal ── */}
      <AssignTeamManagerModal
        isOpen={isAssignManagerModalOpen}
        onClose={() => {
          setIsAssignManagerModalOpen(false);
          setSelectedTeamForManager(null);
        }}
        team={selectedTeamForManager}
        onAddNewManagerClick={() => setIsCreateManagerModalOpen(true)}
      />

      {/* ── Create New Manager Modal ── */}
      <CreateManagerModal
        isOpen={isCreateManagerModalOpen}
        onClose={() => setIsCreateManagerModalOpen(false)}
        teams={teamsList}
        initialTeamId={selectedTeamForManager?._id}
      />

      {/* ── Add Resources (Drivers & Vehicles) to Team Modal ── */}
      <AddResourcesToTeamModal
        isOpen={Boolean(selectedTeamForResources)}
        onClose={() => setSelectedTeamForResources(null)}
        team={selectedTeamForResources}
      />

      {/* ── Manager Removal Modal ── */}
      <DeleteManagerModal
        isOpen={Boolean(selectedManagerForDelete)}
        onClose={() => setSelectedManagerForDelete(null)}
        manager={selectedManagerForDelete?.manager || null}
        teamName={selectedManagerForDelete?.teamName}
      />
    </main>
  );
}
