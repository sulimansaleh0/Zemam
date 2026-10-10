'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Compass, Route } from 'lucide-react';
import type { LocationPoint } from '../types/task.types';
import type { RouteData } from '../utils/mapHelpers';
import { useTaskRoutePicker } from '../hooks/useTaskRoutePicker';
import { TaskPlaceSearchBar } from './TaskPlaceSearchBar';
import { TaskRouteMetrics } from './TaskRouteMetrics';

const LeafletMapCanvas = dynamic(() => import('./LeafletMapCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] w-full flex-col items-center justify-center gap-2.5 rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] text-xs text-[var(--zd-muted)]">
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
  const {
    activeTarget,
    setActiveTarget,
    searchQuery,
    handleSearchChange,
    suggestions,
    isSearching,
    routeData,
    pickupCoords,
    deliveryCoords,
    handleMapClick,
    handlePickupDrag,
    handleDeliveryDrag,
    handleSelectPlace,
    handleUseCurrentLocation,
  } = useTaskRoutePicker({
    pickupLocation,
    deliveryLocation,
    onPickupChange,
    onDeliveryChange,
    onRouteCalculated,
  });

  return (
    <div className="space-y-3 rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-4" dir="rtl">
      {/* ── شريط رأس الخريطة وأزرار التبديل ── */}
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
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
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
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
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
      <TaskPlaceSearchBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        isSearching={isSearching}
        suggestions={suggestions}
        onSelectPlace={handleSelectPlace}
        onUseCurrentLocation={handleUseCurrentLocation}
        activeTarget={activeTarget}
      />

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
        pickupPosition={pickupCoords}
        deliveryPosition={deliveryCoords}
        routeCoordinates={routeData?.coordinates}
        onMapClick={handleMapClick}
        onPickupDrag={handlePickupDrag}
        onDeliveryDrag={handleDeliveryDrag}
        showGeofence={true}
        className="h-[300px] w-full shadow-inner rounded-2xl"
      />

      {/* ── ملخص المسار والعناوين ── */}
      <TaskRouteMetrics
        routeData={routeData}
        pickupLocation={pickupLocation}
        deliveryLocation={deliveryLocation}
      />
    </div>
  );
}
