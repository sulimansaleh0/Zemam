'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Wrench,
  AlertTriangle,
  Camera,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShieldCheck,
  MapPin,
  X,
} from 'lucide-react';
import { DriverHeader } from '@/features/driver/components/DriverHeader';
import { driverTaskService } from '@/features/driver/services/driverTaskService';
import type { MaintenanceReportPayload } from '@/features/driver/types/driverPwa.types';

const INSPECTION_ITEMS = [
  { id: 'oil', label: 'مستوى زيت المحرك وسوائل التبريد' },
  { id: 'tires', label: 'ضغط وحالة الإطارات الأربعة والاحتياطي' },
  { id: 'brakes', label: 'كفاءة واستجابة دواسة الفرامل والجلنط' },
  { id: 'lights', label: 'إضاءة المصابيح الأمامية والخلفية والإشارات' },
  { id: 'mirrors', label: 'نظافة وسلامة الزجاج والمرايا الجانبية' },
];

export default function DriverMaintenancePage() {
  const [activeTab, setActiveTab] = useState<'report' | 'inspection'>('report');

  // بيانات الفحص اليومي
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // بيانات بلاغ الصيانة / الطوارئ
  const [vehicleId, setVehicleId] = useState('');
  const [availableVehicles, setAvailableVehicles] = useState<Array<{ id: string; plate: string; model: string }>>([]);
  const [type, setType] = useState<'routine' | 'emergency' | 'accident' | 'tires' | 'other'>('emergency');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [description, setDescription] = useState('');
  const [odometer, setOdometer] = useState('');
  const [damagePhotos, setDamagePhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [currentCoords, setCurrentCoords] = useState<{ lat?: number; lng?: number }>({});

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    async function loadVehicles() {
      try {
        const res = await fetch('/api/gps/live', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          const raw = data?.vehicles || data?.data?.vehicles || [];
          if (raw.length > 0) {
            const list = raw.map((v: any) => ({
              id: v.vehicleId || v._id,
              plate: v.plateNumber || 'بدون لوحة',
              model: v.model || 'مركبة',
            }));
            setAvailableVehicles(list);
            setVehicleId(list[0].id);
          }
        }
      } catch {}
    }
    loadVehicles();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {}
      );
    }
  }, []);

  const handleToggleCheck = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setDamagePhotos((prev) => [...prev, ...newFiles]);
      const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
      setPhotoPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setDamagePhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    if (!vehicleId) {
      setErrorMessage('يرجى تحديد المركبة المعطلة');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('يرجى كتابة وصف موجز للعطل أو الحادث');
      return;
    }

    try {
      setIsLoading(true);
      const payload: MaintenanceReportPayload = {
        vehicleId,
        type,
        urgency,
        description: description.trim(),
        odometer: odometer ? Number(odometer) : undefined,
        damagePhotos,
        lat: currentCoords.lat,
        lng: currentCoords.lng,
      };

      await driverTaskService.submitMaintenance(payload);

      setSuccessNotice('⚠️ تم إرسال بلاغ الصيانة لمدير الأسطول بنجاح!');
      setDescription('');
      setOdometer('');
      setDamagePhotos([]);
      setPhotoPreviews([]);
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل إرسال البلاغ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-slate-50 text-slate-900">
      <DriverHeader />

      <main className="flex-1 p-4 space-y-4 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-teal-700" />
              <span>الصيانة وفحص المركبة</span>
            </h2>
            <p className="text-xs text-slate-500">
              فحص ما قبل الانطلاق والإبلاغ السريع عن الأعطال
            </p>
          </div>
        </div>

        {/* أزرار التبديل */}
        <div className="flex items-center gap-1.5 rounded-2xl bg-white p-1.5 border border-slate-200 shadow-xs text-xs">
          <button
            onClick={() => setActiveTab('report')}
            className={`flex-1 py-2.5 rounded-xl font-bold transition-all text-center cursor-pointer ${
              activeTab === 'report'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            بلاغ عطل أو طوارئ (SOS)
          </button>
          <button
            onClick={() => setActiveTab('inspection')}
            className={`flex-1 py-2.5 rounded-xl font-bold transition-all text-center cursor-pointer ${
              activeTab === 'inspection'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            فحص ما قبل الانطلاق
          </button>
        </div>

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

        {/* ── تبويب 1: بلاغ عطل أو طوارئ ── */}
        {activeTab === 'report' && (
          <form onSubmit={handleSubmitReport} className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                <Truck className="h-4 w-4 text-teal-700" />
                <span>المركبة المعنية:</span>
              </label>

              {availableVehicles.length > 0 ? (
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-3 text-xs text-slate-900 focus:border-teal-700 focus:outline-none"
                >
                  {availableVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plate} ({v.model})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  placeholder="معرف المركبة"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-3 text-xs text-slate-900"
                  dir="ltr"
                />
              )}

              {/* نوع العطل */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-slate-600">نوع البلاغ:</label>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  {[
                    { id: 'emergency', label: 'عطل مفاجئ ⚠️' },
                    { id: 'tires', label: 'بنشر / إطارات 🛞' },
                    { id: 'accident', label: 'حادث مروري 💥' },
                    { id: 'routine', label: 'صيانة دورية 🔧' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setType(item.id as any)}
                      className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                        type === item.id
                          ? 'bg-rose-50 text-rose-700 border border-rose-300 shadow-xs'
                          : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* درجة الإلحاح */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-slate-600">مستوى الخطورة:</label>
                <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                  {[
                    { id: 'medium', label: 'متوسط' },
                    { id: 'high', label: 'عاجل' },
                    { id: 'critical', label: 'طارئ جداً (SOS)' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setUrgency(item.id as any)}
                      className={`py-2 rounded-xl transition-all cursor-pointer ${
                        urgency === item.id
                          ? 'bg-amber-100 text-amber-800 font-bold border border-amber-300 shadow-xs'
                          : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* وصف العطل وموقعه وتصويره */}
            <div className="rounded-3xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">وصف المشكلة / العطل:</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="صوت غير طبيعي في المحرك، تسريب زيت، توقف المركبة عن العمل..."
                  className="w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-teal-700 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* موقع الحادث */}
              {currentCoords.lat && (
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600 border border-slate-200">
                  <MapPin className="h-4 w-4 text-rose-600 shrink-0" />
                  <span className="truncate">
                    الموقع الجغرافي محدد: {currentCoords.lat.toFixed(4)}, {currentCoords.lng?.toFixed(4)}
                  </span>
                </div>
              )}

              {/* تصوير الأضرار بالكاميرا */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-rose-600" />
                  <span>صور العطل أو الضرر:</span>
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={handlePhotoCapture}
                  className="hidden"
                />

                {photoPreviews.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {photoPreviews.map((p, i) => (
                      <div key={i} className="relative rounded-xl overflow-hidden h-24 bg-slate-100 border border-slate-200">
                        <img src={p} alt="Damage preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(i)}
                          className="absolute top-1 right-1 rounded-full bg-black/70 p-0.5 text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 h-24 text-slate-600 hover:text-slate-900"
                    >
                      <Camera className="h-5 w-5" />
                      <span className="text-[10px] mt-1">+ صورة</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-slate-500 hover:border-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Camera className="h-6 w-6" />
                    <span className="text-xs font-semibold">التقاط صور للعطل بالكاميرا</span>
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 text-sm shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'جاري إرسال البلاغ...' : 'إرسال بلاغ الطوارئ / العطل ⚠️'}
            </button>
          </form>
        )}

        {/* ── تبويب 2: فحص ما قبل الانطلاق ── */}
        {activeTab === 'inspection' && (
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <ShieldCheck className="h-6 w-6 text-teal-700" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">قائمة الفحص اليومية للسلامة</h3>
                  <p className="text-[11px] text-slate-500">تأكد من النقاط التالية قبل بدء الرحلة</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {INSPECTION_ITEMS.map((item) => {
                  const isChecked = !!checkedItems[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleCheck(item.id)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'border-teal-300 bg-teal-50/70 text-slate-900'
                          : 'border-slate-200 bg-slate-50/80 text-slate-700'
                      }`}
                    >
                      <span className="text-xs font-semibold">{item.label}</span>
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-lg border ${
                          isChecked
                            ? 'border-teal-700 bg-teal-700 text-white'
                            : 'border-slate-300 bg-white text-transparent'
                        }`}
                      >
                        ✓
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSuccessNotice('✅ تم توثيق فحص ما قبل الانطلاق بنجاح! رافقتك السلامة.');
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold py-3.5 text-xs shadow-xs transition-all cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>تأكيد اكتمال الفحص بنجاح</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
