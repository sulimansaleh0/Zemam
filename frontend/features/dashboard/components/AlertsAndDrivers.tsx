'use client';

import { useMemo } from 'react';
import { AlertTriangle, ChevronDown, ChevronLeft, MoreHorizontal, UsersRound, CheckCircle2, ShieldAlert, Bell, Check } from 'lucide-react';
import { useDriversList } from '@/features/drivers';
import { useVehicles } from '@/features/vehicles';
import { useAlerts, useMarkAlertRead } from '@/features/alerts';
import { getDriverDisplayName } from '@/features/drivers/utils/driverHelpers';

export function AlertsAndDrivers() {
  const { data: realDrivers = [], isLoading: isLoadingDrivers } = useDriversList();
  const { data: vehiclesList = [] } = useVehicles();
  const { data: backendAlerts = [] } = useAlerts();
  const markAlertReadMutation = useMarkAlertRead();

  // Dynamic alert calculation + Backend alerts
  const alerts = useMemo(() => {
    const list: { id?: string; text: string; time: string; color: string; isBackend?: boolean; isRead?: boolean }[] = [];
    const now = new Date();

    // 0. Backend stored alerts
    backendAlerts.forEach((a) => {
      let color = '#5d8cff';
      if (a.severity === 'critical') color = '#ef4444';
      else if (a.severity === 'high') color = '#f97316';
      else if (a.severity === 'medium') color = '#eab66b';

      const timeFormatted = new Date(a.createdAt).toLocaleDateString('ar-SA', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      list.push({
        id: a._id,
        text: `${a.title}: ${a.message}`,
        time: timeFormatted,
        color,
        isBackend: true,
        isRead: a.isRead,
      });
    });

    // 1. Vehicles in maintenance
    vehiclesList.forEach((v) => {
      if (v.status === 'in_maintenance') {
        list.push({
          text: `مركبة قيد الصيانة الفنية: ${v.model} (${v.year}) - لوحة: ${v.plateNumber}`,
          time: 'صيانة نشطة حالياً',
          color: '#ef4444',
        });
      }

      // 2. Vehicle license expiration
      if (v.licenseExpiry) {
        const exp = new Date(v.licenseExpiry);
        const days = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (days <= 0) {
          list.push({
            text: `استمارة سير منتهية: ${v.model} (لوحة ${v.plateNumber})`,
            time: `انتهت منذ ${Math.abs(days)} يوم - يرجى التجديد`,
            color: '#ef4444',
          });
        } else if (days <= 30) {
          list.push({
            text: `استمارة تنتهي قريباً: ${v.model} (لوحة ${v.plateNumber})`,
            time: `متبقي ${days} يوم على التجديد`,
            color: '#eab66b',
          });
        }
      }

      // 3. Vehicle insurance expiration
      if (v.insuranceExpiry) {
        const exp = new Date(v.insuranceExpiry);
        const days = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (days <= 0) {
          list.push({
            text: `وثيقة تأمين منتهية: ${v.model} (لوحة ${v.plateNumber})`,
            time: `انتهت منذ ${Math.abs(days)} يوم`,
            color: '#ef4444',
          });
        } else if (days <= 30) {
          list.push({
            text: `تجديد تأمين مطلوب: ${v.model} (لوحة ${v.plateNumber})`,
            time: `متبقي ${days} يوم على انتهاء التأمين`,
            color: '#5d8cff',
          });
        }
      }
    });

    // 4. Driver license expiration
    realDrivers.forEach((d) => {
      if (d.licenseExpiry) {
        const exp = new Date(d.licenseExpiry);
        const days = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (days <= 30) {
          list.push({
            text: `رخصة قيادة السائق: ${d.name || d.email}`,
            time: days <= 0 ? 'رخصة منتهية الصلاحية' : `تنتهي خلال ${days} يوم`,
            color: days <= 0 ? '#ef4444' : '#a855f7',
          });
        }
      }
    });

    // If no urgent alerts, add helpful operational reminders
    if (list.length === 0) {
      list.push(
        {
          text: 'جميع تراخيص ووثائق تأمين المركبات سارية المفعول',
          time: 'سجلات سليمة ومحدثة',
          color: '#10b981',
        },
        {
          text: 'متابعة كفاءة استهلاك الوقود ومسارات الحركة',
          time: 'إشعار تشغيلي دوري',
          color: '#5d8cff',
        }
      );
    }

    return list.slice(0, 5);
  }, [backendAlerts, vehiclesList, realDrivers]);

  return (
    <>
      {/* ── Recent Alerts ── */}
      <section className="zd-panel zd-rise zd-d4 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-bold text-[var(--zd-text)]">التنبيهات التشغيلية الذكية</h2>
            <p className="mt-1 text-[10px] text-[var(--zd-muted)]">إشعارات النظام واستهلاك الوقود والتراخيص</p>
          </div>
          <span className="rounded-full bg-[var(--zd-blue)]/15 px-2 py-1 text-[9px] font-semibold text-[var(--zd-blue)]">
            محدث آنياً
          </span>
        </div>
        <div className="mt-4 space-y-2">
          {alerts.map(({ id, text, time, color, isBackend, isRead }, idx) => (
            <div
              key={id || idx}
              className={`flex items-start justify-between gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                isRead ? 'opacity-60' : ''
              }`}
              style={{ borderColor: `${color}40`, background: `${color}12` }}
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />
                <div>
                  <div className="text-[11px] font-medium text-[var(--zd-text)] leading-snug">{text}</div>
                  <div className="mt-1 text-[9px] text-[var(--zd-muted)]">{time}</div>
                </div>
              </div>

              {isBackend && id && !isRead && (
                <button
                  type="button"
                  onClick={() => markAlertReadMutation.mutate(id)}
                  disabled={markAlertReadMutation.isPending}
                  title="تحديد كمقروء"
                  className="shrink-0 p-1 rounded-lg text-[var(--zd-muted)] hover:text-emerald-500 hover:bg-emerald-500/10 transition cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
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
