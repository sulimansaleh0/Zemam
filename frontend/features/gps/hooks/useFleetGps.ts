'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  getGpsSocket,
  joinFleetTracking,
  leaveFleetTracking,
  onVehicleLocationChanged,
} from '../services/gpsSocket';
import { gpsService } from '../services/gps.service';
import type {
  VehicleLiveTelemetry,
  VehicleGpsStatus,
  GpsFilterOptions,
} from '../types/gps.types';

export function useFleetGps() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleLiveTelemetry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [filters, setFilters] = useState<GpsFilterOptions>({
    status: 'all',
    searchQuery: '',
  });

  const vehiclesMapRef = useRef<Map<string, VehicleLiveTelemetry>>(new Map());

  // 1. جلب القائمة الأولية للمركبات من الـ REST API
  const fetchInitialFleet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await gpsService.getLiveFleet();
      if (res.success && res.data?.vehicles) {
        const initialMap = new Map<string, VehicleLiveTelemetry>();
        res.data.vehicles.forEach((v: VehicleLiveTelemetry) => initialMap.set(v.vehicleId, v));
        vehiclesMapRef.current = initialMap;
        setVehicles(res.data.vehicles);
      }
    } catch (err: any) {
      console.warn('⚠️ Could not fetch initial GPS fleet from REST API:', err?.message);
      // في حالة عدم توفر الـ Backend بعد، نحافظ على القائمة فارغة دون انهيار
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. إدارة اتصال الـ WebSocket حسب الدور (Admin / Fleet Manager)
  useEffect(() => {
    fetchInitialFleet();

    const role = user?.role || 'admin';
    const companyId = user?.companyId;
    const teamId = (user as any)?.teamId;

    joinFleetTracking(role, companyId, teamId);

    // الاشتراك في تحديثات الموقع اللحظية
    const unsubscribeLocation = onVehicleLocationChanged((newTelemetry) => {
      if (!newTelemetry || !newTelemetry.vehicleId) return;

      const existing = vehiclesMapRef.current.get(newTelemetry.vehicleId);
      const merged: VehicleLiveTelemetry = {
        ...(existing || {}),
        ...newTelemetry,
        currentLocation: {
          ...(existing?.currentLocation || {}),
          ...newTelemetry.currentLocation,
        },
      };

      vehiclesMapRef.current.set(newTelemetry.vehicleId, merged);
      setVehicles(Array.from(vehiclesMapRef.current.values()));
    });

    return () => {
      unsubscribeLocation();
      leaveFleetTracking();
    };
  }, [user, fetchInitialFleet]);

  // تحديث محلي يدوي لمركبة (يستخدم أيضاً لاختبار التتبع الحي)
  const updateVehicleTelemetry = useCallback((telemetry: VehicleLiveTelemetry) => {
    vehiclesMapRef.current.set(telemetry.vehicleId, telemetry);
    setVehicles(Array.from(vehiclesMapRef.current.values()));
  }, []);

  // تصفية المركبات وفق البحث والحالة
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      // فلتر الحالة
      if (filters.status !== 'all' && v.gpsStatus !== filters.status) {
        return false;
      }
      // فلتر البحث بالاسم أو رقم اللوحة أو السائق
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const plateMatch = v.plateNumber?.toLowerCase().includes(q);
        const modelMatch = v.model?.toLowerCase().includes(q);
        const driverMatch = v.driverName?.toLowerCase().includes(q);
        return plateMatch || modelMatch || driverMatch;
      }
      return true;
    });
  }, [vehicles, filters]);

  // إحصائيات الأسطول السريعة
  const stats = useMemo(() => {
    const total = vehicles.length;
    let moving = 0;
    let idle = 0;
    let available = 0;
    let offline = 0;

    vehicles.forEach((v) => {
      if (v.gpsStatus === 'moving') moving++;
      else if (v.gpsStatus === 'idle') idle++;
      else if (v.gpsStatus === 'available') available++;
      else offline++;
    });

    return { total, moving, idle, available, offline };
  }, [vehicles]);

  const selectedVehicle = useMemo(() => {
    if (!selectedVehicleId) return null;
    return vehicles.find((v) => v.vehicleId === selectedVehicleId) || null;
  }, [vehicles, selectedVehicleId]);

  return {
    vehicles: filteredVehicles,
    allVehicles: vehicles,
    selectedVehicle,
    selectedVehicleId,
    setSelectedVehicleId,
    filters,
    setFilters,
    stats,
    isLoading,
    error,
    refreshFleet: fetchInitialFleet,
    updateVehicleTelemetry,
  };
}
