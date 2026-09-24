'use client';

import React, { useEffect, useState } from 'react';
import { Download, Share2, WifiOff, X, MoreVertical, Smartphone } from 'lucide-react';

export function PwaRegister() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. تسجيل الـ Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    }

    // 2. التحقق من وضع الـ Standalone
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsInstalled(isStandalone);

    // 3. التقاط حدث التثبيت لأجهزة Android / Chromium
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 4. كشف نوع الجهاز
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAnyMobile = /android|iphone|ipad|ipod|mobile/i.test(userAgent);
    setIsIOS(isIosDevice);
    setIsMobile(isAnyMobile);

    // 5. مراقبة حالة الشبكة
    const updateOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    setIsOffline(!navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      try {
        installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setInstallPrompt(null);
          return;
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
    }

    if (isIOS) {
      setShowIOSPrompt(true);
    } else {
      setShowAndroidPrompt(true);
    }
  };

  return (
    <>
      {/* ── شريط التنبيه عند انقطاع الإنترنت ── */}
      {isOffline && (
        <div className="bg-amber-500 text-white text-xs py-1.5 px-4 flex items-center justify-between shadow-xs sticky top-0 z-50 animate-in fade-in">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 shrink-0 animate-pulse" />
            <span className="font-semibold">
              أنت تعمل في وضع عدم الاتصال (Offline) - سيتم حفظ البيانات ومزامنتها تلقائياً.
            </span>
          </div>
          <span className="text-[10px] bg-amber-600/80 px-2 py-0.5 rounded-full font-mono">محلي</span>
        </div>
      )}

      {/* ── بانر تثبيت تطبيق الـ PWA ── */}
      {!isInstalled && !dismissedBanner && (
        <div className="mx-3 mt-2 rounded-2xl border border-teal-200/90 bg-white p-3 shadow-md flex items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-200 shrink-0">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-xs">تثبيت تطبيق زمام السائق</p>
              <p className="text-[10px] text-slate-500">يعمل بدون أشرطة متصفح ويدعم العمل بدون إنترنت</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="rounded-xl bg-teal-700 hover:bg-teal-800 px-3.5 py-1.5 font-bold text-white text-[11px] shadow-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              تثبيت
            </button>
            <button
              onClick={() => setDismissedBanner(true)}
              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              title="إغلاق"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── مودال إرشادات التثبيت على أجهزة Android ── */}
      {showAndroidPrompt && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-teal-700" />
                تثبيت التطبيق على هاتف Android
              </h3>
              <button onClick={() => setShowAndroidPrompt(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <ol className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700 font-bold text-[10px] border border-teal-200">
                  1
                </span>
                <span>
                  اضغط على زر <b>خيارات المتصفح</b> <MoreVertical className="inline h-3.5 w-3.5 text-slate-700" /> (الثلاث نقاط في زاوية المتصفح).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700 font-bold text-[10px] border border-teal-200">
                  2
                </span>
                <span>
                  اختر <b>&quot;تثبيت التطبيق&quot; (Install app)</b> أو <b>&quot;إضافة إلى الشاشة الرئيسية&quot; (Add to Home screen)</b>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700 font-bold text-[10px] border border-teal-200">
                  3
                </span>
                <span>اضغط على <b>تثبيت</b> وسيظهر التطبيق فوراً على شاشة هاتفك مع باقي التطبيقات.</span>
              </li>
            </ol>

            <button
              onClick={() => setShowAndroidPrompt(false)}
              className="w-full rounded-xl bg-teal-700 py-2.5 text-xs font-bold text-white hover:bg-teal-800 transition-colors"
            >
              فهمت ذلك
            </button>
          </div>
        </div>
      )}

      {/* ── مودال إرشادات التثبيت على أجهزة آيفون (iOS Safari) ── */}
      {showIOSPrompt && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Share2 className="h-4 w-4 text-teal-700" />
                تثبيت التطبيق على iPhone / iPad
              </h3>
              <button onClick={() => setShowIOSPrompt(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <ol className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700 font-bold text-[10px] border border-teal-200">
                  1
                </span>
                <span>اضغط على أيقونة <b>المشاركة (Share)</b> في شريط متصفح Safari بالأسفل.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700 font-bold text-[10px] border border-teal-200">
                  2
                </span>
                <span>مرر للأسفل في القائمة واختر <b>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</b>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700 font-bold text-[10px] border border-teal-200">
                  3
                </span>
                <span>اضغط <b>إضافة (Add)</b> في الزاوية العلوية لتثبيت التطبيق بنجاح.</span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSPrompt(false)}
              className="w-full rounded-xl bg-teal-700 py-2.5 text-xs font-bold text-white hover:bg-teal-800 transition-colors"
            >
              فهمت ذلك
            </button>
          </div>
        </div>
      )}
    </>
  );
}
