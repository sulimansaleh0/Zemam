'use client';

import React from 'react';
import { ClipboardList, Plus, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { Sidebar, Header } from '@/features/dashboard';
import {
  useTasksPage,
  useCreateTask,
  useDeclineTask,
  TaskStatsCards,
  TasksTable,
  TaskFormModal,
  TaskDetailModal,
  DeclineTaskModal,
} from '@/features/tasks';

export default function TasksPage() {
  const {
    tasks,
    allTasksCount,
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
    isCreateModalOpen,
    setIsCreateModalOpen,
    selectedTaskForDetails,
    setSelectedTaskForDetails,
    selectedTaskForDecline,
    setSelectedTaskForDecline,
    vehicles,
    drivers,
    isLoadingRelations,
    userName,
    menuOpen,
    setMenuOpen,
    logout,
  } = useTasksPage();

  const createTaskMutation = useCreateTask();
  const declineTaskMutation = useDeclineTask();

  const handleCreateTask = async (data: any) => {
    await createTaskMutation.mutateAsync(data);
  };

  const handleConfirmDecline = async () => {
    if (!selectedTaskForDecline) return;
    await declineTaskMutation.mutateAsync(selectedTaskForDecline._id);
    setSelectedTaskForDecline(null);
  };

  return (
    <main className="zamam-dashboard zd-grid min-h-[100dvh] text-[var(--zd-text)]" dir="rtl">
      <div className="flex min-h-[100dvh]">
        {/* ── القائمة الجانبية ── */}
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

        {/* ── مساحة المحتوى الرئيسي ── */}
        <div className="min-w-0 flex-1">
          <Header
            onMenu={() => setMenuOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            userName={userName}
          />

          <div className="p-4 md:p-6 lg:p-8 space-y-6 flex-1">
            {/* ── شريط رأس الصفحة وأزرار الإجراءات ── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[var(--zd-text)] flex items-center gap-2">
                  <ClipboardList className="h-6 w-6 text-[var(--zd-blue)]" />
                  <span>المهام والعمليات ({allTasksCount})</span>
                </h1>
                <p className="mt-1 text-xs text-[var(--zd-muted)]">
                  نظام جدولة وتعيين المهام للمركبات والسائقين المتوافقين تشغيلياً
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => refetch()}
                  disabled={isRefetching}
                  title="تحديث البيانات"
                  className="flex items-center justify-center h-9 w-9 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] text-[var(--zd-muted)] hover:text-[var(--zd-text)] hover:border-[var(--zd-line-hover)] transition"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-[var(--zd-blue)] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-600 transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>إنشاء مهمة جديدة</span>
                </button>
              </div>
            </div>

            {/* ── بطاقات المؤشرات (KPIs) ── */}
            <TaskStatsCards stats={stats} />

            {/* ── رسائل الخطأ ── */}
            {isError && (
              <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <div className="flex-1">
                  <p className="font-bold">تعذر تحميل بيانات المهام</p>
                  <p className="mt-0.5 opacity-80">
                    {error instanceof Error ? error.message : 'حدث خطأ في الاتصال بالسيرفر'}
                  </p>
                </div>
                <button
                  onClick={() => refetch()}
                  className="rounded-lg bg-rose-500/20 px-3 py-1.5 font-semibold hover:bg-rose-500/30"
                >
                  إعادة المحاولة
                </button>
              </div>
            )}

            {/* ── جدول المهام ── */}
            <TasksTable
              tasks={tasks}
              isLoading={isLoading}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onOpenCreate={() => setIsCreateModalOpen(true)}
              onViewDetails={(task) => setSelectedTaskForDetails(task)}
              onDeclineTask={(task) => setSelectedTaskForDecline(task)}
            />
          </div>
        </div>
      </div>

      {/* ── المودالات التفاعلية ── */}
      <TaskFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
        isLoading={createTaskMutation.isPending}
        vehicles={vehicles as any}
        drivers={drivers as any}
      />

      <TaskDetailModal
        isOpen={Boolean(selectedTaskForDetails)}
        onClose={() => setSelectedTaskForDetails(null)}
        task={selectedTaskForDetails}
      />

      <DeclineTaskModal
        isOpen={Boolean(selectedTaskForDecline)}
        onClose={() => setSelectedTaskForDecline(null)}
        onConfirm={handleConfirmDecline}
        isLoading={declineTaskMutation.isPending}
        task={selectedTaskForDecline}
      />
    </main>
  );
}
