'use client';

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertTriangle,
  Camera,
  Coins,
  Droplet,
  Fuel,
  Gauge,
  Info,
  Loader2,
  MapPin,
  Navigation,
  Receipt,
  Truck,
  UploadCloud,
  X,
} from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';
import {
  createFuelSchema,
  type CreateFuelFormValues,
} from '../schemas/fuel.schema';
import type { CreateFuelInput } from '../types/fuel.types';
import type { BackendVehicle } from '@/features/vehicles';

interface FuelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFuelInput) => Promise<void>;
  isLoading: boolean;
  vehicles: BackendVehicle[];
}

export function FuelFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  vehicles,
}: FuelFormModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateFuelFormValues>({
    resolver: zodResolver(createFuelSchema),
    defaultValues: {
      vehicleId: '',
      cost: undefined,
      qty: undefined,
      odometer: undefined,
      isFullTank: true,
    },
  });

  const selectedVehicleId = watch('vehicleId');
  const watchedOdometer = watch('odometer');
  const watchedCost = watch('cost');
  const watchedQty = watch('qty');
  const watchedIsFullTank = watch('isFullTank');

  const selectedVehicle = vehicles.find((v) => v._id === selectedVehicleId);
  const isOdometerInvalid =
    selectedVehicle?.currentOdometer !== undefined &&
    watchedOdometer !== undefined &&
    Number(watchedOdometer) < selectedVehicle.currentOdometer;

  const isQtyExceedingCapacity = Boolean(
    selectedVehicle?.tankCapacity &&
    watchedQty &&
    Number(watchedQty) > selectedVehicle.tankCapacity
  );

  const pricePerLiter =
    watchedCost && watchedQty && Number(watchedQty) > 0
      ? (Number(watchedCost) / Number(watchedQty)).toFixed(2)
      : null;

  const handleGetLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationError('خدمة تحديد الموقع الجغرافي (GPS) غير متوفرة في هذا المتصفح.');
      return;
    }
    setIsGettingLocation(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsGettingLocation(false);
      },
      (err) => {
        setLocationError('تعذر تحديد الموقع الجغرافي. يرجى تفعيل إذن الوصول للموقع.');
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleClose = () => {
    reset();
    setSelectedFile(null);
    setFilePreview(null);
    setImageError(null);
    setGpsLocation(null);
    setLocationError(null);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
    setImageError(null);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onFormSubmit = async (values: CreateFuelFormValues) => {
    if (!selectedFile) {
      setImageError('صورة إيصال أو فاتورة الوقود مطلوبة إجبارياً');
      return;
    }

    await onSubmit({
      vehicleId: values.vehicleId,
      cost: values.cost,
      qty: values.qty,
      odometer: values.odometer,
      isFullTank: values.isFullTank,
      image: selectedFile,
    });
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="توثيق إيصال تعبئة وقود"
      description="تسجيل تكلفة وكمية الوقود واحتساب مؤشرات الكفاءة والاستهلاك"
      icon={Fuel}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col flex-1 min-h-0" dir="rtl">
        {/* الجسم القابل للتمرير */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* اختيار المركبة */}
          <div>
            <label className="block text-xs font-bold text-[var(--zd-text)] mb-1.5">
              المركبة المستهدفة <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                {...register('vehicleId')}
                className="w-full appearance-none rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] px-3 py-2.5 text-xs text-[var(--zd-text)] focus:border-[var(--zd-blue)] focus:outline-none"
              >
                <option value="">اختر المركبة من الأسطول...</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.model} - لوحة: {v.plateNumber} {v.isInTask ? '(في مهمة)' : ''}
                  </option>
                ))}
              </select>
              <Truck className="absolute left-3 top-3 h-4 w-4 pointer-events-none text-[var(--zd-muted)]" />
            </div>
            {errors.vehicleId && (
              <p className="mt-1 text-[11px] text-rose-500">{errors.vehicleId.message}</p>
            )}
          </div>

          {/* قراءة العداد والتكلفة والكمية */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* قراءة العداد */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[var(--zd-text)]">
                  قراءة العداد (كم) <span className="text-rose-500">*</span>
                </label>
                {selectedVehicle?.currentOdometer !== undefined && (
                  <span className="text-[10px] text-[var(--zd-muted)]">
                    آخر: {Number(selectedVehicle.currentOdometer).toLocaleString('ar-EG')} كم
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1"
                  {...register('odometer')}
                  placeholder={
                    selectedVehicle?.currentOdometer !== undefined
                      ? `مثال: ${selectedVehicle.currentOdometer + 50}`
                      : 'مثال: 45000'
                  }
                  className={`w-full rounded-xl border bg-[var(--zd-surface)] px-3 py-2.5 pl-8 text-xs text-[var(--zd-text)] placeholder-[var(--zd-muted)] focus:outline-none ${
                    isOdometerInvalid
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-[var(--zd-line)] focus:border-[var(--zd-blue)]'
                  }`}
                />
                <Gauge className="absolute left-2.5 top-3 h-3.5 w-3.5 text-[var(--zd-muted)]" />
              </div>
              {errors.odometer && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.odometer.message}</p>
              )}
              {isOdometerInvalid && (
                <p className="mt-1 text-[10px] text-rose-400 font-medium">
                  يجب ألا تقل قراءة العداد عن آخر قراءة مسجلة ({selectedVehicle?.currentOdometer} كم)
                </p>
              )}
            </div>

            {/* كمية الوقود باللتر */}
            <div>
              <label className="block text-xs font-bold text-[var(--zd-text)] mb-1.5">
                الكمية (لتر) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0.1"
                  step="0.01"
                  {...register('qty')}
                  placeholder="مثال: 45"
                  className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] px-3 py-2.5 pl-8 text-xs text-[var(--zd-text)] placeholder-[var(--zd-muted)] focus:border-[var(--zd-blue)] focus:outline-none"
                />
                <Droplet className="absolute left-2.5 top-3 h-3.5 w-3.5 text-[var(--zd-muted)]" />
              </div>
              {errors.qty && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.qty.message}</p>
              )}
            </div>

            {/* إجمالي التكلفة */}
            <div>
              <label className="block text-xs font-bold text-[var(--zd-text)] mb-1.5">
                إجمالي التكلفة (ر.س) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  {...register('cost')}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] px-3 py-2.5 pl-8 text-xs text-[var(--zd-text)] placeholder-[var(--zd-muted)] focus:border-[var(--zd-blue)] focus:outline-none"
                />
                <Coins className="absolute left-2.5 top-3 h-3.5 w-3.5 text-[var(--zd-muted)]" />
              </div>
              {errors.cost && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.cost.message}</p>
              )}
            </div>
          </div>

          {/* تنبيه تجاوز سعة الخزان */}
          {isQtyExceedingCapacity && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-400 flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <p className="font-bold">تنبيه: كمية الوقود تتجاوز سعة خزان المركبة</p>
                <p className="text-[11px] text-amber-300 mt-0.5 leading-relaxed">
                  الكمية المدخلة ({watchedQty} لتر) تتجاوز سعة خزان المركبة المعتمدة ({selectedVehicle?.tankCapacity} لتر). يرجى مراجعة الكمية المسجلة بالفاتورة.
                </p>
              </div>
            </div>
          )}

          {/* معاينة سعر اللتر المحسوب تلقائياً */}
          {pricePerLiter && (
            <div className="flex items-center justify-between rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 text-xs text-cyan-400">
              <span className="font-medium">سعر اللتر المحسوب:</span>
              <span className="font-bold font-mono">{pricePerLiter} ر.س / لتر</span>
            </div>
          )}

          {/* خيار تعبئة خزان كامل (Full Tank) */}
          <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)]/30 p-3.5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(watchedIsFullTank)}
                onChange={(e) => setValue('isFullTank', e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[var(--zd-line)] text-[var(--zd-blue)] focus:ring-0 cursor-pointer"
              />
              <div className="text-xs">
                <p className="font-bold text-[var(--zd-text)]">
                  تعبئة خزان كامل (Full Tank)
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--zd-muted)] leading-relaxed">
                  تحديد هذا الخيار يمكّن النظام من حساب كفاءة الاستهلاك الفعلية (كم/لتر) ومقارنتها بمعدل استهلاك المركبة المعتمد، وتنبيهك تلقائياً في حال وجود تسريب أو استهلاك غير طبيعي.
                </p>
              </div>
            </label>
          </div>

          {/* تحديد موقع محطة الوقود (GPS) */}
          <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)]/30 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[var(--zd-blue)]" />
                <span className="text-xs font-bold text-[var(--zd-text)]">موقع محطة الوقود (GPS)</span>
              </div>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--zd-blue)]/10 text-[var(--zd-blue)] hover:bg-[var(--zd-blue)]/20 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              >
                {isGettingLocation ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Navigation className="h-3.5 w-3.5" />
                )}
                <span>{gpsLocation ? 'تحديث الموقع' : 'تحديد موقع المحطة الحالي'}</span>
              </button>
            </div>
            {gpsLocation ? (
              <div className="flex items-center justify-between text-xs rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-emerald-400">
                <div className="flex items-center gap-2 font-mono" dir="ltr">
                  <span>📍 الإحداثيات: {gpsLocation.lat.toFixed(5)}, {gpsLocation.lng.toFixed(5)}</span>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${gpsLocation.lat},${gpsLocation.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-emerald-400 hover:underline"
                >
                  معاينة على خرائط Google ↗
                </a>
              </div>
            ) : (
              <p className="text-[11px] text-[var(--zd-muted)]">
                يمكنك توثيق إحداثيات محطة الوقود الحالية لضمان دقة الرقابة الجغرافية وتطابق مسار الرحلة.
              </p>
            )}
            {locationError && (
              <p className="text-[11px] text-rose-500">{locationError}</p>
            )}
          </div>

          {/* رفع صورة إيصال الدفع */}
          <div>
            <label className="block text-xs font-bold text-[var(--zd-text)] mb-2 flex items-center gap-1.5">
              <Receipt className="h-3.5 w-3.5 text-[var(--zd-blue)]" />
              <span>صورة فاتورة أو إيصال الوقود <span className="text-rose-500">*</span></span>
            </label>

            {filePreview ? (
              <div className="relative aspect-video max-h-48 w-full overflow-hidden rounded-xl border border-[var(--zd-line)] bg-black/20">
                <img
                  src={filePreview}
                  alt="Receipt Preview"
                  className="h-full w-full object-contain"
                />
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute top-2 left-2 flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--zd-line)] bg-[var(--zd-surface-2)]/40 p-5 text-center transition hover:border-[var(--zd-blue)] hover:bg-[var(--zd-surface-2)] cursor-pointer"
                >
                  <UploadCloud className="h-7 w-7 text-[var(--zd-blue)] mb-1" />
                  <p className="text-xs font-bold text-[var(--zd-text)]">
                    انقر لرفع صورة الفاتورة أو الإيصال
                  </p>
                  <p className="mt-0.5 text-[10px] text-[var(--zd-muted)]">
                    JPG, PNG, WEBP (صورة واضحة توضح العداد والسعر والتاريخ)
                  </p>
                </button>
              </div>
            )}
            {imageError && (
              <p className="mt-1 text-[11px] text-rose-500">{imageError}</p>
            )}
          </div>
        </div>

        {/* تذييل النافذة */}
        <div className="shrink-0 flex items-center justify-end gap-2.5 border-t border-[var(--zd-line)] p-4 bg-[var(--zd-surface-2)]/30">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-xl border border-[var(--zd-line)] px-4 py-2 text-xs font-semibold text-[var(--zd-muted)] hover:bg-[var(--zd-surface)] hover:text-[var(--zd-text)] transition cursor-pointer"
          >
            إلغاء
          </button>

          <button
            type="submit"
            disabled={isLoading || Boolean(isOdometerInvalid) || Boolean(isQtyExceedingCapacity)}
            className="flex items-center gap-1.5 rounded-xl bg-[var(--zd-blue)] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-600 transition disabled:opacity-50 cursor-pointer"
          >
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>حفظ وتوثيق الإيصال</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
