'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle2,
  Compass,
  FileCheck,
  Lock,
  MapPin,
  Navigation,
  Play,
  Radio,
  Route,
  Unlock,
  Wifi,
  WifiOff,
  ArrowUpRight,
} from 'lucide-react';
import {
  emitDriverLocation,
  getGpsSocket,
} from '@/features/gps/services/gpsSocket';
import { calculateHaversineDistance } from '@/features/gps/utils/gpsHelpers';
import type { DriverTelemetryPayload } from '@/features/gps/types/gps.types';
import {
  queueTelemetryPoint,
  getQueuedTelemetry,
  clearQueuedTelemetry,
} from '@/features/driver/services/driverStorage';
import { DriverHeader } from '@/features/driver/components/DriverHeader';
import { useAuth } from '@/features/auth/context/AuthContext';

// استيراد خريطة الـ Leaflet ديناميكياً لتجنب مشاكل الـ SSR
const DriverLiveMap = dynamic(
  () => import('@/features/driver/components/DriverLiveMap'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[290px] w-full rounded-3xl bg-white border border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
        <Navigation className="h-6 w-6 text-teal-600 animate-pulse" />
        <span>جاري تحميل خريطة التتبع المباشر...</span>
      </div>
    ),
  }
);

export default function DriverMobileTrackingPage() {
  const { user } = useAuth();

  // بيانات المركبة والمهمة
  const [vehicleId, setVehicleId] = useState('demo-vehicle-1');
  const [plateNumber, setPlateNumber] = useState('أ ب ج 1234');
  const [taskId, setTaskId] = useState('');
  const [availableVehicles, setAvailableVehicles] = useState<Array<{ id: string; plate: string; model: string }>>([]);

  // إدارة المهام
  const [tasks, setTasks] = useState<any[]>([]);
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [endOdometerInput, setEndOdometerInput] = useState<string>('');
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [isTaskActionLoading, setIsTaskActionLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // حالات البث والاتصال
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // التيليماتري الحية
  const [currentCoords, setCurrentCoords] = useState<{
    lat: number;
    lng: number;
    speed: number;
    heading: number;
    accuracy: number;
  } | null>(null);

  const [tripStats, setTripStats] = useState({
    sentPointsCount: 0,
    totalDistanceMeters: 0,
    startTime: null as number | null,
    maxSpeed: 0,
  });

  const [offlineQueueCount, setOfflineQueueCount] = useState(0);

  // المراجع (Refs)
  const watchIdRef = useRef<number | null>(null);
  const broadcastIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const latestCoordsRef = useRef<{
    lat: number;
    lng: number;
    speed: number;
    heading: number;
    accuracy: number;
  } | null>(null);
  const wakeLockRef = useRef<any>(null);
  const lastEmittedTimeRef = useRef<number>(0);
  const lastEmittedCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  // جلب المهام والمركبات
  const loadInitialData = useCallback(async () => {
    setIsLoadingData(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('zemam_driver_token') : null;
    const authHeaders: Record<string, string> = {};
    if (token) authHeaders['Authorization'] = `Bearer ${token}`;

    // 1. جلب أسطول المركبات
    try {
      const vRes = await fetch('/api/gps/live', {
        credentials: 'include',
        headers: authHeaders,
      });
      if (vRes.ok) {
        const vData = await vRes.json();
        const rawVehicles = vData?.vehicles || vData?.data?.vehicles || [];
        if (rawVehicles.length > 0) {
          const vList = rawVehicles.map((v: any) => ({
            id: v.vehicleId || v._id,
            plate: v.plateNumber || 'بدون لوحة',
            model: v.model || 'مركبة',
          }));
          setAvailableVehicles(vList);
          setVehicleId(vList[0].id);
          setPlateNumber(vList[0].plate);
        }
      }
    } catch {}

    // 2. جلب المهام
    try {
      let tRes = await fetch('/api/task/driver', {
        credentials: 'include',
        headers: authHeaders,
      });
      if (!tRes.ok) {
        tRes = await fetch('/api/task', {
          credentials: 'include',
          headers: authHeaders,
        });
      }
      if (tRes.ok) {
        const tData = await tRes.json();
        const list = tData?.tasks || tData?.data?.tasks || [];
        setTasks(list);

        const inprog = list.find((t: any) => t.status === 'inprogress');
        const pending = list.find((t: any) => t.status === 'pending');
        const chosen = inprog || pending || list[0];

        if (chosen) {
          setActiveTask(chosen);
          setTaskId(chosen._id);
          const vObj = chosen.vehicleId;
          if (vObj) {
            const vId = vObj._id || vObj;
            setVehicleId(vId);
            if (vObj.plateNumber) setPlateNumber(vObj.plateNumber);
          }
        }
      }
    } catch {} finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // إدارة اتصال السوكت
  useEffect(() => {
    const socket = getGpsSocket();
    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    setSocketConnected(socket.connected);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  // مراقبة اتصال الشبكة وتفريغ طابور الـ IndexedDB
  useEffect(() => {
    const flushOfflineQueue = async () => {
      try {
        const queued = await getQueuedTelemetry();
        if (queued.length > 0) {
          queued.forEach((payload) => emitDriverLocation(payload));
          await clearQueuedTelemetry();
          setOfflineQueueCount(0);
          setSuccessNotice(`تمت مزامنة ${queued.length} نبضة مخزنة تلقائياً.`);
          setTimeout(() => setSuccessNotice(null), 3000);
        }
      } catch {}
    };

    const handleOnline = () => {
      setIsOnline(true);
      flushOfflineQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    getQueuedTelemetry().then((q) => setOfflineQueueCount(q.length));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // تفعيل قفل الشاشة لمنع انطفائها أثناء القيادة
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

  // معالجة نبضة الـ GPS الحقيقية
  const handlePositionSuccess = useCallback(
    async (position: GeolocationPosition) => {
      const { latitude, longitude, speed, heading, accuracy } = position.coords;
      const now = Date.now();

      const speedKmH = speed !== null && speed >= 0 ? Math.round(speed * 3.6) : 0;
      const headingDeg = heading !== null && !isNaN(heading) ? Math.round(heading) : 0;

      const coords = {
        lat: latitude,
        lng: longitude,
        speed: speedKmH,
        heading: headingDeg,
        accuracy: Math.round(accuracy),
      };

      latestCoordsRef.current = coords;
      setCurrentCoords(coords);

      if (lastEmittedCoordsRef.current) {
        const delta = calculateHaversineDistance(
          lastEmittedCoordsRef.current.lat,
          lastEmittedCoordsRef.current.lng,
          latitude,
          longitude
        );
        if (delta > 0.001) {
          setTripStats((prev) => ({
            ...prev,
            totalDistanceMeters: prev.totalDistanceMeters + delta * 1000,
            maxSpeed: Math.max(prev.maxSpeed, speedKmH),
          }));
        }
      }

      const timeElapsed = now - lastEmittedTimeRef.current;
      if (timeElapsed >= 1000) {
        const payload: DriverTelemetryPayload = {
          vehicleId,
          taskId: taskId.trim() || undefined,
          companyId: user?.companyId,
          lat: latitude,
          lng: longitude,
          speed: speedKmH,
          heading: headingDeg,
          accuracy: Math.round(accuracy),
          timestamp: now,
        };

        if (navigator.onLine) {
          emitDriverLocation(payload);
          setTripStats((prev) => ({
            ...prev,
            sentPointsCount: prev.sentPointsCount + 1,
            startTime: prev.startTime || now,
          }));
        } else {
          await queueTelemetryPoint(payload);
          setOfflineQueueCount((c) => c + 1);
        }

        lastEmittedTimeRef.current = now;
        lastEmittedCoordsRef.current = { lat: latitude, lng: longitude };
      }
    },
    [vehicleId, taskId, user?.companyId]
  );

  const handlePositionError = useCallback((error: GeolocationPositionError) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        if (typeof window !== 'undefined' && !window.isSecureContext) {
          setErrorMessage('المتصفح يمنع تحديد الموقع عبر شبكة HTTP غير المشفرة. يرجى تفعيل HTTPS (عبر Ngrok) أو السماح بالموقع في إعدادات متصفح الهاتف.');
        } else {
          setErrorMessage('يرجى السماح بالوصول للموقع الجغرافي (GPS) لتفعيل التتبع من إعدادات المتصفح.');
        }
        break;
      case error.POSITION_UNAVAILABLE:
        setErrorMessage('إشارة الـ GPS غير متوفرة حالياً.');
        break;
      case error.TIMEOUT:
        setErrorMessage('انتهت مهلة التقاط إشارة الـ GPS.');
        break;
      default:
        setErrorMessage('حدث خطأ أثناء التقاط الموقع الجغرافي.');
        break;
    }
    setIsBroadcasting(false);
  }, []);

  // بدء البث الفعلي
  const startBroadcasting = () => {
    setErrorMessage(null);
    setSuccessNotice(null);

    if (!navigator.geolocation) {
      setErrorMessage('المتصفح لا يدعم ميزة تحديد الموقع (Geolocation).');
      return;
    }

    requestWakeLock();

    const id = navigator.geolocation.watchPosition(
      handlePositionSuccess,
      handlePositionError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    watchIdRef.current = id;

    if (broadcastIntervalRef.current) clearInterval(broadcastIntervalRef.current);
    broadcastIntervalRef.current = setInterval(async () => {
      const coords = latestCoordsRef.current;
      if (!coords || !vehicleId) return;

      const now = Date.now();
      if (now - lastEmittedTimeRef.current < 900) return;

      const payload: DriverTelemetryPayload = {
        vehicleId,
        taskId: taskId.trim() || undefined,
        companyId: user?.companyId,
        lat: coords.lat,
        lng: coords.lng,
        speed: coords.speed,
        heading: coords.heading,
        accuracy: coords.accuracy,
        timestamp: now,
      };

      if (navigator.onLine) {
        emitDriverLocation(payload);
        setTripStats((prev) => ({
          ...prev,
          sentPointsCount: prev.sentPointsCount + 1,
          startTime: prev.startTime || now,
        }));
      } else {
        await queueTelemetryPoint(payload);
        setOfflineQueueCount((c) => c + 1);
      }

      lastEmittedTimeRef.current = now;
      lastEmittedCoordsRef.current = { lat: coords.lat, lng: coords.lng };
    }, 1000);

    setIsBroadcasting(true);
    setTripStats((prev) => ({ ...prev, startTime: Date.now() }));
  };

  // إيقاف البث
  const stopBroadcasting = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (broadcastIntervalRef.current) {
      clearInterval(broadcastIntervalRef.current);
      broadcastIntervalRef.current = null;
    }
    releaseWakeLock();
    setIsBroadcasting(false);
  };

  // قبول وبدء المهمة
  const handleAcceptTask = async () => {
    if (!activeTask?._id) return;
    setIsTaskActionLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/task/${activeTask._id}/accept`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.msg || data?.message || 'تعذر بدء المهمة');
      }

      setSuccessNotice('🚀 تم قبول المهمة وبدء تنفيذها! تم تفعيل الـ GPS تلقائياً.');
      setActiveTask((prev: any) => ({ ...prev, status: 'inprogress' }));
      startBroadcasting();
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء بدء المهمة');
    } finally {
      setIsTaskActionLoading(false);
    }
  };

  // إنهاء المهمة وتسليمها
  const handleFinishTask = async () => {
    if (!activeTask?._id) return;
    setIsTaskActionLoading(true);
    setErrorMessage(null);
    try {
      const endOdo = endOdometerInput ? Number(endOdometerInput) : undefined;
      const res = await fetch(`/api/task/${activeTask._id}/finish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endOdometer: endOdo }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.msg || data?.message || 'تعذر إنهاء المهمة');
      }

      stopBroadcasting();
      setShowFinishModal(false);
      setSuccessNotice('🎉 تم تسليم المهمة بنجاح وتوليد ملخص الرحلة!');
      setActiveTask((prev: any) => ({ ...prev, status: 'finished' }));
      loadInitialData();
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء إنهاء المهمة');
    } finally {
      setIsTaskActionLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (broadcastIntervalRef.current) {
        clearInterval(broadcastIntervalRef.current);
      }
      releaseWakeLock();
    };
  }, []);

  return (
    <div className="flex flex-col flex-1 bg-slate-50 text-slate-900">
      {/* ── شريط الرأس الميداني ── */}
      <DriverHeader
        plateNumber={plateNumber}
        onRefresh={loadInitialData}
        isRefreshing={isLoadingData}
      />

      {/* ── تنبيهات ── */}
      <div className="px-4 mt-2 max-w-lg mx-auto w-full">
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successNotice && (
          <div className="flex items-center gap-2 rounded-2xl border border-teal-200 bg-teal-50 p-3 text-xs text-teal-800 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600" />
            <span>{successNotice}</span>
          </div>
        )}
      </div>

      {/* ── المحتوى الرئيسي ── */}
      <main className="flex-1 px-4 py-3 flex flex-col gap-3.5 max-w-lg mx-auto w-full">
        {/* ── 1. خريطة التتبع المباشر الحية (Live Interactive Leaflet Map) ── */}
        <div className="w-full">
          <DriverLiveMap
            currentCoords={currentCoords}
            pickupCoords={activeTask?.pickupLocation}
            deliveryCoords={activeTask?.deliveryLocation}
            plateNumber={plateNumber}
            className="w-full h-[290px]"
          />
        </div>

        {/* ── 2. عداد السرعة ومؤشرات الرحلة (Light HUD Badge) ── */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between gap-4">
          {/* عداد السرعة الرقمي */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center justify-center rounded-2xl bg-teal-50/80 border border-teal-100 p-2.5 min-w-[76px]">
              <span
                className={`text-3xl font-black font-mono tracking-tight leading-none ${
                  (currentCoords?.speed || 0) > 80
                    ? 'text-rose-600'
                    : (currentCoords?.speed || 0) > 50
                    ? 'text-amber-600'
                    : 'text-teal-800'
                }`}
              >
                {currentCoords?.speed !== undefined ? currentCoords.speed : 0}
              </span>
              <span className="text-[9px] font-bold text-teal-700 mt-1">كم/ساعة</span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-800 block">
                {isBroadcasting ? 'بث الـ GPS نشط 📡' : 'التتبع متوقف'}
              </span>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Compass className="h-3.5 w-3.5 text-teal-600" />
                  <span>{currentCoords?.heading || 0}°</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>±{currentCoords?.accuracy || 4}م</span>
                </span>
              </div>
            </div>
          </div>

          {/* إحصائيات سريعة */}
          <div className="flex items-center gap-3 text-left pl-1">
            <div>
              <span className="text-[10px] text-slate-400 block">المسافة</span>
              <span className="text-sm font-black text-slate-800 font-mono">
                {(tripStats.totalDistanceMeters / 1000).toFixed(1)} <span className="text-[10px] font-normal text-slate-500">كم</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">النقاط</span>
              <span className="text-sm font-black text-teal-700 font-mono">
                {tripStats.sentPointsCount}
              </span>
            </div>
          </div>
        </div>

        {/* ── 3. بطاقة المهمة الجارية (Active Task Card) ── */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Route className="h-4 w-4 text-teal-700" />
              <span className="text-xs font-bold text-slate-800">المهمة الميدانية الحالية</span>
            </div>

            {activeTask ? (
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  activeTask.status === 'inprogress'
                    ? 'bg-teal-50 text-teal-700 border border-teal-200'
                    : activeTask.status === 'finished'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {activeTask.status === 'inprogress'
                  ? 'قيد التنفيذ 🟢'
                  : activeTask.status === 'finished'
                  ? 'مكتملة 🏁'
                  : 'في الانتظار ⏳'}
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">لا توجد مهمة</span>
            )}
          </div>

          {activeTask ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900">
                  {activeTask.title || 'مهمة توصيل شحنة لوجستية'}
                </h3>
                <Link
                  href="/driver/tasks"
                  className="text-[11px] font-bold text-teal-700 hover:text-teal-800 flex items-center gap-0.5"
                >
                  <span>كافة المهام ({tasks.length})</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>

              {/* نقاط الانطلاق والتسليم */}
              <div className="rounded-2xl bg-slate-50 p-2.5 text-xs space-y-1.5 border border-slate-200/80">
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-slate-400 shrink-0">الاستلام:</span>
                  <span className="font-semibold truncate">
                    {activeTask.pickupLocation?.address || 'مقر مستودع الشركة'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-teal-600 shrink-0" />
                  <span className="text-slate-400 shrink-0">التسليم:</span>
                  <span className="font-semibold truncate">
                    {activeTask.deliveryLocation?.address || 'عنوان العميل المحدد'}
                  </span>
                </div>
              </div>

              {/* أزرار الإجراءات السريعة للمهمة */}
              <div className="flex flex-col gap-2 pt-1">
                {/* صف الملاحة + بدء المهمة (pending) */}
                <div className="flex items-center gap-2">
                  {activeTask.deliveryLocation && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${
                        activeTask.deliveryLocation.lat || ''
                      },${activeTask.deliveryLocation.lng || ''}&destination_place_id=${encodeURIComponent(
                        activeTask.deliveryLocation.address || ''
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-teal-200 bg-teal-50/80 hover:bg-teal-100/80 py-2.5 text-xs font-bold text-teal-800 transition-colors"
                    >
                      <Navigation className="h-3.5 w-3.5 text-teal-700" />
                      <span>فتح الملاحة (Maps)</span>
                    </a>
                  )}

                  {activeTask.status === 'pending' && (
                    <button
                      onClick={handleAcceptTask}
                      disabled={isTaskActionLoading}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold py-2.5 text-xs shadow-xs transition-all active:scale-98 cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>بدء المهمة 🚀</span>
                    </button>
                  )}
                </div>

                {/* زر البث + زر التسليم عند inprogress */}
                {activeTask.status === 'inprogress' && (
                  <div className="flex items-center gap-2">
                    {/* زر بدء / إيقاف البث */}
                    <button
                      onClick={isBroadcasting ? stopBroadcasting : startBroadcasting}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-2xl py-3 text-xs font-bold shadow-xs transition-all active:scale-98 cursor-pointer ${
                        isBroadcasting
                          ? 'bg-rose-100 border border-rose-300 text-rose-700 hover:bg-rose-200'
                          : 'bg-teal-700 hover:bg-teal-800 text-white'
                      }`}
                    >
                      <Radio className={`h-3.5 w-3.5 ${isBroadcasting ? '' : 'animate-pulse'}`} />
                      <span>{isBroadcasting ? 'إيقاف البث ⏹' : 'بدء البث 📡'}</span>
                    </button>

                    {/* زر تسليم الشحنة */}
                    <button
                      onClick={() => {
                        const estimatedOdo =
                          (activeTask.startOdometer || 1000) +
                          Math.round(tripStats.totalDistanceMeters / 1000);
                        setEndOdometerInput(String(estimatedOdo));
                        setShowFinishModal(true);
                      }}
                      disabled={isTaskActionLoading}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-xs shadow-xs transition-all active:scale-98 cursor-pointer"
                    >
                      <FileCheck className="h-3.5 w-3.5" />
                      <span>تسليم الشحنة 🏁</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-2 text-xs text-slate-500 space-y-1">
              <p>لا توجد مهام جارية حالياً.</p>
              <Link href="/driver/tasks" className="text-teal-700 font-bold underline">
                استعراض جدول المهام
              </Link>
            </div>
          )}
        </div>

        {/* ── 4. شريط المؤشرات: GPS / الشاشة / الشبكة ── */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-600 shadow-xs gap-3">
          {/* حالة الـ GPS */}
          <div className="flex items-center gap-1.5">
            <Radio className={`h-3.5 w-3.5 ${isBroadcasting ? 'text-teal-600 animate-pulse' : 'text-slate-400'}`} />
            <span className={isBroadcasting ? 'text-teal-700 font-bold' : ''}>
              {isBroadcasting ? 'GPS نشط 📡' : 'GPS متوقف'}
            </span>
          </div>

          {/* قفل الشاشة */}
          <div className="flex items-center gap-1.5">
            {wakeLockActive ? (
              <Lock className="h-3.5 w-3.5 text-teal-700" />
            ) : (
              <Unlock className="h-3.5 w-3.5 text-slate-400" />
            )}
            <span>{wakeLockActive ? 'شاشة دائمة' : 'تلقائي'}</span>
          </div>

          {/* الشبكة */}
          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <Wifi className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-rose-600" />
            )}
            <span>{isOnline ? 'متصل 🟢' : `غير متصل (${offlineQueueCount})`}</span>
          </div>
        </div>

      </main>


      {/* ── مودال إنهاء المهمة وتسجيل العداد ── */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 border border-teal-200">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">تسليم وإنهاء المهمة</h3>
                <p className="text-[11px] text-slate-500">تأكيد إكمال الرحلة وتلخيص بيانات الـ GPS</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                قراءة عداد المسافات الحالي (كم):
              </label>
              <input
                type="number"
                value={endOdometerInput}
                onChange={(e) => setEndOdometerInput(e.target.value)}
                placeholder="مثلاً: 12540"
                className="w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 font-mono focus:border-teal-700 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleFinishTask}
                disabled={isTaskActionLoading}
                className="flex-1 rounded-2xl bg-teal-700 hover:bg-teal-800 py-3 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                {isTaskActionLoading ? 'جاري التسليم...' : 'تأكيد التسليم الرسمي 🏁'}
              </button>
              <button
                onClick={() => setShowFinishModal(false)}
                className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-xs text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
