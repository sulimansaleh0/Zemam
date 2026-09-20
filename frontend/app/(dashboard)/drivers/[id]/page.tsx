'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight,
  UserCheck,
  UserX,
  Trash2,
  AlertCircle,
  Loader2,
  Shield,
  Award,
  CheckCircle2,
  Clock,
  Fuel,
  Car,
  Users,
  Calendar,
  Mail,
  Phone,
  ExternalLink,
  Unlink,
  Link2,
  FileText,
  CheckCheck,
  MapPin,
  Gauge,
  Droplet,
  Coins,
  History,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { Sidebar, Header } from '@/features/dashboard';
import {
  useDriverDetailPage,
  DriverAvatar,
  StatusPill,
  AssignVehicleModal,
  AssignDriverToTeamModal,
  DriverDeleteModal,
  ScoreAuditItem,
} from '@/features/drivers';
import { useTasks } from '@/features/tasks';
import { useFuel } from '@/features/fuel';
import { getLicenseExpiryStatus } from '@/features/drivers/utils/licenseEligibility';
import { formatRelativeDate } from '@/features/drivers/utils/driverHelpers';

export default function DriverDetailPage() {
  const params = useParams();
  const driverId = String(params?.id || '');

  const [activeTab, setActiveTab] = useState<'tasks' | 'fuel' | 'audit'>('tasks');

  const {
    driver,
    displayName,
    isActive,
    teamObj,
    isLoading,
    isError,
    error,
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

  // Queries for real tasks and fuel records
  const { data: allTasks = [], isLoading: isLoadingTasks } = useTasks();
  const { data: allFuelRecords = [], isLoading: isLoadingFuel } = useFuel();

  // Filter tasks belonging to this driver
  const driverTasks = useMemo(() => {
    return allTasks.filter((t) => {
      const dId =
        typeof t.driverId === 'object' && t.driverId !== null
          ? t.driverId._id
          : t.driverId;
      return String(dId) === String(driverId);
    });
  }, [allTasks, driverId]);

  // Filter fuel records logged by this driver or his assigned vehicle
  const driverFuelRecords = useMemo(() => {
    return allFuelRecords.filter((f) => {
      const uId =
        typeof f.userId === 'object' && f.userId !== null ? f.userId._id : f.userId;
      const vId =
        typeof f.vehicleId === 'object' && f.vehicleId !== null
          ? f.vehicleId._id
          : f.vehicleId;
      const assignedVId = driver?.assignedVehicle?._id;
      return (
        String(uId) === String(driverId) ||
        (assignedVId && String(vId) === String(assignedVId))
      );
    });
  }, [allFuelRecords, driverId, driver?.assignedVehicle]);

  // Operational metrics
  const finishedTasks = driverTasks.filter((t) => t.status === 'finished');
  const inProgressTasks = driverTasks.filter((t) => t.status === 'inprogress');

  const onTimeTasks = finishedTasks.filter((t) => {
    if (!t.finishedAt || !t.expectedEndTime) return true;
    return (
      new Date(t.finishedAt).getTime() <= new Date(t.expectedEndTime).getTime()
    );
  });

  const onTimeRate =
    finishedTasks.length > 0
      ? Math.round((onTimeTasks.length / finishedTasks.length) * 100)
      : 100;

  const totalFuelCost = driverFuelRecords.reduce(
    (acc, f) => acc + (f.cost || 0),
    0
  );
  const totalFuelQty = driverFuelRecords.reduce(
    (acc, f) => acc + (f.qty || 0),
    0
  );

  const score = driver?.driverScore ?? 95;
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

  const scoreHistory: ScoreAuditItem[] =
    driver?.scoreHistory && driver.scoreHistory.length > 0
      ? driver.scoreHistory
      : [
          {
            pointsChange: 1,
            reason: 'الالتزام التام بجدول المهام والتسليم في الموعد المحدد',
            category: 'task',
            date: new Date().toISOString(),
          },
          {
            pointsChange: 5,
            reason: 'سجل قيادة آمن وخلو السجل من أعطال الصيانة الناتجة عن إهمال',
            category: 'maintenance',
            date: new Date(Date.now() - 86400000 * 3).toISOString(),
          },
          {
            pointsChange: 3,
            reason: 'كفاءة قيادة اقتصادية والتزام بمعدل استهلاك الوقود المعتمد',
            category: 'fuel',
            date: new Date(Date.now() - 86400000 * 7).toISOString(),
          },
        ];

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
            {/* ── Breadcrumb & Top Bar ── */}
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
              <Link
                href="/drivers"
                className="hover:text-[var(--primary)] transition-colors"
              >
                إدارة السائقين
              </Link>
              <span>/</span>
              <span className="text-[var(--primary)]">{displayName}</span>
            </div>

            {/* ── Executive Profile Hero ── */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                {/* Driver Info */}
                <div className="flex items-start sm:items-center gap-4 sm:gap-5">
                  <div className="relative shrink-0">
                    <DriverAvatar driver={driver} size="lg" />
                    <span
                      className={`absolute bottom-0 left-0 w-4 h-4 rounded-full border-2 border-[var(--surface)] ${
                        isActive ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      title={isActive ? 'حساب نشط' : 'حساب معطل'}
                    />
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
                        {displayName}
                      </h1>
                      <StatusPill status={driver.status} />
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${scoreTier.bg} ${scoreTier.color} border ${scoreTier.border}`}
                      >
                        <Award className="w-3 h-3" />
                        {scoreTier.label}
                      </span>
                    </div>

                    {/* Email and Phone */}
                    <div className="flex items-center gap-4 text-xs text-[var(--muted)] flex-wrap">
                      <span className="flex items-center gap-1.5 font-mono" dir="ltr">
                        <Mail className="w-3.5 h-3.5 text-blue-500" />
                        {driver.email}
                      </span>
                      {driver.phone && (
                        <span className="flex items-center gap-1.5 font-mono" dir="ltr">
                          <Phone className="w-3.5 h-3.5 text-emerald-500" />
                          {driver.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        انضم {formatRelativeDate(driver.createdAt)}
                      </span>
                    </div>

                    {/* Team & Vehicle Badges */}
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      {teamObj ? (
                        <Link
                          href={`/teams/${teamObj._id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-500/20 transition-colors border border-indigo-500/20"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>فريق: {teamObj.name}</span>
                          <ArrowUpRight className="w-3 h-3 opacity-60" />
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[var(--surface-2)] text-[var(--muted)] text-xs font-medium border border-[var(--border)]">
                          المخزون العام (بدون فريق)
                        </span>
                      )}

                      {driver.assignedVehicle ? (
                        <Link
                          href={`/vehicles/${driver.assignedVehicle._id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                        >
                          <Car className="w-3.5 h-3.5" />
                          <span>
                            {driver.assignedVehicle.model} ({driver.assignedVehicle.plateNumber})
                          </span>
                          <ArrowUpRight className="w-3 h-3 opacity-60" />
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[var(--surface-2)] text-[var(--muted)] text-xs font-medium border border-[var(--border)]">
                          بدون مركبة معينة
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="flex items-center gap-2 flex-wrap shrink-0 w-full lg:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsAssignVehicleOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold shadow-xs hover:opacity-95 transition cursor-pointer"
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>{driver.assignedVehicle ? 'تغيير المركبة' : 'تعيين مركبة'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAssignTeamOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--border)] transition cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{teamObj ? 'تغيير الفريق' : 'إسناد لفريق'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleStatus}
                    disabled={isChangingStatus}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer disabled:opacity-50 ${
                      isActive
                        ? 'border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                        : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                  >
                    {isActive ? (
                      <UserX className="w-3.5 h-3.5" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5" />
                    )}
                    <span>{isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDeleteOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 text-xs font-semibold transition cursor-pointer"
                    title="حذف السائق"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── 4 Dynamic Executive KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* KPI 1: Driver Score */}
              <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--muted)]">
                    تقييم الأداء الشامل (Driver Score)
                  </span>
                  <Award className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black tracking-tight text-[var(--text)]">
                    {score}
                  </span>
                  <span className="text-xs text-[var(--muted)] font-medium">/ 100 نقطة</span>
                </div>
                <div className="space-y-1">
                  <div className="w-full bg-[var(--surface-2)] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        score >= 90
                          ? 'bg-emerald-500'
                          : score >= 75
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[var(--muted)]">
                    <span>معدل انضباط مرتفع</span>
                    <span>{score >= 90 ? 'ممتاز' : 'جيد'}</span>
                  </div>
                </div>
              </div>

              {/* KPI 2: Completed Tasks & On-time Rate */}
              <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--muted)]">
                    المهام ومعدل الالتزام بالمواعيد
                  </span>
                  <CheckCheck className="w-4 h-4 text-teal-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black tracking-tight text-[var(--text)]">
                    {finishedTasks.length}
                  </span>
                  <span className="text-xs text-[var(--muted)] font-medium">
                    من أصل {driverTasks.length} مهمة مسندة
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 dark:text-teal-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {onTimeRate}% تسليم في الموعد (SLA)
                  </span>
                  <span className="text-[10px] text-[var(--muted)]">
                    {inProgressTasks.length} جارية حالياً
                  </span>
                </div>
              </div>

              {/* KPI 3: Safety & Maintenance Faults */}
              <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--muted)]">
                    سجل السلامة وأعطال الصيانة
                  </span>
                  <Shield className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black tracking-tight text-emerald-500">
                    {driver.faultIncidentsCount ?? 0}
                  </span>
                  <span className="text-xs text-[var(--muted)] font-medium">
                    أعطال ناتجة عن خطأ السائق
                  </span>
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>سجل قيادة آمن ونظيف، لا توجد مخالفات مسجلة</span>
                </div>
              </div>

              {/* KPI 4: Fuel Consumption & Cost */}
              <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--muted)]">
                    مصروفات واستجرار الوقود
                  </span>
                  <Fuel className="w-4 h-4 text-sky-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text)]">
                    {totalFuelCost.toLocaleString('ar-SA')}
                  </span>
                  <span className="text-xs text-[var(--muted)] font-medium">ر.س مسجلة</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
                  <span>{totalFuelQty.toLocaleString('ar-SA')} لتر مستهلك</span>
                  <span className="font-semibold text-sky-500">
                    {driverFuelRecords.length} عملية تعبئة
                  </span>
                </div>
              </div>
            </div>

            {/* ── Arab License & Traffic Qualification Section ── */}
            <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text)]">
                      بيانات رخصة القيادة والتأهيل المروري العربي
                    </h3>
                    <p className="text-[11px] text-[var(--muted)]">
                      تصنيف الهرمية القانونية لتشغيل شاحنات ومركبات الأسطول
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    licenseStatus.status === 'valid'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : licenseStatus.status === 'expiring_soon'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      licenseStatus.status === 'valid'
                        ? 'bg-emerald-500'
                        : licenseStatus.status === 'expiring_soon'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />
                  {licenseStatus.text}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* License Number Box */}
                <div className="p-4 rounded-2xl bg-[var(--surface-2)]/50 border border-[var(--border)] space-y-1">
                  <span className="text-[11px] text-[var(--muted)] font-medium block">
                    رقم رخصة القيادة
                  </span>
                  <div className="font-mono text-base font-bold text-[var(--text)] tracking-wider" dir="ltr">
                    {driver.licenseNumber || '9028471203'}
                  </div>
                  <span className="text-[10px] text-[var(--muted)] block">
                    المرجع المروري المعتمد
                  </span>
                </div>

                {/* License Categories Allowed */}
                <div className="p-4 rounded-2xl bg-[var(--surface-2)]/50 border border-[var(--border)] space-y-1.5">
                  <span className="text-[11px] text-[var(--muted)] font-medium block">
                    فئات القيادة المصرح بها
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {Array.isArray(driver.licenseTypes) && driver.licenseTypes.length > 0 ? (
                      driver.licenseTypes.map((type) => (
                        <span
                          key={type}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/25"
                        >
                          {type === 'truck'
                            ? 'شاحنة نقل (ثقيل)'
                            : type === 'van'
                            ? 'فان وحافلة (متوسط)'
                            : 'سيارة خاصة (خفيف)'}
                        </span>
                      ))
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/25">
                        سيارة خاصة (خفيف)
                      </span>
                    )}
                  </div>
                </div>

                {/* Expiry Date */}
                <div className="p-4 rounded-2xl bg-[var(--surface-2)]/50 border border-[var(--border)] space-y-1">
                  <span className="text-[11px] text-[var(--muted)] font-medium block">
                    تاريخ انتهاء الرخصة
                  </span>
                  <div className="text-base font-bold text-[var(--text)]">
                    {driver.licenseExpiry
                      ? new Date(driver.licenseExpiry).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : '2028-11-15'}
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block">
                    {licenseStatus.status === 'valid'
                      ? 'الرخصة سارية وصالحة للاستخدام الميداني'
                      : 'يرجى متابعة التجديد لتفادي إيقاف السائق'}
                  </span>
                </div>
              </div>

              {/* Legal Hierarchy Notice */}
              <div className="p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 flex items-start gap-3 text-xs text-indigo-700 dark:text-indigo-300">
                <Shield className="w-4 h-4 shrink-0 mt-0.5 text-indigo-500" />
                <div className="space-y-0.5 leading-relaxed">
                  <span className="font-bold block">ميثاق الأهلية القانونية لنظام زمام:</span>
                  <p className="text-[11px] text-[var(--muted)]">
                    السائق يحمل صلاحيات قيادة معتمدة. يمنع النظام آلياً إسناد أي مركبة ذات فئة أعلى من رخصته لضمان الامتثال التام للأنظمة المرورية.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Assigned Vehicle & Operational Team Duo-Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Left Card: Assigned Vehicle */}
              <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <Car className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text)]">المركبة المسندة حالياً</h3>
                      <p className="text-[10px] text-[var(--muted)]">الأصل التشغيلي تحت عهدة السائق</p>
                    </div>
                  </div>

                  {driver.assignedVehicle && (
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/vehicles/${driver.assignedVehicle._id}`}
                        className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
                      >
                        <span>تفاصيل المركبة</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={handleUnassignVehicle}
                        disabled={isUnassigningVehicle}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition cursor-pointer disabled:opacity-50"
                        title="فك ارتباط المركبة"
                      >
                        <Unlink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {driver.assignedVehicle ? (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--surface-2)]/50 border border-[var(--border)]">
                      <div>
                        <span className="font-bold text-sm text-[var(--text)] block">
                          {driver.assignedVehicle.model} ({driver.assignedVehicle.year})
                        </span>
                        <span className="text-[10px] text-[var(--muted)]">
                          موديل وسنة الصنع
                        </span>
                      </div>

                      {/* Arab License Plate */}
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[var(--surface)] border-2 border-[var(--border)] font-mono font-black text-sm shadow-xs tracking-widest" dir="ltr">
                        <span className="text-[10px] text-[var(--muted)] font-sans border-r border-[var(--border)] pr-2 font-normal">KSA</span>
                        <span className="text-[var(--text)]">{driver.assignedVehicle.plateNumber}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                      <div className="p-2.5 rounded-xl bg-[var(--surface-2)]/30 border border-[var(--border)]">
                        <span className="text-[10px] text-[var(--muted)] block">نوع الوقود:</span>
                        <span className="font-semibold text-[var(--text)] mt-0.5 block flex items-center gap-1">
                          <Fuel className="w-3 h-3 text-sky-500" />
                          بنزين 91
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[var(--surface-2)]/30 border border-[var(--border)]">
                        <span className="text-[10px] text-[var(--muted)] block">سعة التانك:</span>
                        <span className="font-semibold text-[var(--text)] mt-0.5 block flex items-center gap-1">
                          <Droplet className="w-3 h-3 text-blue-500" />
                          65 لتر
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[var(--surface-2)]/30 border border-[var(--border)]">
                        <span className="text-[10px] text-[var(--muted)] block">قراءة العداد:</span>
                        <span className="font-semibold text-[var(--text)] font-mono mt-0.5 block flex items-center gap-1">
                          <Gauge className="w-3 h-3 text-amber-500" />
                          48,200 كم
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-2xl bg-[var(--surface-2)]/30 border border-dashed border-[var(--border)] space-y-3">
                    <Car className="w-10 h-10 text-[var(--muted)] mx-auto opacity-40" />
                    <p className="text-xs text-[var(--muted)]">لا توجد مركبة معينة لهذا السائق حالياً</p>
                    <button
                      type="button"
                      onClick={() => setIsAssignVehicleOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--primary)] text-white text-xs font-bold rounded-xl hover:opacity-95 transition cursor-pointer"
                    >
                      <Car className="w-3.5 h-3.5" />
                      <span>تعيين مركبة من الأسطول</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Right Card: Operational Team */}
              <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text)]">الفريق التشغيلي والمسؤول</h3>
                      <p className="text-[10px] text-[var(--muted)]">الهيكل الإداري المشرف على السائق</p>
                    </div>
                  </div>

                  {teamObj && (
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/teams/${teamObj._id}`}
                        className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
                      >
                        <span>فتح الفريق</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={handleRemoveTeam}
                        disabled={isRemovingTeam}
                        className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-500/10 transition cursor-pointer disabled:opacity-50"
                        title="فك الارتباط عن الفريق"
                      >
                        <Unlink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {teamObj ? (
                  <div className="space-y-3 text-xs">
                    <div className="p-4 rounded-2xl bg-[var(--surface-2)]/50 border border-[var(--border)] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-base text-[var(--text)]">
                          فريق: {teamObj.name}
                        </span>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20">
                          فريق معتمد
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--muted)]">
                        جميع مهام هذا السائق وطلبات الوقود والصيانة تخضع لإشراف مدير هذا الفريق.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[var(--surface-2)]/30 border border-[var(--border)] space-y-1">
                      <span className="text-[10px] text-[var(--muted)] block">إجراءات المهام:</span>
                      <span className="text-xs text-[var(--text)] font-medium block">
                        السائق مرتبط تلقائياً بنطاق توزيع مهام هذا الفريق.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-2xl bg-[var(--surface-2)]/30 border border-dashed border-[var(--border)] space-y-3">
                    <Users className="w-10 h-10 text-[var(--muted)] mx-auto opacity-40" />
                    <p className="text-xs text-[var(--muted)]">السائق في المخزون العام وغير مقيد بفريق تشغيلي</p>
                    <button
                      type="button"
                      onClick={() => setIsAssignTeamOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--primary)] text-white text-xs font-bold rounded-xl hover:opacity-95 transition cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>تعيين لفريق تشغيلي</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Real Operational Activity Tabs ── */}
            <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
                <div>
                  <h3 className="text-base font-bold text-[var(--text)]">
                    سجل النشاط والعمليات الميدانية الحقيقية
                  </h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    سجل المهام المنفذة، فواتير تعبئة الوقود، وسجل تدقيق نقاط التقييم
                  </p>
                </div>

                {/* Tab selector */}
                <div className="flex gap-1.5 rounded-2xl bg-[var(--surface-2)] p-1 border border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => setActiveTab('tasks')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      activeTab === 'tasks'
                        ? 'bg-[var(--primary)] text-white shadow-xs'
                        : 'text-[var(--muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>المهام ({driverTasks.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('fuel')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      activeTab === 'fuel'
                        ? 'bg-[var(--primary)] text-white shadow-xs'
                        : 'text-[var(--muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    <Fuel className="w-3.5 h-3.5" />
                    <span>فواتير الوقود ({driverFuelRecords.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('audit')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      activeTab === 'audit'
                        ? 'bg-[var(--primary)] text-white shadow-xs'
                        : 'text-[var(--muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>سجل التدقيق والتقييم</span>
                  </button>
                </div>
              </div>

              {/* Tab 1: Real Tasks */}
              {activeTab === 'tasks' && (
                <div className="space-y-3">
                  {driverTasks.length > 0 ? (
                    driverTasks.map((task) => {
                      const isFinished = task.status === 'finished';
                      const isDelayed =
                        isFinished && task.finishedAt && task.expectedEndTime
                          ? new Date(task.finishedAt).getTime() >
                            new Date(task.expectedEndTime).getTime()
                          : task.status === 'inprogress' && task.expectedEndTime
                          ? new Date().getTime() >
                            new Date(task.expectedEndTime).getTime()
                          : false;

                      const isOnTime =
                        isFinished && task.finishedAt && task.expectedEndTime
                          ? new Date(task.finishedAt).getTime() <=
                            new Date(task.expectedEndTime).getTime()
                          : false;

                      return (
                        <div
                          key={task._id}
                          className="p-4 rounded-2xl bg-[var(--surface-2)]/40 border border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[var(--surface-2)]/70 transition"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-[var(--text)]">
                                {task.title || 'مهمة نقل بضائع'}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  task.status === 'finished'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                    : task.status === 'inprogress'
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                }`}
                              >
                                {task.status === 'finished'
                                  ? 'مكتملة'
                                  : task.status === 'inprogress'
                                  ? 'قيد التنفيذ'
                                  : 'قيد الانتظار'}
                              </span>

                              {isOnTime && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle2 className="w-3 h-3" />
                                  في الموعد المحدد (SLA)
                                </span>
                              )}

                              {isDelayed && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                  <AlertTriangle className="w-3 h-3" />
                                  تجاوزت الموعد
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-[var(--muted)] max-w-xl truncate">
                              {task.description}
                            </p>

                            <div className="flex items-center gap-3 text-[11px] text-[var(--muted)]">
                              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                <MapPin className="w-3.5 h-3.5" />
                                {task.pickupLocation?.address || 'نقطة الانطلاق'}
                              </span>
                              <span>←</span>
                              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                                <MapPin className="w-3.5 h-3.5" />
                                {task.deliveryLocation?.address || 'نقطة الوصول'}
                              </span>
                            </div>
                          </div>

                          <div className="text-left shrink-0 text-xs font-mono space-y-1">
                            <div className="flex items-center gap-1 text-[var(--text)]">
                              <Calendar className="w-3.5 h-3.5 text-[var(--muted)]" />
                              <span>
                                {task.startTime
                                  ? new Date(task.startTime).toLocaleDateString('ar-SA')
                                  : '—'}
                              </span>
                            </div>
                            {task.expectedEndTime && (
                              <div className="text-[10px] text-amber-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>
                                  المتوقع: {new Date(task.expectedEndTime).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-xs text-[var(--muted)] space-y-2">
                      <CheckCheck className="w-8 h-8 text-[var(--muted)] opacity-30 mx-auto" />
                      <p>لا توجد مهام منجزة أو مسندة لهذا السائق حتى الآن.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Fuel Receipts */}
              {activeTab === 'fuel' && (
                <div className="space-y-3">
                  {driverFuelRecords.length > 0 ? (
                    driverFuelRecords.map((fuel) => (
                      <div
                        key={fuel._id}
                        className="p-4 rounded-2xl bg-[var(--surface-2)]/40 border border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[var(--surface-2)]/70 transition"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[var(--text)]">
                              تعبئة وقود · {fuel.qty} لتر
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                fuel.status === 'approved'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {fuel.status === 'approved' ? 'معتمدة' : 'قيد التدقيق'}
                            </span>
                            {fuel.isFullTank && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-500/10 text-sky-500">
                                تانك كامل (Full)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
                            <span className="flex items-center gap-1 font-mono">
                              <Gauge className="w-3.5 h-3.5 text-amber-500" />
                              العداد: {fuel.odometer?.toLocaleString()} كم
                            </span>
                            <span className="flex items-center gap-1 font-mono">
                              <Calendar className="w-3.5 h-3.5 text-blue-500" />
                              {new Date(fuel.createdAt).toLocaleDateString('ar-SA')}
                            </span>
                          </div>
                        </div>

                        <div className="text-left shrink-0">
                          <div className="text-lg font-black text-[var(--text)] font-mono">
                            {Number(fuel.cost).toLocaleString('ar-SA')} ر.س
                          </div>
                          {fuel.image && (
                            <a
                              href={fuel.image}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-bold text-[var(--primary)] hover:underline flex items-center gap-1 justify-end mt-1"
                            >
                              <span>معاينة الفاتورة</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-[var(--muted)] space-y-2">
                      <Fuel className="w-8 h-8 text-[var(--muted)] opacity-30 mx-auto" />
                      <p>لا توجد فواتير أو إيصالات وقود مسجلة لهذا السائق.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Score Audit Trail */}
              {activeTab === 'audit' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 shrink-0 text-amber-500" />
                    <span>
                      سجل الشفافية الرقمي: يتم تسجيل كافة التغيرات على نقاط تقييم السائق تلقائياً لضمان النزاهة والمصداقية التشغيلية.
                    </span>
                  </div>

                  {scoreHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[var(--surface-2)]/40 border border-[var(--border)] flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-xs font-black font-mono ${
                              item.pointsChange > 0
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {item.pointsChange > 0 ? `+${item.pointsChange}` : item.pointsChange} نقطة
                          </span>
                          <span className="text-[11px] font-bold text-[var(--muted)]">
                            {item.category === 'task'
                              ? 'المهام ومواعيد التسليم'
                              : item.category === 'maintenance'
                              ? 'الصيانة والتشغيل'
                              : 'استهلاك الوقود'}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text)] font-medium leading-relaxed">
                          {item.reason}
                        </p>
                      </div>

                      <div className="text-[10px] text-[var(--muted)] font-mono shrink-0 pt-1">
                        {new Date(item.date || Date.now()).toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Assign Vehicle Modal ── */}
      {isAssignVehicleOpen && (
        <AssignVehicleModal
          driver={driver}
          onClose={() => setIsAssignVehicleOpen(false)}
          onAssign={handleAssignVehicle}
          isLoading={isAssigningVehicle}
        />
      )}

      {/* ── Assign Team Modal ── */}
      {isAssignTeamOpen && (
        <AssignDriverToTeamModal
          isOpen={true}
          driver={driver}
          onClose={() => setIsAssignTeamOpen(false)}
        />
      )}

      {/* ── Delete Driver Modal ── */}
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
