'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  Crosshair,
  Layers,
  Maximize2,
  Minimize2,
  Navigation,
  Pin,
  Satellite,
  Sun,
  Moon,
  Map as MapIcon,
  Check,
} from 'lucide-react';
import {
  MAP_TILE_STYLES,
  type MapTileStyleId,
} from '../utils/mapMarkers';

interface MapControlsProps {
  currentStyleId: MapTileStyleId;
  onStyleChange: (styleId: MapTileStyleId) => void;
  onFitFleet?: () => void;
  onLocateMe?: () => void;
  onSaveHq?: () => void;
  isFollowingVehicle?: boolean;
  onToggleFollowVehicle?: () => void;
  selectedVehiclePlate?: string;
  hasSelectedVehicle?: boolean;
  containerElement?: HTMLElement | null;
  className?: string;
}

export function MapControls({
  currentStyleId,
  onStyleChange,
  onFitFleet,
  onLocateMe,
  onSaveHq,
  isFollowingVehicle = false,
  onToggleFollowVehicle,
  selectedVehiclePlate,
  hasSelectedVehicle = false,
  containerElement,
  className = '',
}: MapControlsProps) {
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const layersDropdownRef = useRef<HTMLDivElement>(null);

  // إغلاق القائمة المنسدلة عند النقر خارجها
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

  // تبديل ملء الشاشة للحاوية المحددة
  const toggleFullscreen = () => {
    const target = containerElement || document.documentElement;
    if (!document.fullscreenElement) {
      target.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const stylesList: { id: MapTileStyleId; name: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'voyager',
      name: 'شوارع حديثة',
      desc: 'وضوح فائق وتفاصيل لوجستية نقية',
      icon: <Sun className="h-4 w-4 text-amber-500" />,
    },
    {
      id: 'dark',
      name: 'وضع تكتيكي ليلي',
      desc: 'نمط غرف العمليات التكتيكية والتباين العالي',
      icon: <Moon className="h-4 w-4 text-sky-400" />,
    },
    {
      id: 'satellite',
      name: 'أقمار صناعية',
      desc: 'تصوير جوي واقعي للمباني والمستودعات',
      icon: <Satellite className="h-4 w-4 text-emerald-400" />,
    },
    {
      id: 'streets',
      name: 'شوارع كلاسيكية',
      desc: 'خريطة OpenStreetMap التفصيلية',
      icon: <MapIcon className="h-4 w-4 text-blue-400" />,
    },
  ];

  return (
    <div className={`relative z-[500] flex items-center gap-1.5 rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface)]/90 p-1.5 shadow-xl backdrop-blur-md transition-all ${className}`} dir="rtl">
      {/* ── 1. مبدل الطبقات والأنماط (Layer Switcher) ── */}
      <div className="relative" ref={layersDropdownRef}>
        <button
          type="button"
          onClick={() => setIsLayersOpen(!isLayersOpen)}
          className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
            isLayersOpen
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-[var(--zd-text)] hover:bg-[var(--zd-surface-2)]'
          }`}
          title="تغيير مظهر وطبقات الخريطة"
        >
          <Layers className="h-3.5 w-3.5 text-blue-500" />
          <span className="hidden sm:inline">مظهر الخريطة</span>
        </button>

        {isLayersOpen && (
          <div className="absolute top-full start-0 mt-2 w-64 rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-2 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
            <div className="px-2.5 py-1.5 text-[11px] font-extrabold text-[var(--zd-muted)] border-b border-[var(--zd-line)] mb-1">
              اختر طبقة الخريطة المفضلة:
            </div>
            <div className="space-y-1">
              {stylesList.map((s) => {
                const isActive = currentStyleId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      onStyleChange(s.id);
                      setIsLayersOpen(false);
                    }}
                    className={`flex w-full items-start gap-2.5 rounded-xl p-2 text-right transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600/15 border border-blue-500/30 text-blue-500 font-bold'
                        : 'text-[var(--zd-text)] hover:bg-[var(--zd-surface-2)]'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{s.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{s.name}</span>
                        {isActive && <Check className="h-3.5 w-3.5 text-blue-500" />}
                      </div>
                      <p className="text-[10px] text-[var(--zd-muted)] leading-tight mt-0.5">{s.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="h-4 w-px bg-[var(--zd-line)]" />

      {/* ── 2. زر تتبع الكاميرا التلقائي للمركبة ── */}
      {hasSelectedVehicle && onToggleFollowVehicle && (
        <>
          <button
            type="button"
            onClick={onToggleFollowVehicle}
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              isFollowingVehicle
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 ring-2 ring-emerald-400/30'
                : 'text-[var(--zd-text)] hover:bg-[var(--zd-surface-2)]'
            }`}
            title={isFollowingVehicle ? 'إلغاء التتبع التلقائي للكاميرا' : 'تفعيل تتبع الكاميرا التلقائي للمركبة'}
          >
            <Navigation className={`h-3.5 w-3.5 ${isFollowingVehicle ? 'text-white animate-spin' : 'text-emerald-500'}`} />
            <span className="hidden md:inline">
              {isFollowingVehicle ? 'الكاميرا تتبع المركبة' : 'تتبع المركبة'}
            </span>
          </button>
          <div className="h-4 w-px bg-[var(--zd-line)]" />
        </>
      )}

      {/* ── 3. تركيز الكاميرا على كامل الأسطول ── */}
      {onFitFleet && (
        <button
          type="button"
          onClick={onFitFleet}
          className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[var(--zd-text)] hover:bg-[var(--zd-surface-2)] transition-colors cursor-pointer"
          title="عرض كامل أسطول الشركة في زاوية الرؤية"
        >
          <Crosshair className="h-3.5 w-3.5 text-blue-500" />
          <span className="hidden sm:inline">كل الأسطول</span>
        </button>
      )}

      {/* ── 4. التمركز على موقعي ── */}
      {onLocateMe && (
        <button
          type="button"
          onClick={onLocateMe}
          className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[var(--zd-text)] hover:bg-[var(--zd-surface-2)] transition-colors cursor-pointer"
          title="التمركز على موقعي الجغرافي الحالي"
        >
          <Compass className="h-3.5 w-3.5 text-emerald-500" />
          <span className="hidden sm:inline">موقعي</span>
        </button>
      )}

      {/* ── 5. تعيين كمقر ── */}
      {onSaveHq && (
        <button
          type="button"
          onClick={onSaveHq}
          className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[var(--zd-text)] hover:bg-[var(--zd-surface-2)] transition-colors cursor-pointer"
          title="حفظ مركز الخريطة الحالي كمقر رسمي للمنشأة"
        >
          <Pin className="h-3.5 w-3.5 text-amber-500" />
          <span className="hidden lg:inline">تعيين كمقر</span>
        </button>
      )}

      <div className="h-4 w-px bg-[var(--zd-line)]" />

      {/* ── 6. وضع ملء الشاشة ── */}
      <button
        type="button"
        onClick={toggleFullscreen}
        className="flex items-center justify-center rounded-xl p-1.5 text-[var(--zd-text)] hover:bg-[var(--zd-surface-2)] transition-colors cursor-pointer"
        title={isFullscreen ? 'الخروج من ملء الشاشة' : 'تكبير الخريطة ملء الشاشة'}
      >
        {isFullscreen ? (
          <Minimize2 className="h-3.5 w-3.5 text-purple-400" />
        ) : (
          <Maximize2 className="h-3.5 w-3.5 text-purple-400" />
        )}
      </button>
    </div>
  );
}
