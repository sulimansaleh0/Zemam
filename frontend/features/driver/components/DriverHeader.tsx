'use client';

import React, { useEffect, useState } from 'react';
import { Truck, RefreshCw } from 'lucide-react';
import { getGpsSocket } from '@/features/gps/services/gpsSocket';
import { usePathname } from 'next/navigation';

interface DriverHeaderProps {
  plateNumber?: string;
  driverName?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function DriverHeader({
  plateNumber,
  driverName,
  onRefresh,
  isRefreshing,
}: DriverHeaderProps) {
  const pathname = usePathname();
  const [socketConnected, setSocketConnected] = useState(false);

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

  if (pathname === '/driver/login') {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-4 py-3 shadow-xs">
      {/* ── لوجو زمام ومعلومات السائق ── */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm shrink-0">
          <Truck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
            <span>زمام السائق</span>
            <span className="rounded-md bg-teal-50 px-1.5 py-0.5 text-[10px] font-bold text-teal-700 border border-teal-200/60">
              PWA
            </span>
          </h1>
          <p className="text-[11px] text-slate-500 font-medium truncate max-w-[170px]">
            {plateNumber || 'مركبة الأسطول'} {driverName ? `• ${driverName}` : ''}
          </p>
        </div>
      </div>

      {/* ── مؤشرات الاتصال والإجراءات ── */}
      <div className="flex items-center gap-2">
        {/* حالة الـ WebSocket */}
        <div
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
            socketConnected
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
          title={socketConnected ? 'البث المباشر متصل' : 'البث المباشر غير متصل'}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              socketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span className="text-[10px]">{socketConnected ? 'مباشر' : 'منفصل'}</span>
        </div>

        {/* زر التحديث السريع إن وجد */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            title="تحديث البيانات"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-teal-600' : ''}`} />
          </button>
        )}
      </div>
    </header>
  );
}
