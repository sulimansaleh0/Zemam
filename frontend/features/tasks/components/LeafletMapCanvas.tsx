'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import {
  createUnifiedLocationPin,
  createUnifiedVehicleMarker,
  MAP_TILE_STYLES,
  type MapTileStyleId,
} from '@/features/gps/utils/mapMarkers';
import { Layers, Maximize2, Minimize2, Check } from 'lucide-react';

const MAP_STYLE_STORAGE_KEY = 'zemam_map_style_preference';

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
  className = 'h-[360px] w-full',
  readOnly = false,
  showGeofence = true,
}: LeafletMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const deliveryMarkerRef = useRef<L.Marker | null>(null);
  const pickupGeofenceRef = useRef<L.Circle | null>(null);
  const deliveryGeofenceRef = useRef<L.Circle | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const routeGlowPolylineRef = useRef<L.Polyline | null>(null);
  const routeFlowPolylineRef = useRef<L.Polyline | null>(null);
  const playbackMarkerRef = useRef<L.Marker | null>(null);

  const [currentStyleId, setCurrentStyleId] = useState<MapTileStyleId>('voyager');
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const layersDropdownRef = useRef<HTMLDivElement>(null);

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

  // استرجاع تفضيل نمط الخريطة
  useEffect(() => {
    try {
      const savedStyle = localStorage.getItem(MAP_STYLE_STORAGE_KEY) as MapTileStyleId;
      if (savedStyle && MAP_TILE_STYLES[savedStyle]) {
        setCurrentStyleId(savedStyle);
      }
    } catch { }
  }, []);

  // إغلاق قائمة الطبقات عند النقر خارجها
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        layersDropdownRef.current &&
        !layersDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLayersOpen(false);
      }
    }
    if (isLayersOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLayersOpen]);

  // 1. تهيئة الخريطة
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
    L.control.scale({ imperial: false, metric: true, position: 'bottomright' }).addTo(map);

    const styleConfig = MAP_TILE_STYLES[currentStyleId] || MAP_TILE_STYLES.voyager;
    const tileLayer = L.tileLayer(styleConfig.url, {
      maxZoom: styleConfig.maxZoom,
      attribution: styleConfig.attribution,
      subdomains: (styleConfig.subdomains as any) || 'abc',
    }).addTo(map);

    tileLayerRef.current = tileLayer;

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
    }, 250);

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
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
      pickupMarkerRef.current = null;
      deliveryMarkerRef.current = null;
      pickupGeofenceRef.current = null;
      deliveryGeofenceRef.current = null;
      routePolylineRef.current = null;
      routeGlowPolylineRef.current = null;
      routeFlowPolylineRef.current = null;
      playbackMarkerRef.current = null;
    };
  }, []);

  // تبديل طبقة البلاطات
  const handleStyleChange = useCallback((newStyleId: MapTileStyleId) => {
    setCurrentStyleId(newStyleId);
    try {
      localStorage.setItem(MAP_STYLE_STORAGE_KEY, newStyleId);
    } catch { }

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

  // 2. تحديث نقطة الانطلاق (Pickup A) مع النطاق الجغرافي
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

      // رسم دائرة النطاق الجغرافي للوصول (Geofence Radius 80m)
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

  // 3. تحديث نقطة التسليم (Delivery B) مع النطاق الجغرافي
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

      // رسم دائرة النطاق الجغرافي للوصول (Geofence Radius 80m)
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

  // 4. تحديث مسار الطريق (Polyline مع توهج وأسهم انسيابية متحركة)
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
      // 1. غلاف التوهج الخارجي
      if (!routeGlowPolylineRef.current) {
        routeGlowPolylineRef.current = L.polyline(coordsToDraw, {
          color: '#1d4ed8',
          weight: 8,
          opacity: 0.35,
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(map);
      } else {
        routeGlowPolylineRef.current.setLatLngs(coordsToDraw);
      }

      // 2. الخط الرئيسي الصلب
      if (!routePolylineRef.current) {
        routePolylineRef.current = L.polyline(coordsToDraw, {
          color: '#2563eb',
          weight: 4.5,
          opacity: 0.95,
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(map);
      } else {
        routePolylineRef.current.setLatLngs(coordsToDraw);
      }

      // 3. خط الحركة الانسيابي المتحرك (Flow Dashes)
      if (!routeFlowPolylineRef.current) {
        routeFlowPolylineRef.current = L.polyline(coordsToDraw, {
          color: '#93c5fd',
          weight: 2.5,
          dashArray: '8, 16',
          className: 'zemam-flow-path',
          opacity: 0.85,
          lineCap: 'round',
        }).addTo(map);
      } else {
        routeFlowPolylineRef.current.setLatLngs(coordsToDraw);
      }

      // ضبط زاوية الرؤية
      try {
        const bounds = L.latLngBounds(coordsToDraw);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } catch { }
    } else {
      if (routeGlowPolylineRef.current) {
        routeGlowPolylineRef.current.remove();
        routeGlowPolylineRef.current = null;
      }
      if (routePolylineRef.current) {
        routePolylineRef.current.remove();
        routePolylineRef.current = null;
      }
      if (routeFlowPolylineRef.current) {
        routeFlowPolylineRef.current.remove();
        routeFlowPolylineRef.current = null;
      }
      if (pickupPosition) {
        map.panTo(pickupPosition);
      } else if (deliveryPosition) {
        map.panTo(deliveryPosition);
      }
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

      // تحريك سلس للكاميرا مع المركبة المتحركة
      map.panTo(playbackVehicle.position, { animate: true, duration: 0.3 });
    } else if (playbackMarkerRef.current) {
      playbackMarkerRef.current.remove();
      playbackMarkerRef.current = null;
    }
  }, [playbackVehicle]);

  // ملء الشاشة
  const toggleFullscreen = () => {
    const target = containerRef.current?.parentElement || containerRef.current;
    if (!document.fullscreenElement) {
      target?.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => { });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => { });
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[var(--zd-line)] shadow-sm ${className}`}>
      {/* حاوية الخريطة */}
      <div ref={containerRef} className="h-full w-full" />

      {/* عناصر التحكم العائمة (Floating Controls) في الزاوية العلوية */}
      <div className="absolute top-2.5 start-2.5 z-[500] flex items-center gap-1.5 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)]/90 p-1 shadow-lg backdrop-blur-md" dir="rtl">
        {/* مبدل الطبقات */}
        <div className="relative" ref={layersDropdownRef}>
          <button
            type="button"
            onClick={() => setIsLayersOpen(!isLayersOpen)}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-[var(--zd-text)] hover:bg-[var(--zd-surface-2)] transition cursor-pointer"
            title="تغيير طبقة الخريطة"
          >
            <Layers className="h-3.5 w-3.5 text-blue-500" />
            <span className="hidden sm:inline">الطبقات</span>
          </button>

          {isLayersOpen && (
            <div className="absolute top-full start-0 mt-1.5 w-48 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-1.5 shadow-xl backdrop-blur-xl">
              {(Object.keys(MAP_TILE_STYLES) as MapTileStyleId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    handleStyleChange(id);
                    setIsLayersOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-right text-xs transition cursor-pointer ${currentStyleId === id
                      ? 'bg-blue-600/15 font-bold text-blue-500'
                      : 'text-[var(--zd-text)] hover:bg-[var(--zd-surface-2)]'
                    }`}
                >
                  <span>{MAP_TILE_STYLES[id].name}</span>
                  {currentStyleId === id && <Check className="h-3.5 w-3.5 text-blue-500" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-3 w-px bg-[var(--zd-line)]" />

        {/* زر ملء الشاشة */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="flex items-center justify-center rounded-lg p-1 text-[var(--zd-text)] hover:bg-[var(--zd-surface-2)] transition cursor-pointer"
          title={isFullscreen ? 'الخروج من ملء الشاشة' : 'تكبير ملء الشاشة'}
        >
          {isFullscreen ? (
            <Minimize2 className="h-3.5 w-3.5 text-purple-400" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5 text-purple-400" />
          )}
        </button>
      </div>
    </div>
  );
}
