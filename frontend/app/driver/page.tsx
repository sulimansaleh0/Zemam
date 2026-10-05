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
  Zap,
  Phone,
  MessageSquare,
  Clock,
  Truck,
} from 'lucide-react';
import {
  emitDriverLocation,
  getGpsSocket,
} from '@/features/gps/services/gpsSocket';
import { watchCurrentLocation, type Coordinates } from '@/shared/lib/navigatorClient';
import { calculateHaversineDistance } from '@/features/gps/utils/gpsHelpers';
import type { DriverTelemetryPayload } from '@/features/gps/types/gps.types';
import {
  queueTelemetryPoint,
  getQueuedTelemetry,
  clearQueuedTelemetry,
  removeQueuedTelemetryPoints,
} from '@/features/driver/services/driverStorage';
import { DriverHeader } from '@/features/driver/components/DriverHeader';
import { useAuth } from '@/features/auth/context/AuthContext';
import { driverTaskService } from '@/features/driver/services/driverTaskService';
import { gpsService } from '@/features/gps/services/gps.service';

// استيراد خريطة الـ Leaflet ديناميكياً لتجنب مشاكل الـ SSR
const DriverLiveMap = dynamic(
  () => import('@/features/driver/components/DriverLiveMap'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[290px] w-full rounded-3xl bg-white border border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
        <Navigation className="h-6 w-6 text-[#195CF1] animate-pulse" />
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

  const [traversedPath, setTraversedPath] = useState<
    Array<{ lat: number; lng: number; speed?: number; heading?: number; timestamp?: number }>
  >([]);

  const [tripStats, setTripStats] = useState({
    sentPointsCount: 0,
    totalDistanceMeters: 0,
    startTime: null as number | null,
    maxSpeed: 0,
  });

  const [offlineQueueCount, setOfflineQueueCount] = useState(0);

  // وضع توفير البيانات الذكي لشبكات الهاتف 2G/3G أو ضعف الواي فاي (Low Data Mode)
  const [isLowDataMode, setIsLowDataMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zemam_driver_low_data');
      if (saved !== null) return saved === 'true';
      const conn = (navigator as any).connection;
      if (conn) {
        if (conn.saveData) return true;
        if (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g' || conn.effectiveType === '3g') return true;
      }
    }
    return false;
  });

  const toggleLowDataMode = () => {
    setIsLowDataMode((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('zemam_driver_low_data', String(next));
      }
      return next;
    });
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const conn = (navigator as any).connection;
    if (conn) {
      const updateConn = () => {
        if (localStorage.getItem('zemam_driver_low_data') === null) {
          if (conn.saveData || conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g' || conn.effectiveType === '3g') {
            setIsLowDataMode(true);
          }
        }
      };
      conn.addEventListener('change', updateConn);
      return () => conn.removeEventListener('change', updateConn);
    }
  }, []);

  // المراجع (Refs)
  const locationWatchCleanupRef = useRef<(() => void) | null>(null);
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
  const lastEmittedHeadingRef = useRef<number | null>(null);
  const isFlushingRef = useRef<boolean>(false);

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
    } catch { }

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

          // استعادة مسار المهمة الحالية لتجنب ظهور خط مستقيم بعد إعادة التحميل
          if (chosen.status === 'inprogress') {
            try {
              const [pathRes, queued] = await Promise.all([
                gpsService.getLiveTripPath(chosen._id),
                getQueuedTelemetry(),
              ]);
              const existingPoints: Array<{ lat: number; lng: number; speed?: number; heading?: number; timestamp?: number }> = [];
              if (pathRes.success && pathRes.data?.path?.points) {
                pathRes.data.path.points.forEach((p) => {
                  existingPoints.push({
                    lat: p.lat,
                    lng: p.lng,
                    speed: p.speed,
                    heading: p.heading,
                    timestamp: typeof p.timestamp === 'string' ? new Date(p.timestamp).getTime() : p.timestamp,
                  });
                });
              }
              // دمج أي نقاط في طابور الـ offline
              if (queued && queued.length > 0) {
                queued.forEach((q) => {
                  if (q.lat && q.lng) {
                    existingPoints.push({
                      lat: q.lat,
                      lng: q.lng,
                      speed: q.speed,
                      heading: q.heading,
                      timestamp: q.timestamp,
                    });
                  }
                });
              }
              if (existingPoints.length > 0) {
                setTraversedPath(existingPoints);
              }
            } catch (err) { }
          }
        }
      }
    } catch { } finally {
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

    const onConnect = () => {
      setSocketConnected(true);
      if (typeof window !== 'undefined' && navigator.onLine) {
        window.dispatchEvent(new Event('online'));
      }
    };
    const onDisconnect = () => setSocketConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    setSocketConnected(socket.connected);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  // مزامنة وتفريغ طابور الـ IndexedDB على دفعات (Chunks of 50) لتقليل حجم الحزم لـ 2G/3G
  const flushOfflineQueue = useCallback(async () => {
    if (isFlushingRef.current) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    isFlushingRef.current = true;
    try {
      // 1. أولاً تفريغ نقاط الـ GPS المخزنة على دفعات صغيرة لتناسب شبكات 2G/3G
      const queued = await getQueuedTelemetry();
      if (queued.length > 0) {
        const sorted = [...queued].sort((a, b) => (Number(a.timestamp) || 0) - (Number(b.timestamp) || 0));
        const CHUNK_SIZE = 50;
        let syncedCount = 0;

        for (let i = 0; i < sorted.length; i += CHUNK_SIZE) {
          const chunk = sorted.slice(i, i + CHUNK_SIZE);
          const res = await gpsService.sendBatchTelemetry(chunk);
          if (res.success) {
            const idsToRemove = chunk.map((p) => p.id).filter((id): id is number => id !== undefined);
            if (idsToRemove.length > 0) {
              await removeQueuedTelemetryPoints(idsToRemove);
            }
            syncedCount += res.data?.processedCount || chunk.length;
            setOfflineQueueCount((prev) => Math.max(0, prev - chunk.length));
          } else {
            console.warn('[Driver] Batch telemetry sync chunk failed, preserving remaining points');
            break;
          }
        }

        if (syncedCount > 0) {
          setSuccessNotice(`تمت مزامنة ${syncedCount} نقطة تتبع مخزنة بنجاح.`);
          setTimeout(() => setSuccessNotice(null), 3500);
        }
      }

      // 2. ثانياً مزامنة العمليات الميدانية (بدء المهمة / إنهاء المهمة)
      // عند إرسال إنهاء المهمة الآن، تكون جميع نقاط الـ GPS قد وصلت قاعدة البيانات بالفعل!
      const actionsRes = await driverTaskService.flushOfflineActions();
      if (actionsRes.succeeded > 0) {
        setSuccessNotice(`تمت مزامنة ${actionsRes.succeeded} عملية ميدانية مخزنة.`);
        setTimeout(() => setSuccessNotice(null), 3000);
      }
    } catch (err) {
      console.warn('[Driver] flushOfflineQueue error:', err);
    } finally {
      isFlushingRef.current = false;
      try {
        const remaining = await getQueuedTelemetry();
        setOfflineQueueCount(remaining.length);
      } catch { }
    }
  }, []);

  // مراقبة اتصال الشبكة
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      flushOfflineQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);
    if (navigator.onLine) {
      flushOfflineQueue();
    } else {
      getQueuedTelemetry()
        .then((queued) => setOfflineQueueCount(queued.length))
        .catch((err) => console.warn('[Driver] readOfflineQueue error:', err));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [flushOfflineQueue]);

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
    async ({ lat, lng, speed, heading, accuracy }: Coordinates) => {
      const now = Date.now();

      const speedKmH = speed !== null && speed >= 0 ? Math.round(speed * 3.6) : 0;
      const headingDeg = heading !== null && !isNaN(heading) ? Math.round(heading) : 0;

      // تقريب الإحداثيات لـ 5 خانات عشرية (~1.1 متر) لتقليل حجم الحزم لشبكات 2G/3G
      const lat5 = Number(lat.toFixed(5));
      const lng5 = Number(lng.toFixed(5));

      const coords = {
        lat: lat5,
        lng: lng5,
        speed: speedKmH,
        heading: headingDeg,
        accuracy: Math.round(accuracy),
      };

      let deltaMeters = 0;
      let headingDelta = 0;

      if (lastEmittedCoordsRef.current) {
        const deltaKm = calculateHaversineDistance(
          lastEmittedCoordsRef.current.lat,
          lastEmittedCoordsRef.current.lng,
          lat5,
          lng5
        );
        deltaMeters = deltaKm * 1000;

        // 2. فحص القفزة المستحيلة (أكثر من 180 كم/ساعة) - حماية ضد شطحات أبراج الاتصال عند انقطاع/عودة النت
        const elapsedSec = (now - lastEmittedTimeRef.current) / 1000;
        if (elapsedSec > 0 && (deltaKm / (elapsedSec / 3600)) > 180) {
          return;
        }

        if (deltaKm > 0.001) {
          setTripStats((prev) => ({
            ...prev,
            totalDistanceMeters: prev.totalDistanceMeters + deltaMeters,
            maxSpeed: Math.max(prev.maxSpeed, speedKmH),
          }));
        }
      }

      if (lastEmittedHeadingRef.current !== null) {
        const diff = Math.abs(headingDeg - lastEmittedHeadingRef.current);
        headingDelta = diff > 180 ? 360 - diff : diff;
      }

      latestCoordsRef.current = coords;
      setCurrentCoords(coords);

      // تحديث مسار الرسم المحلي: أضف النقطة فقط إذا تحركت المركبة مسافة حقيقية (لا تقل عن 5 أمتار)
      setTraversedPath((prev) => {
        if (prev.length === 0) {
          return [{ lat: lat5, lng: lng5, speed: speedKmH, heading: headingDeg, timestamp: now }];
        }
        const last = prev[prev.length - 1];
        const distFromLast = calculateHaversineDistance(last.lat, last.lng, lat5, lng5) * 1000;
        if (distFromLast >= 5) {
          return [...prev, { lat: lat5, lng: lng5, speed: speedKmH, heading: headingDeg, timestamp: now }];
        }
        return prev;
      });

      // خوارزمية البث التكيفية للحد الأدنى من البيانات (2G/3G Dynamic Throttling / Low Data Mode):
      // 1. التوقف التام (سرعة < 3 كم/س ومسافة < 5م): إرسال كل 30 ثانية (أو 60 ثانية في وضع توفير البيانات)
      // 2. المنعطفات (تغير زاوية الاتجاه >= 15 درجة): إرسال فوري لمنع الخط المستقيم (بحد أدنى 2-2.5 ثانية)
      // 3. الحركة في خط مستقيم: إرسال كل 4 ثوانٍ (أو 8 ثوانٍ في وضع توفير البيانات لخفض الاستهلاك بنسبة 60%)
      // 4. نبضة دورية كل 30 ثانية (أو 60 ثانية في وضع التوفير)
      const timeElapsed = now - lastEmittedTimeRef.current;
      const isStationary = speedKmH < 3 && deltaMeters < 5;
      const turnMinInterval = isLowDataMode ? 2500 : 2000;
      const isTurning = headingDelta >= 15 && timeElapsed >= turnMinInterval;
      const straightInterval = isLowDataMode ? 8000 : 4000;
      const isMovingInterval = !isStationary && timeElapsed >= straightInterval;
      const heartbeatInterval = isLowDataMode ? 60000 : 30000;
      const isHeartbeat = timeElapsed >= heartbeatInterval;

      const shouldEmit = (lastEmittedTimeRef.current === 0) || isTurning || isMovingInterval || isHeartbeat;

      if (shouldEmit) {
        const payload: DriverTelemetryPayload = {
          vehicleId,
          taskId: taskId.trim() || undefined,
          companyId: user?.companyId,
          lat: lat5,
          lng: lng5,
          speed: speedKmH,
          heading: headingDeg,
          accuracy: Math.round(accuracy),
          timestamp: now,
        };

        const isCurrentlyConnected = typeof navigator !== 'undefined' && navigator.onLine && socketConnected;

        if (isCurrentlyConnected && offlineQueueCount === 0 && !isFlushingRef.current) {
          emitDriverLocation(payload);
          setTripStats((prev) => ({
            ...prev,
            sentPointsCount: prev.sentPointsCount + 1,
            startTime: prev.startTime || now,
          }));
        } else {
          await queueTelemetryPoint(payload);
          setOfflineQueueCount((c) => c + 1);
          if (isCurrentlyConnected && !isFlushingRef.current) {
            flushOfflineQueue();
          }
        }

        lastEmittedTimeRef.current = now;
        lastEmittedCoordsRef.current = { lat: lat5, lng: lng5 };
        lastEmittedHeadingRef.current = headingDeg;
      }
    },
    [vehicleId, taskId, user?.companyId, socketConnected, offlineQueueCount, flushOfflineQueue, isLowDataMode]
  );

  const handlePositionError = useCallback((error: GeolocationPositionError) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        if (typeof window !== 'undefined' && !window.isSecureContext) {
          setErrorMessage('المتصفح يمنع تحديد الموقع عبر شبكة HTTP غير المشفرة. يرجى تفعيل HTTPS (عبر Ngrok) أو السماح بالموقع في إعدادات متصفح الهاتف.');
        } else {
          setErrorMessage('يرجى السماح بالوصول للموقع الجغرافي (GPS) لتفعيل التتبع من إعدادات المتصفح.');
        }
        setIsBroadcasting(false);
        break;
      case error.POSITION_UNAVAILABLE:
        setErrorMessage('إشارة الـ GPS ضعيفة أو انقطعت مؤقتاً. جاري إعادة المحاولة تلقائياً...');
        break;
      case error.TIMEOUT:
        setErrorMessage('مهلة التقاط إشارة الـ GPS مؤقتة. جاري انتظار القمر الصناعي...');
        break;
      default:
        setErrorMessage('حدث خطأ مؤقت أثناء التقاط الموقع الجغرافي.');
        break;
    }
  }, []);

  // بدء البث الفعلي
  const startBroadcasting = () => {
    setErrorMessage(null);
    setSuccessNotice(null);

    const stopWatching = watchCurrentLocation(
      handlePositionSuccess,
      handlePositionError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    if (!stopWatching) {
      setErrorMessage('المتصفح لا يدعم ميزة تحديد الموقع (Geolocation).');
      return;
    }

    requestWakeLock();
    locationWatchCleanupRef.current = stopWatching;

    // مؤقت نبضات احتياطي خفيف كل 30 ثانية لتوفير استهلاك باقة 2G/3G في حال توقف المركبة أثناء الاتصال
    if (broadcastIntervalRef.current) clearInterval(broadcastIntervalRef.current);
    broadcastIntervalRef.current = setInterval(async () => {
      const coords = latestCoordsRef.current;
      if (!coords || !vehicleId) return;

      const now = Date.now();
      if (now - lastEmittedTimeRef.current < 28000) return;

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

      if (typeof navigator !== 'undefined' && navigator.onLine && socketConnected) {
        emitDriverLocation(payload);
        lastEmittedTimeRef.current = now;
      } else {
        await queueTelemetryPoint(payload);
        setOfflineQueueCount((c) => c + 1);
        lastEmittedTimeRef.current = now;
      }
    }, 30000);

    setIsBroadcasting(true);
    setTripStats((prev) => ({ ...prev, startTime: Date.now() }));
  };

  // إيقاف البث
  const stopBroadcasting = () => {
    locationWatchCleanupRef.current?.();
    locationWatchCleanupRef.current = null;
    if (broadcastIntervalRef.current) {
      clearInterval(broadcastIntervalRef.current);
      broadcastIntervalRef.current = null;
    }
    releaseWakeLock();
    setIsBroadcasting(false);
  };

  // قبول وبدء المهمة (يدعم العمل بدون إنترنت مع حفظ وتأكيد محلي)
  const handleAcceptTask = async () => {
    if (!activeTask?._id) return;
    setIsTaskActionLoading(true);
    setErrorMessage(null);
    try {
      const result = await driverTaskService.acceptTask(activeTask._id);
      if (result.offline) {
        setSuccessNotice('📴 تم بدء المهمة بنجاح (وضع بدون إنترنت). سيتم التزامن مع السيرفر فور عودة الاتصال.');
      } else {
        setSuccessNotice('🚀 تم قبول المهمة وبدء تنفيذها! تم تفعيل الـ GPS تلقائياً.');
      }
      setActiveTask((prev: any) => ({ ...prev, status: 'inprogress' }));
      startBroadcasting();
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء بدء المهمة');
    } finally {
      setIsTaskActionLoading(false);
    }
  };

  // إنهاء المهمة وتسليمها (يدعم العمل بدون إنترنت مع حفظ وتأكيد محلي)
  const handleFinishTask = async () => {
    if (!activeTask?._id) return;
    setIsTaskActionLoading(true);
    setErrorMessage(null);
    try {
      // 1. أولاً: تفريغ أي نقاط GPS متبقية في طابور الهاتف على دفعات والتأكد من وصولها للسيرفر
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        await flushOfflineQueue();
      }

      // 2. ثانياً: إنهاء المهمة رسمياً في السيرفر (الآن السيرفر سيجد كافة النقاط جاهزة أمامه)
      const endOdo = endOdometerInput ? Number(endOdometerInput) : undefined;
      const result = await driverTaskService.finishTask(activeTask._id, { endOdometer: endOdo });
      stopBroadcasting();
      setShowFinishModal(false);
      if (result.offline) {
        setSuccessNotice('📴 تم تسجيل إنهاء المهمة محلياً (بدون إنترنت). سيتم تسليمها للسيرفر فور توفر الشبكة.');
      } else {
        setSuccessNotice('🎉 تم تسليم المهمة بنجاح وتوليد ملخص الرحلة!');
      }
      setActiveTask((prev: any) => ({ ...prev, status: 'finished' }));
      if (navigator.onLine) {
        loadInitialData();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء إنهاء المهمة');
    } finally {
      setIsTaskActionLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      locationWatchCleanupRef.current?.();
      if (broadcastIntervalRef.current) {
        clearInterval(broadcastIntervalRef.current);
      }
      releaseWakeLock();
    };
  }, []);

  return (
    <div className="flex flex-col flex-1 bg-slate-100 text-slate-900 font-sans">
      {/* ── شريط الرأس الميداني الذكي ── */}
      <DriverHeader
        plateNumber={plateNumber}
        onRefresh={loadInitialData}
        isRefreshing={isLoadingData}
      />

      {/* ── تنبيهات النظام السريعة ── */}
      <div className="px-3 sm:px-4 mt-2 max-w-lg mx-auto w-full">
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 animate-in fade-in shadow-xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}
        {successNotice && (
          <div className="flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900 animate-in fade-in shadow-xs">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#195CF1]" />
            <span className="font-medium">{successNotice}</span>
          </div>
        )}
      </div>

      {/* ── مسرح قمرة القيادة الميدانية (Driver Cockpit Stage) ── */}
      <main className="flex-1 px-3 sm:px-4 py-2 flex flex-col gap-3 max-w-lg mx-auto w-full pb-6">
        {/* ── 1. شريط المؤشرات التكتيكية السريع (Floating Telemetry Strip) ── */}
        <div className="flex items-center justify-between gap-1.5 rounded-2xl bg-white/95 backdrop-blur-md px-3 py-2 border border-slate-200/90 shadow-sm text-[11px] font-bold text-slate-700 select-none">
          {/* حالة الاتصال والسوكت */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-xl bg-slate-50 border border-slate-200/60">
            {isOnline && socketConnected ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-700">مباشر</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-amber-800">
                  {offlineQueueCount > 0 ? `محلي (${offlineQueueCount})` : 'منفصل'}
                </span>
              </>
            )}
          </div>

          {/* المسافة المقطوعة وعدد النقاط */}
          <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
            <span>{(tripStats.totalDistanceMeters / 1000).toFixed(1)} كم</span>
            <span className="text-slate-300">•</span>
            <span className="text-[#195CF1]">{tripStats.sentPointsCount} نقطة</span>
          </div>

          {/* زر توفير البيانات لشبكات 2G/3G */}
          <button
            onClick={toggleLowDataMode}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border transition-all cursor-pointer select-none active:scale-95 ${
              isLowDataMode
                ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-800'
            }`}
            title="تفعيل وضع توفير البيانات لشبكات 2G/3G وضعف الواي فاي"
          >
            <Zap className={`h-3 w-3 ${isLowDataMode ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
            <span>{isLowDataMode ? 'توفير 2G/3G' : 'عادي'}</span>
          </button>

          {/* قفل الشاشة */}
          <button
            onClick={wakeLockActive ? releaseWakeLock : requestWakeLock}
            className={`flex items-center justify-center h-7 w-7 rounded-xl border transition-all cursor-pointer select-none ${
              wakeLockActive
                ? 'bg-blue-50 text-[#195CF1] border-blue-200 shadow-xs'
                : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600'
            }`}
            title={wakeLockActive ? 'قفل الشاشة مفعل (لن تنطفئ)' : 'انقر لإبقاء الشاشة مضاءة'}
          >
            {wakeLockActive ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* ── 2. مسرح الخريطة الملاحية الحية (Live Interactive Navigation Map) ── */}
        <div className="w-full relative shadow-md">
          <DriverLiveMap
            currentCoords={currentCoords}
            pickupCoords={activeTask?.pickupLocation}
            deliveryCoords={activeTask?.deliveryLocation}
            plateNumber={plateNumber}
            traversedPath={traversedPath}
            mapHeight="44vh"
            showSpeedometer={true}
            className="w-full"
          />
        </div>

        {/* ── 3. قمرة القيادة والتحكم الميداني التفاعلية (Driver Action Cockpit Card) ── */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-4 shadow-xl space-y-3.5 relative">
          {activeTask ? (
            <>
              {/* شريط معلومات المهمة والحالة */}
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-50 text-[#195CF1]">
                    <Route className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 leading-tight">
                      {activeTask.description || 'مهمة نقل وشحنة لوجستية'}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      #{activeTask._id.slice(-6)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      activeTask.status === 'inprogress'
                        ? 'bg-blue-50 text-[#195CF1] border border-blue-200'
                        : activeTask.status === 'finished'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {activeTask.status === 'inprogress'
                      ? 'قيد التنفيذ 🟢'
                      : activeTask.status === 'finished'
                      ? 'مكتملة 🏁'
                      : 'في الانتظار ⏳'}
                  </span>
                </div>
              </div>

              {/* بطاقة تفاصيل الوجهة والموقع المبرزة */}
              <div className="rounded-2xl bg-slate-50 p-3 space-y-2 border border-slate-200/70">
                {/* موقع التسليم (الوجهة الرئيسية) */}
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#195CF1] text-white text-[10px] font-bold shadow-xs">
                    ب
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 block">وجهة التسليم (العميل):</span>
                    <p className="text-xs font-black text-slate-900 truncate m-0">
                      {activeTask.deliveryLocation?.address || 'عنوان العميل المحدد'}
                    </p>
                    {activeTask.customer?.name && (
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        العميل: {activeTask.customer.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* موقع الاستلام الثانوي */}
                <div className="flex items-center gap-2.5 pt-1.5 border-t border-slate-200/60 text-slate-500">
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-300 text-slate-700 text-[9px] font-bold">
                    أ
                  </div>
                  <div className="flex-1 min-w-0 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 shrink-0">الانطلاق:</span>
                    <span className="font-semibold text-slate-700 truncate pr-1">
                      {activeTask.pickupLocation?.address || 'مقر مستودع الشركة'}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── أزرار العمليات الميدانية السريعة (Quick Driving Action Suite) ── */}
              <div className="space-y-2">
                {/* أزرار الاتصال والملاحة */}
                <div className="flex items-center gap-2">
                  {/* زر الملاحة في خرائط Google */}
                  {activeTask.deliveryLocation && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${
                        activeTask.deliveryLocation.lat || ''
                      },${activeTask.deliveryLocation.lng || ''}&destination_place_id=${encodeURIComponent(
                        activeTask.deliveryLocation.address || ''
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-blue-50 border border-blue-200/90 hover:bg-blue-100/90 py-3 text-xs font-bold text-[#195CF1] transition-all active:scale-98 no-underline shadow-xs"
                    >
                      <Navigation className="h-4 w-4 text-[#195CF1]" />
                      <span>فتح الملاحة (Google Maps)</span>
                    </a>
                  )}

                  {/* أزرار التواصل المباشر مع العميل */}
                  {activeTask.customer?.phone && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={`tel:${activeTask.customer.phone}`}
                        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-[#195CF1] hover:bg-slate-100 transition-all active:scale-95 shadow-xs"
                        title="اتصال هاتفي بالعميل"
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                      <a
                        href={`https://wa.me/${activeTask.customer.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all active:scale-95 shadow-xs"
                        title="مراسلة واتساب"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </a>
                    </div>
                  )}
                </div>

                {/* ── الزر الأساسي الأكبر للعملية (Primary Cockpit CTA) ── */}
                {activeTask.status === 'pending' && (
                  <button
                    onClick={handleAcceptTask}
                    disabled={isTaskActionLoading}
                    className="w-full h-13 flex items-center justify-center gap-2 rounded-2xl bg-[#195CF1] hover:bg-blue-700 text-white font-black text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    <span>قبول المهمة وبدء التحرك 🚀</span>
                  </button>
                )}

                {activeTask.status === 'inprogress' && (
                  <button
                    onClick={() => {
                      const estimatedOdo =
                        (activeTask.startOdometer || 1000) +
                        Math.round(tripStats.totalDistanceMeters / 1000);
                      setEndOdometerInput(String(estimatedOdo));
                      setShowFinishModal(true);
                    }}
                    disabled={isTaskActionLoading}
                    className="w-full h-13 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/25 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    <FileCheck className="h-5 w-5" />
                    <span>تسليم الشحنة وتأكيد الوصول 🏁</span>
                  </button>
                )}

                {/* شريط التحكم الثانوي بالبث المباشر */}
                {activeTask.status === 'inprogress' && (
                  <div className="flex items-center justify-between pt-1 px-1 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Radio className={`h-3 w-3 ${isBroadcasting ? 'text-[#195CF1] animate-pulse' : 'text-slate-400'}`} />
                      <span>{isBroadcasting ? 'بث الـ GPS المباشر نشط' : 'بث الـ GPS متوقف'}</span>
                    </div>

                    <button
                      onClick={isBroadcasting ? stopBroadcasting : startBroadcasting}
                      className="text-[#195CF1] hover:text-blue-800 font-bold underline cursor-pointer"
                    >
                      {isBroadcasting ? 'إيقاف مؤقت ⏸️' : 'استئناف البث 📡'}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* حالة عدم وجود مهمة جارية (حالة الاستعداد) */
            <div className="text-center py-4 space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <Truck className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">أنت في وضع الجاهزية والاستعداد 🟢</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  المركبة {plateNumber} مسندة لك وبث الـ GPS جاهز لتلقي المهام
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-1">
                <Link
                  href="/driver/tasks"
                  className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-[#195CF1] hover:bg-blue-700 text-white font-bold px-5 py-3 text-xs shadow-md shadow-blue-500/20 transition-all active:scale-98 no-underline"
                >
                  <Route className="h-3.5 w-3.5" />
                  <span>استعراض جدول المهام ({tasks.length})</span>
                </Link>

                <button
                  onClick={isBroadcasting ? stopBroadcasting : startBroadcasting}
                  className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold px-4 py-3 text-xs transition-all active:scale-98 cursor-pointer"
                >
                  <Radio className={`h-3.5 w-3.5 ${isBroadcasting ? 'text-[#195CF1] animate-pulse' : 'text-slate-400'}`} />
                  <span>{isBroadcasting ? 'إيقاف البث' : 'تجربة البث'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── مودال إنهاء المهمة وتسجيل العداد التفاعلي (Modern Bottom Sheet Modal) ── */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4 text-slate-800">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
                <FileCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 m-0">تسليم وإنهاء المهمة رسمياً</h3>
                <p className="text-[11px] text-slate-500 m-0 mt-0.5">توثيق اكتمال الرحلة وحفظ ملخص الـ GPS</p>
              </div>
            </div>

            {/* بطاقة ملخص الرحلة التلقائي */}
            <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200/80 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-600">
                <span>المسافة المقطوعة المسجلة:</span>
                <span className="font-mono font-bold text-slate-900">
                  {(tripStats.totalDistanceMeters / 1000).toFixed(1)} كم
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>إجمالي نقاط التتبع المحفوظة:</span>
                <span className="font-mono font-bold text-[#195CF1]">
                  {tripStats.sentPointsCount} نقطة
                </span>
              </div>
            </div>

            {/* حقل قراءة عداد المسافات */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>قراءة عداد المسافات النهائي:</span>
                <span className="text-[10px] text-slate-400">كم (محسوب تقريبياً)</span>
              </label>
              <input
                type="number"
                value={endOdometerInput}
                onChange={(e) => setEndOdometerInput(e.target.value)}
                placeholder="مثلاً: 12540"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 font-mono font-bold focus:border-[#195CF1] focus:outline-none shadow-xs"
              />
            </div>

            {/* أزرار الإجراء */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleFinishTask}
                disabled={isTaskActionLoading}
                className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3.5 text-xs font-black text-white shadow-md shadow-emerald-600/25 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {isTaskActionLoading ? 'جاري التوثيق...' : 'تأكيد التسليم النهائي 🏁'}
              </button>
              <button
                onClick={() => setShowFinishModal(false)}
                className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3.5 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
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
