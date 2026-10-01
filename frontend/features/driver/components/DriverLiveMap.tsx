'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Compass,
  Layers,
  Locate,
  Lock,
  Maximize2,
  Minimize2,
  Moon,
  Navigation,
  Sun,
  Unlock,
} from 'lucide-react';

import {
  createUnifiedVehicleMarker,
  createUnifiedLocationPin,
  createBreadcrumbDot,
  MAP_TILE_STYLES,
  type MapTileStyleId,
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
  vehicleType?: string;
  traversedPath?: Array<TraversedPoint | [number, number]>;
  className?: string;
}

function normalizePoint(p: TraversedPoint | [number, number]): TraversedPoint {
  if (Array.isArray(p)) {
    return { lat: p[0], lng: p[1] };
  }
  return p;
}

function createDriverMarkerIcon(
  heading = 0,
  speed = 0,
  plateNumber = '',
  vehicleType = 'normal'
) {
  return createUnifiedVehicleMarker({
    plateNumber: plateNumber || 'مركبتي',
    speed,
    heading,
    status: speed > 0 ? 'moving' : 'idle',
    vehicleType,
    isSelected: true,
    label: 'مركبتي',
  });
}

export function DriverLiveMap({
  currentCoords,
  pickupCoords,
  deliveryCoords,
  plateNumber,
  vehicleType = 'normal',
  traversedPath = [],
  className = '',
}: DriverLiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const startMarkerRef = useRef<L.Marker | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const deliveryMarkerRef = useRef<L.Marker | null>(null);
  const pickupGeofenceRef = useRef<L.Circle | null>(null);
  const deliveryGeofenceRef = useRef<L.Circle | null>(null);
  const casingPolylineRef = useRef<L.Polyline | null>(null);
  const traversedPolylineRef = useRef<L.Polyline | null>(null);
  const remainingPolylineRef = useRef<L.Polyline | null>(null);
  const waypointsGroupRef = useRef<L.LayerGroup | null>(null);

  const hasInitialFittedRef = useRef(false);
  const [autoFollowDriver, setAutoFollowDriver] = useState(true);
  const [currentStyleId, setCurrentStyleId] = useState<MapTileStyleId>('voyager');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 1. تهيئة خريطة السائق
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = currentCoords?.lat || pickupCoords?.lat || 24.7136;
    const initialLng = currentCoords?.lng || pickupCoords?.lng || 46.6753;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 16,
      zoomControl: false,
    });

    const styleConfig = MAP_TILE_STYLES[currentStyleId] || MAP_TILE_STYLES.voyager;
    const tileLayer = L.tileLayer(styleConfig.url, {
      maxZoom: styleConfig.maxZoom,
      attribution: styleConfig.attribution,
      subdomains: (styleConfig.subdomains as any) || 'abc',
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    L.control.zoom({ position: 'bottomleft' }).addTo(map);
    L.control.scale({ imperial: false, metric: true, position: 'bottomright' }).addTo(map);

    waypointsGroupRef.current = L.layerGroup().addTo(map);

    // إلغاء وضع التتبع التلقائي عند قيام السائق بسحب الخريطة يدوياً
    map.on('dragstart', () => {
      setAutoFollowDriver(false);
    });

    mapInstanceRef.current = map;

    const timer1 = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    const timer2 = setTimeout(() => {
      map.invalidateSize();
    }, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // تبديل النمط بين النهاري والليلي التكتيكي
  const toggleMapTheme = useCallback(() => {
    const nextStyle: MapTileStyleId = currentStyleId === 'voyager' ? 'dark' : 'voyager';
    setCurrentStyleId(nextStyle);

    const map = mapInstanceRef.current;
    if (!map) return;

    const styleConfig = MAP_TILE_STYLES[nextStyle];
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const newLayer = L.tileLayer(styleConfig.url, {
      maxZoom: styleConfig.maxZoom,
      attribution: styleConfig.attribution,
      subdomains: (styleConfig.subdomains as any) || 'abc',
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [currentStyleId]);

  // 2. تحديث مؤشر موقع السائق الحقيقي مع سلاسة الحركة والتدوير
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (currentCoords?.lat && currentCoords?.lng) {
      const latLng: [number, number] = [currentCoords.lat, currentCoords.lng];
      const icon = createDriverMarkerIcon(
        currentCoords.heading || 0,
        currentCoords.speed || 0,
        plateNumber,
        vehicleType
      );

      if (!driverMarkerRef.current) {
        driverMarkerRef.current = L.marker(latLng, { icon, zIndexOffset: 1500 }).addTo(map);
        if (!hasInitialFittedRef.current) {
          map.setView(latLng, 16);
          hasInitialFittedRef.current = true;
        }
      } else {
        driverMarkerRef.current.setLatLng(latLng);
        driverMarkerRef.current.setIcon(icon);
      }

      if (autoFollowDriver) {
        map.panTo(latLng, { animate: true, duration: 0.5 });
      }
    }
  }, [currentCoords, plateNumber, vehicleType, autoFollowDriver]);

  // 3. رسم خط السير الفعلي المقطوع ونقاط الأثر الملونة (Breadcrumbs)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const rawPoints = traversedPath.map(normalizePoint);

    // إضافة الإحداثية الحالية كأحدث نقطة
    const fullTrack = [...rawPoints];
    if (currentCoords?.lat && currentCoords?.lng) {
      const last = fullTrack[fullTrack.length - 1];
      if (
        !last ||
        Math.abs(last.lat - currentCoords.lat) > 0.00005 ||
        Math.abs(last.lng - currentCoords.lng) > 0.00005
      ) {
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

    // رسم المسار المقطوع بتوهج نيون حاد
    if (latLngs.length >= 2) {
      // الغلاف الخارجي النيوني
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

      // المسار الصلب الرئيسي
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

      // مؤشر نقطة بداية الرحلة
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

    // رسم نقاط الأثر الملونة بالسرعة اللحظية
    if (waypointsGroupRef.current) {
      waypointsGroupRef.current.clearLayers();
      const step = fullTrack.length > 50 ? Math.ceil(fullTrack.length / 50) : 1;

      fullTrack.forEach((p, idx) => {
        if (idx === 0 || idx === fullTrack.length - 1) return;
        if (idx % step !== 0) return;

        const dot = createBreadcrumbDot(p.lat, p.lng, idx + 1, p.speed, p.timestamp);
        dot.addTo(waypointsGroupRef.current!);
      });
    }

    // ── رسم المسار المتبقي المتدفق نحو نقطة التسليم (Remaining Flow Path) ──
    if (currentCoords?.lat && currentCoords?.lng && deliveryCoords?.lat && deliveryCoords?.lng) {
      const remainingCoords: [number, number][] = [
        [currentCoords.lat, currentCoords.lng],
        [deliveryCoords.lat, deliveryCoords.lng],
      ];

      if (!remainingPolylineRef.current) {
        remainingPolylineRef.current = L.polyline(remainingCoords, {
          color: '#38bdf8',
          weight: 3.5,
          dashArray: '8, 14',
          className: 'zemam-flow-path',
          opacity: 0.85,
        }).addTo(map);
      } else {
        remainingPolylineRef.current.setLatLngs(remainingCoords);
      }
    } else if (remainingPolylineRef.current) {
      map.removeLayer(remainingPolylineRef.current);
      remainingPolylineRef.current = null;
    }
  }, [traversedPath, currentCoords, deliveryCoords]);

  // 4. دبابيس ودوائر النطاق الجغرافي للاستلام والتسليم
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (pickupCoords?.lat && pickupCoords?.lng) {
      const pos: [number, number] = [pickupCoords.lat, pickupCoords.lng];
      if (!pickupMarkerRef.current) {
        pickupMarkerRef.current = L.marker(pos, {
          icon: createUnifiedLocationPin('pickup', 'موقع الاستلام (A)'),
        }).addTo(map);
      } else {
        pickupMarkerRef.current.setLatLng(pos);
      }

      if (!pickupGeofenceRef.current) {
        pickupGeofenceRef.current = L.circle(pos, {
          radius: 80,
          color: '#10b981',
          weight: 1.5,
          dashArray: '4, 4',
          fillColor: '#10b981',
          fillOpacity: 0.12,
        }).addTo(map);
      } else {
        pickupGeofenceRef.current.setLatLng(pos);
      }
    } else {
      if (pickupMarkerRef.current) {
        map.removeLayer(pickupMarkerRef.current);
        pickupMarkerRef.current = null;
      }
      if (pickupGeofenceRef.current) {
        map.removeLayer(pickupGeofenceRef.current);
        pickupGeofenceRef.current = null;
      }
    }

    if (deliveryCoords?.lat && deliveryCoords?.lng) {
      const pos: [number, number] = [deliveryCoords.lat, deliveryCoords.lng];
      if (!deliveryMarkerRef.current) {
        deliveryMarkerRef.current = L.marker(pos, {
          icon: createUnifiedLocationPin('delivery', 'موقع التسليم (B)'),
        }).addTo(map);
      } else {
        deliveryMarkerRef.current.setLatLng(pos);
      }

      if (!deliveryGeofenceRef.current) {
        deliveryGeofenceRef.current = L.circle(pos, {
          radius: 80,
          color: '#2563eb',
          weight: 1.5,
          dashArray: '4, 4',
          fillColor: '#2563eb',
          fillOpacity: 0.12,
        }).addTo(map);
      } else {
        deliveryGeofenceRef.current.setLatLng(pos);
      }
    } else {
      if (deliveryMarkerRef.current) {
        map.removeLayer(deliveryMarkerRef.current);
        deliveryMarkerRef.current = null;
      }
      if (deliveryGeofenceRef.current) {
        map.removeLayer(deliveryGeofenceRef.current);
        deliveryGeofenceRef.current = null;
      }
    }
  }, [pickupCoords, deliveryCoords]);

  // إعادة التمركز وتفعيل التتبع
  const handleRecenter = () => {
    setAutoFollowDriver(true);
    if (mapInstanceRef.current && currentCoords?.lat && currentCoords?.lng) {
      mapInstanceRef.current.setView([currentCoords.lat, currentCoords.lng], 16, {
        animate: true,
      });
      mapInstanceRef.current.invalidateSize();
    }
  };

  const toggleFullscreen = () => {
    const target = mapContainerRef.current?.parentElement || mapContainerRef.current;
    if (!document.fullscreenElement) {
      target?.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {/* حاوية الخريطة */}
      <div
        ref={mapContainerRef}
        style={{ height: '320px', width: '100%', minHeight: '320px' }}
        className="z-0"
      />

      {/* ── شريط أدوات تحكم السائق العائم (Driver Navigation HUD Bar) ── */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2" dir="ltr">
        {/* زر التمركز وتثبيت الكاميرا */}
        <button
          onClick={handleRecenter}
          type="button"
          className={`flex h-10 items-center gap-1.5 px-3 rounded-2xl shadow-md border transition-all active:scale-95 cursor-pointer ${
            autoFollowDriver
              ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/20'
              : 'bg-white/95 backdrop-blur-md text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
          title="تثبيت الكاميرا مع حركة المركبة"
        >
          <Locate className={`h-4 w-4 ${autoFollowDriver ? 'animate-pulse' : 'text-blue-600'}`} />
          <span className="text-[11px] font-bold">
            {autoFollowDriver ? 'كاميرا مثبتة' : 'تمركز'}
          </span>
        </button>

        {/* زر التبديل السريع بين الوضع النهاري والليلي */}
        <button
          onClick={toggleMapTheme}
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/95 backdrop-blur-md text-slate-700 shadow-md border border-slate-200 hover:bg-slate-50 transition active:scale-95 cursor-pointer"
          title={currentStyleId === 'voyager' ? 'التحويل للوضع التكتيكي الليلي' : 'التحويل للوضع النهاري'}
        >
          {currentStyleId === 'voyager' ? (
            <Moon className="h-4 w-4 text-sky-500" />
          ) : (
            <Sun className="h-4 w-4 text-amber-500" />
          )}
        </button>

        {/* زر ملء الشاشة */}
        <button
          onClick={toggleFullscreen}
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/95 backdrop-blur-md text-slate-700 shadow-md border border-slate-200 hover:bg-slate-50 transition active:scale-95 cursor-pointer"
          title="ملء الشاشة"
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4 text-purple-600" />
          ) : (
            <Maximize2 className="h-4 w-4 text-purple-600" />
          )}
        </button>
      </div>

      {/* مؤشر الخريطة الحية وسرعة القيادة */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2 rounded-2xl bg-white/95 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-slate-800 border border-slate-200 shadow-md pointer-events-none" dir="rtl">
        <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <Navigation className="h-3.5 w-3.5 text-blue-600" />
        <span>تتبع ملاحي فائق الدقة</span>
        {currentCoords?.speed !== undefined && currentCoords.speed > 0 && (
          <span className="rounded-lg bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-[10px] font-black">
            {currentCoords.speed} كم/س
          </span>
        )}
      </div>
    </div>
  );
}

export default DriverLiveMap;
