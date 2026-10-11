'use client';

import React from 'react';
import { Users } from 'lucide-react';
import { PageHeader, ErrorAlert } from '@/shared/ui';
import { useTeamsPage } from '../hooks/useTeamsPage';
import { TeamsTable } from './TeamsTable';
import { TeamStatsCards } from './TeamStatsCards';
import { CreateTeamModal } from './CreateTeamModal';
import { EditTeamModal } from './EditTeamModal';
import { DeleteTeamModal } from './DeleteTeamModal';
import { AssignTeamManagerModal } from './AssignTeamManagerModal';
import { AddResourcesToTeamModal } from './AddResourcesToTeamModal';
import {
  CreateManagerModal,
  DeleteManagerModal,
} from '@/features/managers';

export function TeamsView() {
  const {
    isFleetManager,
    companyName,
    teamsList,
    allTeams,
    pagination,
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    managerFilter,
    setManagerFilter,
    vehiclesList,
    vehicleCounts,
    driverCounts,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    isCreateModalOpen,
    setIsCreateModalOpen,
    selectedTeamForEdit,
    setSelectedTeamForEdit,
    selectedTeamForDelete,
    setSelectedTeamForDelete,
    isAssignManagerModalOpen,
    setIsAssignManagerModalOpen,
    isCreateManagerModalOpen,
    setIsCreateManagerModalOpen,
    selectedTeamForManager,
    setSelectedTeamForManager,
    selectedManagerForDelete,
    setSelectedManagerForDelete,
    selectedTeamForResources,
    setSelectedTeamForResources,
    handleOpenAdd,
    handleOpenEdit,
    handleOpenDelete,
    handleOpenAssignManager,
    handleOpenAddResources,
    handleOpenRemoveManager,
  } = useTeamsPage();

  if (isFleetManager) {
    return null;
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* ── ترويسة الصفحة ── */}
      <PageHeader
        title="إدارة الفرق التشغيلية"
        count={pagination?.total ?? allTeams.length}
        description="إنشاء وإدارة الفرق التشغيلية وتعيين مدراء الأساطيل وتوزيع المركبات"
        icon={Users}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
        actionLabel="إنشاء فريق جديد"
        onAction={handleOpenAdd}
      />

      {/* ── حالة الخطأ ── */}
      {isError && (
        <ErrorAlert
          title="فشل في تحميل بيانات الفرق"
          error={error}
          onRetry={() => refetch()}
        />
      )}

            {/* ── Summary Metrics ── */}
            <TeamStatsCards
              teams={allTeams.length > 0 ? allTeams : teamsList}
              totalVehicles={vehiclesList.length}
            />

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
                pagination={pagination}
                currentPage={page}
                onPageChange={setPage}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={managerFilter}
                onStatusFilterChange={setManagerFilter}
                isLoading={isLoading}
                companyName={companyName}
                vehicleCounts={vehicleCounts}
                driverCounts={driverCounts}
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
        teams={allTeams.length > 0 ? allTeams : teamsList}
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
    </div>
  );
}
