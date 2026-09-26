'use client';

import { io, Socket } from 'socket.io-client';
import type { DriverTelemetryPayload, VehicleLiveTelemetry } from '../types/gps.types';

export function getSocketUrl(): string {
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    // إذا كان التصفح من IP شبكة محلية (مثل 192.168.10.130) على الهاتف
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      if (hostname.includes('ngrok')) {
        return window.location.origin;
      }
      return `http://${hostname}:3001`;
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
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
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1500,
      transports: ['websocket', 'polling'],
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
    socket.emit('fleet:join', {
      role,
      companyId,
      teamId,
    });
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
  socket.emit('driver:location_update', payload);
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

