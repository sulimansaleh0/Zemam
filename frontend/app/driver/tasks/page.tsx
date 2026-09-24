'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  MapPin,
  Navigation,
  Phone,
  MessageSquare,
  Camera,
  AlertCircle,
  RefreshCw,
  Play,
  FileCheck,
  X,
  Truck,
} from 'lucide-react';
import { driverTaskService } from '@/features/driver/services/driverTaskService';
import type { DriverTask } from '@/features/driver/types/driverPwa.types';
import { DriverHeader } from '@/features/driver/components/DriverHeader';

type TaskTab = 'all' | 'inprogress' | 'pending' | 'finished';

export default function DriverTasksPage() {
  const [tasks, setTasks] = useState<DriverTask[]>([]);
  const [currentTab, setCurrentTab] = useState<TaskTab>('inprogress');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // حالة مودال إنهاء المهمة (POD)
  const [selectedTaskForFinish, setSelectedTaskForFinish] = useState<DriverTask | null>(null);
  const [endOdometer, setEndOdometer] = useState<string>('');
  const [proofPhoto, setProofPhoto] = useState<File | null>(null);
  const [proofPhotoPreview, setProofPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await driverTaskService.getTasks();
      setTasks(result.tasks);
      if (result.fromCache) {
        setSuccessNotice('تم استرجاع المهام من الذاكرة المحلية (بدون اتصال).');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'تعذر تحميل المهام');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const filteredTasks = tasks.filter((t) => {
    if (currentTab === 'all') return true;
    return t.status === currentTab;
  });

  const handleAccept = async (task: DriverTask) => {
    setActionLoading(true);
    setErrorMessage(null);
    try {
      await driverTaskService.acceptTask(task._id);
      setSuccessNotice('🚀 تم قبول المهمة بنجاح وبدء التنفيذ!');
      await loadTasks();
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل قبول المهمة');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofPhoto(file);
      const url = URL.createObjectURL(file);
      setProofPhotoPreview(url);
    }
  };

  const handleFinishConfirm = async () => {
    if (!selectedTaskForFinish) return;

    setActionLoading(true);
    setErrorMessage(null);
    try {
      const odoNumber = endOdometer ? Number(endOdometer) : undefined;
      await driverTaskService.finishTask(selectedTaskForFinish._id, {
        endOdometer: odoNumber,
        proofPhotoFile: proofPhoto,
      });

      setSuccessNotice('🎉 تم تسليم المهمة بنجاح وتوثيق إثبات التسليم!');
      setSelectedTaskForFinish(null);
      setProofPhoto(null);
      setProofPhotoPreview(null);
      setEndOdometer('');
      await loadTasks();
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل إنهاء المهمة');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-slate-50 text-slate-900">
      <DriverHeader onRefresh={loadTasks} isRefreshing={isLoading} />

      <main className="flex-1 p-4 space-y-4 max-w-lg mx-auto w-full">
        {/* ── عنوان الصفحة ── */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-teal-700" />
              <span>مهام التوصيل والشحنات</span>
            </h2>
            <p className="text-xs text-slate-500">
              إجمالي {tasks.length} مهام معينة لك
            </p>
          </div>
        </div>

        {/* ── تنبيهات ── */}
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successNotice && (
          <div className="flex items-center gap-2 rounded-2xl border border-teal-200 bg-teal-50 p-3 text-xs text-teal-800">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* ── أزرار التبويبات (Tabs) ── */}
        <div className="flex items-center gap-1.5 rounded-2xl bg-white p-1.5 border border-slate-200 shadow-xs text-xs">
          <button
            onClick={() => setCurrentTab('inprogress')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all text-center cursor-pointer ${
              currentTab === 'inprogress'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            الجارية ({tasks.filter((t) => t.status === 'inprogress').length})
          </button>
          <button
            onClick={() => setCurrentTab('pending')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all text-center cursor-pointer ${
              currentTab === 'pending'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            المعلقة ({tasks.filter((t) => t.status === 'pending').length})
          </button>
          <button
            onClick={() => setCurrentTab('finished')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all text-center cursor-pointer ${
              currentTab === 'finished'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            المكتملة ({tasks.filter((t) => t.status === 'finished').length})
          </button>
        </div>

        {/* ── قائمة بطاقات المهام ── */}
        {isLoading ? (
          <div className="text-center py-12 space-y-3">
            <RefreshCw className="h-7 w-7 text-teal-700 animate-spin mx-auto" />
            <p className="text-xs text-slate-500">جاري تحميل المهام الميدانية...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center space-y-2 shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <ClipboardList className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">لا توجد مهام في هذا القسم</p>
            <p className="text-xs text-slate-400">
              سيتم إشعارك فور تعيين مهمة لوجستية جديدة لك من إدارة الأسطول.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm space-y-3 relative overflow-hidden"
              >
                {/* شريط علوي للبطاقة */}
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      task.status === 'inprogress'
                        ? 'bg-teal-50 text-teal-700 border border-teal-200'
                        : task.status === 'finished'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {task.status === 'inprogress'
                      ? 'قيد التنفيذ 🟢'
                      : task.status === 'finished'
                      ? 'تم التسليم 🏁'
                      : 'في الانتظار ⏳'}
                  </span>

                  <span className="text-[11px] font-mono text-slate-400 font-bold">
                    #{task._id.slice(-6)}
                  </span>
                </div>

                {/* عنوان المهمة وتفاصيلها */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">
                    {task.title || 'مهمة توصيل شحنة لوجستية'}
                  </h3>
                  {task.description && (
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* نقاط الانطلاق والتسليم */}
                <div className="rounded-2xl bg-slate-50 p-3 text-xs space-y-2 border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                    <span className="text-slate-400 shrink-0">نقطة الاستلام:</span>
                    <span className="font-semibold text-slate-700 truncate">
                      {task.pickupLocation?.address || 'مقر مستودع الشركة'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-teal-600 shrink-0" />
                    <span className="text-slate-400 shrink-0">نقطة التسليم:</span>
                    <span className="font-semibold text-slate-700 truncate">
                      {task.deliveryLocation?.address || 'عنوان العميل المحدد'}
                    </span>
                  </div>
                </div>

                {/* بيانات العميل والتواصل والملاحة */}
                <div className="flex items-center gap-2 pt-1">
                  {task.deliveryLocation && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${
                        task.deliveryLocation.lat || ''
                      },${task.deliveryLocation.lng || ''}&destination_place_id=${encodeURIComponent(
                        task.deliveryLocation.address || ''
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100/80 py-2.5 text-xs font-bold text-teal-800 transition-colors"
                    >
                      <Navigation className="h-3.5 w-3.5 text-teal-700" />
                      <span>الملاحة (Maps)</span>
                    </a>
                  )}

                  {task.customer?.phone && (
                    <>
                      <a
                        href={`tel:${task.customer.phone}`}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-teal-700 hover:bg-slate-100"
                        title="اتصال بالعميل"
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                      <a
                        href={`https://wa.me/${task.customer.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-emerald-600 hover:bg-slate-100"
                        title="مراسلة واتساب"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </a>
                    </>
                  )}
                </div>

                {/* أزرار الإجراءات */}
                <div className="pt-2 border-t border-slate-100">
                  {task.status === 'pending' && (
                    <button
                      onClick={() => handleAccept(task)}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold py-3 text-xs shadow-xs transition-all cursor-pointer"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      <span>قبول المهمة وبدء التحرك 🚀</span>
                    </button>
                  )}

                  {task.status === 'inprogress' && (
                    <button
                      onClick={() => {
                        setSelectedTaskForFinish(task);
                        setEndOdometer(task.startOdometer ? String(task.startOdometer + 15) : '');
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-xs shadow-xs transition-all cursor-pointer"
                    >
                      <FileCheck className="h-4 w-4" />
                      <span>تسليم الشحنة وتوثيق الإثبات (POD) 🏁</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── مودال إنهاء المهمة وتوثيق إثبات التسليم (POD) ── */}
      {selectedTaskForFinish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">إثبات تسليم الشحنة</h3>
                  <p className="text-[11px] text-slate-500">توثيق اكتمال المهمة وتسليمها</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTaskForFinish(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* قراءة عداد المسافات */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                قراءة عداد المسافات الحالي (كم):
              </label>
              <input
                type="number"
                value={endOdometer}
                onChange={(e) => setEndOdometer(e.target.value)}
                placeholder="مثلاً: 45280"
                className="w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 font-mono focus:border-teal-700 focus:outline-none"
              />
            </div>

            {/* التقاط صورة الشحنة بالكاميرا */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5 text-teal-700" />
                <span>تصوير الشحنة المسلمة:</span>
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
              />

              {proofPhotoPreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-teal-200 h-36 bg-slate-100">
                  <img
                    src={proofPhotoPreview}
                    alt="Proof of delivery"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => {
                      setProofPhoto(null);
                      setProofPhotoPreview(null);
                    }}
                    className="absolute top-2 right-2 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-slate-500 hover:border-teal-600 hover:text-teal-700 transition-colors cursor-pointer"
                >
                  <Camera className="h-6 w-6" />
                  <span className="text-xs font-semibold">فتح الكاميرا والتقاط صورة التسليم</span>
                </button>
              )}
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleFinishConfirm}
                disabled={actionLoading}
                className="flex-1 rounded-2xl bg-teal-700 hover:bg-teal-800 py-3 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                {actionLoading ? 'جاري التسليم...' : 'تأكيد التسليم الرسمي 🏁'}
              </button>
              <button
                onClick={() => setSelectedTaskForFinish(null)}
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
