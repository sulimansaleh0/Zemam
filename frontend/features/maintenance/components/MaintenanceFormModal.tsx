'use client';

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertTriangle,
  Camera,
  Coins,
  FileText,
  Gauge,
  Loader2,
  Plus,
  Truck,
  UploadCloud,
  Wrench,
  X,
} from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';
import {
  createMaintenanceSchema,
  type CreateMaintenanceFormValues,
} from '../schemas/maintenance.schema';
import type { CreateMaintenanceInput } from '../types/maintenance.types';
import type { BackendVehicle } from '@/features/vehicles';

interface MaintenanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMaintenanceInput) => Promise<void>;
  isLoading: boolean;
  vehicles: BackendVehicle[];
}

export function MaintenanceFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  vehicles,
}: MaintenanceFormModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateMaintenanceFormValues>({
    resolver: zodResolver(createMaintenanceSchema),
    defaultValues: {
      category: 'Faults',
      priority: 'low',
      description: '',
      cost: undefined,
      odoMeter: undefined,
      vehicleId: '',
    },
  });

  const selectedPriority = watch('priority');
  const selectedCategory = watch('category');

  const handleClose = () => {
    reset();
    setSelectedFiles([]);
    setFilePreviews([]);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const combined = [...selectedFiles, ...files].slice(0, 4);

    setSelectedFiles(combined);

    // Generate previews
    const previews = combined.map((file) => URL.createObjectURL(file));
    setFilePreviews(previews);
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);

    const updatedPreviews = filePreviews.filter((_, i) => i !== index);
    setFilePreviews(updatedPreviews);
  };

  const onFormSubmit = async (values: CreateMaintenanceFormValues) => {
    await onSubmit({
      vehicleId: values.vehicleId,
      description: values.description,
      category: values.category,
      priority: values.priority,
      cost: values.cost,
      odoMeter: values.odoMeter,
      images: selectedFiles,
    });
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="تسجيل طلب صيانة أو بلاغ عطل"
      description="توثيق أعمال الصيانة الدورية أو الأعطال الطارئة لأسطول المركبات"
      icon={Wrench}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col flex-1 min-h-0" dir="rtl">
        {/* الجسم القابل للتمرير */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* تحذير الأولوية العالية */}
          {selectedPriority === 'High' && (
            <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-400 animate-in fade-in duration-150">
              <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
              <div>
                <p className="font-bold text-rose-300">تنبيه تشغيلي: أولوية عالية</p>
                <p className="mt-0.5 opacity-90">
                  تحديد الأولوية العالية سيقوم تلقائياً بتغيير حالة المركبة في النظام إلى (قيد الصيانة)، مما يمنع تعيينها لأي مهام جديدة حتى يتم فحصها وإعادة تفعيلها.
                </p>
              </div>
            </div>
          )}

          {/* تحديد المركبة وتصنيف الصيانة */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* المركبة */}
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

            {/* تصنيف الصيانة */}
            <div>
              <label className="block text-xs font-bold text-[var(--zd-text)] mb-1.5">
                تصنيف الصيانة <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setValue('category', 'Faults')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-bold transition cursor-pointer ${
                    selectedCategory === 'Faults'
                      ? 'border-orange-500/40 bg-orange-500/10 text-orange-400 shadow-xs'
                      : 'border-[var(--zd-line)] bg-[var(--zd-surface)] text-[var(--zd-muted)] hover:border-[var(--zd-line-hover)]'
                  }`}
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>عطل طارئ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setValue('category', 'Periodic Maintenance')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-bold transition cursor-pointer ${
                    selectedCategory === 'Periodic Maintenance'
                      ? 'border-blue-500/40 bg-blue-500/10 text-blue-400 shadow-xs'
                      : 'border-[var(--zd-line)] bg-[var(--zd-surface)] text-[var(--zd-muted)] hover:border-[var(--zd-line-hover)]'
                  }`}
                >
                  <Wrench className="h-3.5 w-3.5" />
                  <span>صيانة دورية</span>
                </button>
              </div>
              {errors.category && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.category.message}</p>
              )}
            </div>
          </div>

          {/* درجة الأولوية وقراءة العداد والتكلفة */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* درجة الأولوية */}
            <div>
              <label className="block text-xs font-bold text-[var(--zd-text)] mb-1.5">
                مستوى الأولوية <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('priority')}
                className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] px-3 py-2.5 text-xs text-[var(--zd-text)] focus:border-[var(--zd-blue)] focus:outline-none"
              >
                <option value="low">عادية (المركبة صالحة للعمل)</option>
                <option value="High">عالية (توقف فوري للمركبة)</option>
              </select>
              {errors.priority && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.priority.message}</p>
              )}
            </div>

            {/* قراءة العداد الحالية */}
            <div>
              <label className="block text-xs font-bold text-[var(--zd-text)] mb-1.5">
                قراءة العداد (كم)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1"
                  {...register('odoMeter')}
                  placeholder="مثال: 45000"
                  className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] px-3 py-2.5 pl-8 text-xs text-[var(--zd-text)] placeholder-[var(--zd-muted)] focus:border-[var(--zd-blue)] focus:outline-none"
                />
                <Gauge className="absolute left-2.5 top-3 h-3.5 w-3.5 text-[var(--zd-muted)]" />
              </div>
              {errors.odoMeter && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.odoMeter.message}</p>
              )}
            </div>

            {/* التكلفة التقديرية */}
            <div>
              <label className="block text-xs font-bold text-[var(--zd-text)] mb-1.5">
                التكلفة التقديرية (ر.س)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
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

          {/* تفاصيل ووصف الصيانة */}
          <div>
            <label className="block text-xs font-bold text-[var(--zd-text)] mb-1.5">
              تفاصيل الصيانة أو البلاغ <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              {...register('description')}
              placeholder="اكتب وصفاً دقيقاً للمشكلة الميكانيكية، القطع المطلوبة للاستبدال، أو سبب الصيانة..."
              className="w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3 text-xs text-[var(--zd-text)] placeholder-[var(--zd-muted)] focus:border-[var(--zd-blue)] focus:outline-none resize-none"
            />
            {errors.description && (
              <p className="mt-1 text-[11px] text-rose-500">{errors.description.message}</p>
            )}
          </div>

          {/* رفع صور الصيانة والفواتير */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[var(--zd-text)] flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5 text-[var(--zd-blue)]" />
                <span>صور الصيانة أو إيصالات الفحص (حتى 4 صور)</span>
              </label>
              <span className="text-[11px] text-[var(--zd-muted)] font-mono">
                {selectedFiles.length} / 4
              </span>
            </div>

            {/* معاينة الصور المرفوعة */}
            {filePreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-3">
                {filePreviews.map((src, index) => (
                  <div
                    key={index}
                    className="group relative aspect-square rounded-xl overflow-hidden border border-[var(--zd-line)] bg-black/20"
                  >
                    <img
                      src={src}
                      alt={`Preview ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="absolute top-1 left-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 transition cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* منطقة الإفلات والرفع */}
            {selectedFiles.length < 4 && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--zd-line)] bg-[var(--zd-surface-2)]/40 p-4 text-center transition hover:border-[var(--zd-blue)] hover:bg-[var(--zd-surface-2)] cursor-pointer"
                >
                  <UploadCloud className="h-7 w-7 text-[var(--zd-blue)] mb-1" />
                  <p className="text-xs font-bold text-[var(--zd-text)]">
                    انقر لاختيار صور من جهازك
                  </p>
                  <p className="mt-0.5 text-[10px] text-[var(--zd-muted)]">
                    JPG, PNG, WEBP (الحد الأقصى 4 صور للمعاينة وإثبات التكلفة)
                  </p>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* أزرار الإجراءات السفلية */}
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
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl bg-[var(--zd-blue)] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-600 transition disabled:opacity-50 cursor-pointer"
          >
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>حفظ وتوثيق الصيانة</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
