'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  createUnifiedLocationPin,
  createUnifiedVehicleMarker,
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
  routeCoordinates?: [number, number][];
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
  const deliveryMarkerRef = useRef<L.Marker | null>(null);
  const deliveryGeofenceRef = useRef<L.Circle | null>(null);
  const playbackMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

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

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
    }).addTo(map);

    if (!readOnly) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (onMapClickRef.current) {
          onMapClickRef.current(e.latlng.lat, e.latlng.lng);
        }
      });
    }

    mapRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timer);
      if (resizeObserver) resizeObserver.disconnect();
      if (deliveryGeofenceRef.current) deliveryGeofenceRef.current.remove();
      if (playbackMarkerRef.current) playbackMarkerRef.current.remove();
      map.remove();
      mapRef.current = null;
      pickupMarkerRef.current = null;
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
          const pos = markerTarget.getLatLng();
          if (onPickupDragRef.current) {
            onPickupDragRef.current(pos.lat, pos.lng);
          }
        });

        pickupMarkerRef.current = marker;
      } else {
        pickupMarkerRef.current.setLatLng(pickupPosition);
      }
    } else if (pickupMarkerRef.current) {
      pickupMarkerRef.current.remove();
      pickupMarkerRef.current = null;
    }
  }, [pickupPosition, readOnly]);

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
          const pos = markerTarget.getLatLng();
          if (onDeliveryDragRef.current) {
            onDeliveryDragRef.current(pos.lat, pos.lng);
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

  // 4. رسم مسار الرحلة وضبط إطار الرؤية (Fit Bounds)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const coordsToDraw =
      routeCoordinates && routeCoordinates.length > 1
        ? routeCoordinates
        : pickupPosition && deliveryPosition
          ? [pickupPosition, deliveryPosition]
          : null;

    if (coordsToDraw && coordsToDraw.length > 1) {
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
      }

      try {
        const bounds = L.latLngBounds(coordsToDraw);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      } catch { }
    } else if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }
  }, [routeCoordinates, pickupPosition, deliveryPosition]);

  // 5. مؤشر محاكاة حركة المركبة (Playback Replay Simulator Marker)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (playbackVehicle && playbackVehicle.position) {
      const icon = createUnifiedVehicleMarker({
        plateNumber: playbackVehicle.plateNumber || 'مركبة',
        speed: playbackVehicle.speed || 0,
        heading: playbackVehicle.heading || 0,
        status: (playbackVehicle.speed || 0) > 0 ? 'moving' : 'idle',
        vehicleType: playbackVehicle.vehicleType || 'normal',
        isSelected: true,
      });

      if (!playbackMarkerRef.current) {
        playbackMarkerRef.current = L.marker(playbackVehicle.position, {
          icon,
          zIndexOffset: 1200,
        }).addTo(map);
      } else {
        playbackMarkerRef.current.setLatLng(playbackVehicle.position);
        playbackMarkerRef.current.setIcon(icon);
      }

      map.panTo(playbackVehicle.position, { animate: true, duration: 0.3 });
    } else if (playbackMarkerRef.current) {
      playbackMarkerRef.current.remove();
      playbackMarkerRef.current = null;
    }
  }, [playbackVehicle]);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[var(--border)] shadow-xs ${className}`}>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
