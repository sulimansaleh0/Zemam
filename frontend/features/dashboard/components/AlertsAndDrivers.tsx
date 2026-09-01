'use client';

import { AlertTriangle, ChevronDown, ChevronLeft, MoreHorizontal, UsersRound } from 'lucide-react';
import { useDriversList } from '@/features/drivers';
import { getDriverDisplayName } from '@/features/drivers/utils/driverHelpers';

export function AlertsAndDrivers() {
  const { data: realDrivers = [], isLoading: isLoadingDrivers } = useDriversList();

  const alerts = [
    ['موعد صيانة مجدولة للمركبات خلال الأيام القادمة', 'تنبيه نظام', '#eab66b'],
    ['متابعة كفاءة استهلاك الوقود ومسارات الحركة', 'إشعار تشغيلي', '#5d8cff'],
  ] as const;

  return (
    <>
      {/* ── Recent Alerts ── */}
      <section className="zd-panel zd-rise zd-d4 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-bold text-[var(--zd-text)]">التنبيهات التشغيلية</h2>
            <p className="mt-1 text-[10px] text-[var(--zd-muted)]">إشعارات النظام والأسطول</p>
          </div>
          <span className="rounded-full bg-[var(--zd-blue)]/15 px-2 py-1 text-[9px] font-semibold text-[var(--zd-blue)]">
            محدث
          </span>
        </div>
        <div className="mt-4 space-y-2">
          {alerts.map(([text, time, color]) => (
            <div
              key={text}
              className="flex gap-3 rounded-xl border px-3 py-3"
              style={{ borderColor: `${color}40`, background: `${color}12` }}
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />
              <div>
                <div className="text-[11px] font-medium text-[var(--zd-text)]">{text}</div>
                <div className="mt-1 text-[9px] text-[var(--zd-muted)]">{time}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Drivers Performance ── */}
      <section className="zd-panel zd-rise zd-d4 overflow-hidden rounded-2xl p-5 lg:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-bold text-[var(--zd-text)]">سائقو الأسطول</h2>
            <p className="mt-1 text-[10px] text-[var(--zd-muted)]">
              قائمة السائقين المسجلين في النظام ({realDrivers.length})
            </p>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          {isLoadingDrivers ? (
            <div className="py-8 text-center text-xs text-[var(--zd-muted)]">جارٍ تحميل بيانات السائقين...</div>
          ) : realDrivers.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--zd-muted)] flex flex-col items-center gap-2">
              <UsersRound className="w-8 h-8 opacity-40" />
              <span>لا يوجد سائقون مسجلون حالياً</span>
            </div>
          ) : (
            <table className="w-full min-w-[560px] text-right text-[11px]">
              <thead className="border-b border-[var(--zd-line)] text-[10px] text-[var(--zd-muted)]">
                <tr>
                  <th className="pb-3 font-medium">السائق</th>
                  <th className="pb-3 font-medium">البريد الإلكتروني</th>
                  <th className="pb-3 font-medium">المركبة المعينة</th>
                  <th className="pb-3 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {realDrivers.slice(0, 5).map((driver) => {
                  const name = getDriverDisplayName(driver);
                  const isActive = driver.status === 'active';
                  return (
                    <tr key={driver._id} className="border-b border-[var(--zd-line)] last:border-0">
                      <td className="py-3">
                        <span className="flex items-center gap-2.5">
                          <i
                            className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-xs"
                            style={{ background: driver.color || '#5d8cff' }}
                          >
                            {driver.initials || name[0]}
                          </i>
                          <span className="font-medium text-[var(--zd-text)]">{name}</span>
                        </span>
                      </td>
                      <td className="py-3 font-mono text-[var(--zd-muted)]" dir="ltr">
                        {driver.email}
                      </td>
                      <td className="py-3 text-[var(--zd-text)]">
                        {driver.assignedVehicle
                          ? `${driver.assignedVehicle.model} (${driver.assignedVehicle.plateNumber})`
                          : '— غير معين'}
                      </td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-[9px] font-medium ${
                            isActive
                              ? 'bg-[var(--zd-teal)]/15 text-[var(--zd-teal)]'
                              : 'bg-rose-500/15 text-rose-500'
                          }`}
                        >
                          {isActive ? 'نشط' : 'معطل'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  );
}
