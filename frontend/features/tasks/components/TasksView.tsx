'use client';

import React from 'react';
import { ClipboardList } from 'lucide-react';
import { PageHeader, ErrorAlert } from '@/shared/ui';
import { useTasksPage } from '../hooks/useTasksPage';
import { TaskStatsCards } from './TaskStatsCards';
import { TasksTable } from './TasksTable';
import { TaskFormModal } from './TaskFormModal';
import { TaskDetailModal } from './TaskDetailModal';
import { DeclineTaskModal } from './DeclineTaskModal';

export function TasksView() {
  const {
    tasks,
    totalCount,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    stats,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    totalPages,
    isCreateModalOpen,
    setIsCreateModalOpen,
    taskToEdit,
    setTaskToEdit,
    handleOpenEdit,
    selectedTaskForDetails,
    setSelectedTaskForDetails,
    selectedTaskForDecline,
    setSelectedTaskForDecline,
    vehicles,
    drivers,
    teams,
    isLoadingRelations,
    isSubmitting,
    isDeclining,
    handleFormSubmit,
    handleConfirmDecline,
  } = useTasksPage();

  return (
    <div className="space-y-6" dir="rtl">
      {/* ── ترويسة الصفحة والإجراءات ── */}
      <PageHeader
        title="إدارة المهام والعمليات"
        count={stats.total}
        description="جدولة وتتبع مهام النقل والتوصيل الميدانية للأسطول وحالات الإنجاز"
        icon={ClipboardList}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
        actionLabel="إنشاء مهمة جديدة"
        onAction={() => {
          setTaskToEdit(null);
          setIsCreateModalOpen(true);
        }}
      />

      {/* ── تنبيه الخطأ إن وجد ── */}
      {isError && (
        <ErrorAlert
          title="حدث خطأ أثناء تحميل بيانات المهام"
          error={error}
          onRetry={() => refetch()}
        />
      )}

            {/* ── بطاقات الإحصائيات الشاملة ── */}
            <TaskStatsCards stats={stats} />

            {/* ── جدول المهام مع التبويبات والبحث والترقيم ── */}
            <TasksTable
              tasks={tasks}
              isLoading={isLoading}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onOpenCreate={() => {
                setTaskToEdit(null);
                setIsCreateModalOpen(true);
              }}
              onViewDetails={(task) => setSelectedTaskForDetails(task)}
              onEditTask={handleOpenEdit}
              onDeclineTask={(task) => setSelectedTaskForDecline(task)}
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={setPage}
            />

      {/* ── نافذة إنشاء / تعديل مهمة ── */}
      <TaskFormModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setTaskToEdit(null);
        }}
        onSubmit={handleFormSubmit}
        isLoading={isSubmitting || isLoadingRelations}
        vehicles={vehicles}
        drivers={drivers}
        teams={teams}
        initialTask={taskToEdit}
      />

      {/* ── نافذة تفاصيل المهمة ── */}
      <TaskDetailModal
        isOpen={Boolean(selectedTaskForDetails)}
        onClose={() => setSelectedTaskForDetails(null)}
        task={selectedTaskForDetails}
      />

      {/* ── نافذة إلغاء / رفض المهمة ── */}
      <DeclineTaskModal
        isOpen={Boolean(selectedTaskForDecline)}
        onClose={() => setSelectedTaskForDecline(null)}
        onConfirm={handleConfirmDecline}
        isLoading={isDeclining}
        task={selectedTaskForDecline}
      />
    </div>
  );
}
