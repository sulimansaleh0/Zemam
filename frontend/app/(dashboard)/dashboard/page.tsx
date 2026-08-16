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

  return (
    <main className="zamam-dashboard zd-grid min-h-[100dvh] text-[#edf4ff]" dir="rtl">
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
            className="fixed inset-0 z-30 bg-[#020914]/70 lg:hidden"
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
                <div className="mb-2 flex items-center gap-2 text-[11px] text-[#7390bd]">
                  <CalendarDays className="h-3.5 w-3.5" /> الأربعاء، ١٥ أغسطس ٢٠٢٦{' '}
                  <span className="text-[#466185]">•</span> آخر تحديث منذ دقيقة
                </div>
                <h1 className="text-[25px] font-bold tracking-[-.035em] text-white sm:text-[30px]">
                  صباح الخير، {userName.split(' ')[0]} <span className="text-[#6f9bff]">.</span>
                </h1>
                <p className="mt-1.5 text-[12px] text-[#8499b7]">
                  إليك نظرة سريعة على حالة أسطولك وما يحتاج إلى انتباهك اليوم.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button className="zd-focus flex items-center gap-2 rounded-xl border border-white/[.1] bg-[#12243d] px-4 py-2.5 text-[12px] font-semibold text-[#cfdbeb] hover:border-[#5788ff]">
                  <SlidersHorizontal className="h-4 w-4" /> تخصيص العرض
                </button>
                <button className="zd-focus flex items-center gap-2 rounded-xl bg-[#3d7bff] px-4 py-2.5 text-[12px] font-semibold text-white shadow-[0_9px_22px_rgba(61,123,255,.2)] hover:bg-[#548aff]">
                  <Truck className="h-4 w-4" /> إضافة مركبة
                </button>
              </div>
            </section>

            {/* ── KPIs Grid ── */}
            <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <KpiCard
                icon={Truck}
                label="إجمالي المركبات"
                value="٥٨"
                change="+٦.٢٪"
                color="bg-[#5d8cff]"
                note="مقارنة بالأسبوع الماضي"
              />
              <KpiCard
                icon={UsersRound}
                label="السائقون النشطون"
                value="٤٧"
                change="+٢.١٪"
                color="bg-[#57d0bf]"
                note="من أصل ٥٢ سائقاً"
              />
              <KpiCard
                icon={Package}
                label="طلبات الوقود"
                value="٢٨,٩٠٠"
                change="+٥.٣٪"
                color="bg-[#eab66b]"
                note="ريال هذا الشهر"
              />
              <KpiCard
                icon={Wrench}
                label="صيانة مجدولة"
                value="١١"
                change="+٨.٧٪"
                color="bg-[#a981ef]"
                note="تحتاج إلى متابعة"
              />
              <KpiCard
                icon={AlertTriangle}
                label="تنبيهات نشطة"
                value="٧"
                change="+١٢٪"
                color="bg-[#eb6974]"
                note="٣ منها عالية الأولوية"
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
            <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/[.07] pt-5 text-[10px] text-[#627996]">
              <span>زمام لإدارة الأساطيل · بيانات العرض توضيحية</span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#57d0bf]" /> جميع الأنظمة تعمل بشكل طبيعي
              </span>
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}
