'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Fuel,
  Camera,
  CheckCircle2,
  AlertCircle,
  Truck,
  Gauge,
  X,
} from 'lucide-react';
import { DriverHeader } from '@/features/driver/components/DriverHeader';
import { driverTaskService } from '@/features/driver/services/driverTaskService';
import type { FuelLogPayload } from '@/features/driver/types/driverPwa.types';

export default function DriverFuelPage() {
  const [vehicleId, setVehicleId] = useState('');
  const [availableVehicles, setAvailableVehicles] = useState<Array<{ id: string; plate: string; model: string }>>([]);
  const [liters, setLiters] = useState('');
  const [cost, setCost] = useState('');
  const [fuelType, setFuelType] = useState<'91' | '95' | 'diesel'>('91');
  const [odometer, setOdometer] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptPhoto, setReceiptPhoto] = useState<File | null>(null);
  const [receiptPhotoPreview, setReceiptPhotoPreview] = useState<string | null>(null);

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
  }, []);

  const handleCapturePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptPhoto(file);
      const url = URL.createObjectURL(file);
      setReceiptPhotoPreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    if (!vehicleId) {
      setErrorMessage('يرجى تحديد المركبة');
      return;
    }
    if (!liters || Number(liters) <= 0) {
      setErrorMessage('يرجى إدخال كمية الوقود باللتر');
      return;
    }
    if (!cost || Number(cost) <= 0) {
      setErrorMessage('يرجى إدخال المبلغ الإجمالي');
      return;
    }
    if (!odometer || Number(odometer) <= 0) {
      setErrorMessage('يرجى إدخال قراءة عداد المسافات');
      return;
    }

    try {
      setIsLoading(true);
      const payload: FuelLogPayload = {
        vehicleId,
        liters: Number(liters),
        cost: Number(cost),
        fuelType,
        odometer: Number(odometer),
        notes: notes.trim() || undefined,
        receiptPhoto,
      };

      await driverTaskService.submitFuel(payload);

      setSuccessNotice('⛽ تم تسجيل فاتورة الوقود بنجاح وإرسالها للاعتماد!');
      setLiters('');
      setCost('');
      setOdometer('');
      setNotes('');
      setReceiptPhoto(null);
      setReceiptPhotoPreview(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل تسجيل فاتورة الوقود');
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
              <Fuel className="h-5 w-5 text-teal-700" />
              <span>تسجيل تعبئة الوقود</span>
            </h2>
            <p className="text-xs text-slate-500">
              رفع وتوثيق فواتير المحطة وقراءات العداد فوراً
            </p>
          </div>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* محدد المركبة */}
          <div className="rounded-3xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
              <Truck className="h-4 w-4 text-teal-700" />
              <span>المركبة الحالية:</span>
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
                placeholder="معرف المركبة (ID)"
                className="w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-3 text-xs text-slate-900"
                dir="ltr"
              />
            )}

            {/* نوع الوقود */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-slate-600">نوع الوقود:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['91', '95', 'diesel'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFuelType(type)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      fuelType === type
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {type === '91' ? 'بنزين 91' : type === '95' ? 'بنزين 95' : 'ديزل'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* تفاصيل التعبئة والمبالغ */}
          <div className="rounded-3xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">الكمية (لتر):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={liters}
                  onChange={(e) => setLiters(e.target.value)}
                  placeholder="مثلاً: 45.5"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 font-mono focus:border-teal-700 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">المبلغ الإجمالي:</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="مثلاً: 120"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 font-mono focus:border-teal-700 focus:outline-none pl-8"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ر.س
                  </span>
                </div>
              </div>
            </div>

            {/* قراءة عداد المسافات */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5 text-teal-700" />
                <span>قراءة العداد الحالية (كم):</span>
              </label>
              <input
                type="number"
                required
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                placeholder="مثلاً: 52140"
                className="w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 font-mono focus:border-teal-700 focus:outline-none"
              />
            </div>

            {/* تصوير إيصال الوقود بالكاميرا */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5 text-teal-700" />
                <span>صورة الفاتورة / شاشة المحطة:</span>
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleCapturePhoto}
                className="hidden"
              />

              {receiptPhotoPreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-teal-200 h-36 bg-slate-100">
                  <img
                    src={receiptPhotoPreview}
                    alt="Receipt preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setReceiptPhoto(null);
                      setReceiptPhotoPreview(null);
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
                  <span className="text-xs font-semibold">التقاط صورة الفاتورة بالكاميرا</span>
                </button>
              )}
            </div>

            {/* ملاحظات */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-slate-700">اسم المحطة أو ملاحظات إضافية:</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="محطة ساسكو - طريق الملك فهد"
                className="w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-teal-700 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold py-4 text-sm shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'جاري إرسال الفاتورة...' : 'تأكيد وحفظ فاتورة الوقود ⛽'}
          </button>
        </form>
      </main>
    </div>
  );
}
