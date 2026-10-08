'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { Sidebar, Header } from '@/features/dashboard';
import { useDriverDetailPage } from '../hooks/useDriverDetailPage';
import { AssignVehicleModal } from './AssignVehicleModal';
import { AssignDriverToTeamModal } from './AssignDriverToTeamModal';
import { DriverDeleteModal } from './DriverDeleteModal';
import { TaskDetailModal, useTasks } from '@/features/tasks';
import type { TaskWithRelations } from '@/features/tasks';
import { useFuel } from '@/features/fuel';
import { getLicenseExpiryStatus } from '../utils/licenseEligibility';
import type { ScoreAuditItem } from '../types/driver.types';

// Modular Detail Sub-Components
import { DriverDetailHeader } from './detail/DriverDetailHeader';
import { DriverKpiCards } from './detail/DriverKpiCards';
import { DriverLicenseCard } from './detail/DriverLicenseCard';
import { DriverVehicleCard } from './detail/DriverVehicleCard';
import { DriverTeamCard } from './detail/DriverTeamCard';
import { DriverActivityTabs } from './detail/DriverActivityTabs';

interface DriverDetailViewProps {
  driverId: string;
}

export function DriverDetailView({ driverId }: DriverDetailViewProps) {
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);

  const {
    driver,
    stats,
    displayName,
    isActive,
    teamObj,
    isLoading,
    isError,
    error,
    activeTab,
    setActiveTab,
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

  // Server-scoped queries: Fetch only tasks and fuel records for this driver directly from backend
  const { data: driverTasks = [] } = useTasks({ driverId });
  const { data: driverFuelRecords = [] } = useFuel({ driverId });

  // Operational metrics
  const finishedTasks = driverTasks.filter((t) => t.status === 'finished');
  const inProgressTasks = driverTasks.filter((t) => t.status === 'inprogress');

  const onTimeTasks = finishedTasks.filter((t) => {
    if (!t.finishedAt || !t.expectedEndTime) return true;
    return (
      new Date(t.finishedAt).getTime() <= new Date(t.expectedEndTime).getTime()
    );
  });

  const onTimeRate = stats?.onTimeRate ?? (
    finishedTasks.length > 0
      ? Math.round((onTimeTasks.length / finishedTasks.length) * 100)
      : 100
  );

  const totalFuelCost = stats?.totalFuelCost ?? driverFuelRecords.reduce(
    (acc, f) => acc + (f.cost || 0),
    0
  );
  const totalFuelQty = stats?.totalFuelQty ?? driverFuelRecords.reduce(
    (acc, f) => acc + (f.qty || 0),
    0
  );

  const score = stats?.driverScore ?? driver?.driverScore ?? 100;
  const faultIncidentsCount = stats?.faultIncidentsCount ?? driver?.faultIncidentsCount ?? 0;

  const scoreTier =
    score >= 90
      ? {
          label: 'سائق متميز (Tier 1)',
          color: 'text-emerald-500',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20',
        }
      : score >= 75
      ? {
          label: 'سائق معتمد',
          color: 'text-amber-500',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
        }
      : {
          label: 'يحتاج متابعة وتدريب',
          color: 'text-rose-500',
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/20',
        };

  const licenseStatus = getLicenseExpiryStatus(driver?.licenseExpiry);
  const scoreHistory: ScoreAuditItem[] = driver?.scoreHistory || [];

  if (isLoading) {
    return (
      <main
        className="zamam-dashboard min-h-[100dvh] flex items-center justify-center bg-[var(--background)]"
        dir="rtl"
      >
        <div className="flex flex-col items-center gap-3 text-[var(--muted)]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
          <p className="text-xs">جارٍ تحميل الملف التشغيلي للسائق...</p>
        </div>
      </main>
    );
  }

  if (isError || !driver) {
    return (
      <main
        className="zamam-dashboard min-h-[100dvh] flex items-center justify-center p-6 bg-[var(--background)]"
        dir="rtl"
      >
        <div className="max-w-md w-full p-8 text-center bg-[var(--surface)] border border-rose-500/20 rounded-2xl space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-[var(--text)]">السائق غير موجود</h2>
          <p className="text-xs text-[var(--muted)]">
            {error instanceof Error
              ? error.message
              : 'تعذّر العثور على السائق المطلوب أو قد تم حذفه'}
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
    <main
      className="zamam-dashboard zd-grid min-h-[100dvh] text-[var(--zd-text)]"
      dir="rtl"
    >
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
            {/* 1. Header & Executive Profile */}
            <DriverDetailHeader
              driver={driver}
              displayName={displayName}
              isActive={isActive}
              teamObj={teamObj}
              scoreTier={scoreTier}
              isChangingStatus={isChangingStatus}
              isDeleting={isDeleting}
              onAssignVehicleClick={() => setIsAssignVehicleOpen(true)}
              onAssignTeamClick={() => setIsAssignTeamOpen(true)}
              onToggleStatusClick={handleToggleStatus}
              onDeleteClick={() => setIsDeleteOpen(true)}
            />

            {/* 2. 4 Dynamic Executive KPI Cards */}
            <DriverKpiCards
              score={score}
              finishedTasksCount={finishedTasks.length}
              totalTasksCount={driverTasks.length}
              onTimeRate={onTimeRate}
              inProgressTasksCount={inProgressTasks.length}
              faultIncidentsCount={faultIncidentsCount}
              totalFuelCost={totalFuelCost}
              totalFuelQty={totalFuelQty}
              fuelRecordsCount={driverFuelRecords.length}
            />

            {/* 3. Arab License & Traffic Qualification */}
            <DriverLicenseCard
              licenseNumber={driver.licenseNumber}
              licenseTypes={driver.licenseTypes}
              licenseExpiry={driver.licenseExpiry}
              licenseStatus={licenseStatus}
            />

            {/* 4. Assigned Vehicle & Operational Team Duo-Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <DriverVehicleCard
                assignedVehicle={driver.assignedVehicle}
                onAssignVehicleClick={() => setIsAssignVehicleOpen(true)}
                onUnassignVehicleClick={handleUnassignVehicle}
                isUnassigningVehicle={isUnassigningVehicle}
              />

              <DriverTeamCard
                teamObj={teamObj}
                onAssignTeamClick={() => setIsAssignTeamOpen(true)}
                onRemoveTeamClick={handleRemoveTeam}
                isRemovingTeam={isRemovingTeam}
              />
            </div>

            {/* 5. Real Operational Activity Tabs */}
            <DriverActivityTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              driverTasks={driverTasks}
              driverFuelRecords={driverFuelRecords}
              scoreHistory={scoreHistory}
              onSelectTask={setSelectedTask}
            />
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <TaskDetailModal
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
      />

      {isAssignVehicleOpen && (
        <AssignVehicleModal
          driver={driver}
          onClose={() => setIsAssignVehicleOpen(false)}
          onAssign={handleAssignVehicle}
          isLoading={isAssigningVehicle}
        />
      )}

      {isAssignTeamOpen && (
        <AssignDriverToTeamModal
          isOpen={true}
          driver={driver}
          onClose={() => setIsAssignTeamOpen(false)}
        />
      )}

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
