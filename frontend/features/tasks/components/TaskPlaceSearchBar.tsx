'use client';

import React from 'react';
import { Crosshair, Loader2, MapPin, Search } from 'lucide-react';
import type { GeocodingResult } from '../utils/mapHelpers';

interface TaskPlaceSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearching: boolean;
  suggestions: GeocodingResult[];
  onSelectPlace: (place: GeocodingResult) => void;
  onUseCurrentLocation: () => void;
  activeTarget: 'pickup' | 'delivery';
}

export function TaskPlaceSearchBar({
  searchQuery,
  onSearchChange,
  isSearching,
  suggestions,
  onSelectPlace,
  onUseCurrentLocation,
  activeTarget,
}: TaskPlaceSearchBarProps) {
  const targetLabel = activeTarget === 'pickup' ? 'نقطة الانطلاق A' : 'نقطة التسليم B';

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-[var(--zd-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`ابحث عن اسم مكان أو حي لـ ${targetLabel}...`}
            className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] py-2 pr-9 pl-3 text-xs text-[var(--zd-text)] placeholder-[var(--zd-muted)] focus:border-[var(--zd-blue)] focus:outline-none"
          />
          {isSearching && (
            <Loader2 className="absolute left-3 top-2.5 h-4 w-4 animate-spin text-[var(--zd-blue)]" />
          )}
        </div>

        <button
          type="button"
          onClick={onUseCurrentLocation}
          title="تحديد موقعي الحالي"
          className="flex h-9 items-center gap-1.5 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] px-3 text-xs font-semibold text-[var(--zd-muted)] hover:text-[var(--zd-text)] hover:border-[var(--zd-line-hover)] shrink-0 cursor-pointer"
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
                onClick={() => onSelectPlace(item)}
                className="flex w-full items-start gap-2.5 rounded-lg p-2 text-right text-xs text-[var(--zd-text)] hover:bg-[var(--zd-surface-2)] transition cursor-pointer"
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
  );
}
