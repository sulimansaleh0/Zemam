'use client';

import React, { useState } from 'react';
import { Truck, Plus, RefreshCw } from 'lucide-react';
import { Sidebar, Header, useDashboard } from '@/features/dashboard';
import {
  useVehicles,
  VehiclesTable,
  VehicleFormModal,
  DeleteVehicleModal,
  VehicleStatsCards,
  VehicleWithRelations,
} from '@/features/vehicles';

export default function VehiclesPage() {
  const { userName, menuOpen, setMenuOpen, logout } = useDashboard();
  const {
    data: vehiclesList = [],
    isLoading: isLoadingVehicles,
    refetch: refetchVehicles,
    isRefetching: isRefetchingVehicles,
  } = useVehicles();

  // Modal states for vehicles
  const [isVehicleFormModalOpen, setIsVehicleFormModalOpen] = useState(false);
  const [selectedVehicleForEdit, setSelectedVehicleForEdit] =
    useState<VehicleWithRelations | null>(null);
  const [selectedVehicleForDelete, setSelectedVehicleForDelete] =
    useState<VehicleWithRelations | null>(null);

  // Handlers
  const handleOpenAddVehicleModal = () => {
    setSelectedVehicleForEdit(null);
    setIsVehicleFormModalOpen(true);
  };

  const handleOpenEditVehicleModal = (vehicle: VehicleWithRelations) => {
    setSelectedVehicleForEdit(vehicle);
    setIsVehicleFormModalOpen(true);
  };

  const handleOpenDeleteVehicleModal = (vehicle: VehicleWithRelations) => {
    setSelectedVehicleForDelete(vehicle);
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
                  <Truck className="w-4 h-4" />
                  <span>إدارة الأسطول والعمليات</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
                  سجل المركبات والأسطول
                </h1>
                <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
                  عرض وتتبع كامل لمركبات الأسطول، أجهزة التتبع (GPS)، وتعيينات السائقين
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => refetchVehicles()}
                  disabled={isRefetchingVehicles}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors shadow-xs cursor-pointer"
                  title="تحديث البيانات"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isRefetchingVehicles ? 'animate-spin' : ''}`}
                  />
                  <span>تحديث</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenAddVehicleModal}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة مركبة جديدة</span>
                </button>
              </div>
            </div>

            {/* ── Summary Metrics ── */}
            <VehicleStatsCards vehicles={vehiclesList} />

            {/* ── Vehicles Interactive Table ── */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[var(--text)]">قائمة مركبات الأسطول</h2>
                  <p className="text-xs text-[var(--muted)]">إدارة السجلات والتعديل المباشر</p>
                </div>
              </div>

              <VehiclesTable
                vehiclesData={vehiclesList}
                isLoadingVehicles={isLoadingVehicles}
                onAddVehicleClick={handleOpenAddVehicleModal}
                onEditVehicleClick={handleOpenEditVehicleModal}
                onDeleteVehicleClick={handleOpenDeleteVehicleModal}
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
      <VehicleFormModal
        isOpen={isVehicleFormModalOpen}
        onClose={() => setIsVehicleFormModalOpen(false)}
        initialVehicleData={selectedVehicleForEdit}
      />

      <DeleteVehicleModal
        isOpen={Boolean(selectedVehicleForDelete)}
        onClose={() => setSelectedVehicleForDelete(null)}
        targetVehicle={selectedVehicleForDelete}
      />
    </main>
  );
}
