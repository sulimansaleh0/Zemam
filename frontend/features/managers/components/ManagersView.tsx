'use client';

import React from 'react';
import { UserCheck } from 'lucide-react';
import { PageHeader, ErrorAlert } from '@/shared/ui';
import { useManagersPage } from '../hooks/useManagersPage';
import { ManagerStatsCards } from './ManagerStatsCards';
import { ManagersTable } from './ManagersTable';
import { CreateManagerModal } from './CreateManagerModal';
import { DeleteManagerModal } from './DeleteManagerModal';
import { AssignManagerTeamModal } from './AssignManagerTeamModal';
import { ManagerDetailModal } from './ManagerDetailModal';

export function ManagersView() {
  const {
    isFleetManager,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    teamFilter,
    setTeamFilter,
    sortOrder,
    toggleSort,
    page,
    setPage,
    pagination,
    managersList,
    allManagers,
    teamsList,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    modalState,
    handleOpenAdd,
    handleOpenDelete,
    handleOpenAssign,
    handleOpenDetail,
    handleCloseModal,
    handleToggleStatus,
    handleDisableTeam,
  } = useManagersPage();

  if (isFleetManager) {
    return null;
  }

  const effectiveManagersForStats = allManagers.length > 0 ? allManagers : managersList;

  return (
    <div className="space-y-6" dir="rtl">
      {/* ── ترويسة الصفحة ── */}
      <PageHeader
        title="مدراء الأساطيل"
        count={pagination?.total ?? effectiveManagersForStats.length}
        description="إدارة حسابات مدراء الأساطيل وتعيينهم على الفرق التشغيلية ومتابعة صلاحياتهم"
        icon={UserCheck}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
        actionLabel={statusFilter !== 'inactive' ? 'إضافة مدير أسطول' : undefined}
        onAction={statusFilter !== 'inactive' ? () => handleOpenAdd() : undefined}
      />

      {/* ── حالة الخطأ ── */}
      {isError && (
        <ErrorAlert
          title="فشل في تحميل بيانات مدراء الأساطيل"
          error={error}
          onRetry={() => refetch()}
        />
      )}

            {/* ── Summary Metrics ── */}
            <ManagerStatsCards managers={effectiveManagersForStats} teams={teamsList} />

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
                isLoading={isLoading}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                teamFilter={teamFilter}
                onTeamFilterChange={setTeamFilter}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortOrder={sortOrder}
                onSortToggle={toggleSort}
                pagination={pagination}
                onPageChange={setPage}
                totalCount={pagination?.total ?? effectiveManagersForStats.length}
                onAddClick={() => handleOpenAdd()}
                onDeleteClick={handleOpenDelete}
                onAssignTeamClick={handleOpenAssign}
                onDisableTeamClick={handleDisableTeam}
                onToggleStatusClick={handleToggleStatus}
                onViewDetailClick={handleOpenDetail}
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
      {modalState.type === 'create' && (
        <CreateManagerModal
          isOpen={true}
          onClose={handleCloseModal}
          teams={teamsList}
          initialTeamId={modalState.initialTeamId}
        />
      )}

      {modalState.type === 'delete' && (
        <DeleteManagerModal
          isOpen={true}
          onClose={handleCloseModal}
          manager={modalState.manager}
          teamName={modalState.teamName}
        />
      )}

      {modalState.type === 'assign' && (
        <AssignManagerTeamModal
          isOpen={true}
          onClose={handleCloseModal}
          manager={modalState.manager}
          teams={teamsList}
        />
      )}

      {modalState.type === 'detail' && (
        <ManagerDetailModal
          isOpen={true}
          onClose={handleCloseModal}
          manager={modalState.manager}
        />
      )}
    </div>
  );
}
