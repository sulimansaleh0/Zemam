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
import { getGpsStatusConfig } from '../utils/gpsHelpers';

const COMPANY_HQ_STORAGE_KEY = 'zemam_company_hq_center';

interface GpsMapCanvasProps {
  vehicles: VehicleLiveTelemetry[];
  selectedVehicleId: string | null;
  onSelectVehicle?: (vehicleId: string) => void;
  activePolyline?: [number, number][];
  className?: string;
}

/**
 * إنشاء أيقونة مركبة احترافية مع زاوية الاتجاه ولون الحالة
 */
function createVehicleMarkerIcon(v: VehicleLiveTelemetry, isSelected: boolean) {
  const config = getGpsStatusConfig(v.gpsStatus);
  const heading = v.currentLocation?.heading || 0;
  const speed = Math.round(v.currentLocation?.speed || 0);

  const html = `
    <div class="group relative flex flex-col items-center cursor-pointer transition-all duration-300 ${
      isSelected ? 'scale-115 z-50' : 'hover:scale-105 z-20'
    }">
      <!-- وسم المركبة العلوي -->
      <div style="
        background: #0f172a;
        color: white;
        font-weight: 700;
        font-size: 10px;
        padding: 3px 8px;
        border-radius: 9999px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.4);
        white-space: nowrap;
        margin-bottom: 4px;
        border: 1.5px solid ${isSelected ? '#3b82f6' : config.pinColor};
        display: flex;
        align-items: center;
        gap: 5px;
        direction: rtl;
      ">
        <span style="width: 7px; height: 7px; border-radius: 50%; background: ${config.pinColor}; display: inline-block;"></span>
        <span>${v.plateNumber}</span>
        ${v.gpsStatus === 'moving' ? `<span style="color: #34d399; font-size: 9px; font-weight: 800;">${speed} كم/س</span>` : ''}
      </div>

      <!-- قرص المركبة مع سهم البوصلة -->
      <div style="
        position: relative;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #0f172a;
        border: 3px solid ${isSelected ? '#3b82f6' : config.pinColor};
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 6px 20px rgba(0,0,0,0.45);
      ">
        ${
          v.gpsStatus === 'moving'
            ? `<div style="
                position: absolute;
                inset: -6px;
                border-radius: 50%;
                border: 2px solid ${config.pinColor};
                opacity: 0.7;
                animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
              "></div>`
            : ''
        }

        <div style="
          transform: rotate(${heading}deg);
          transition: transform 0.6s ease-out;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${isSelected ? '#3b82f6' : 'white'}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
          </svg>
        </div>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'gps-vehicle-marker-icon',
    iconSize: [42, 60],
    iconAnchor: [21, 52],
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
  const hasAutoCenteredRef = useRef(false);

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

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
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

    if (validCoords.length > 0 && !hasAutoCenteredRef.current && !selectedVehicleId) {
      if (validCoords.length === 1) {
        map.setView(validCoords[0], 14);
      } else {
        const bounds = L.latLngBounds(validCoords);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
      }
      hasAutoCenteredRef.current = true;
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
    const map = mapRef.current;
    if (!map || !selectedVehicleId) return;

    const v = vehicles.find((item) => item.vehicleId === selectedVehicleId);
    if (v?.currentLocation?.lat && v?.currentLocation?.lng) {
      map.flyTo([v.currentLocation.lat, v.currentLocation.lng], 15, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [selectedVehicleId, vehicles]);

  // 5. رسم مسار الرحلة
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (activePolyline && activePolyline.length > 1) {
      if (!polylineRef.current) {
        polylineRef.current = L.polyline(activePolyline, {
          color: '#2563eb',
          weight: 5,
          opacity: 0.9,
          lineJoin: 'round',
        }).addTo(map);
      } else {
        polylineRef.current.setLatLngs(activePolyline);
      }

      try {
        const bounds = L.latLngBounds(activePolyline);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } catch {}
    } else if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
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
