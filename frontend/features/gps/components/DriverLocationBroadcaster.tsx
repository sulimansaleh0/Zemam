'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Lock,
  MapPin,
  Navigation,
  Play,
  Radio,
  Square,
  Unlock,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';
import { emitDriverLocation } from '../services/gpsSocket';
import { calculateHaversineDistance } from '../utils/gpsHelpers';
import type { DriverTelemetryPayload } from '../types/gps.types';

interface DriverLocationBroadcasterProps {
  vehicleId: string;
  taskId?: string;
  onLocationEmitted?: (payload: DriverTelemetryPayload) => void;
  className?: string;
}

export function DriverLocationBroadcaster({
  vehicleId,
  taskId,
  onLocationEmitted,
  className = '',
}: DriverLocationBroadcasterProps) {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{
    lat: number;
    lng: number;
    speed: number;
    heading: number;
    accuracy: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [sentPointsCount, setSentPointsCount] = useState(0);

  const watchIdRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);
  const lastEmittedTimeRef = useRef<number>(0);
  const lastEmittedCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const offlineQueueRef = useRef<DriverTelemetryPayload[]>([]);

  // مراقبة حالة اتصال الإنترنت
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // إرسال النقاط المتراكمة أثناء انقطاع الشبكة (Batch Sync)
      if (offlineQueueRef.current.length > 0) {
        offlineQueueRef.current.forEach((payload) => emitDriverLocation(payload));
        offlineQueueRef.current = [];
        setOfflineQueueCount(0);
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // تفعيل وإلغاء ميزة إبقاء الشاشة مضاءة (Screen Wake Lock API)
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        setWakeLockActive(true);
        wakeLockRef.current.addEventListener('release', () => {
          setWakeLockActive(false);
        });
      }
    } catch (err: any) {
      console.warn('Wake Lock request failed:', err?.message);
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
      setWakeLockActive(false);
    }
  };

  // معالجة نبضة الـ GPS الحقيقية من المتصفح مع الفلترة الذكية لمنع الـ Lag
  const handlePositionSuccess = useCallback(
    (position: GeolocationPosition) => {
      const { latitude, longitude, speed, heading, accuracy } = position.coords;
      const now = Date.now();

      // تحويل السرعة من م/ث إلى كم/س
      const speedKmH = speed !== null && speed >= 0 ? Math.round(speed * 3.6) : 0;
      const headingDeg = heading !== null && !isNaN(heading) ? Math.round(heading) : 0;

      setCurrentCoords({
        lat: latitude,
        lng: longitude,
        speed: speedKmH,
        heading: headingDeg,
        accuracy: Math.round(accuracy),
      });

      // فلترة التردد (Throttling): لا نرسل أكثر من نبضة كل 3.5 ثوانٍ أو عند تحرك > 8 أمتار
      const timeElapsed = now - lastEmittedTimeRef.current;
      let hasMovedSignificantly = true;

      if (lastEmittedCoordsRef.current) {
        const distKm = calculateHaversineDistance(
          lastEmittedCoordsRef.current.lat,
          lastEmittedCoordsRef.current.lng,
          latitude,
          longitude
        );
        hasMovedSignificantly = distKm * 1000 >= 8; // أكثر من 8 أمتار
      }

      if (timeElapsed >= 3500 || hasMovedSignificantly) {
        const payload: DriverTelemetryPayload = {
          vehicleId,
          taskId,
          lat: latitude,
          lng: longitude,
          speed: speedKmH,
          heading: headingDeg,
          accuracy: Math.round(accuracy),
          timestamp: now,
        };

        if (navigator.onLine) {
          emitDriverLocation(payload);
          setSentPointsCount((prev) => prev + 1);
        } else {
          // حفظ محلي في طابور الانقطاع
          offlineQueueRef.current.push(payload);
          setOfflineQueueCount(offlineQueueRef.current.length);
        }

        lastEmittedTimeRef.current = now;
        lastEmittedCoordsRef.current = { lat: latitude, lng: longitude };

        if (onLocationEmitted) {
          onLocationEmitted(payload);
        }
      }
    },
    [vehicleId, taskId, onLocationEmitted]
  );

  const handlePositionError = useCallback((error: GeolocationPositionError) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setErrorMessage('تم رفض إذن الوصول للموقع الجغرافي. يرجى تفعيله من إعدادات المتصفح.');
        break;
      case error.POSITION_UNAVAILABLE:
        setErrorMessage('إشارة الـ GPS غير متوفرة حالياً.');
        break;
      case error.TIMEOUT:
        setErrorMessage('انتهت مهلة التقاط إشارة الأقمار الصناعية.');
        break;
      default:
        setErrorMessage('حدث خطأ أثناء التقاط الموقع.');
        break;
    }
    setIsBroadcasting(false);
  }, []);

  // بدء البث المباشر
  const startBroadcasting = () => {
    setErrorMessage(null);
    if (!navigator.geolocation) {
      setErrorMessage('المتصفح لا يدعم ميزة تحديد الموقع الجغرافي (Geolocation).');
      return;
    }

    requestWakeLock();

    const id = navigator.geolocation.watchPosition(
      handlePositionSuccess,
      handlePositionError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 2000,
      }
    );

    watchIdRef.current = id;
    setIsBroadcasting(true);
  };

  // إيقاف البث
  const stopBroadcasting = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    releaseWakeLock();
    setIsBroadcasting(false);
  };

  // تنظيف عند الخروج
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      releaseWakeLock();
    };
  }, []);

  return (
    <div
      className={`rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-4 text-[var(--zd-text)] shadow-md ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              isBroadcasting ? 'bg-emerald-500/10 text-emerald-500' : 'bg-neutral-500/10 text-neutral-400'
            }`}
          >
            <Radio className={`h-5 w-5 ${isBroadcasting ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <h4 className="text-sm font-bold">بث موقع السائق المباشر (PWA Tracker)</h4>
            <p className="text-[11px] text-[var(--zd-muted)]">
              {isBroadcasting ? 'البث نشط ومتصل بالقمر الصناعي والسيرفر' : 'البث متوقف'}
            </p>
          </div>
        </div>

        <button
          onClick={isBroadcasting ? stopBroadcasting : startBroadcasting}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
            isBroadcasting
              ? 'bg-rose-600 text-white hover:bg-rose-700'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          {isBroadcasting ? (
            <>
              <Square className="h-4 w-4 fill-current" />
              <span>إيقاف البث</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-current" />
              <span>بدء البث الحقيقي</span>
            </>
          )}
        </button>
      </div>

      {/* رسالة الخطأ إن وجدت */}
      {errorMessage && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-500">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* لوحة المؤشرات الميدانية */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {/* حالة الشبكة */}
        <div className="flex items-center gap-2 rounded-xl bg-[var(--zd-surface-2)] p-2.5">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-emerald-500 shrink-0" />
          ) : (
            <WifiOff className="h-4 w-4 text-rose-500 shrink-0" />
          )}
          <div>
            <div className="text-[10px] text-[var(--zd-muted)]">اتصال الإنترنت</div>
            <div className="font-bold">{isOnline ? 'متصل 🟢' : 'منقطع 🔴'}</div>
          </div>
        </div>

        {/* حالة قفل الشاشة */}
        <div className="flex items-center gap-2 rounded-xl bg-[var(--zd-surface-2)] p-2.5">
          {wakeLockActive ? (
            <Lock className="h-4 w-4 text-blue-500 shrink-0" />
          ) : (
            <Unlock className="h-4 w-4 text-[var(--zd-muted)] shrink-0" />
          )}
          <div>
            <div className="text-[10px] text-[var(--zd-muted)]">حالة الشاشة (WakeLock)</div>
            <div className="font-bold">{wakeLockActive ? 'نشطة دائماً' : 'تلقائي'}</div>
          </div>
        </div>

        {/* السرعة الحالية */}
        <div className="flex items-center gap-2 rounded-xl bg-[var(--zd-surface-2)] p-2.5">
          <Zap className="h-4 w-4 text-amber-500 shrink-0" />
          <div>
            <div className="text-[10px] text-[var(--zd-muted)]">السرعة الملتقطة</div>
            <div className="font-bold">
              {currentCoords?.speed !== undefined ? `${currentCoords.speed} كم/س` : '--'}
            </div>
          </div>
        </div>

        {/* النقاط المرسلة */}
        <div className="flex items-center gap-2 rounded-xl bg-[var(--zd-surface-2)] p-2.5">
          <Activity className="h-4 w-4 text-purple-500 shrink-0" />
          <div>
            <div className="text-[10px] text-[var(--zd-muted)]">النبضات المرسلة</div>
            <div className="font-bold">
              {sentPointsCount} {offlineQueueCount > 0 && `(+${offlineQueueCount} معلقة)`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
