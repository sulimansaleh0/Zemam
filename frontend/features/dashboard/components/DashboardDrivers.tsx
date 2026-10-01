'use client';

import { UsersRound } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useDriversList } from '@/features/drivers';
import { getDriverDisplayName } from '@/features/drivers/utils/driverHelpers';

export function DashboardDrivers() {
  const { user } = useAuth();
  const { data: drivers = [], isLoading } = useDriversList();
  const isFleetManager = user?.role === 'fleet_manager' || user?.role === 'fleet-manager';
  const visibleDrivers = isFleetManager && user?.teamId
    ? drivers.filter((driver) => {
        const teamId = typeof driver.teamId === 'object' && driver.teamId !== null
          ? driver.teamId._id
          : driver.teamId;
        return String(teamId) === String(user.teamId);
      })
    : drivers;

  return (
    <section className="zd-panel zd-rise zd-d4 overflow-hidden rounded-2xl p-5 lg:col-span-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-bold text-[var(--zd-text)]">سائقو الأسطول</h2>
          <p className="mt-1 text-[10px] text-[var(--zd-muted)]">
            قائمة السائقين المسجلين في النظام ({visibleDrivers.length})
          </p>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-[var(--zd-muted)]">جارٍ تحميل بيانات السائقين...</div>
        ) : visibleDrivers.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-xs text-[var(--zd-muted)]">
            <UsersRound className="h-8 w-8 opacity-40" />
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
              {visibleDrivers.slice(0, 5).map((driver) => {
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
                    <td className="py-3 font-mono text-[var(--zd-muted)]" dir="ltr">{driver.email}</td>
                    <td className="py-3 text-[var(--zd-text)]">
                      {driver.assignedVehicle
                        ? `${driver.assignedVehicle.model} (${driver.assignedVehicle.plateNumber})`
                        : '— غير معين'}
                    </td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-1 text-[9px] font-medium ${isActive
                        ? 'bg-[var(--zd-teal)]/15 text-[var(--zd-teal)]'
                        : 'bg-rose-500/15 text-rose-500'}`}>
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
  );
}