'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Locate, Navigation } from 'lucide-react';

import {
  createUnifiedVehicleMarker,
  createUnifiedLocationPin,
  createBreadcrumbDot,
  UNIFIED_MAP_TILE_URL,
  UNIFIED_MAP_ATTRIBUTION,
} from '@/features/gps/utils/mapMarkers';

export interface TraversedPoint {
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  timestamp?: string | number;
}

interface DriverLiveMapProps {
  currentCoords?: {
    lat: number;
    lng: number;
    heading?: number;
    speed?: number;
    accuracy?: number;
  } | null;
  pickupCoords?: {
    lat?: number;
    lng?: number;
    address?: string;
  } | null;
  deliveryCoords?: {
    lat?: number;
    lng?: number;
    address?: string;
  } | null;
  plateNumber?: string;
  traversedPath?: Array<TraversedPoint | [number, number]>;
  className?: string;
}

function normalizePoint(p: TraversedPoint | [number, number]): {
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  timestamp?: string | number;
} {
  if (Array.isArray(p)) {
    return { lat: p[0], lng: p[1] };
  }
  return p;
}

function createDriverMarkerIcon(heading = 0, speed = 0, plateNumber = '') {
  return createUnifiedVehicleMarker({
    plateNumber,
    speed,
    heading,
    status: speed > 0 ? 'moving' : 'idle',
    isSelected: true,
    label: 'مركبتي',
  });
}

export function DriverLiveMap({
  currentCoords,
  pickupCoords,
  deliveryCoords,
  plateNumber,
  traversedPath = [],
  className = '',
}: DriverLiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const startMarkerRef = useRef<L.Marker | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const deliveryMarkerRef = useRef<L.Marker | null>(null);
  const casingPolylineRef = useRef<L.Polyline | null>(null);
  const traversedPolylineRef = useRef<L.Polyline | null>(null);
  const remainingPolylineRef = useRef<L.Polyline | null>(null);
  const waypointsGroupRef = useRef<L.LayerGroup | null>(null);
  const hasInitialFittedRef = useRef(false);

  // 1. تهيئة الخريطة فور توفر عنصر الـ DOM
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = currentCoords?.lat || pickupCoords?.lat || 24.7136;
    const initialLng = currentCoords?.lng || pickupCoords?.lng || 46.6753;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 15,
      zoomControl: false,
    });

    L.tileLayer(UNIFIED_MAP_TILE_URL, {
      maxZoom: 19,
      attribution: UNIFIED_MAP_ATTRIBUTION,
    }).addTo(map);

    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    // مجموعة طبقات النقاط المقطوعة
    waypointsGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    const timer1 = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    const timer2 = setTimeout(() => {
      map.invalidateSize();
    }, 500);

    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. تحديث مؤشر موقع السائق الحقيقي
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (currentCoords?.lat && currentCoords?.lng) {
      const latLng: [number, number] = [currentCoords.lat, currentCoords.lng];
      const icon = createDriverMarkerIcon(
        currentCoords.heading || 0,
        currentCoords.speed || 0,
        plateNumber
      );

      if (!driverMarkerRef.current) {
        driverMarkerRef.current = L.marker(latLng, { icon, zIndexOffset: 1000 }).addTo(map);
        if (!hasInitialFittedRef.current) {
          map.setView(latLng, 16);
          hasInitialFittedRef.current = true;
        }
      } else {
        driverMarkerRef.current.setLatLng(latLng);
        driverMarkerRef.current.setIcon(icon);
      }
    }
  }, [currentCoords, plateNumber]);

  // 3. رسم خط السير الفعلي المقطوع وتحديد النقاط المقطوعة (Traversed Route & Waypoints)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const rawPoints = traversedPath.map(normalizePoint);

    // تضمين الموقع الحالي كآخر نقطة في المسار المقطوع إذا لم يكن مضافاً بعد
    const fullTrack = [...rawPoints];
    if (currentCoords?.lat && currentCoords?.lng) {
      const last = fullTrack[fullTrack.length - 1];
      if (!last || Math.abs(last.lat - currentCoords.lat) > 0.00005 || Math.abs(last.lng - currentCoords.lng) > 0.00005) {
        fullTrack.push({
          lat: currentCoords.lat,
          lng: currentCoords.lng,
          speed: currentCoords.speed,
          heading: currentCoords.heading,
          timestamp: Date.now(),
        });
      }
    }

    const latLngs: [number, number][] = fullTrack.map((p) => [p.lat, p.lng]);

    // ── رسم خط السير المقطوع (Traversed Polyline with Glow) ──
    if (latLngs.length >= 2) {
      // الغلاف الخارجي المتوهج (Outer glow casing)
      if (!casingPolylineRef.current) {
        casingPolylineRef.current = L.polyline(latLngs, {
          color: '#0369a1',
          weight: 8,
          opacity: 0.35,
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(map);
      } else {
        casingPolylineRef.current.setLatLngs(latLngs);
      }

      // المسار الرئيسي الصلب والواضح (Inner solid line)
      if (!traversedPolylineRef.current) {
        traversedPolylineRef.current = L.polyline(latLngs, {
          color: '#0284c7',
          weight: 4.5,
          opacity: 0.95,
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(map);
      } else {
        traversedPolylineRef.current.setLatLngs(latLngs);
      }

      // مؤشر نقطة بداية الانطلاق
      const startCoord = latLngs[0];
      if (!startMarkerRef.current) {
        startMarkerRef.current = L.marker(startCoord, {
          icon: createUnifiedLocationPin('start', 'بداية الرحلة'),
        }).addTo(map);
      } else {
        startMarkerRef.current.setLatLng(startCoord);
      }
    } else {
      if (casingPolylineRef.current) {
        map.removeLayer(casingPolylineRef.current);
        casingPolylineRef.current = null;
      }
      if (traversedPolylineRef.current) {
        map.removeLayer(traversedPolylineRef.current);
        traversedPolylineRef.current = null;
      }
      if (startMarkerRef.current) {
        map.removeLayer(startMarkerRef.current);
        startMarkerRef.current = null;
      }
    }

    // ── وضع مؤشرات دائرية صغيرة للنقاط المقطوعة (Breadcrumb Trail Dots) ──
    if (waypointsGroupRef.current) {
      waypointsGroupRef.current.clearLayers();

      // نأخذ عينة متوازنة حتى لا تثقل الخريطة (حتى 50 نقطة مع الاحتفاظ بالنقاط الهامة)
      const step = fullTrack.length > 50 ? Math.ceil(fullTrack.length / 50) : 1;

      fullTrack.forEach((p, idx) => {
        // نتخطى النقطة الأخيرة (لأنها المركبة) والنقطة الأولى (لأنها نقطة البداية)
        if (idx === 0 || idx === fullTrack.length - 1) return;
        if (idx % step !== 0) return;

        const dot = createBreadcrumbDot(p.lat, p.lng, idx + 1, p.speed, p.timestamp);
        dot.addTo(waypointsGroupRef.current!);
      });
    }

    // ── رسم المسار المتبقي حتى نقطة التسليم (Remaining Path - Dashed) ──
    if (currentCoords?.lat && currentCoords?.lng && deliveryCoords?.lat && deliveryCoords?.lng) {
      const remainingCoords: [number, number][] = [
        [currentCoords.lat, currentCoords.lng],
        [deliveryCoords.lat, deliveryCoords.lng],
      ];

      if (!remainingPolylineRef.current) {
        remainingPolylineRef.current = L.polyline(remainingCoords, {
          color: '#64748b',
          weight: 3,
          opacity: 0.8,
          dashArray: '6, 8',
        }).addTo(map);
      } else {
        remainingPolylineRef.current.setLatLngs(remainingCoords);
      }
    } else if (remainingPolylineRef.current) {
      map.removeLayer(remainingPolylineRef.current);
      remainingPolylineRef.current = null;
    }
  }, [traversedPath, currentCoords, deliveryCoords]);

  // 4. تحديث مؤشرات الاستلام والتسليم
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (pickupCoords?.lat && pickupCoords?.lng) {
      const pos: [number, number] = [pickupCoords.lat, pickupCoords.lng];
      if (!pickupMarkerRef.current) {
        pickupMarkerRef.current = L.marker(pos, {
          icon: createUnifiedLocationPin('pickup', 'موقع الاستلام'),
        }).addTo(map);
      } else {
        pickupMarkerRef.current.setLatLng(pos);
      }
    } else if (pickupMarkerRef.current) {
      map.removeLayer(pickupMarkerRef.current);
      pickupMarkerRef.current = null;
    }

    if (deliveryCoords?.lat && deliveryCoords?.lng) {
      const pos: [number, number] = [deliveryCoords.lat, deliveryCoords.lng];
      if (!deliveryMarkerRef.current) {
        deliveryMarkerRef.current = L.marker(pos, {
          icon: createUnifiedLocationPin('delivery', 'موقع التسليم'),
        }).addTo(map);
      } else {
        deliveryMarkerRef.current.setLatLng(pos);
      }
    } else if (deliveryMarkerRef.current) {
      map.removeLayer(deliveryMarkerRef.current);
      deliveryMarkerRef.current = null;
    }
  }, [pickupCoords, deliveryCoords]);

  // إعادة التمركز على موقع السائق
  const handleRecenter = () => {
    if (mapInstanceRef.current && currentCoords?.lat && currentCoords?.lng) {
      mapInstanceRef.current.setView([currentCoords.lat, currentCoords.lng], 16, {
        animate: true,
      });
      mapInstanceRef.current.invalidateSize();
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {/* حاوية الخريطة بارتفاع ثابت ومحدد لمنع انهيار أبعاد Leaflet */}
      <div
        ref={mapContainerRef}
        style={{ height: '300px', width: '100%', minHeight: '300px' }}
        className="z-0"
      />

      {/* زر التمركز السريع على موقع السائق */}
      <button
        onClick={handleRecenter}
        type="button"
        className="absolute top-3 left-3 z-10 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-md border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
        title="تمركز على موقعي الحالي"
      >
        <Locate className="h-5 w-5 text-blue-600" />
      </button>

      {/* مؤشر الخريطة الحية */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-xl bg-white/95 backdrop-blur-xs px-2.5 py-1 text-[11px] font-bold text-slate-700 border border-slate-200 shadow-xs pointer-events-none">
        <Navigation className="h-3.5 w-3.5 text-blue-600" />
        <span>خريطة التتبع المباشر</span>
      </div>
    </div>
  );
}

export default DriverLiveMap;
