'use client';

import { io, Socket } from 'socket.io-client';
import type { DriverTelemetryPayload, VehicleLiveTelemetry } from '../types/gps.types';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

let socketInstance: Socket | null = null;

/**
 * الحصول على كائن اتصال السوكت كـ Singleton
 */
export function getGpsSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('🟢 [GPS Socket] Connected to server successfully:', socketInstance?.id);
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
  const socket = getGpsSocket();
  if (!socket.connected) {
    socket.connect();
  }

  socket.emit('fleet:join', {
    role,
    companyId,
    teamId,
  });
}

/**
 * مغادرة غرفة التتبع وفصل السوكت عند مغادرة الصفحة
 */
export function leaveFleetTracking() {
  if (socketInstance) {
    socketInstance.emit('fleet:leave');
    socketInstance.disconnect();
    socketInstance = null;
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
  socket.emit('driver:location_update', payload);
}

/**
 * الاشتراك في حدث تحديث موقع مركبة حي
 */
export function onVehicleLocationChanged(callback: (telemetry: VehicleLiveTelemetry) => void) {
  const socket = getGpsSocket();
  socket.on('vehicle:location_changed', callback);
  return () => {
    socket.off('vehicle:location_changed', callback);
  };
}

/**
 * الاشتراك في حدث إتمام رحلة وتوفر ملخص
 */
export function onTripCompleted(callback: (summary: any) => void) {
  const socket = getGpsSocket();
  socket.on('trip:completed', callback);
  return () => {
    socket.off('trip:completed', callback);
  };
}
