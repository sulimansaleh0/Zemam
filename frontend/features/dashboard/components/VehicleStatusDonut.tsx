'use client';

import { useAuth } from '@/features/auth/context/AuthContext';
import { useVehicles } from '@/features/vehicles';

export function VehicleStatusDonut() {
  const { user } = useAuth();
  const { data: vehicles = [], isLoading, isError } = useVehicles();
  const isFleetManager = user?.role === 'fleet_manager' || user?.role === 'fleet-manager';
  const visibleVehicles = isFleetManager && user?.teamId
    ? vehicles.filter((vehicle) => {
        const teamId = typeof vehicle.teamId === 'object' && vehicle.teamId !== null
          ? vehicle.teamId._id
          : vehicle.teamId;
        return String(teamId) === String(user.teamId);
      })
    : vehicles;
  const statuses = [
    { label: 'نشطة', count: visibleVehicles.filter((vehicle) => vehicle.status === 'active').length, color: '#28b89f' },
    { label: 'في الصيانة', count: visibleVehicles.filter((vehicle) => vehicle.status === 'in_maintenance').length, color: '#e6a849' },
    { label: 'متوقفة', count: visibleVehicles.filter((vehicle) => vehicle.status === 'inactive').length, color: '#eb6570' },
  ];
  const total = visibleVehicles.length;
  let segmentStart = 0;
  const segments = statuses.map(({ count, color }) => {
    const start = segmentStart;
    segmentStart += total > 0 ? (count / total) * 100 : 0;
    return `${color} ${start}% ${segmentStart}%`;
  });

  return (
    <section className="zd-panel zd-rise zd-d2 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-bold text-[var(--zd-text)]">حالة المركبات</h2>
          <p className="mt-1 text-[10px] text-[var(--zd-muted)]">حالة {total} مركبة مسجلة</p>
        </div>
      </div>

      {isLoading ? (
        <p className="mt-5 flex h-[125px] items-center justify-center text-xs text-[var(--zd-muted)]">جارٍ تحميل المركبات...</p>
      ) : isError ? (
        <p className="mt-5 flex h-[125px] items-center justify-center text-xs text-rose-500">تعذر تحميل المركبات</p>
      ) : total === 0 ? (
        <p className="mt-5 flex h-[125px] items-center justify-center text-xs text-[var(--zd-muted)]">لا توجد مركبات مسجلة</p>
      ) : (
        <div className="mt-5 flex items-center justify-around gap-4">
          <div
            className="relative h-[125px] w-[125px] shrink-0 rounded-full shadow-inner"
            style={{ background: `conic-gradient(${segments.join(', ')})` }}
          >
            <div className="absolute inset-[17px] flex flex-col items-center justify-center rounded-full bg-[var(--zd-surface)] shadow-xs">
              <strong className="font-manrope text-2xl text-[var(--zd-text)]">{total}</strong>
              <span className="text-[9px] text-[var(--zd-muted)]">مركبة</span>
            </div>
          </div>

          <div className="space-y-3 text-[11px] text-[var(--zd-muted)]">
            {statuses.map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-2">
                <i className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
                <span className="w-16 text-[var(--zd-text)] opacity-90">{label}</span>
                <b className="font-manrope text-[var(--zd-text)]">{count}</b>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
