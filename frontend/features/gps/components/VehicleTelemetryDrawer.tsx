'use client';

import React from 'react';
import {
  Car,
  Compass,
  FileText,
  MapPin,
  Navigation,
  Phone,
  Route,
  ShieldCheck,
  User,
  X,
  Zap,
} from 'lucide-react';
import type { VehicleLiveTelemetry } from '../types/gps.types';
import { getGpsStatusConfig, formatLastSeen } from '../utils/gpsHelpers';

interface VehicleTelemetryDrawerProps {
  vehicle: VehicleLiveTelemetry | null;
  onClose: () => void;
  onViewRecentTrip?: (vehicleId: string) => void;
}

export function VehicleTelemetryDrawer({
  vehicle,
  onClose,
  onViewRecentTrip,
}: VehicleTelemetryDrawerProps) {
  if (!vehicle) return null;

  const statusConfig = getGpsStatusConfig(vehicle.gpsStatus);
  const speed = Math.round(vehicle.currentLocation?.speed || 0);
  const heading = vehicle.currentLocation?.heading || 0;
  const lat = vehicle.currentLocation?.lat?.toFixed(5);
  const lng = vehicle.currentLocation?.lng?.toFixed(5);

  return (
    <div className="absolute bottom-4 start-4 z-[500] w-88 max-w-[calc(100vw-2rem)] rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface)]/95 p-4 shadow-2xl backdrop-blur-md text-[var(--zd-text)] transition-all">
      {/* رأس البطاقة */}
      <div className="flex items-start justify-between border-b border-[var(--zd-line)] pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <Car className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold">{vehicle.plateNumber}</h3>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusConfig.badgeClass}`}
              >
                {statusConfig.label}
              </span>
            </div>
            <p className="text-xs text-[var(--zd-muted)]">
              {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ''} • {vehicle.teamName || 'مستودع عام'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-[var(--zd-muted)] hover:bg-[var(--zd-surface-2)] hover:text-[var(--zd-text)]"
          aria-label="إغلاق"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* العدادات والقياسات الحية */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {/* السرعة الحالية */}
        <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] p-2.5 text-center">
          <div className="text-[10px] text-[var(--zd-muted)]">السرعة الحالية</div>
          <div className="mt-0.5 text-lg font-black text-emerald-500">
            {speed} <span className="text-[10px] font-normal text-[var(--zd-muted)]">كم/س</span>
          </div>
        </div>

        {/* الاتجاه */}
        <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] p-2.5 text-center">
          <div className="text-[10px] text-[var(--zd-muted)]">زاوية الاتجاه</div>
          <div className="mt-0.5 flex items-center justify-center gap-1 text-lg font-black">
            <Compass
              className="h-4 w-4 text-blue-500"
              style={{ transform: `rotate(${heading}deg)` }}
            />
            <span>{heading}°</span>
          </div>
        </div>

        {/* آخر تحديث */}
        <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] p-2.5 text-center">
          <div className="text-[10px] text-[var(--zd-muted)]">آخر ظهور</div>
          <div className="mt-0.5 text-xs font-bold text-[var(--zd-text)] truncate">
            {formatLastSeen(vehicle.currentLocation?.updatedAt)}
          </div>
        </div>
      </div>

      {/* معلومات السائق والمهمة */}
      <div className="mt-3 space-y-2 text-xs">
        <div className="flex items-center justify-between rounded-lg bg-[var(--zd-surface-2)]/60 px-3 py-2">
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-blue-500" />
            <span className="font-semibold">{vehicle.driverName || 'لا يوجد سائق معيّن'}</span>
          </div>
          {vehicle.driverPhone && (
            <a
              href={`tel:${vehicle.driverPhone}`}
              className="flex items-center gap-1 text-[11px] text-blue-500 hover:underline"
            >
              <Phone className="h-3 w-3" />
              <span>{vehicle.driverPhone}</span>
            </a>
          )}
        </div>

        {vehicle.isInTask && (
          <div className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2 text-blue-500">
            <Navigation className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">المهمة النشطة: {vehicle.activeTaskTitle || 'مهمة توصيل جارية'}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-[10px] text-[var(--zd-muted)] px-1">
          <MapPin className="h-3 w-3 shrink-0" />
          <span>الإحداثيات: {lat}, {lng}</span>
        </div>
      </div>

      {/* أزرار الإجراءات */}
      <div className="mt-4 flex gap-2">
        {onViewRecentTrip && (
          <button
            onClick={() => onViewRecentTrip(vehicle.vehicleId)}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Route className="h-3.5 w-3.5" />
            <span>عرض آخر رحلة مكتملة</span>
          </button>
        )}
      </div>
    </div>
  );
}
