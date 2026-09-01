'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  ChevronRight,
  Truck,
  Layers,
  Edit2,
  Trash2,
  Plus,
  Unlink,
  UserPlus,
  Car,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Calendar,
  Shield,
  Clock,
  CheckCheck,
} from 'lucide-react';
import { Sidebar, Header } from '@/features/dashboard';
import {
  useTeamDetailPage,
  EditTeamModal,
  DeleteTeamModal,
  AssignTeamManagerModal,
  AddResourcesToTeamModal,
} from '@/features/teams';
import type { BackendDriver } from '@/features/drivers/types/driver.types';
import type { VehicleWithRelations } from '@/features/vehicles/types/vehicle.types';

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = String(params?.id || '');

  const {
    isFleetManager,
    userName,
    menuOpen,
    setMenuOpen,
    logout,
    team,
    statics,
    teamDrivers,
    teamVehicles,
    managerId,
    managerObj,
    isLoading,
    isError,
    error,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isAssignManagerModalOpen,
    setIsAssignManagerModalOpen,
    isAddResourcesModalOpen,
    setIsAddResourcesModalOpen,
    isDisablingManager,
    handleRemoveDriver,
    handleRemoveVehicle,
    handleDisableManager,
  } = useTeamDetailPage(teamId);

  if (isFleetManager) {
    return null;
  }

  if (isLoading) {
    return (
      <main className="zamam-dashboard min-h-[100dvh] flex items-center justify-center bg-[var(--background)]" dir="rtl">
        <div className="flex flex-col items-center gap-3 text-[var(--muted)]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
          <p className="text-xs">جارٍ تحميل تفاصيل الفريق...</p>
        </div>
      </main>
    );
  }

  if (isError || !team) {
    return (
      <main className="zamam-dashboard min-h-[100dvh] flex items-center justify-center p-6 bg-[var(--background)]" dir="rtl">
        <div className="max-w-md w-full p-8 text-center bg-[var(--surface)] border border-rose-500/20 rounded-2xl space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-[var(--text)]">الفريق غير موجود</h2>
          <p className="text-xs text-[var(--muted)]">
            {error instanceof Error ? error.message : 'تعذّر العثور على الفريق المطلوب أو قد تم حذفه'}
          </p>
          <Link
            href="/teams"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white text-xs font-bold rounded-xl"
          >
            <ChevronRight className="w-4 h-4" />
            <span>العودة لقائمة الفرق</span>
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
            {/* ── Breadcrumb & Top Action Bar ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)] mb-1">
                  <Link href="/teams" className="hover:text-[var(--primary)] transition-colors">
                    الفرق التشغيلية
                  </Link>
                  <span>/</span>
                  <span className="text-[var(--primary)]">{team.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center font-bold text-lg border border-[var(--primary)]/20 shadow-xs">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
                      فريق: {team.name}
                    </h1>
                    <div className="flex items-center gap-3 text-xs text-[var(--muted)] mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        تاريخ الإنشاء:{' '}
                        {team.createdAt
                          ? new Date(team.createdAt).toLocaleDateString('ar-SA', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsAddResourcesModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold shadow-xs hover:opacity-95 transition-opacity cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  <span>إضافة سائقين / مركبات من المخزون</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>تعديل الاسم</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف الفريق</span>
                </button>
              </div>
            </div>

            {/* ── Quick Statics ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
                <div className="flex items-center justify-between text-[var(--muted)] mb-2">
                  <span className="text-xs font-semibold">إجمالي السائقين</span>
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-[var(--text)]">{teamDrivers.length}</div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
                <div className="flex items-center justify-between text-[var(--muted)] mb-2">
                  <span className="text-xs font-semibold">إجمالي المركبات</span>
                  <Truck className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold text-[var(--text)]">{teamVehicles.length}</div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
                <div className="flex items-center justify-between text-[var(--muted)] mb-2">
                  <span className="text-xs font-semibold">المهام المنجزة</span>
                  <CheckCheck className="w-4 h-4 text-teal-500" />
                </div>
                <div className="text-2xl font-bold text-[var(--text)]">
                  {statics?.finishedTasks ?? 0}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
                <div className="flex items-center justify-between text-[var(--muted)] mb-2">
                  <span className="text-xs font-semibold">المهام قيد التنفيذ</span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-[var(--text)]">
                  {statics?.inProgressTasks ?? 0}
                </div>
              </div>
            </div>

            {/* ── Manager Card ── */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/20 shrink-0">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-[var(--muted)] block">
                      مدير الأسطول المسؤول
                    </span>
                    {managerObj || team.managerId ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-base font-bold text-[var(--text)]">
                          {managerObj?.name ||
                            (typeof team.managerId === 'object' ? team.managerId?.name : null) ||
                            managerObj?.email ||
                            'مدير الأسطول'}
                        </span>
                        <span className="text-xs text-[var(--muted)] font-mono" dir="ltr">
                          ({managerObj?.email ||
                            (typeof team.managerId === 'object' ? team.managerId?.email : '')})
                        </span>
                        {managerObj?.status === 'active' || (typeof team.managerId === 'object' && team.managerId && (team.managerId as any).status === 'active') ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> نشط
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-semibold border border-amber-500/20">
                            <AlertCircle className="w-3 h-3" /> غير نشط
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--muted)] italic mt-0.5 block">
                        لا يوجد مدير مسند لهذا الفريق حالياً
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAssignManagerModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{team.managerId ? 'تغيير المدير' : 'تعيين مدير للفريق'}</span>
                  </button>

                  {team.managerId && managerId && (
                    <button
                      type="button"
                      onClick={handleDisableManager}
                      disabled={isDisablingManager}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Unlink className="w-3.5 h-3.5" />
                      <span>فك الارتباط</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Team Drivers Table ── */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[var(--text)]">سائقو الفريق ({teamDrivers.length})</h2>
                  <p className="text-xs text-[var(--muted)]">قائمة السائقين المنتمين لهذا الفريق</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddResourcesModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] text-xs font-semibold hover:bg-[var(--primary)] hover:text-white transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة من المخزون</span>
                </button>
              </div>

              {teamDrivers.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-[var(--border)] rounded-xl bg-[var(--surface-2)]/30">
                  <Users className="w-8 h-8 text-[var(--muted)] mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-semibold text-[var(--text)]">لا يوجد سائقين في هذا الفريق</p>
                  <p className="text-[11px] text-[var(--muted)] mt-1">
                    يمكنك إضافة سائقين من المخزون العام بالنقر على زر الإضافة أعلاه
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-[var(--border)] rounded-xl">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[var(--surface-2)]/60 text-[var(--muted)] border-b border-[var(--border)]">
                      <tr>
                        <th className="py-3 px-4 font-bold">السائق</th>
                        <th className="py-3 px-4 font-bold">البريد الإلكتروني</th>
                        <th className="py-3 px-4 font-bold">الحالة</th>
                        <th className="py-3 px-4 font-bold text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {teamDrivers.map((driver: BackendDriver) => (
                        <tr key={driver._id} className="hover:bg-[var(--surface-2)]/40 transition-colors">
                          <td className="py-3 px-4 font-semibold text-[var(--text)]">
                            <Link
                              href={`/drivers/${driver._id}`}
                              className="hover:text-[var(--primary)] hover:underline"
                            >
                              {driver.name && driver.name !== 'Default'
                                ? driver.name
                                : driver.email.split('@')[0]}
                            </Link>
                          </td>
                          <td className="py-3 px-4 text-[var(--muted)] font-mono" dir="ltr">
                            {driver.email}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                              {driver.status === 'active' ? 'نشط' : 'معطل'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveDriver(driver._id)}
                              title="فك ارتباط السائق عن هذا الفريق"
                              className="p-1.5 rounded-lg text-[var(--muted)] hover:text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer"
                            >
                              <Unlink className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ── Team Vehicles Table ── */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[var(--text)]">مركبات الفريق ({teamVehicles.length})</h2>
                  <p className="text-xs text-[var(--muted)]">قائمة المركبات المخصصة لهذا الفريق</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddResourcesModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] text-xs font-semibold hover:bg-[var(--primary)] hover:text-white transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة من المخزون</span>
                </button>
              </div>

              {teamVehicles.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-[var(--border)] rounded-xl bg-[var(--surface-2)]/30">
                  <Car className="w-8 h-8 text-[var(--muted)] mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-semibold text-[var(--text)]">لا توجد مركبات في هذا الفريق</p>
                  <p className="text-[11px] text-[var(--muted)] mt-1">
                    يمكنك إضافة مركبات من المخزون العام بالنقر على زر الإضافة أعلاه
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-[var(--border)] rounded-xl">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[var(--surface-2)]/60 text-[var(--muted)] border-b border-[var(--border)]">
                      <tr>
                        <th className="py-3 px-4 font-bold">المركبة</th>
                        <th className="py-3 px-4 font-bold">رقم اللوحة</th>
                        <th className="py-3 px-4 font-bold">السائق المعين</th>
                        <th className="py-3 px-4 font-bold">الحالة</th>
                        <th className="py-3 px-4 font-bold text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {teamVehicles.map((vehicle: VehicleWithRelations) => (
                        <tr key={vehicle._id} className="hover:bg-[var(--surface-2)]/40 transition-colors">
                          <td className="py-3 px-4 font-semibold text-[var(--text)]">
                            <Link
                              href={`/vehicles/${vehicle._id}`}
                              className="hover:text-[var(--primary)] hover:underline"
                            >
                              {vehicle.model} ({vehicle.year})
                            </Link>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-[var(--text)]" dir="ltr">
                            {vehicle.plateNumber}
                          </td>
                          <td className="py-3 px-4 text-[var(--muted)]">
                            {vehicle.driverName || '—'}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                              {vehicle.status === 'active' ? 'نشطة' : 'معطلة'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveVehicle(vehicle._id)}
                              title="فك ارتباط المركبة ونقلها للمستودع العام"
                              className="p-1.5 rounded-lg text-[var(--muted)] hover:text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer"
                            >
                              <Unlink className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Team Modal ── */}
      <EditTeamModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        team={team}
      />

      {/* ── Delete Team Modal ── */}
      <DeleteTeamModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={() => router.push('/teams')}
        team={team}
        assignedVehiclesCount={teamVehicles.length}
      />

      {/* ── Assign Manager Modal ── */}
      <AssignTeamManagerModal
        isOpen={isAssignManagerModalOpen}
        onClose={() => setIsAssignManagerModalOpen(false)}
        team={team}
      />

      {/* ── Add Resources to Team Modal ── */}
      <AddResourcesToTeamModal
        isOpen={isAddResourcesModalOpen}
        onClose={() => setIsAddResourcesModalOpen(false)}
        team={team}
      />
    </main>
  );
}
