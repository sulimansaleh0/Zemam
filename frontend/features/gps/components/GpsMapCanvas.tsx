'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { VehicleLiveTelemetry } from '../types/gps.types';
import {
  createUnifiedVehicleMarker,
  createUnifiedLocationPin,
  createBreadcrumbDot,
  MAP_TILE_STYLES,
  type MapTileStyleId,
} from '../utils/mapMarkers';
import { MapControls } from './MapControls';

const COMPANY_HQ_STORAGE_KEY = 'zemam_company_hq_center';
const MAP_STYLE_STORAGE_KEY = 'zemam_map_style_preference';

export interface TrajectoryPoint {
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  timestamp?: string | number;
}

interface GpsMapCanvasProps {
  vehicles: VehicleLiveTelemetry[];
  selectedVehicleId: string | null;
  onSelectVehicle?: (vehicleId: string) => void;
  activePolyline?: Array<[number, number] | TrajectoryPoint>;
  className?: string;
}

function normalizePoint(p: [number, number] | TrajectoryPoint): TrajectoryPoint {
  if (Array.isArray(p)) {
    return { lat: p[0], lng: p[1] };
  }
  return p;
}

function createVehicleMarkerIcon(v: VehicleLiveTelemetry, isSelected: boolean) {
  return createUnifiedVehicleMarker({
    plateNumber: v.plateNumber,
    speed: v.currentLocation?.speed,
    heading: v.currentLocation?.heading,
    status: v.gpsStatus,
    vehicleType: v.vehicleType || 'normal',
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
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const polylineRef = useRef<L.Polyline | null>(null);
  const polylineCasingRef = useRef<L.Polyline | null>(null);
  const startPointMarkerRef = useRef<L.Marker | null>(null);
  const geofenceCircleRef = useRef<L.Circle | null>(null);
  const waypointsLayerRef = useRef<L.LayerGroup | null>(null);

  const hasAutoCenteredRef = useRef(false);
  const hasFittedFleetRef = useRef(false);
  const hasFittedPolylineRef = useRef(false);

  const [currentStyleId, setCurrentStyleId] = useState<MapTileStyleId>('voyager');
  const [isFollowingVehicle, setIsFollowingVehicle] = useState(false);
  const [hqSavedNotice, setHqSavedNotice] = useState(false);

  const onSelectVehicleRef = useRef(onSelectVehicle);
  useEffect(() => {
    onSelectVehicleRef.current = onSelectVehicle;
  }, [onSelectVehicle]);

  // استرجاع تفضيل نمط الخريطة المحفوظ
  useEffect(() => {
    try {
      const savedStyle = localStorage.getItem(MAP_STYLE_STORAGE_KEY) as MapTileStyleId;
      if (savedStyle && MAP_TILE_STYLES[savedStyle]) {
        setCurrentStyleId(savedStyle);
      }
    } catch {}
  }, []);

  // 1. تهيئة خريطة Leaflet
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let initialCenter: [number, number] = [31.9522, 35.2332];
    let initialZoom = 10;

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

    // موضع أزرار التقريب والتصغير في الزاوية السفلية لمنع أي تداخل مع الرأس
    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    // مقياس الرسم المتري في الزاوية السفلية (Scale bar in meters & km)
    L.control.scale({ imperial: false, metric: true, position: 'bottomright' }).addTo(map);

    // طبقة البلاطات الأولى
    const initialStyleConfig = MAP_TILE_STYLES[currentStyleId] || MAP_TILE_STYLES.voyager;
    const tileLayer = L.tileLayer(initialStyleConfig.url, {
      maxZoom: initialStyleConfig.maxZoom,
      attribution: initialStyleConfig.attribution,
      subdomains: (initialStyleConfig.subdomains as any) || 'abc',
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapRef.current = map;

    // طبقة نقاط المسار
    waypointsLayerRef.current = L.layerGroup().addTo(map);

    // إلغاء وضع التتبع التلقائي عند قيام المستخدم بسحب الخريطة يدوياً
    map.on('dragstart', () => {
      setIsFollowingVehicle(false);
    });

    // التقاط الموقع الأولي تلقائياً إذا لم يكن هناك مركز محفوظ
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

  // 2. تحديث طبقة البلاطات عند تغيير نمط الخريطة
  const handleStyleChange = useCallback((newStyleId: MapTileStyleId) => {
    setCurrentStyleId(newStyleId);
    try {
      localStorage.setItem(MAP_STYLE_STORAGE_KEY, newStyleId);
    } catch {}

    const map = mapRef.current;
    if (!map) return;

    const styleConfig = MAP_TILE_STYLES[newStyleId] || MAP_TILE_STYLES.voyager;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const newLayer = L.tileLayer(styleConfig.url, {
      maxZoom: styleConfig.maxZoom,
      attribution: styleConfig.attribution,
      subdomains: (styleConfig.subdomains as any) || 'abc',
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, []);

  // 3. ضبط زاوية الرؤية لتشمل كامل الأسطول عند التحميل
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
        map.setView(validCoords[0], 14, { animate: true });
      } else {
        const bounds = L.latLngBounds(validCoords);
        map.fitBounds(bounds, { padding: [70, 70], maxZoom: 15 });
      }
      hasFittedFleetRef.current = true;
    }
  }, [vehicles, selectedVehicleId]);

  // 4. تحديث مؤشرات المركبات الحية وحركتها
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
        if (isSelected && isFollowingVehicle) {
          map.panTo([lat, lng], { animate: true, duration: 0.6 });
        }
      } else {
        const marker = L.marker([lat, lng], {
          icon: createVehicleMarkerIcon(v, isSelected),
          zIndexOffset: isSelected ? 1000 : 200,
        }).addTo(map);

        marker.on('click', () => {
          if (onSelectVehicleRef.current) {
            onSelectVehicleRef.current(v.vehicleId);
            setIsFollowingVehicle(true);
          }
        });

        markersRef.current.set(v.vehicleId, marker);
      }
    });

    // إزالة المركبات غير المتواجدة
    markersRef.current.forEach((marker, vehicleId) => {
      if (!activeVehicleIds.has(vehicleId)) {
        marker.remove();
        markersRef.current.delete(vehicleId);
      }
    });
  }, [vehicles, selectedVehicleId, isFollowingVehicle]);

  // 5. التمركز على المركبة المحددة بسلاسة
  useEffect(() => {
    hasFittedPolylineRef.current = false;
    const map = mapRef.current;
    if (!map || !selectedVehicleId) return;

    const v = vehicles.find((item) => item.vehicleId === selectedVehicleId);
    if (v?.currentLocation?.lat && v?.currentLocation?.lng) {
      map.flyTo([v.currentLocation.lat, v.currentLocation.lng], 16, {
        animate: true,
        duration: 0.9,
      });
    }
  }, [selectedVehicleId]);

  // 6. رسم خط السير الفعلي، نطاق الوصول الجغرافي، ونقاط الأثر الملونة
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!waypointsLayerRef.current) {
      waypointsLayerRef.current = L.layerGroup().addTo(map);
    }

    if (activePolyline && activePolyline.length > 1) {
      const normalizedPoints = activePolyline.map(normalizePoint);
      const latLngs: [number, number][] = normalizedPoints.map((p) => [p.lat, p.lng]);

      // الغلاف الخارجي النيوني المتوهج (Outer Glow Casing)
      if (!polylineCasingRef.current) {
        polylineCasingRef.current = L.polyline(latLngs, {
          color: '#0284c7',
          weight: 9,
          opacity: 0.35,
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(map);
      } else {
        polylineCasingRef.current.setLatLngs(latLngs);
      }

      // خط السير الرئيسي المقطوع الصلب
      if (!polylineRef.current) {
        polylineRef.current = L.polyline(latLngs, {
          color: '#0284c7',
          weight: 4.5,
          opacity: 0.95,
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(map);
      } else {
        polylineRef.current.setLatLngs(latLngs);
      }

      // دبوس نقطة الانطلاق
      const startCoord = latLngs[0];
      if (!startPointMarkerRef.current) {
        startPointMarkerRef.current = L.marker(startCoord, {
          icon: createUnifiedLocationPin('start', 'نقطة الانطلاق'),
        }).addTo(map);
      } else {
        startPointMarkerRef.current.setLatLng(startCoord);
      }

      // دائرة النطاق الجغرافي لانطلاق الرحلة (Geofence Arrival Zone - 80m)
      if (!geofenceCircleRef.current) {
        geofenceCircleRef.current = L.circle(startCoord, {
          radius: 80,
          color: '#10b981',
          weight: 1.5,
          dashArray: '4, 4',
          fillColor: '#10b981',
          fillOpacity: 0.12,
        }).addTo(map);
      } else {
        geofenceCircleRef.current.setLatLng(startCoord);
      }

      // رسم نقاط الأثر المقطوعة بدقة وتلوينها بالسرعة (Breadcrumbs)
      if (waypointsLayerRef.current) {
        waypointsLayerRef.current.clearLayers();
        const step = normalizedPoints.length > 60 ? Math.ceil(normalizedPoints.length / 60) : 1;
        normalizedPoints.forEach((pt, i) => {
          if (i === 0 || i === normalizedPoints.length - 1) return;
          if (i % step !== 0) return;

          const dot = createBreadcrumbDot(pt.lat, pt.lng, i + 1, pt.speed, pt.timestamp);
          dot.addTo(waypointsLayerRef.current!);
        });
      }

      if (!hasFittedPolylineRef.current) {
        try {
          const bounds = L.latLngBounds(latLngs);
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
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
      if (geofenceCircleRef.current) {
        geofenceCircleRef.current.remove();
        geofenceCircleRef.current = null;
      }
      if (waypointsLayerRef.current) {
        waypointsLayerRef.current.clearLayers();
      }
    }
  }, [activePolyline]);

  // دوال التحكم
  const handleFitAllFleet = () => {
    const map = mapRef.current;
    if (!map) return;

    const validCoords = vehicles
      .filter((v) => v.currentLocation?.lat && v.currentLocation?.lng)
      .map((v) => [v.currentLocation.lat, v.currentLocation.lng] as [number, number]);

    if (validCoords.length > 0) {
      if (validCoords.length === 1) {
        map.flyTo(validCoords[0], 14, { duration: 1 });
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
        mapRef.current?.flyTo([pos.coords.latitude, pos.coords.longitude], 15, {
          duration: 1.2,
        });
      },
      (err) => alert('تعذر التقاط موقع المتصفح: ' + err.message),
      { enableHighAccuracy: true }
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

  const selectedVehicle = vehicles.find((v) => v.vehicleId === selectedVehicleId);

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      {/* حاوية الخريطة */}
      <div ref={containerRef} className="h-full w-full" />

      {/* شريط أدوات الخريطة الموحد في الزاوية العلوية المقابلة */}
      <div className="absolute top-3 start-3">
        <MapControls
          currentStyleId={currentStyleId}
          onStyleChange={handleStyleChange}
          onFitFleet={handleFitAllFleet}
          onLocateMe={handleLocateMe}
          onSaveHq={handleSaveCompanyHq}
          hasSelectedVehicle={!!selectedVehicleId}
          isFollowingVehicle={isFollowingVehicle}
          onToggleFollowVehicle={() => setIsFollowingVehicle(!isFollowingVehicle)}
          selectedVehiclePlate={selectedVehicle?.plateNumber}
          containerElement={containerRef.current}
        />
      </div>

      {/* إشعار حفظ مقر الشركة بنجاح */}
      {hqSavedNotice && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[600] flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-xl animate-in fade-in">
          <span>✓ تم تعيين هذا المركز كمقر رسمي معتمد للمنشأة</span>
        </div>
      )}
    </div>
  );
}
