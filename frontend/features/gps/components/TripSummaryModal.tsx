'use client';

import React, { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
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
import { decodePolyline, calculateBearing } from '../utils/gpsHelpers';
import type { PlaybackVehicleData } from '@/features/tasks/components/LeafletMapCanvas';

const LeafletMapCanvas = dynamic(
  () => import('@/features/tasks/components/LeafletMapCanvas'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[320px] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] text-xs text-[var(--zd-muted)]">
        <Compass className="h-7 w-7 animate-spin text-blue-500" />
        <span className="font-medium">جاري تحميل مسار الرحلة والبيانات الملاحية...</span>
      </div>
    ),
  }
);

interface TripSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: TripSummary | null;
}

function formatTripDateTime(dateStr?: string): string {
  if (!dateStr) return 'غير محدد';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function TripSummaryModal({
  isOpen,
  onClose,
  summary,
}: TripSummaryModalProps) {
  // إحداثيات المسار المسترجعة مباشرة من الخادم مع الاحتياط لفك التشفير
  const routeCoordinates = useMemo(() => {
    if (summary?.coordinates && summary.coordinates.length > 0) {
      return summary.coordinates;
    }
    if (!summary?.encodedPath) return [];
    return decodePolyline(summary.encodedPath);
  }, [summary?.coordinates, summary?.encodedPath]);

  // حالة محاكي تشغيل الرحلة (Trip Replay Simulator)
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4 | 8>(1);

  // إعادة ضبط المحاكي عند فتح النافذة أو تغيير الرحلة
  useEffect(() => {
    setIsPlaying(false);
    setPlaybackIndex(0);
  }, [isOpen, summary?.taskId]);

  // مؤقت تشغيل المحاكي التفاعلي
  useEffect(() => {
    if (!isPlaying || routeCoordinates.length <= 1) return;

    const intervalMs = Math.max(60, Math.floor(400 / playbackSpeed));
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

  // حساب بيانات وزاوية المركبة في إطار المحاكاة الحالي
  let playbackVehicle: PlaybackVehicleData | null = null;
  let currentBearing = 0;
  if (routeCoordinates.length > 0) {
    const curPos = routeCoordinates[playbackIndex] || routeCoordinates[0];
    const nextPos = routeCoordinates[Math.min(playbackIndex + 1, routeCoordinates.length - 1)];
    currentBearing =
      nextPos && curPos ? calculateBearing(curPos[0], curPos[1], nextPos[0], nextPos[1]) : 0;

    playbackVehicle = {
      position: curPos,
      heading: currentBearing,
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
      description="التقرير الميداني المعتمد والمسار المسجل بالـ GPS مع محاكي إعادة خط السير"
      icon={Route}
      iconClassName="text-blue-500"
      maxWidth="4xl"
    >
      <div className="space-y-4 pt-1 text-[var(--zd-text)]" dir="rtl">
        {/* ── بطاقة رأس التقرير ومعلومات الرحلة ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] p-3.5 text-xs shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-tight text-[var(--zd-text)]">
                  {summary.plateNumber || 'مركبة أسطول'}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>مكتملة وموثقة</span>
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-[var(--zd-muted)]">
                المهمة: <span className="font-semibold text-[var(--zd-text)]">{summary.taskTitle || summary.taskId}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-[var(--zd-muted)]">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-blue-500" />
              <span>السائق: <strong className="text-[var(--zd-text)]">{summary.driverName || 'سائق غير مسجل'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-emerald-500" />
              <span>المدة: <strong className="text-[var(--zd-text)]">{summary.durationMinutes} دقيقة</strong></span>
            </div>
          </div>
        </div>

        {/* ── شبكة كروت القياسات الأربعة الميدانية (Standard KPI Grid) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* إجمالي المسافة المقطوعة */}
          <div className="group rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3.5 text-center shadow-xs transition hover:border-blue-500/30">
            <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--zd-muted)]">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-500/10 text-blue-600">
                <Route className="h-3 w-3" />
              </div>
              <span className="font-medium">المسافة المقطوعة</span>
            </div>
            <div className="mt-1.5 text-2xl font-black text-blue-600">
              {summary.totalDistanceKm} <span className="text-xs font-normal text-[var(--zd-muted)]">كم</span>
            </div>
            <p className="mt-1 text-[10px] text-[var(--zd-muted)]">تتبع عداد GPS الفعلي</p>
          </div>

          {/* مدة الرحلة الصافية */}
          <div className="group rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3.5 text-center shadow-xs transition hover:border-emerald-500/30">
            <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--zd-muted)]">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600">
                <Timer className="h-3 w-3" />
              </div>
              <span className="font-medium">زمن القيادة</span>
            </div>
            <div className="mt-1.5 text-2xl font-black text-emerald-600">
              {summary.durationMinutes} <span className="text-xs font-normal text-[var(--zd-muted)]">دقيقة</span>
            </div>
            <p className="mt-1 text-[10px] text-[var(--zd-muted)]">من الانطلاق حتى التسليم</p>
          </div>

          {/* متوسط السرعة */}
          <div className="group rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3.5 text-center shadow-xs transition hover:border-amber-500/30">
            <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--zd-muted)]">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/10 text-amber-600">
                <Zap className="h-3 w-3" />
              </div>
              <span className="font-medium">متوسط السرعة</span>
            </div>
            <div className="mt-1.5 text-2xl font-black text-amber-600">
              {summary.averageSpeed} <span className="text-xs font-normal text-[var(--zd-muted)]">كم/س</span>
            </div>
            <p className="mt-1 text-[10px] text-[var(--zd-muted)]">معدل سرعة خط السير</p>
          </div>

          {/* أقصى سرعة مسجلة */}
          <div className="group rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3.5 text-center shadow-xs transition hover:border-purple-500/30">
            <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--zd-muted)]">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-purple-500/10 text-purple-600">
                <Gauge className="h-3 w-3" />
              </div>
              <span className="font-medium">أقصى سرعة</span>
            </div>
            <div className="mt-1.5 text-2xl font-black text-purple-600">
              {summary.maxSpeed} <span className="text-xs font-normal text-[var(--zd-muted)]">كم/س</span>
            </div>
            <p className="mt-1 text-[10px] text-[var(--zd-muted)]">أعلى نبضة سرعة مرصودة</p>
          </div>
        </div>

        {/* ── خريطة مسار الرحلة الفعلي والتسجيل الميداني ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--zd-muted)]">
            <span className="font-bold text-[var(--zd-text)] flex items-center gap-1.5">
              <Navigation className="h-4 w-4 text-blue-500" />
              <span>خريطة التتبع الميداني المسجل:</span>
            </span>
            <span className="text-[11px] font-mono">
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
            className="h-[320px] w-full rounded-2xl border border-[var(--zd-line)] shadow-inner"
            readOnly={true}
          />

          {/* ── شريط محاكي تشغيل الرحلة وإعادة العرض (Trip Replay Simulator Controls) ── */}
          {routeCoordinates.length > 1 && (
            <div className="rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] p-3.5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                    <Play className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-bold text-[var(--zd-text)]">
                    محاكي إعادة عرض خط السير والسرعات
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-[var(--zd-muted)]">
                  <span className="flex items-center gap-1 font-mono">
                    <Compass
                      className="h-3 w-3 text-blue-500 transition-transform duration-200"
                      style={{ transform: `rotate(${currentBearing}deg)` }}
                    />
                    <span>{currentBearing}°</span>
                  </span>
                  <span className="font-mono">
                    النقطة {playbackIndex + 1} من {routeCoordinates.length} ({progressPercent}%)
                  </span>
                </div>
              </div>

              {/* شريط التمرير الزمني التفاعلي */}
              <input
                type="range"
                min={0}
                max={routeCoordinates.length - 1}
                value={playbackIndex}
                onChange={(e) => setPlaybackIndex(Number(e.target.value))}
                className="w-full h-2 bg-[var(--zd-line)] rounded-lg appearance-none cursor-pointer accent-blue-600 transition"
              />

              {/* أزرار التحكم بالتشغيل والسرعة */}
              <div className="flex items-center justify-between pt-0.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (playbackIndex >= routeCoordinates.length - 1) {
                        setPlaybackIndex(0);
                      }
                      setIsPlaying(!isPlaying);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition cursor-pointer shadow-xs"
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
                    title="إعادة لنقطة البداية"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>البداية</span>
                  </button>
                </div>

                {/* مضاعف سرعة المحاكاة */}
                <div className="flex items-center gap-1 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-1 text-[11px] font-bold">
                  {[1, 2, 4, 8].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setPlaybackSpeed(spd as 1 | 2 | 4 | 8)}
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

        {/* ── كروت نقاط الانطلاق والوصول وتوقيتاتهما ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* نقطة الانطلاق A */}
          <div className="rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-emerald-600">
                <MapPin className="h-4 w-4" />
                <span>نقطة الانطلاق (A):</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-[var(--zd-muted)]">
                <Calendar className="h-3 w-3" />
                <span>{formatTripDateTime(summary.startedAt)}</span>
              </span>
            </div>
            <p className="text-[var(--zd-text)] font-medium leading-relaxed">
              {summary.startLocation?.address ||
                (summary.startLocation?.lat
                  ? `${summary.startLocation.lat.toFixed(5)}, ${summary.startLocation.lng.toFixed(5)}`
                  : 'موقع الانطلاق')}
            </p>
          </div>

          {/* نقطة الوصول B */}
          <div className="rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)] p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-blue-600">
                <MapPin className="h-4 w-4" />
                <span>نقطة الوصول (B):</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-[var(--zd-muted)]">
                <Calendar className="h-3 w-3" />
                <span>{formatTripDateTime(summary.finishedAt)}</span>
              </span>
            </div>
            <p className="text-[var(--zd-text)] font-medium leading-relaxed">
              {summary.endLocation?.address ||
                (summary.endLocation?.lat
                  ? `${summary.endLocation.lat.toFixed(5)}, ${summary.endLocation.lng.toFixed(5)}`
                  : 'موقع التسليم')}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
