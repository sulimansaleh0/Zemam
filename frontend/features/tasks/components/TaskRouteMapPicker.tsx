'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  Compass,
  Crosshair,
  Loader2,
  MapPin,
  Navigation,
  Route,
  Search,
  Timer,
  X,
} from 'lucide-react';
import {
  fetchDrivingRoute,
  searchPlaces,
  reverseGeocodeCoords,
  type GeocodingResult,
  type RouteData,
} from '../utils/mapHelpers';
import type { LocationPoint } from '../types/task.types';

// Dynamic import with SSR disabled for Leaflet map canvas
const LeafletMapCanvas = dynamic(() => import('./LeafletMapCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] w-full flex-col items-center justify-center gap-2.5 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] text-xs text-[var(--zd-muted)]">
      <Compass className="h-7 w-7 animate-spin text-[var(--zd-blue)]" />
      <span>جاري تحميل الخريطة التفاعلية والمسارات...</span>
    </div>
  ),
});

interface TaskRouteMapPickerProps {
  pickupLocation: LocationPoint;
  deliveryLocation: LocationPoint;
  onPickupChange: (loc: LocationPoint) => void;
  onDeliveryChange: (loc: LocationPoint) => void;
  onRouteCalculated?: (route: RouteData) => void;
}

export function TaskRouteMapPicker({
  pickupLocation,
  deliveryLocation,
  onPickupChange,
  onDeliveryChange,
  onRouteCalculated,
}: TaskRouteMapPickerProps) {
  const [activeTarget, setActiveTarget] = useState<'pickup' | 'delivery'>('pickup');
  const activeTargetRef = useRef<'pickup' | 'delivery'>('pickup');

  useEffect(() => {
    activeTargetRef.current = activeTarget;
  }, [activeTarget]);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [routeData, setRouteData] = useState<RouteData | null>(null);

  const searchAbortRef = useRef<AbortController | null>(null);

  const pickupLat = parseFloat(pickupLocation.lat);
  const pickupLng = parseFloat(pickupLocation.lng);
  const hasPickup = !isNaN(pickupLat) && !isNaN(pickupLng);

  const deliveryLat = parseFloat(deliveryLocation.lat);
  const deliveryLng = parseFloat(deliveryLocation.lng);
  const hasDelivery = !isNaN(deliveryLat) && !isNaN(deliveryLng);

  // البحث التفاعلي عن الأماكن والعناوين مع Debounce
  useEffect(() => {
    if (searchAbortRef.current) searchAbortRef.current.abort();

    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    searchAbortRef.current = controller;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchPlaces(trimmed, controller.signal);
      if (!controller.signal.aborted) {
        setSuggestions(results);
        setIsSearching(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  // حساب المسار الفعلي على الطرق ورسمه بمجرد تحديد النقطتين
  useEffect(() => {
    if (!hasPickup || !hasDelivery) {
      setRouteData(null);
      return;
    }

    let isMounted = true;
    const fetchRoute = async () => {
      setIsRouting(true);
      const data = await fetchDrivingRoute(
        [pickupLat, pickupLng],
        [deliveryLat, deliveryLng]
      );
      if (isMounted) {
        setRouteData(data);
        setIsRouting(false);
        if (onRouteCalculated) onRouteCalculated(data);
      }
    };

    fetchRoute();
    return () => {
      isMounted = false;
    };
  }, [pickupLocation.lat, pickupLocation.lng, deliveryLocation.lat, deliveryLocation.lng]);

  // معالجة النقر على الخريطة لتحديد الموقع الفعلي بحسب الهدف النشط حالياً
  const handleMapClick = async (lat: number, lng: number) => {
    const target = activeTargetRef.current;
    const latStr = lat.toFixed(6);
    const lngStr = lng.toFixed(6);
    const address = await reverseGeocodeCoords(lat, lng);

    if (target === 'pickup') {
      onPickupChange({ address, lat: latStr, lng: lngStr });
      // الانتقال التلقائي للهدف الثاني (B) لتسهيل التدفق
      setActiveTarget('delivery');
    } else {
      onDeliveryChange({ address, lat: latStr, lng: lngStr });
    }
  };

  // سحب دبوس الانطلاق A
  const handlePickupDrag = async (lat: number, lng: number) => {
    const latStr = lat.toFixed(6);
    const lngStr = lng.toFixed(6);
    const address = await reverseGeocodeCoords(lat, lng);
    onPickupChange({ address, lat: latStr, lng: lngStr });
  };

  // سحب دبوس التسليم B
  const handleDeliveryDrag = async (lat: number, lng: number) => {
    const latStr = lat.toFixed(6);
    const lngStr = lng.toFixed(6);
    const address = await reverseGeocodeCoords(lat, lng);
    onDeliveryChange({ address, lat: latStr, lng: lngStr });
  };

  // اختيار من نتائج البحث
  const handleSelectPlace = (place: GeocodingResult) => {
    const target = activeTargetRef.current;
    const latStr = place.lat.toFixed(6);
    const lngStr = place.lng.toFixed(6);

    if (target === 'pickup') {
      onPickupChange({ address: place.address, lat: latStr, lng: lngStr });
      setActiveTarget('delivery');
    } else {
      onDeliveryChange({ address: place.address, lat: latStr, lng: lngStr });
    }

    setSearchQuery('');
    setSuggestions([]);
  };

  // جلب إحداثيات موقع المستخدم الحالي بالـ GPS
  const handleUseCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        await handleMapClick(lat, lng);
      },
      (err) => {
        console.warn('Geolocation error:', err);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="space-y-3 rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-4" dir="rtl">
      {/* ── شريط رأس الخريطة وتحديد الهدف ── */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Route className="h-5 w-5 text-[var(--zd-blue)]" />
          <div>
            <h4 className="text-xs font-bold text-[var(--zd-text)]">
              الخريطة التفاعلية وتخطيط مسار الرحلة
            </h4>
            <p className="text-[10px] text-[var(--zd-muted)]">
              انقر على الخريطة أو ابحث لتحديد نقطة الانطلاق ونقطة التسليم ورسم المسار المباشر
            </p>
          </div>
        </div>

        {/* أزرار التبديل بين نقطة الانطلاق ونقطة التسليم */}
        <div className="flex items-center gap-1.5 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] p-1">
          <button
            type="button"
            onClick={() => setActiveTarget('pickup')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTarget === 'pickup'
                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/40'
                : 'text-[var(--zd-muted)] hover:text-[var(--zd-text)]'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>الانطلاق A</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTarget('delivery')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTarget === 'delivery'
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/40'
                : 'text-[var(--zd-muted)] hover:text-[var(--zd-text)]'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            <span>التسليم B</span>
          </button>
        </div>
      </div>

      {/* ── حقل البحث عن العناوين والأماكن ── */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-[var(--zd-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`ابحث عن اسم مكان أو حي لـ ${
                activeTarget === 'pickup' ? 'نقطة الانطلاق A' : 'نقطة التسليم B'
              }...`}
              className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] py-2 pr-9 pl-3 text-xs text-[var(--zd-text)] placeholder-[var(--zd-muted)] focus:border-[var(--zd-blue)] focus:outline-none"
            />
            {isSearching && (
              <Loader2 className="absolute left-3 top-2.5 h-4 w-4 animate-spin text-[var(--zd-blue)]" />
            )}
          </div>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            title="تحديد موقعي الحالي"
            className="flex h-9 items-center gap-1.5 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] px-3 text-xs font-semibold text-[var(--zd-muted)] hover:text-[var(--zd-text)] hover:border-[var(--zd-line-hover)] shrink-0"
          >
            <Crosshair className="h-4 w-4 text-[var(--zd-blue)]" />
            <span className="hidden sm:inline">موقعي الحالي</span>
          </button>
        </div>

        {/* قائمة اقتراحات البحث المنسدلة */}
        {suggestions.length > 0 && (
          <div className="absolute top-full z-50 mt-1.5 w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-1.5 shadow-xl">
            <div className="max-h-48 overflow-y-auto space-y-1">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPlace(item)}
                  className="flex w-full items-start gap-2.5 rounded-lg p-2 text-right text-xs text-[var(--zd-text)] hover:bg-[var(--zd-surface-2)] transition"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--zd-blue)]" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{item.address}</p>
                    <p className="text-[10px] text-[var(--zd-muted)]">
                      {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── مؤشر الهدف النشط الحالي ── */}
      <div className="flex items-center justify-between rounded-xl bg-[var(--zd-surface-2)] px-3 py-2 text-xs">
        <span className="font-bold flex items-center gap-1.5">
          {activeTarget === 'pickup' ? (
            <span className="text-emerald-500">📍 المستهدف حالياً: انقر على الخريطة لتحديد نقطة الانطلاق (A)</span>
          ) : (
            <span className="text-blue-500">🏁 المستهدف حالياً: انقر على الخريطة لتحديد نقطة التسليم (B)</span>
          )}
        </span>
        <span className="text-[10px] text-[var(--zd-muted)] hidden sm:inline">
          (يمكنك سحب الدبابيس 🟢 و 🔵 على الخريطة لتعديل الموقع)
        </span>
      </div>

      {/* ── لوحة الخريطة التفاعلية ── */}
      <LeafletMapCanvas
        pickupPosition={hasPickup ? [pickupLat, pickupLng] : null}
        deliveryPosition={hasDelivery ? [deliveryLat, deliveryLng] : null}
        routeCoordinates={routeData?.coordinates}
        onMapClick={handleMapClick}
        onPickupDrag={handlePickupDrag}
        onDeliveryDrag={handleDeliveryDrag}
        className="h-[250px] w-full shadow-inner rounded-xl"
      />

      {/* ── ملخص المسار والمسافة الحقيقية والوقت المقدر ── */}
      {routeData && (
        <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5 text-xs text-[var(--zd-text)]">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shrink-0">
              <Route className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] text-[var(--zd-muted)]">المسافة الفعلية</p>
              <p className="text-xs font-bold text-blue-400">
                {routeData.distanceKm} كم
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm shrink-0">
              <Timer className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] text-[var(--zd-muted)]">الوقت المتوقع</p>
              <p className="text-xs font-bold text-emerald-400">
                {routeData.durationMinutes} دقيقة تقريباً
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── العناوين الحالية المحددة ── */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-[11px]">
        <div className="flex items-center gap-2 rounded-lg border border-[var(--zd-line)] bg-[var(--zd-surface-2)] p-2">
          <MapPin className="h-4 w-4 shrink-0 text-emerald-500" />
          <div className="min-w-0 flex-1">
            <span className="font-bold text-emerald-500">الانطلاق A:</span>{' '}
            <span className="text-[var(--zd-text)] truncate inline-block max-w-[160px] align-bottom">
              {pickupLocation.address || 'لم يُحدد بعد'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-[var(--zd-line)] bg-[var(--zd-surface-2)] p-2">
          <Navigation className="h-4 w-4 shrink-0 text-blue-500" />
          <div className="min-w-0 flex-1">
            <span className="font-bold text-blue-500">التسليم B:</span>{' '}
            <span className="text-[var(--zd-text)] truncate inline-block max-w-[160px] align-bottom">
              {deliveryLocation.address || 'لم يُحدد بعد'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
