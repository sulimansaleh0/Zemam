'use client';

import React, { useState } from 'react';
import { ClipboardList, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { Sidebar, Header } from '@/features/dashboard';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useTasksPage } from '../hooks/useTasksPage';
import { TaskStatsCards } from './TaskStatsCards';
import { TasksTable } from './TasksTable';
import { TaskFormModal } from './TaskFormModal';
import { TaskDetailModal } from './TaskDetailModal';
import { DeclineTaskModal } from './DeclineTaskModal';

export function TasksView() {
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

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
    userName,
  } = useTasksPage();

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

          <div className="mx-auto max-w-[1540px] px-4 py-6 sm:px-7 sm:py-8 lg:px-10 space-y-6">
            {/* ── ترويسة الصفحة والإجراءات ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--primary)] mb-1">
                  <ClipboardList className="w-4 h-4" />
                  <span>العمليات الميدانية والتشغيل</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
                  إدارة المهام والعمليات
                </h1>
                <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
                  جدولة وتتبع مهام النقل والتوصيل الميدانية للأسطول وحالات الإنجاز
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => refetch()}
                  disabled={isRefetching}
                  className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-xs font-semibold text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition cursor-pointer"
                  title="تحديث البيانات"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">تحديث</span>
                </button>

                <button
                  onClick={() => {
                    setTaskToEdit(null);
                    setIsCreateModalOpen(true);
                  }}
                  className="flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-600 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>إنشاء مهمة جديدة</span>
                </button>
              </div>
            </div>

            {/* ── تنبيه الخطأ إن وجد ── */}
            {isError && (
              <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-500">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>
                  حدث خطأ أثناء تحميل بيانات المهام: {error instanceof Error ? error.message : 'يرجى المحاولة لاحقاً'}
                </p>
              </div>
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
          </div>
        </div>
      </div>

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
    </main>
  );
}
