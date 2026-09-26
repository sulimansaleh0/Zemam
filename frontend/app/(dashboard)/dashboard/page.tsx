'use client';

import {
  AlertTriangle,
  CalendarDays,
  Package,
  SlidersHorizontal,
  Truck,
  UsersRound,
  Wrench,
} from 'lucide-react';
import {
  AiRecommendations,
  AlertsAndDrivers,
  Header,
  KpiCard,
  LiveMapPanel,
  Sidebar,
  TodayTasksList,
  TrendChart,
  useDashboard,
  VehicleStatusDonut,
} from '@/features/dashboard';

import { useVehicles } from '@/features/vehicles';
import { useDriversList } from '@/features/drivers';
import { useTeams } from '@/features/teams';
import { useAuth } from '@/features/auth/context/AuthContext';
import { teamService } from '@/features/teams/services/team.service';
import { companyService } from '@/features/company/services/company.service';
import { useQuery } from '@tanstack/react-query';

export default function DashboardPage() {
  const { user } = useAuth();
  const isFleetManager = user?.role === 'fleet_manager' || user?.role === 'fleet-manager';

  const {
    userName,
    menuOpen,
    setMenuOpen,
    searchQuery,
    setSearchQuery,
    doneTasks,
    toggleTask,
    logout,
  } = useDashboard();

  const { data: vehiclesList = [] } = useVehicles();
  const { data: driversList = [] } = useDriversList();
  const { data: teamsList = [] } = useTeams();

  // Fleet manager team stats query
  const { data: teamStatics } = useQuery({
    queryKey: ['fleet-manager-dashboard-team-stats', user?.teamId],
    queryFn: async () => {
      if (!isFleetManager) return null;
      return await teamService.getTeamStatics(user?.teamId);
    },
    enabled: Boolean(isFleetManager),
  });

  // Admin company-wide stats query
  const { data: companyStatics } = useQuery({
    queryKey: ['admin-dashboard-company-stats', user?.companyId],
    queryFn: async () => {
      if (isFleetManager) return null;
      return await companyService.getCompanyStatics();
    },
    enabled: !isFleetManager,
  });

  const fleetManagerTeam = isFleetManager && user?.teamId
    ? teamsList.find((t) => t._id === user.teamId)
    : null;

  // Filter for fleet manager
  const displayedVehicles = isFleetManager && user?.teamId
    ? vehiclesList.filter((v) => {
        const vTeamId = typeof v.teamId === 'object' && v.teamId !== null ? v.teamId._id : v.teamId;
        return String(vTeamId) === String(user.teamId);
      })
    : vehiclesList;

  const displayedDrivers = isFleetManager && user?.teamId
    ? driversList.filter((d) => {
        const dTeamId = typeof d.teamId === 'object' && d.teamId !== null ? d.teamId._id : d.teamId;
        return String(dTeamId) === String(user.teamId);
      })
    : driversList;

  const activeVehiclesCount = displayedVehicles.filter((v) => v.status === 'active').length;
  const activeDriversCount = displayedDrivers.filter((d) => d.status === 'active').length;

  const fleetFuelCost = typeof teamStatics?.FuelRecordsCost === 'number'
    ? teamStatics.FuelRecordsCost
    : Array.isArray(teamStatics?.FuelRecordsCost)
    ? (teamStatics.FuelRecordsCost as any[]).reduce((acc, c) => acc + (c?.totalCost || 0), 0)
    : 0;

  const fleetMaintenanceCost = typeof teamStatics?.maintenanceRecordsCost === 'number'
    ? teamStatics.maintenanceRecordsCost
    : Array.isArray(teamStatics?.maintenanceRecordsCost)
    ? (teamStatics.maintenanceRecordsCost as any[]).reduce((acc, c) => acc + (c?.totalCost || 0), 0)
    : 0;

  const companyFuelCost = typeof companyStatics?.FuelRecordsCost === 'number'
    ? companyStatics.FuelRecordsCost
    : 0;

  const companyMaintenanceCost = typeof companyStatics?.maintenanceRecordsCost === 'number'
    ? companyStatics.maintenanceRecordsCost
    : 0;

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
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            userName={userName}
          />

          <div className="mx-auto max-w-[1540px] px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
            {/* ── Welcome Hero ── */}
            <section className="zd-rise mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <div className="mb-2 flex items-center gap-2 text-[11px] text-[var(--zd-muted)]">
                  <CalendarDays className="h-3.5 w-3.5" />{' '}
                  {new Date().toLocaleDateString('ar-EG', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                  <span className="opacity-40">•</span> بيانات مباشرة
                  {isFleetManager && fleetManagerTeam && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--zd-blue)]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--zd-blue)] border border-[var(--zd-blue)]/20">
                      فريق: {fleetManagerTeam.name}
                    </span>
                  )}
                </div>
                <h1 className="text-[25px] font-bold tracking-[-.035em] text-[var(--zd-text)] sm:text-[30px]">
                  مرحباً بك، {userName.split(' ')[0]} <span className="text-[var(--zd-blue)]">.</span>
                </h1>
                <p className="mt-1.5 text-[12px] text-[var(--zd-muted)]">
                  {isFleetManager
                    ? `إليك نظرة سريعة على إحصاءات وأداء فريقك (${fleetManagerTeam?.name || 'الفريق التشغيلي'}) ومركباتك الحالية.`
                    : 'إليك نظرة سريعة على حالة أسطولك والبيانات التشغيلية الحالية.'}
                </p>
              </div>
            </section>

            {/* ── Real Dynamic KPIs Grid ── */}
            <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {isFleetManager ? (
                <>
                  <KpiCard
                    icon={Truck}
                    label="مركبات فريقي"
                    value={String(displayedVehicles.length)}
                    change={`${activeVehiclesCount} نشطة`}
                    color="bg-[#5d8cff]"
                    note={fleetManagerTeam ? `فريق ${fleetManagerTeam.name}` : 'فريقك الحالي'}
                  />
                  <KpiCard
                    icon={UsersRound}
                    label="سائقو فريقي"
                    value={String(displayedDrivers.length)}
                    change={`${activeDriversCount} نشط`}
                    color="bg-[#57d0bf]"
                    note="كادر السائقين بالفريق"
                  />
                  <KpiCard
                    icon={Package}
                    label="مهام الفريق"
                    value={teamStatics ? `${teamStatics.finishedTasks ?? 0} / ${teamStatics.totalTasks ?? 0}` : '0'}
                    change={
                      teamStatics?.totalTasks
                        ? `${Math.round(((teamStatics.finishedTasks ?? 0) / (teamStatics.totalTasks || 1)) * 100)}% إنجاز`
                        : 'جاهزية تامة'
                    }
                    color="bg-[#eab66b]"
                    note="المهام المنفذة للفريق"
                  />
                  <KpiCard
                    icon={Wrench}
                    label="تكاليف التشغيل"
                    value={
                      teamStatics
                        ? `${(fleetFuelCost + fleetMaintenanceCost).toLocaleString('ar-SA')} ر.س`
                        : '0 ر.س'
                    }
                    change={
                      teamStatics
                        ? `صيانة: ${fleetMaintenanceCost.toLocaleString('ar-SA')} ر.س`
                        : 'مستقر'
                    }
                    color="bg-[#10b981]"
                    note="إجمالي وقود وصيانة الفريق"
                  />
                </>
              ) : (
                <>
                  <KpiCard
                    icon={Truck}
                    label="إجمالي المركبات"
                    value={String(companyStatics?.totalVehicles ?? vehiclesList.length)}
                    change={`${companyStatics?.activeVehicles ?? vehiclesList.filter((v) => v.status === 'active').length} نشطة`}
                    color="bg-[#5d8cff]"
                    note="مسجلة في أسطول الشركة"
                  />
                  <KpiCard
                    icon={UsersRound}
                    label="إجمالي السائقين"
                    value={String(driversList.length)}
                    change={`${driversList.filter((d) => d.status === 'active').length} نشط`}
                    color="bg-[#57d0bf]"
                    note="في جميع الفرق التشغيلية"
                  />
                  <KpiCard
                    icon={Package}
                    label="إنجاز المهام"
                    value={
                      companyStatics
                        ? `${companyStatics.finishedTasks ?? 0} / ${companyStatics.totalTasks ?? 0}`
                        : `${teamsList.length} فرق`
                    }
                    change={
                      companyStatics?.totalTasks
                        ? `${Math.round(((companyStatics.finishedTasks ?? 0) / (companyStatics.totalTasks || 1)) * 100)}% إنجاز`
                        : `${teamsList.length} فرق معتمدة`
                    }
                    color="bg-[#eab66b]"
                    note="المهام المنفذة للشركة"
                  />
                  <KpiCard
                    icon={Wrench}
                    label="إجمالي المصروفات"
                    value={
                      companyStatics
                        ? `${(companyFuelCost + companyMaintenanceCost).toLocaleString('ar-SA')} ر.س`
                        : '0 ر.س'
                    }
                    change={
                      companyStatics
                        ? `صيانة: ${companyMaintenanceCost.toLocaleString('ar-SA')} ر.س`
                        : 'مستقر'
                    }
                    color="bg-[#10b981]"
                    note="إجمالي وقود وصيانة الأسطول"
                  />
                </>
              )}
            </section>

            {/* ── Charts Grid ── */}
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <TrendChart />
              <VehicleStatusDonut />
            </section>

            {/* ── Map, Tasks & AI Grid ── */}
            <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <LiveMapPanel />
              <TodayTasksList doneTasks={doneTasks} onToggleTask={toggleTask} />
              <AiRecommendations />
            </section>

            {/* ── Alerts & Drivers Table Grid ── */}
            <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <AlertsAndDrivers />
            </section>

            {/* ── Footer ── */}
            <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--zd-line)] pt-5 text-[10px] text-[var(--zd-muted)] transition-colors">
              <span>زمام لإدارة الأساطيل · بيانات العرض توضيحية</span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--zd-teal)]" /> جميع الأنظمة تعمل بشكل طبيعي
              </span>
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}
