'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FastForward,
  Gauge,
  MapPin,
  Navigation,
  Pause,
  Play,
  RotateCcw,
  Route,
  Timer,
  Truck,
  User,
  Zap,
} from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';
import type { TripSummary } from '../types/gps.types';
import { decodePolyline } from '../utils/gpsHelpers';
import type { PlaybackVehicleData } from '@/features/tasks/components/LeafletMapCanvas';

const LeafletMapCanvas = dynamic(
  () => import('@/features/tasks/components/LeafletMapCanvas'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[280px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] text-xs text-[var(--zd-muted)]">
        <Compass className="h-6 w-6 animate-spin text-blue-500" />
        <span>جاري تحميل مسار الرحلة والبيانات الملاحية...</span>
      </div>
    ),
  }
);

interface TripSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: TripSummary | null;
}

function calculateBearing(start: [number, number], end: [number, number]): number {
  const startLat = (start[0] * Math.PI) / 180;
  const startLng = (start[1] * Math.PI) / 180;
  const endLat = (end[0] * Math.PI) / 180;
  const endLng = (end[1] * Math.PI) / 180;
  const dLng = endLng - startLng;
  const y = Math.sin(dLng) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  return Math.round((brng + 360) % 360);
}

export function TripSummaryModal({
  isOpen,
  onClose,
  summary,
}: TripSummaryModalProps) {
  // فك تشفير المسار المضغوط
  const routeCoordinates = useMemo(() => {
    if (!summary?.encodedPath) return [];
    return decodePolyline(summary.encodedPath);
  }, [summary?.encodedPath]);

  // حالة محاكي تشغيل الرحلة (Trip Replay Simulator)
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4>(1);

  // إعادة ضبط المحاكي عند فتح النافذة
  useEffect(() => {
    setIsPlaying(false);
    setPlaybackIndex(0);
  }, [isOpen, summary?.taskId]);

  // مؤقت تشغيل المحاكي
  useEffect(() => {
    if (!isPlaying || routeCoordinates.length <= 1) return;

    const intervalMs = Math.max(80, Math.floor(400 / playbackSpeed));
    const timer = setInterval(() => {
      setPlaybackIndex((prev) => {
        if (prev >= routeCoordinates.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, routeCoordinates.length]);

  if (!summary) return null;

  const pickupCoord: [number, number] | null =
    summary.startLocation?.lat && summary.startLocation?.lng
      ? [summary.startLocation.lat, summary.startLocation.lng]
      : null;

  const deliveryCoord: [number, number] | null =
    summary.endLocation?.lat && summary.endLocation?.lng
      ? [summary.endLocation.lat, summary.endLocation.lng]
      : null;

  // حساب بيانات المركبة المتحركة في المحاكي
  let playbackVehicle: PlaybackVehicleData | null = null;
  if (routeCoordinates.length > 0) {
    const curPos = routeCoordinates[playbackIndex] || routeCoordinates[0];
    const nextPos = routeCoordinates[Math.min(playbackIndex + 1, routeCoordinates.length - 1)];
    const heading = nextPos && curPos ? calculateBearing(curPos, nextPos) : 0;

    playbackVehicle = {
      position: curPos,
      heading,
      speed: summary.averageSpeed,
      plateNumber: summary.plateNumber || 'مركبة زمام',
    };
  }

  const progressPercent =
    routeCoordinates.length > 1
      ? Math.round((playbackIndex / (routeCoordinates.length - 1)) * 100)
      : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ملخص الرحلة الفعلي والتتبع المنجز"
      description="بيانات الأداء الميداني الدقيقة والمسار المقطوع للمهمة مع محاكي الإعادة"
      icon={Route}
      iconClassName="text-blue-500"
      maxWidth="3xl"
    >
      <div className="space-y-4 pt-2 text-[var(--zd-text)]" dir="rtl">
        {/* معلومات المركبة والسائق */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] p-3 text-xs">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-blue-500" />
            <span className="font-bold">{summary.plateNumber || 'مركبة أسطول'}</span>
            <span className="text-[var(--zd-muted)]">• المهمة: {summary.taskTitle || summary.taskId}</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--zd-muted)]">
            <User className="h-4 w-4 text-blue-500" />
            <span>السائق: <strong className="text-[var(--zd-text)]">{summary.driverName || 'سائق'}</strong></span>
          </div>
        </div>

        {/* كروت القياسات الأربعة الذكية */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* إجمالي المسافة */}
          <div className="rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3 text-center shadow-xs">
            <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--zd-muted)]">
              <Route className="h-3.5 w-3.5 text-blue-500" />
              <span>المسافة المقطوعة</span>
            </div>
            <div className="mt-1 text-xl font-black text-blue-600">
              {summary.totalDistanceKm} <span className="text-xs font-normal text-[var(--zd-muted)]">كم</span>
            </div>
          </div>

          {/* مدة القيادة الفعلية */}
          <div className="rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3 text-center shadow-xs">
            <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--zd-muted)]">
              <Timer className="h-3.5 w-3.5 text-emerald-500" />
              <span>زمن الرحلة</span>
            </div>
            <div className="mt-1 text-xl font-black text-emerald-600">
              {summary.durationMinutes} <span className="text-xs font-normal text-[var(--zd-muted)]">دقيقة</span>
            </div>
          </div>

          {/* متوسط السرعة */}
          <div className="rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3 text-center shadow-xs">
            <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--zd-muted)]">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>متوسط السرعة</span>
            </div>
            <div className="mt-1 text-xl font-black text-amber-600">
              {summary.averageSpeed} <span className="text-xs font-normal text-[var(--zd-muted)]">كم/س</span>
            </div>
          </div>

          {/* أقصى سرعة مسجلة */}
          <div className="rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3 text-center shadow-xs">
            <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--zd-muted)]">
              <Gauge className="h-3.5 w-3.5 text-purple-500" />
              <span>أقصى سرعة</span>
            </div>
            <div className="mt-1 text-xl font-black text-purple-600">
              {summary.maxSpeed} <span className="text-xs font-normal text-[var(--zd-muted)]">كم/س</span>
            </div>
          </div>
        </div>

        {/* خريطة مسار الرحلة الفعلي */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--zd-muted)]">
            <span className="font-bold text-[var(--zd-text)] flex items-center gap-1.5">
              <Navigation className="h-4 w-4 text-blue-500" />
              <span>خريطة التتبع الميداني المسجل:</span>
            </span>
            <span className="text-[11px]">
              {routeCoordinates.length > 0
                ? `${routeCoordinates.length} نقطة مسار مفكوكة من النص المضغوط`
                : 'المسار المباشر'}
            </span>
          </div>

          <LeafletMapCanvas
            pickupPosition={pickupCoord}
            deliveryPosition={deliveryCoord}
            routeCoordinates={routeCoordinates}
            playbackVehicle={playbackVehicle}
            className="h-[300px] w-full rounded-2xl border border-[var(--zd-line)] shadow-inner"
            readOnly={true}
          />

          {/* ── شريط محاكي تشغيل الرحلة (Trip Replay Simulator Controls) ── */}
          {routeCoordinates.length > 1 && (
            <div className="rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] p-3 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5 text-blue-500">
                  <Play className="h-3.5 w-3.5" />
                  <span>محاكي إعادة عرض خط السير والسرعات</span>
                </span>
                <span className="text-[11px] font-mono text-[var(--zd-muted)]">
                  النقطة {playbackIndex + 1} من {routeCoordinates.length} ({progressPercent}%)
                </span>
              </div>

              {/* شريط التمرير الزمني التفاعلي */}
              <input
                type="range"
                min={0}
                max={routeCoordinates.length - 1}
                value={playbackIndex}
                onChange={(e) => setPlaybackIndex(Number(e.target.value))}
                className="w-full h-1.5 bg-[var(--zd-line)] rounded-lg appearance-none cursor-pointer accent-blue-600"
              />

              {/* أزرار التحكم بالتشغيل والسرعة */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (playbackIndex >= routeCoordinates.length - 1) {
                        setPlaybackIndex(0);
                      }
                      setIsPlaying(!isPlaying);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition cursor-pointer shadow-xs"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-3.5 w-3.5" />
                        <span>إيقاف مؤقت</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" />
                        <span>تشغيل المحاكاة</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setPlaybackIndex(0);
                    }}
                    className="flex items-center gap-1 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] px-2.5 py-1.5 text-xs text-[var(--zd-text)] hover:bg-[var(--zd-surface-2)] transition cursor-pointer"
                    title="إعادة للمنطلق"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>البداية</span>
                  </button>
                </div>

                {/* مضاعف سرعة المحاكاة */}
                <div className="flex items-center gap-1 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-0.5 text-[11px] font-bold">
                  {[1, 2, 4].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setPlaybackSpeed(spd as 1 | 2 | 4)}
                      className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
                        playbackSpeed === spd
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-[var(--zd-muted)] hover:text-[var(--zd-text)]'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* نقاط الانطلاق والوصول */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] p-3">
            <div className="flex items-center gap-1.5 font-bold text-emerald-600">
              <MapPin className="h-4 w-4" />
              <span>نقطة الانطلاق (A):</span>
            </div>
            <p className="mt-1 text-[var(--zd-muted)] leading-relaxed">
              {summary.startLocation?.address || `${summary.startLocation?.lat}, ${summary.startLocation?.lng}`}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] p-3">
            <div className="flex items-center gap-1.5 font-bold text-blue-600">
              <MapPin className="h-4 w-4" />
              <span>نقطة الوصول (B):</span>
            </div>
            <p className="mt-1 text-[var(--zd-muted)] leading-relaxed">
              {summary.endLocation?.address || `${summary.endLocation?.lat}, ${summary.endLocation?.lng}`}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
