'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Locate,
  Maximize2,
  Pin,
} from 'lucide-react';
import type { VehicleLiveTelemetry } from '../types/gps.types';
import {
  createUnifiedVehicleMarker,
  createUnifiedLocationPin,
  createBreadcrumbDot,
  UNIFIED_MAP_TILE_URL,
  UNIFIED_MAP_ATTRIBUTION,
} from '../utils/mapMarkers';

const COMPANY_HQ_STORAGE_KEY = 'zemam_company_hq_center';

interface GpsMapCanvasProps {
  vehicles: VehicleLiveTelemetry[];
  selectedVehicleId: string | null;
  onSelectVehicle?: (vehicleId: string) => void;
  activePolyline?: [number, number][];
  className?: string;
}

function createVehicleMarkerIcon(v: VehicleLiveTelemetry, isSelected: boolean) {
  return createUnifiedVehicleMarker({
    plateNumber: v.plateNumber,
    speed: v.currentLocation?.speed,
    heading: v.currentLocation?.heading,
    status: v.gpsStatus,
    isSelected,
  });
}

export default function GpsMapCanvas({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  activePolyline,
  className = 'h-full w-full',
}: GpsMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const polylineRef = useRef<L.Polyline | null>(null);
  const polylineCasingRef = useRef<L.Polyline | null>(null);
  const startPointMarkerRef = useRef<L.Marker | null>(null);
  const waypointsLayerRef = useRef<L.LayerGroup | null>(null);
  const hasAutoCenteredRef = useRef(false);
  const hasFittedFleetRef = useRef(false);
  const hasFittedPolylineRef = useRef(false);

  const [hqSavedNotice, setHqSavedNotice] = useState(false);

  const onSelectVehicleRef = useRef(onSelectVehicle);
  useEffect(() => {
    onSelectVehicleRef.current = onSelectVehicle;
  }, [onSelectVehicle]);

  // 1. تهيئة الخريطة وتحديد المركز الذكي
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let initialCenter: [number, number] = [31.9522, 35.2332];
    let initialZoom = 9;

    try {
      const savedHq = localStorage.getItem(COMPANY_HQ_STORAGE_KEY);
      if (savedHq) {
        const parsed = JSON.parse(savedHq);
        if (parsed?.lat && parsed?.lng) {
          initialCenter = [parsed.lat, parsed.lng];
          initialZoom = 13;
        }
      }
    } catch {}

    const map = L.map(containerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
    });

    // وضع أزرار التقريب في الزاوية العلوية المقابلة لمنع أي تداخل
    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer(UNIFIED_MAP_TILE_URL, {
      maxZoom: 19,
      attribution: UNIFIED_MAP_ATTRIBUTION,
    }).addTo(map);

    mapRef.current = map;

    // محاولة التقاط موقع المتصفح تلقائياً إذا لم يكن هناك مركز محفوظ
    if (!localStorage.getItem(COMPANY_HQ_STORAGE_KEY) && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (mapRef.current && !hasAutoCenteredRef.current) {
            const userCenter: [number, number] = [pos.coords.latitude, pos.coords.longitude];
            mapRef.current.setView(userCenter, 13);
            hasAutoCenteredRef.current = true;
          }
        },
        () => {},
        { timeout: 5000, enableHighAccuracy: false }
      );
    }

    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(resizeTimer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. تحديث زاوية الرؤية تلقائياً لتشمل كامل أسطول الشركة
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const validCoords: [number, number][] = [];

    vehicles.forEach((v) => {
      const lat = v.currentLocation?.lat;
      const lng = v.currentLocation?.lng;
      if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
        validCoords.push([lat, lng]);
      }
    });

    if (validCoords.length > 0 && !hasFittedFleetRef.current && !selectedVehicleId) {
      if (validCoords.length === 1) {
        map.setView(validCoords[0], 15, { animate: true });
      } else {
        const bounds = L.latLngBounds(validCoords);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
      }
      hasFittedFleetRef.current = true;
    }
  }, [vehicles, selectedVehicleId]);

  // 3. تحديث مؤشرات المركبات الحية
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const activeVehicleIds = new Set<string>();

    vehicles.forEach((v) => {
      const lat = v.currentLocation?.lat;
      const lng = v.currentLocation?.lng;
      if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
        return;
      }

      activeVehicleIds.add(v.vehicleId);
      const isSelected = v.vehicleId === selectedVehicleId;
      const existingMarker = markersRef.current.get(v.vehicleId);

      if (existingMarker) {
        existingMarker.setLatLng([lat, lng]);
        existingMarker.setIcon(createVehicleMarkerIcon(v, isSelected));
        if (isSelected) {
          map.panTo([lat, lng], { animate: true, duration: 0.5 });
        }
      } else {
        const marker = L.marker([lat, lng], {
          icon: createVehicleMarkerIcon(v, isSelected),
        }).addTo(map);

        marker.on('click', () => {
          if (onSelectVehicleRef.current) {
            onSelectVehicleRef.current(v.vehicleId);
          }
        });

        markersRef.current.set(v.vehicleId, marker);
      }
    });

    markersRef.current.forEach((marker, vehicleId) => {
      if (!activeVehicleIds.has(vehicleId)) {
        marker.remove();
        markersRef.current.delete(vehicleId);
      }
    });
  }, [vehicles, selectedVehicleId]);

  // 4. التمركز على مركبة محددة عند النقر عليها
  useEffect(() => {
    hasFittedPolylineRef.current = false;
    const map = mapRef.current;
    if (!map || !selectedVehicleId) return;

    const v = vehicles.find((item) => item.vehicleId === selectedVehicleId);
    if (v?.currentLocation?.lat && v?.currentLocation?.lng) {
      map.flyTo([v.currentLocation.lat, v.currentLocation.lng], 15, {
        animate: true,
        duration: 1.0,
      });
    }
  }, [selectedVehicleId]);

  // 5. رسم مسار الرحلة وتحديد النقاط المقطوعة
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!waypointsLayerRef.current) {
      waypointsLayerRef.current = L.layerGroup().addTo(map);
    }

    if (activePolyline && activePolyline.length > 1) {
      // الغلاف الخارجي المتوهج
      if (!polylineCasingRef.current) {
        polylineCasingRef.current = L.polyline(activePolyline, {
          color: '#1d4ed8',
          weight: 9,
          opacity: 0.35,
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(map);
      } else {
        polylineCasingRef.current.setLatLngs(activePolyline);
      }

      // خط السير الرئيسي المقطوع
      if (!polylineRef.current) {
        polylineRef.current = L.polyline(activePolyline, {
          color: '#2563eb',
          weight: 5,
          opacity: 0.95,
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(map);
      } else {
        polylineRef.current.setLatLngs(activePolyline);
      }

      // مؤشر نقطة البداية
      const startCoord = activePolyline[0];
      if (!startPointMarkerRef.current) {
        startPointMarkerRef.current = L.marker(startCoord, {
          icon: createUnifiedLocationPin('start'),
        }).addTo(map);
      } else {
        startPointMarkerRef.current.setLatLng(startCoord);
      }

      // النقاط المقطوعة (Breadcrumb Trail Dots)
      if (waypointsLayerRef.current) {
        waypointsLayerRef.current.clearLayers();
        const step = activePolyline.length > 50 ? Math.ceil(activePolyline.length / 50) : 1;
        activePolyline.forEach((pt, i) => {
          if (i === 0 || i === activePolyline.length - 1) return;
          if (i % step !== 0) return;

          const dot = createBreadcrumbDot(pt[0], pt[1], i + 1);
          dot.addTo(waypointsLayerRef.current!);
        });
      }

      if (!hasFittedPolylineRef.current) {
        try {
          const bounds = L.latLngBounds(activePolyline);
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
          hasFittedPolylineRef.current = true;
        } catch {}
      }
    } else {
      hasFittedPolylineRef.current = false;
      if (polylineCasingRef.current) {
        polylineCasingRef.current.remove();
        polylineCasingRef.current = null;
      }
      if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }
      if (startPointMarkerRef.current) {
        startPointMarkerRef.current.remove();
        startPointMarkerRef.current = null;
      }
      if (waypointsLayerRef.current) {
        waypointsLayerRef.current.clearLayers();
      }
    }
  }, [activePolyline]);

  // دوال الإجراءات
  const handleFitAllFleet = () => {
    const map = mapRef.current;
    if (!map) return;

    const validCoords = vehicles
      .filter((v) => v.currentLocation?.lat && v.currentLocation?.lng)
      .map((v) => [v.currentLocation.lat, v.currentLocation.lng] as [number, number]);

    if (validCoords.length > 0) {
      if (validCoords.length === 1) {
        map.flyTo(validCoords[0], 14);
      } else {
        const bounds = L.latLngBounds(validCoords);
        map.fitBounds(bounds, { padding: [70, 70], maxZoom: 14 });
      }
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current?.flyTo([pos.coords.latitude, pos.coords.longitude], 14, {
          duration: 1.5,
        });
      },
      (err) => alert('تعذر التقاط موقع المتصفح: ' + err.message)
    );
  };

  const handleSaveCompanyHq = () => {
    if (!mapRef.current) return;
    const center = mapRef.current.getCenter();
    localStorage.setItem(
      COMPANY_HQ_STORAGE_KEY,
      JSON.stringify({ lat: center.lat, lng: center.lng })
    );
    setHqSavedNotice(true);
    setTimeout(() => setHqSavedNotice(false), 3000);
  };

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      {/* حاوية الخريطة */}
      <div ref={containerRef} className="h-full w-full" />

      {/* شريط أدوات الخريطة الأفقي في الزاوية العلوية (بدون تداخل) */}
      <div className="absolute top-3 start-3 z-[500] flex items-center gap-1.5 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)]/95 p-1 shadow-md backdrop-blur-md">
        <button
          onClick={handleFitAllFleet}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--zd-text)] hover:bg-[var(--zd-surface-2)] transition-colors cursor-pointer"
          title="تركيز الكاميرا على كامل أسطول الشركة"
        >
          <Maximize2 className="h-3.5 w-3.5 text-blue-500" />
          <span className="hidden md:inline">كل الأسطول</span>
        </button>

        <div className="h-3.5 w-px bg-[var(--zd-line)]" />

        <button
          onClick={handleLocateMe}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--zd-text)] hover:bg-[var(--zd-surface-2)] transition-colors cursor-pointer"
          title="التمركز على موقعي الجغرافي الحالي"
        >
          <Locate className="h-3.5 w-3.5 text-emerald-500" />
          <span className="hidden md:inline">موقعي</span>
        </button>

        <div className="h-3.5 w-px bg-[var(--zd-line)]" />

        <button
          onClick={handleSaveCompanyHq}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--zd-text)] hover:bg-[var(--zd-surface-2)] transition-colors cursor-pointer"
          title="حفظ هذا المركز كمقر دائم للشركة"
        >
          <Pin className="h-3.5 w-3.5 text-amber-500" />
          <span className="hidden md:inline">تعيين كمقر</span>
        </button>
      </div>

      {/* إشعار حفظ مقر الشركة بنجاح */}
      {hqSavedNotice && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[600] flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-xl">
          <span>✓ تم حفظ المركز كمقر دائم للشركة</span>
        </div>
      )}
    </div>
  );
}
