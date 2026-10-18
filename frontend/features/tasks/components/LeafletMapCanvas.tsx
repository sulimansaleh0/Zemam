'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  createUnifiedLocationPin,
  createUnifiedVehicleMarker,
  UNIFIED_MAP_TILE_URL,
  UNIFIED_MAP_ATTRIBUTION,
} from '@/features/gps/utils/mapMarkers';

export interface PlaybackVehicleData {
  position: [number, number];
  heading?: number;
  speed?: number;
  plateNumber?: string;
  vehicleType?: string;
}

interface LeafletMapCanvasProps {
  center?: [number, number];
  zoom?: number;
  pickupPosition?: [number, number] | null;
  deliveryPosition?: [number, number] | null;
  routeCoordinates?: ([number, number] | { lat: number; lng: number })[];
  plannedCoordinates?: ([number, number] | { lat: number; lng: number })[];
  routeType?: 'actual' | 'planned';
  playbackVehicle?: PlaybackVehicleData | null;
  onMapClick?: (lat: number, lng: number) => void;
  onPickupDrag?: (lat: number, lng: number) => void;
  onDeliveryDrag?: (lat: number, lng: number) => void;
  className?: string;
  readOnly?: boolean;
  showGeofence?: boolean;
}

export default function LeafletMapCanvas({
  center = [24.7136, 46.6753],
  zoom = 11,
  pickupPosition,
  deliveryPosition,
  routeCoordinates,
  plannedCoordinates,
  routeType,
  playbackVehicle,
  onMapClick,
  onPickupDrag,
  onDeliveryDrag,
  className = 'h-[320px] w-full',
  readOnly = false,
  showGeofence = false,
}: LeafletMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const pickupGeofenceRef = useRef<L.Circle | null>(null);
  const deliveryMarkerRef = useRef<L.Marker | null>(null);
  const deliveryGeofenceRef = useRef<L.Circle | null>(null);
  const playbackMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const routePolylineCasingRef = useRef<L.Polyline | null>(null);
  const plannedPolylineRef = useRef<L.Polyline | null>(null);

  const onMapClickRef = useRef(onMapClick);
  const onPickupDragRef = useRef(onPickupDrag);
  const onDeliveryDragRef = useRef(onDeliveryDrag);

  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  useEffect(() => {
    onPickupDragRef.current = onPickupDrag;
  }, [onPickupDrag]);

  useEffect(() => {
    onDeliveryDragRef.current = onDeliveryDrag;
  }, [onDeliveryDrag]);

  // 1. تهيئة الخريطة وتنظيف الموارد
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialLat = pickupPosition ? pickupPosition[0] : center[0];
    const initialLng = pickupPosition ? pickupPosition[1] : center[1];

    const map = L.map(containerRef.current, {
      center: [initialLat, initialLng],
      zoom,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    const tileLayer = L.tileLayer(UNIFIED_MAP_TILE_URL, {
      maxZoom: 19,
      attribution: UNIFIED_MAP_ATTRIBUTION,
      subdomains: 'abcd',
    }).addTo(map);

    let hasFallenBack = false;
    tileLayer.on('tileerror', () => {
      if (!hasFallenBack) {
        hasFallenBack = true;
        tileLayer.setUrl('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
      }
    });

    if (!readOnly) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (onMapClickRef.current) {
          onMapClickRef.current(e.latlng.lat, e.latlng.lng);
        }
      });
    }

    mapRef.current = map;

    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 300);
    const t3 = setTimeout(() => map.invalidateSize(), 600);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (resizeObserver) resizeObserver.disconnect();
      if (pickupGeofenceRef.current) pickupGeofenceRef.current.remove();
      if (deliveryGeofenceRef.current) deliveryGeofenceRef.current.remove();
      if (playbackMarkerRef.current) playbackMarkerRef.current.remove();
      map.remove();
      mapRef.current = null;
      pickupMarkerRef.current = null;
      pickupGeofenceRef.current = null;
      deliveryMarkerRef.current = null;
      deliveryGeofenceRef.current = null;
      playbackMarkerRef.current = null;
      routePolylineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. تحديث نقطة الانطلاق (Pickup A)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (pickupPosition) {
      if (!pickupMarkerRef.current) {
        const marker = L.marker(pickupPosition, {
          icon: createUnifiedLocationPin('pickup', 'نقطة الانطلاق (A)'),
          draggable: !readOnly,
          zIndexOffset: 800,
        }).addTo(map);

        marker.on('dragend', (e: L.LeafletEvent) => {
          const markerTarget = e.target as L.Marker;
          const posLatLng = markerTarget.getLatLng();
          if (onPickupDragRef.current) {
            onPickupDragRef.current(posLatLng.lat, posLatLng.lng);
          }
        });

        pickupMarkerRef.current = marker;
      } else {
        pickupMarkerRef.current.setLatLng(pickupPosition);
      }

      if (showGeofence) {
        if (!pickupGeofenceRef.current) {
          pickupGeofenceRef.current = L.circle(pickupPosition, {
            radius: 80,
            color: '#10b981',
            weight: 1.5,
            dashArray: '4, 4',
            fillColor: '#10b981',
            fillOpacity: 0.12,
          }).addTo(map);
        } else {
          pickupGeofenceRef.current.setLatLng(pickupPosition);
        }
      } else if (pickupGeofenceRef.current) {
        pickupGeofenceRef.current.remove();
        pickupGeofenceRef.current = null;
      }

      if (!deliveryPosition) {
        map.panTo(pickupPosition, { animate: true });
      }
    } else {
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.remove();
        pickupMarkerRef.current = null;
      }
      if (pickupGeofenceRef.current) {
        pickupGeofenceRef.current.remove();
        pickupGeofenceRef.current = null;
      }
    }
  }, [pickupPosition, readOnly, showGeofence]);

  // 3. تحديث نقطة التسليم (Delivery B)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (deliveryPosition) {
      if (!deliveryMarkerRef.current) {
        const marker = L.marker(deliveryPosition, {
          icon: createUnifiedLocationPin('delivery', 'نقطة التسليم (B)'),
          draggable: !readOnly,
          zIndexOffset: 800,
        }).addTo(map);

        marker.on('dragend', (e: L.LeafletEvent) => {
          const markerTarget = e.target as L.Marker;
          const posLatLng = markerTarget.getLatLng();
          if (onDeliveryDragRef.current) {
            onDeliveryDragRef.current(posLatLng.lat, posLatLng.lng);
          }
        });

        deliveryMarkerRef.current = marker;
      } else {
        deliveryMarkerRef.current.setLatLng(deliveryPosition);
      }

      if (showGeofence) {
        if (!deliveryGeofenceRef.current) {
          deliveryGeofenceRef.current = L.circle(deliveryPosition, {
            radius: 80,
            color: '#2563eb',
            weight: 1.5,
            dashArray: '4, 4',
            fillColor: '#2563eb',
            fillOpacity: 0.12,
          }).addTo(map);
        } else {
          deliveryGeofenceRef.current.setLatLng(deliveryPosition);
        }
      } else if (deliveryGeofenceRef.current) {
        deliveryGeofenceRef.current.remove();
        deliveryGeofenceRef.current = null;
      }
    } else {
      if (deliveryMarkerRef.current) {
        deliveryMarkerRef.current.remove();
        deliveryMarkerRef.current = null;
      }
      if (deliveryGeofenceRef.current) {
        deliveryGeofenceRef.current.remove();
        deliveryGeofenceRef.current = null;
      }
    }
  }, [deliveryPosition, readOnly, showGeofence]);

function toLatLngPairs(coords?: ([number, number] | { lat: number; lng: number })[]): [number, number][] {
  if (!coords || !Array.isArray(coords)) return [];
  return coords
    .map((c: any): [number, number] => {
      if (Array.isArray(c)) return [Number(c[0]), Number(c[1])];
      return [Number(c?.lat), Number(c?.lng)];
    })
    .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));
}

  // 4. رسم مسار الرحلة وضبط إطار الرؤية (Fit Bounds)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const normalizedActual = toLatLngPairs(routeCoordinates);
    const normalizedPlanned = toLatLngPairs(plannedCoordinates);

    const isActualRoute = routeType === 'actual' || (normalizedActual.length > 2 && routeType !== 'planned');

    // أ) رسم المسار التخطيطي/المقدر كخط منقط (Dashed Indigo) إذا توفر مع المسار الفعلي
    if (normalizedPlanned.length > 1 && isActualRoute) {
      if (!plannedPolylineRef.current) {
        plannedPolylineRef.current = L.polyline(normalizedPlanned, {
          color: '#6366f1',
          weight: 3.5,
          opacity: 0.75,
          dashArray: '8, 8',
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(map);
      } else {
        plannedPolylineRef.current.setLatLngs(normalizedPlanned);
      }
    } else if (plannedPolylineRef.current) {
      plannedPolylineRef.current.remove();
      plannedPolylineRef.current = null;
    }

    // ب) تحديد المسار الأساسي للعرض
    const coordsToDraw =
      normalizedActual.length > 1
        ? normalizedActual
        : normalizedPlanned.length > 1
          ? normalizedPlanned
          : pickupPosition && deliveryPosition
            ? [pickupPosition, deliveryPosition]
            : null;

    if (coordsToDraw && coordsToDraw.length > 1) {
      if (isActualRoute && normalizedActual.length > 1) {
        // غلاف التوهج الزمردي للمسار الفعلي (مطابق 100% لخريطة التتبع المباشر)
        if (!routePolylineCasingRef.current) {
          routePolylineCasingRef.current = L.polyline(coordsToDraw, {
            color: '#10b981',
            weight: 9,
            opacity: 0.35,
            lineJoin: 'round',
            lineCap: 'round',
          }).addTo(map);
        } else {
          routePolylineCasingRef.current.setLatLngs(coordsToDraw);
        }

        // خط السير الفعلي الصلب الحي
        if (!routePolylineRef.current) {
          routePolylineRef.current = L.polyline(coordsToDraw, {
            color: '#10b981',
            weight: 4.5,
            opacity: 0.95,
            lineJoin: 'round',
            lineCap: 'round',
          }).addTo(map);
        } else {
          routePolylineRef.current.setLatLngs(coordsToDraw);
          routePolylineRef.current.setStyle({ color: '#10b981', weight: 4.5, opacity: 0.95 });
        }
      } else {
        // خط السير المقدر/الافتراضي (أزرق قياسي)
        if (routePolylineCasingRef.current) {
          routePolylineCasingRef.current.remove();
          routePolylineCasingRef.current = null;
        }

        if (!routePolylineRef.current) {
          routePolylineRef.current = L.polyline(coordsToDraw, {
            color: '#2563eb',
            weight: 4,
            opacity: 0.9,
            lineJoin: 'round',
            lineCap: 'round',
          }).addTo(map);
        } else {
          routePolylineRef.current.setLatLngs(coordsToDraw);
          routePolylineRef.current.setStyle({ color: '#2563eb', weight: 4, opacity: 0.9 });
        }
      }

      try {
        const allBoundary = [...coordsToDraw, ...(normalizedPlanned.length > 1 ? normalizedPlanned : [])];
        const bounds = L.latLngBounds(allBoundary);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      } catch { }
    } else {
      if (routePolylineCasingRef.current) {
        routePolylineCasingRef.current.remove();
        routePolylineCasingRef.current = null;
      }
      if (routePolylineRef.current) {
        routePolylineRef.current.remove();
        routePolylineRef.current = null;
      }
    }
  }, [routeCoordinates, plannedCoordinates, routeType, pickupPosition, deliveryPosition]);

  // 5. مؤشر محاكاة حركة المركبة (Playback Replay Simulator Marker)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (playbackVehicle && playbackVehicle.position) {
      const pos: [number, number] = Array.isArray(playbackVehicle.position)
        ? [Number(playbackVehicle.position[0]), Number(playbackVehicle.position[1])]
        : [Number((playbackVehicle.position as any)?.lat), Number((playbackVehicle.position as any)?.lng)];

      if (!Number.isFinite(pos[0]) || !Number.isFinite(pos[1])) return;

      const icon = createUnifiedVehicleMarker({
        plateNumber: playbackVehicle.plateNumber || 'مركبة',
        speed: playbackVehicle.speed || 0,
        heading: playbackVehicle.heading || 0,
        status: (playbackVehicle.speed || 0) > 0 ? 'moving' : 'idle',
        vehicleType: playbackVehicle.vehicleType || 'normal',
        isSelected: true,
      });

      if (!playbackMarkerRef.current) {
        playbackMarkerRef.current = L.marker(pos, {
          icon,
          zIndexOffset: 1200,
        }).addTo(map);
      } else {
        playbackMarkerRef.current.setLatLng(pos);
        playbackMarkerRef.current.setIcon(icon);
      }

      map.panTo(pos, { animate: true, duration: 0.3 });
    } else if (playbackMarkerRef.current) {
      playbackMarkerRef.current.remove();
      playbackMarkerRef.current = null;
    }
  }, [playbackVehicle]);

  const isActualTrack =
    routeType === 'actual' || ((toLatLngPairs(routeCoordinates).length > 2) && routeType !== 'planned');

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[var(--border)] shadow-xs ${className}`}>
      <div ref={containerRef} className="h-full w-full" />
      {isActualTrack && (
        <div className="absolute top-2.5 left-2.5 z-[500] flex items-center gap-1.5 rounded-lg bg-[var(--zd-surface)]/90 px-2.5 py-1 text-[11px] font-bold text-emerald-500 shadow-sm border border-emerald-500/25 backdrop-blur-xs select-none">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          <span>مسار الـ GPS الفعلي 100%</span>
        </div>
      )}
    </div>
  );
}
