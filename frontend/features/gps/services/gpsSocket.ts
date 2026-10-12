'use client';

import { io, Socket } from 'socket.io-client';
import type { DriverTelemetryPayload, TripSummary, VehicleLiveTelemetry } from '../types/gps.types';
import { sendRequest } from '@/shared/lib/coreApi';
import { API_PATHS } from '@/shared/constants/apiPaths';
import { zemamGeoCodec } from '@/shared/lib/geoSync';

export function getSocketUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
}

async function getSocketTicket(): Promise<string> {
  const result = await sendRequest<{ ticket: string }>(API_PATHS.AUTH.SOCKET_TICKET, {
    method: 'POST',
  });

  if (!result.success) {
    throw new Error(result.message || 'Could not authenticate GPS socket');
  }

  return result.data.ticket;
}

let socketInstance: Socket | null = null;
let trackingSubscribersCount = 0;
let lastJoinPayload: { role: string; companyId?: string; teamId?: string } | null = null;

/**
 * الحصول على كائن اتصال السوكت كـ Singleton
 */
export function getGpsSocket(): Socket {
  if (!socketInstance) {
    const targetUrl = getSocketUrl();

    socketInstance = io(targetUrl, {
      withCredentials: true,
      autoConnect: false,
      addTrailingSlash: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      transports: ["websocket", "polling"],
      auth: (callback) => {
        void getSocketTicket()
          .then((ticket) => callback({ ticket }))
          .catch((error: unknown) => {
            console.error('[GPS Socket] Could not obtain authentication ticket:', error);
            callback({});
          });
      },
    });

    socketInstance.on('connect', () => {
      console.log('🟢 [GPS Socket] Connected to server successfully:', socketInstance?.id);
      // إعادة الانضمام لغرف التتبع تلقائياً عند إعادة الاتصال
      if (lastJoinPayload && socketInstance) {
        socketInstance.emit('fleet:join', lastJoinPayload);
      }
    });

    socketInstance.on('disconnect', (reason) => {
      console.warn('🔴 [GPS Socket] Disconnected from server:', reason);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('⚠️ [GPS Socket] Connection error:', err.message);
    });
  }

  return socketInstance;
}

/**
 * الانضمام إلى غرفة تتبع الأسطول المحددة بالدور والشركة/الفريق
 */
export function joinFleetTracking(role: string, companyId?: string, teamId?: string) {
  trackingSubscribersCount++;
  lastJoinPayload = { role, companyId, teamId };

  const socket = getGpsSocket();
  const emitJoin = () => {
    socket.emit('fleet:join');
  };

  if (!socket.connected) {
    socket.connect();
    socket.once('connect', emitJoin);
  } else {
    emitJoin();
  }
}

/**
 * مغادرة غرفة التتبع وفصل السوكت عند مغادرة الصفحة
 */
export function leaveFleetTracking() {
  trackingSubscribersCount = Math.max(0, trackingSubscribersCount - 1);
  if (trackingSubscribersCount === 0 && socketInstance && socketInstance.connected) {
    socketInstance.emit('fleet:leave');
  }
}

/**
 * إرسال نبضة GPS حية من طرف السائق (PWA)
 */
export function emitDriverLocation(payload: DriverTelemetryPayload) {
  const socket = getGpsSocket();
  if (!socket.connected) {
    socket.connect();
  }

  // إرسال نبضة واحدة فقط لتجنب المعالجة المزدوجة في الباك إند
  socket.emit('driver:location_update', {
    lat: payload.lat,
    lng: payload.lng,
    speed: payload.speed,
    heading: payload.heading,
    accuracy: payload.accuracy,
    timestamp: payload.timestamp,
  });
}

/**
 * إرسال نبضة GPS مشفرة بنظام باينري فائق الخفة (~8 بايت) لتوفير باقة النت والبطارية على شبكات 2G/EDGE
 */
export function emitDriverLocationBin(payload: DriverTelemetryPayload) {
  const socket = getGpsSocket();
  if (!socket.connected) {
    socket.connect();
  }

  try {
    const binaryPulse = zemamGeoCodec.encodePoint({
      lat: payload.lat,
      lon: payload.lng,
      speed: payload.speed != null ? payload.speed / 3.6 : 0,
      heading: payload.heading ?? 0,
      ageSec: payload.timestamp ? Math.max(0, Math.round((Date.now() - payload.timestamp) / 1000)) : 0,
    });

    console.log(`\n📡 [DRIVER GPS] نبضة تتبع:`, {
      '1. قبل التشفير (Raw Point)': {
        lat: payload.lat,
        lng: payload.lng,
        speed: payload.speed,
        heading: payload.heading,
      },
      '2. بعد التشفير (Binary)': `${binaryPulse.length} بايت (${Array.from(binaryPulse).map((b) => b.toString(16).padStart(2, '0')).join(' ')})`,
    });

    socket.emit('driver:location_bin', { bin: binaryPulse });
  } catch {
    // عودة تلقائية إلى JSON في حالة حدوث أي تعذر في التشفير
    emitDriverLocation(payload);
  }
}

/**
 * الاستماع لتحديثات الموقع اللحظية لمركبات الأسطول
 */
export function onFleetTelemetryUpdate(callback: (telemetry: VehicleLiveTelemetry) => void): () => void {
  const socket = getGpsSocket();
  if (!socket.connected) {
    socket.connect();
  }

  const handler = (data: VehicleLiveTelemetry) => {
    console.log(`📡 [GPS Socket] Live telemetry received for vehicle ${data?.vehicleId}:`, data?.currentLocation);
    callback(data);
  };

  socket.on('vehicle:location_changed', handler);

  return () => {
    socket.off('vehicle:location_changed', handler);
  };
}

export const onVehicleLocationChanged = onFleetTelemetryUpdate;

export function onTripCompleted(callback: (summary: TripSummary) => void): () => void {
  const socket = getGpsSocket();
  const handler = (summary: TripSummary) => callback(summary);

  socket.on('trip:completed', handler);

  return () => {
    socket.off('trip:completed', handler);
  };
}
