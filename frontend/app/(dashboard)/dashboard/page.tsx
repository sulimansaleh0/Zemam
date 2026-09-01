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

export default function DashboardPage() {
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

  const activeVehiclesCount = vehiclesList.filter((v) => v.status === 'active').length;
  const activeDriversCount = driversList.filter((d) => d.status === 'active').length;

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
                </div>
                <h1 className="text-[25px] font-bold tracking-[-.035em] text-[var(--zd-text)] sm:text-[30px]">
                  مرحباً بك، {userName.split(' ')[0]} <span className="text-[var(--zd-blue)]">.</span>
                </h1>
                <p className="mt-1.5 text-[12px] text-[var(--zd-muted)]">
                  إليك نظرة سريعة على حالة أسطولك والبيانات التشغيلية الحالية.
                </p>
              </div>
            </section>

            {/* ── Real Dynamic KPIs Grid ── */}
            <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                icon={Truck}
                label="إجمالي المركبات"
                value={String(vehiclesList.length)}
                change={`${activeVehiclesCount} نشطة`}
                color="bg-[#5d8cff]"
                note="مسجلة في أسطولك"
              />
              <KpiCard
                icon={UsersRound}
                label="السائقون"
                value={String(driversList.length)}
                change={`${activeDriversCount} نشط`}
                color="bg-[#57d0bf]"
                note="في الفرق التشغيلية"
              />
              <KpiCard
                icon={Package}
                label="الفرق التشغيلية"
                value={String(teamsList.length)}
                change="فرق معتمدة"
                color="bg-[#eab66b]"
                note="هيكل الشركة"
              />
              <KpiCard
                icon={AlertTriangle}
                label="حالة النظام"
                value="مستقر"
                change="100%"
                color="bg-[#10b981]"
                note="جميع الخوادم متصلة"
              />
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
