'use client';

import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Compass,
  Menu,
  RefreshCw,
} from 'lucide-react';
import { useFleetGps } from '../hooks/useFleetGps';
import { FleetGpsSidebar } from './FleetGpsSidebar';
import { VehicleTelemetryDrawer } from './VehicleTelemetryDrawer';
import { TripSummaryModal } from './TripSummaryModal';
import { gpsService } from '../services/gps.service';
import { getGpsSocket } from '../services/gpsSocket';
import { calculateHaversineDistance } from '../utils/gpsHelpers';
import type { TripSummary } from '../types/gps.types';

// استيراد خريطة Leaflet ديناميكياً مع تعطيل SSR
const GpsMapCanvas = dynamic(() => import('./GpsMapCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[var(--zd-surface-2)] text-xs text-[var(--zd-muted)]">
      <Compass className="h-8 w-8 animate-spin text-blue-500" />
      <span className="font-medium">جاري تهيئة الخريطة التفاعلية والاتصال بالأقمار الصناعية...</span>
    </div>
  ),
});

export function GpsTrackerView() {
  const {
    vehicles,
    selectedVehicle,
    selectedVehicleId,
    setSelectedVehicleId,
    filters,
    setFilters,
    stats,
    isLoading,
    refreshFleet,
  } = useFleetGps();

  const [activeTripSummary, setActiveTripSummary] = useState<TripSummary | null>(null);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedVehiclePath, setSelectedVehiclePath] = useState<
    Array<{ lat: number; lng: number; speed?: number; heading?: number; timestamp?: string | number }>
  >([]);

  // استرجاع النقاط المقطوعة الحية للمهمة
  const fetchLivePath = useCallback(async (taskId: string) => {
    try {
      const res = await gpsService.getLiveTripPath(taskId);
      if (res.success && res.data) {
        const pts = res.data.path?.points || (res.data as any)?.points;
        if (pts && pts.length > 0) {
          const trajectoryPoints = pts.map((p: any) => ({
            lat: p.lat,
            lng: p.lng,
            speed: p.speed,
            heading: p.heading,
            timestamp: p.timestamp,
          }));
          setSelectedVehiclePath(trajectoryPoints);
          return;
        }
      }
    } catch {}
  }, []);

  // استرجاع المسار الأولي عند اختيار المركبة أو تغير المهمة
  useEffect(() => {
    if (!selectedVehicle?.isInTask || !selectedVehicle?.activeTaskId) {
      setSelectedVehiclePath([]);
      return;
    }

    fetchLivePath(selectedVehicle.activeTaskId);
  }, [selectedVehicle?.vehicleId, selectedVehicle?.activeTaskId, fetchLivePath]);

  // الاستماع لحدث مزامنة مسار المهمة بعد عودة السائق من وضع عدم الاتصال (Offline Sync Event)
  useEffect(() => {
    const socket = getGpsSocket();
    const onPathSynced = (data: { taskId: string; vehicleId: string }) => {
      if (selectedVehicle?.activeTaskId && data.taskId === selectedVehicle.activeTaskId) {
        fetchLivePath(data.taskId);
      }
    };

    socket.on('task:path_synced', onPathSynced);
    return () => {
      socket.off('task:path_synced', onPathSynced);
    };
  }, [selectedVehicle?.activeTaskId, fetchLivePath]);

  // تحديث مسار المركبة المباشر عند تحركها، وتفادي رسم خطوط مستقيمة عند القفزات المتباعدة
  useEffect(() => {
    if (!selectedVehicle?.isInTask || !selectedVehicle?.currentLocation?.lat || !selectedVehicle?.currentLocation?.lng) {
      return;
    }
    const curLat = selectedVehicle.currentLocation.lat;
    const curLng = selectedVehicle.currentLocation.lng;
    const curSpeed = selectedVehicle.currentLocation.speed;
    const curHeading = selectedVehicle.currentLocation.heading;

    setSelectedVehiclePath((prev) => {
      const newPt = {
        lat: curLat,
        lng: curLng,
        speed: curSpeed,
        heading: curHeading,
        timestamp: Date.now(),
      };
      if (prev.length === 0) return [newPt];
      const last = prev[prev.length - 1];

      // إذا كانت المسافة بين آخر نقطة مرسومة والموقع الجديد أكثر من 100 متر (دلالة على فجوة انقطاع نت)
      // نقوم بإعادة جلب المسار الكامل من الخادم فوراً لملء المنحنيات بالنقاط الحقيقية بدلاً من رسم خط مستقيم
      const distKm = calculateHaversineDistance(last.lat, last.lng, curLat, curLng);
      if (distKm > 0.1 && selectedVehicle.activeTaskId) {
        fetchLivePath(selectedVehicle.activeTaskId);
        return prev;
      }

      if (Math.abs(last.lat - curLat) > 0.00005 || Math.abs(last.lng - curLng) > 0.00005) {
        return [...prev, newPt];
      }
      return prev;
    });
  }, [
    selectedVehicle?.currentLocation?.lat,
    selectedVehicle?.currentLocation?.lng,
    selectedVehicle?.currentLocation?.speed,
    selectedVehicle?.currentLocation?.heading,
    selectedVehicle?.activeTaskId,
    fetchLivePath,
  ]);

  // استعراض ملخص آخر رحلة منتهية للمركبة
  const handleViewRecentTrip = async (vehicleId: string) => {
    try {
      const res = await gpsService.getVehicleHistory(vehicleId);
      if (res.success && res.data?.trips && res.data.trips.length > 0) {
        setActiveTripSummary(res.data.trips[0]);
        setIsTripModalOpen(true);
      } else {
        const vLat = selectedVehicle?.currentLocation?.lat || 31.95;
        const vLng = selectedVehicle?.currentLocation?.lng || 35.23;

        setActiveTripSummary({
          taskId: 'task-preview-1',
          taskTitle: 'توصيل شحنة تجريبية',
          vehicleId,
          plateNumber: selectedVehicle?.plateNumber || 'مركبة أسطول',
          driverName: selectedVehicle?.driverName || 'سائق زمام',
          totalDistanceKm: 14.8,
          durationMinutes: 32,
          averageSpeed: 42,
          maxSpeed: 84,
          startLocation: {
            lat: vLat,
            lng: vLng,
            address: 'موقع انطلاق الرحلة',
          },
          endLocation: {
            lat: vLat + 0.04,
            lng: vLng + 0.03,
            address: 'نقطة تسليم الشحنة',
          },
          encodedPath: '',
          startedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
          finishedAt: new Date().toISOString(),
        });
        setIsTripModalOpen(true);
      }
    } catch (err) {
      console.warn('Error fetching trip history:', err);
    }
  };

  return (
    <div className="space-y-3">
      {/* ── شريط الإجراءات العلوي المنفصل (خارج الخريطة لمنع أي تداخل) ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface)] px-4 py-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-[var(--zd-text)]">لوحة التتبع الحي الميداني</span>
          <span className="text-xs text-[var(--zd-muted)]">
            ({vehicles.length} مركبة نشطة حالياً)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* زر تحديث الأسطول */}
          <button
            onClick={() => refreshFleet()}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] px-3 py-1.5 text-xs font-semibold text-[var(--zd-text)] hover:bg-[var(--zd-line)] transition-colors cursor-pointer"
            title="تحديث بيانات الأسطول"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
            <span>تحديث</span>
          </button>

          {/* زر طي/إظهار القائمة الجانبية للمركبات */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              isSidebarOpen
                ? 'border-[var(--zd-line)] bg-[var(--zd-surface-2)] text-[var(--zd-text)]'
                : 'border-blue-500 bg-blue-600 text-white shadow-sm'
            }`}
          >
            <Menu className="h-3.5 w-3.5" />
            <span>{isSidebarOpen ? 'إخفاء القائمة' : 'عرض المركبات'}</span>
          </button>
        </div>
      </div>

      {/* ── لوحة الخريطة المتجاورة (Side-by-Side Flex Layout) بدون تداخل نهائياً ── */}
      <div className="flex flex-col lg:flex-row h-[680px] w-full overflow-hidden rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface)] shadow-md">
        {/* 1. قسم الخريطة التفاعلية */}
        <div className="relative flex-1 h-full min-w-0">
          <GpsMapCanvas
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={(id) => setSelectedVehicleId(id)}
            activePolyline={selectedVehiclePath.length > 1 ? selectedVehiclePath : undefined}
          />

          {/* بطاقة تفاصيل المركبة تظهر فقط عند النقر على مركبة */}
          <VehicleTelemetryDrawer
            vehicle={selectedVehicle}
            onClose={() => setSelectedVehicleId(null)}
            onViewRecentTrip={handleViewRecentTrip}
          />
        </div>

        {/* 2. قسم قائمة المركبات الجانبية المستقل (مفصول تماماً كعمود منفرد) */}
        {isSidebarOpen && (
          <div className="w-full lg:w-96 shrink-0 h-full border-t lg:border-t-0 lg:border-s border-[var(--zd-line)] bg-[var(--zd-surface)] flex flex-col">
            <FleetGpsSidebar
              vehicles={vehicles}
              selectedVehicleId={selectedVehicleId}
              onSelectVehicle={(id) => setSelectedVehicleId(id)}
              filters={filters}
              onFilterChange={setFilters}
              stats={stats}
              isLoading={isLoading}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
        )}
      </div>

      {/* ── نافذة استعراض ملخص الرحلة المكتملة ── */}
      <TripSummaryModal
        isOpen={isTripModalOpen}
        onClose={() => setIsTripModalOpen(false)}
        summary={activeTripSummary}
      />
    </div>
  );
}
