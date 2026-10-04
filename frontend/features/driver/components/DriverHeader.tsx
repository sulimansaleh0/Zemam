'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
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
        <Link href="/driver" className="flex items-center gap-2.5 no-underline">
          <div className="relative w-8 h-8 rounded-xl bg-white border border-[#195CF1]/20 p-1 flex items-center justify-center shadow-xs shrink-0">
            <Image
              src="/images/landing/zimam-official-emblem.png?v=3"
              alt="زمام"
              width={26}
              height={26}
              className="object-contain"
              priority
              unoptimized
            />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-slate-900 flex items-center gap-1.5 m-0 leading-tight">
              <span>زمام السائق</span>
              <span className="rounded-md bg-[#195CF1]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#195CF1] border border-[#195CF1]/20">
                PWA
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium truncate max-w-[170px] m-0">
              {plateNumber || 'مركبة الأسطول'} {driverName ? `• ${driverName}` : ''}
            </p>
          </div>
        </Link>
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
