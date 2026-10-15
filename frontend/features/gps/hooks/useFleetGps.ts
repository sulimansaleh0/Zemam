'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  joinFleetTracking,
  leaveFleetTracking,
  onVehicleLocationChanged,
  onTripCompleted,
} from '../services/gpsSocket';
import { gpsService } from '../services/gps.service';
import type {
  VehicleLiveTelemetry,
  GpsFilterOptions,
  FleetStats,
} from '../types/gps.types';

function calculateFleetStats(vehicles: VehicleLiveTelemetry[]): FleetStats {
  return {
    total: vehicles.length,
    moving: vehicles.filter((vehicle) => vehicle.gpsStatus === 'moving').length,
    idle: vehicles.filter((vehicle) => vehicle.gpsStatus === 'idle').length,
    available: vehicles.filter((vehicle) => vehicle.gpsStatus === 'available').length,
    offline: vehicles.filter((vehicle) => vehicle.gpsStatus === 'offline').length,
  };
}

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
  const [stats, setStats] = useState<FleetStats>({
    total: 0,
    moving: 0,
    idle: 0,
    available: 0,
    offline: 0,
  });

  const vehiclesMapRef = useRef<Map<string, VehicleLiveTelemetry>>(new Map());

  // 1. جلب القائمة الأولية للمركبات والإحصائيات من الـ REST API (محسوبة على السيرفر)
  const fetchInitialFleet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await gpsService.getLiveFleet();
      if (res.success && res.data) {
        const fleetList = (res.data.vehicles || []).filter(
          (vehicle) => vehicle.isInTask && Boolean(vehicle.activeTaskId)
        );
        const initialMap = new Map<string, VehicleLiveTelemetry>();
        fleetList.forEach((v: VehicleLiveTelemetry) => initialMap.set(v.vehicleId, v));
        vehiclesMapRef.current = initialMap;
        setVehicles(fleetList);

        setStats(calculateFleetStats(fleetList));
      }
    } catch (err: any) {
      console.warn('⚠️ Could not fetch initial GPS fleet from REST API:', err?.message);
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

      if (!newTelemetry.isInTask || !newTelemetry.activeTaskId) {
        vehiclesMapRef.current.delete(newTelemetry.vehicleId);
        const nextVehicles = Array.from(vehiclesMapRef.current.values());
        setVehicles(nextVehicles);
        setStats(calculateFleetStats(nextVehicles));
        return;
      }

      const existing = vehiclesMapRef.current.get(newTelemetry.vehicleId);
      const merged: VehicleLiveTelemetry = {
        ...(existing || {}),
        ...newTelemetry,
        currentLocation: newTelemetry.currentLocation
          ? { ...existing?.currentLocation, ...newTelemetry.currentLocation }
          : existing?.currentLocation ?? null,
      };

      vehiclesMapRef.current.set(newTelemetry.vehicleId, merged);
      const nextVehicles = Array.from(vehiclesMapRef.current.values());
      setVehicles(nextVehicles);
      setStats(calculateFleetStats(nextVehicles));
    });

    const unsubscribeTripCompleted = onTripCompleted((summary) => {
      if (!summary?.vehicleId) return;

      vehiclesMapRef.current.delete(summary.vehicleId);
      const nextVehicles = Array.from(vehiclesMapRef.current.values());
      setVehicles(nextVehicles);
      setStats(calculateFleetStats(nextVehicles));
    });

    return () => {
      unsubscribeLocation();
      unsubscribeTripCompleted();
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
      if (!v.isInTask || !v.activeTaskId) return false;
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

  // إحصائيات الأسطول المعتمدة من الخادم مباشرة دون تكرار حسابات
  const effectiveStats = useMemo(() => {
    if (stats.total > 0 || vehicles.length === 0) return stats;
    return {
      total: vehicles.length,
      moving: vehicles.filter((v) => v.gpsStatus === 'moving').length,
      idle: vehicles.filter((v) => v.gpsStatus === 'idle').length,
      available: vehicles.filter((v) => v.gpsStatus === 'available').length,
      offline: vehicles.filter((v) => v.gpsStatus === 'offline').length,
    };
  }, [stats, vehicles]);

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
    stats: effectiveStats,
    isLoading,
    error,
    refreshFleet: fetchInitialFleet,
    updateVehicleTelemetry,
  };
}
