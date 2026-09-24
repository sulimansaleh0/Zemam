'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import {
  createUnifiedLocationPin,
  UNIFIED_MAP_TILE_URL,
  UNIFIED_MAP_ATTRIBUTION,
} from '@/features/gps/utils/mapMarkers';

interface LeafletMapCanvasProps {
  center?: [number, number];
  zoom?: number;
  pickupPosition?: [number, number] | null;
  deliveryPosition?: [number, number] | null;
  routeCoordinates?: [number, number][];
  onMapClick?: (lat: number, lng: number) => void;
  onPickupDrag?: (lat: number, lng: number) => void;
  onDeliveryDrag?: (lat: number, lng: number) => void;
  className?: string;
  readOnly?: boolean;
}

export default function LeafletMapCanvas({
  center = [24.7136, 46.6753],
  zoom = 11,
  pickupPosition,
  deliveryPosition,
  routeCoordinates,
  onMapClick,
  onPickupDrag,
  onDeliveryDrag,
  className = 'h-[360px] w-full',
  readOnly = false,
}: LeafletMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const deliveryMarkerRef = useRef<L.Marker | null>(null);
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

  // تهيئة الخريطة مرة واحدة
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: true,
    });

    L.tileLayer(UNIFIED_MAP_TILE_URL, {
      maxZoom: 19,
      attribution: UNIFIED_MAP_ATTRIBUTION,
    }).addTo(map);

    if (!readOnly) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (onMapClickRef.current) {
          onMapClickRef.current(e.latlng.lat, e.latlng.lng);
        }
      });
    }

    mapRef.current = map;

    // إصلاح مشاكل الأبعاد عند العرض داخل Modals
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // تحديث نقطة الانطلاق
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (pickupPosition) {
      if (!pickupMarkerRef.current) {
        const marker = L.marker(pickupPosition, {
          icon: createUnifiedLocationPin('pickup', 'نقطة الانطلاق A'),
          draggable: !readOnly,
        }).addTo(map);

        marker.on('dragend', (e: any) => {
          const pos = e.target.getLatLng();
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

  // تحديث نقطة التسليم
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (deliveryPosition) {
      if (!deliveryMarkerRef.current) {
        const marker = L.marker(deliveryPosition, {
          icon: createUnifiedLocationPin('delivery', 'نقطة التسليم B'),
          draggable: !readOnly,
        }).addTo(map);

        marker.on('dragend', (e: any) => {
          const pos = e.target.getLatLng();
          if (onDeliveryDragRef.current) {
            onDeliveryDragRef.current(pos.lat, pos.lng);
          }
        });

        deliveryMarkerRef.current = marker;
      } else {
        deliveryMarkerRef.current.setLatLng(deliveryPosition);
      }
    } else if (deliveryMarkerRef.current) {
      deliveryMarkerRef.current.remove();
      deliveryMarkerRef.current = null;
    }
  }, [deliveryPosition, readOnly]);

  // تحديث مسار الطريق (Polyline) وضبط نطاق الرؤية
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (routeCoordinates && routeCoordinates.length > 1) {
      if (!routePolylineRef.current) {
        routePolylineRef.current = L.polyline(routeCoordinates, {
          color: '#2563eb',
          weight: 5,
          opacity: 0.85,
          lineJoin: 'round',
        }).addTo(map);
      } else {
        routePolylineRef.current.setLatLngs(routeCoordinates);
      }

      // ضبط زاوية الرؤية لتشمل المسار بالكامل
      try {
        const bounds = L.latLngBounds(routeCoordinates);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      } catch {}
    } else if (pickupPosition && deliveryPosition) {
      // إذا لم يتوفر مسار بعد، ارسم خطاً مستقيماً مؤقتاً
      const line = [pickupPosition, deliveryPosition];
      if (!routePolylineRef.current) {
        routePolylineRef.current = L.polyline(line, {
          color: '#2563eb',
          weight: 4,
          dashArray: '8, 8',
          opacity: 0.7,
        }).addTo(map);
      } else {
        routePolylineRef.current.setLatLngs(line);
      }

      try {
        const bounds = L.latLngBounds(line);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      } catch {}
    } else {
      if (routePolylineRef.current) {
        routePolylineRef.current.remove();
        routePolylineRef.current = null;
      }
      if (pickupPosition) {
        map.panTo(pickupPosition);
      } else if (deliveryPosition) {
        map.panTo(deliveryPosition);
      }
    }
  }, [routeCoordinates, pickupPosition, deliveryPosition]);

  return (
    <div className={`relative overflow-hidden rounded-xl border border-[var(--zd-line)] ${className}`}>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
