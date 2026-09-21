'use client';

import React, { useState, useEffect } from 'react';
import {
  Car,
  Calendar,
  FileText,
  Shield,
  Fuel,
  Gauge,
  Loader2,
  AlertCircle,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';
import type { BackendVehicle, VehicleWithRelations } from '../types/vehicle.types';

interface EditVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleWithRelations | BackendVehicle | null;
  onUpdate: (vehicleId: string, updatedData: Partial<BackendVehicle>) => Promise<void>;
  isLoading: boolean;
}

export function EditVehicleModal({
  isOpen,
  onClose,
  vehicle,
  onUpdate,
  isLoading,
}: EditVehicleModalProps) {
  const [formData, setFormData] = useState({
    model: '',
    year: new Date().getFullYear(),
    plateNumber: '',
    vehicleType: 'normal' as 'normal' | 'van' | 'truck',
    tankCapacity: 60,
    fuelType: 'بنزين 91',
    currentOdometer: 0,
    expectedFuelEfficiency: 12,
    licenseNumber: '',
    licenseExpiry: '',
    insuranceNumber: '',
    insuranceCompany: '',
    insuranceType: 'comprehensive' as 'comprehensive' | 'third_party',
    insuranceExpiry: '',
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (vehicle && isOpen) {
      setFormData({
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        plateNumber: String(vehicle.plateNumber || ''),
        vehicleType: (vehicle.vehicleType as any) || 'normal',
        tankCapacity: vehicle.tankCapacity || 60,
        fuelType: vehicle.fuelType || 'بنزين 91',
        currentOdometer: vehicle.currentOdometer || 0,
        expectedFuelEfficiency: vehicle.expectedFuelEfficiency || 12,
        licenseNumber: vehicle.licenseNumber || '',
        licenseExpiry: vehicle.licenseExpiry ? vehicle.licenseExpiry.split('T')[0] : '',
        insuranceNumber: vehicle.insuranceNumber || '',
        insuranceCompany: vehicle.insuranceCompany || '',
        insuranceType: vehicle.insuranceType || 'comprehensive',
        insuranceExpiry: vehicle.insuranceExpiry ? vehicle.insuranceExpiry.split('T')[0] : '',
      });
      setErrorMsg(null);
    }
  }, [vehicle, isOpen]);

  if (!vehicle) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.model.trim()) {
      setErrorMsg('يرجى إدخال اسم وموديل المركبة');
      return;
    }
    if (!formData.plateNumber.trim()) {
      setErrorMsg('يرجى إدخال رقم اللوحة');
      return;
    }

    setErrorMsg(null);
    try {
      await onUpdate(vehicle._id, {
        model: formData.model.trim(),
        year: Number(formData.year),
        plateNumber: formData.plateNumber.trim(),
        vehicleType: formData.vehicleType,
        tankCapacity: Number(formData.tankCapacity) || undefined,
        fuelType: formData.fuelType,
        currentOdometer: Number(formData.currentOdometer) || 0,
        expectedFuelEfficiency: Number(formData.expectedFuelEfficiency) || undefined,
        licenseNumber: formData.licenseNumber.trim() || undefined,
        licenseExpiry: formData.licenseExpiry ? new Date(formData.licenseExpiry).toISOString() : undefined,
        insuranceNumber: formData.insuranceNumber.trim() || undefined,
        insuranceCompany: formData.insuranceCompany.trim() || undefined,
        insuranceType: formData.insuranceType,
        insuranceExpiry: formData.insuranceExpiry ? new Date(formData.insuranceExpiry).toISOString() : undefined,
      });
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'حدث خطأ أثناء تعديل بيانات المركبة');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تعديل بيانات ورخص وتأمين المركبة"
      description={`تحديث بيانات المركبة: ${vehicle.model} - لوحة: ${vehicle.plateNumber}`}
      icon={Car}
      iconClassName="bg-[var(--zd-blue)]/10 text-[var(--zd-blue)]"
      maxWidth="max-w-[700px]"
      preventClose={isLoading}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Section 1: الأساسيات والتصنيف */}
        <div className="space-y-3">
          <h4 className="font-bold text-[var(--text)] flex items-center gap-1.5 text-sm pb-1 border-b border-[var(--border)]">
            <Car className="w-4 h-4 text-blue-500" />
            <span>البيانات الأساسية وتصنيف المركبة</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-[var(--muted)] block mb-1">الموديل والطراز *</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="مثال: تويوتا هايلوكس"
                required
                className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div>
              <label className="font-semibold text-[var(--muted)] block mb-1">سنة الصنع *</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                min={1990}
                max={new Date().getFullYear() + 1}
                required
                className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div>
              <label className="font-semibold text-[var(--muted)] block mb-1">رقم اللوحة (حروف وأرقام) *</label>
              <input
                type="text"
                value={formData.plateNumber}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                placeholder="مثال: أ ب ج 1234 أو 50-12345"
                required
                className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] font-mono"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="font-semibold text-[var(--muted)] block mb-1">تصنيف فئة المركبة (وفق المعايير المرورية) *</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'normal', label: 'سيارة ركوب خاصة (خفيف)', desc: 'يقودها رخصة خفيف أو متوسط أو ثقيل' },
                  { value: 'van', label: 'حافلة صغيرة / فان (متوسط)', desc: 'يقودها رخصة متوسط أو ثقيل فقط' },
                  { value: 'truck', label: 'شاحنة نقل بضائع (ثقيل)', desc: 'تتطلب حصراً رخصة نقل ثقيل' },
                ].map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, vehicleType: t.value as any })}
                    className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                      formData.vehicleType === t.value
                        ? 'bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)] font-bold shadow-xs'
                        : 'bg-[var(--surface-2)]/40 border-[var(--border)] text-[var(--muted)] hover:border-[var(--muted)]'
                    }`}
                  >
                    <div className="text-xs font-semibold text-[var(--text)]">{t.label}</div>
                    <div className="text-[10px] text-[var(--muted)] mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: خزان الوقود والعداد */}
        <div className="space-y-3">
          <h4 className="font-bold text-[var(--text)] flex items-center gap-1.5 text-sm pb-1 border-b border-[var(--border)]">
            <Fuel className="w-4 h-4 text-amber-500" />
            <span>مواصفات الوقود والعداد ومعدل الكفاءة</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="font-semibold text-[var(--muted)] block mb-1">سعة خزان الوقود (لتر) *</label>
              <input
                type="number"
                value={formData.tankCapacity}
                onChange={(e) => setFormData({ ...formData, tankCapacity: Number(e.target.value) })}
                min={10}
                max={1500}
                placeholder="مثلاً: 60"
                className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] font-mono"
              />
              <span className="text-[10px] text-[var(--muted)] mt-0.5 block">يمنع التعبئة بأكثر منها</span>
            </div>

            <div>
              <label className="font-semibold text-[var(--muted)] block mb-1">نوع الوقود المعتمد</label>
              <select
                value={formData.fuelType}
                onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] cursor-pointer"
              >
                <option value="بنزين 91">بنزين 91</option>
                <option value="بنزين 95">بنزين 95</option>
                <option value="ديزل">ديزل (Diesel)</option>
                <option value="هجين">هجين (Hybrid)</option>
                <option value="كهربائي">كهربائي (EV)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-[var(--muted)] block mb-1">قراءة العداد الحالية (كم)</label>
              <input
                type="number"
                value={formData.currentOdometer}
                onChange={(e) => setFormData({ ...formData, currentOdometer: Number(e.target.value) })}
                min={0}
                className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-[var(--muted)] block mb-1">الكفاءة المتوقعة (كم/لتر)</label>
              <input
                type="number"
                step="0.1"
                value={formData.expectedFuelEfficiency}
                onChange={(e) => setFormData({ ...formData, expectedFuelEfficiency: Number(e.target.value) })}
                min={0.1}
                className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 3: رخصة السير / الاستمارة والتأمين */}
        <div className="space-y-3">
          <h4 className="font-bold text-[var(--text)] flex items-center gap-1.5 text-sm pb-1 border-b border-[var(--border)]">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>بيانات رخصة السير (الاستمارة) ووثيقة التأمين</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* الاستمارة */}
            <div className="p-3.5 rounded-xl bg-[var(--surface-2)]/50 border border-[var(--border)] space-y-2.5">
              <div className="font-bold text-[var(--text)] flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-purple-500" />
                <span>رخصة السير (الاستمارة)</span>
              </div>

              <div>
                <label className="font-semibold text-[var(--muted)] block mb-1">رقم الاستمارة</label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  placeholder="رقم الوثيقة الرسمية"
                  className="w-full px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-[var(--muted)] block mb-1">تاريخ انتهاء الاستمارة</label>
                <input
                  type="date"
                  value={formData.licenseExpiry}
                  onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] font-mono cursor-pointer"
                />
              </div>
            </div>

            {/* التأمين */}
            <div className="p-3.5 rounded-xl bg-[var(--surface-2)]/50 border border-[var(--border)] space-y-2.5">
              <div className="font-bold text-[var(--text)] flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>وثيقة التأمين</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-[var(--muted)] block mb-1">رقم الوثيقة</label>
                  <input
                    type="text"
                    value={formData.insuranceNumber}
                    onChange={(e) => setFormData({ ...formData, insuranceNumber: e.target.value })}
                    placeholder="رقم التأمين"
                    className="w-full px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[var(--muted)] block mb-1">شركة التأمين</label>
                  <input
                    type="text"
                    value={formData.insuranceCompany}
                    onChange={(e) => setFormData({ ...formData, insuranceCompany: e.target.value })}
                    placeholder="مثال: التعاونية"
                    className="w-full px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-[var(--muted)] block mb-1">نوع التأمين</label>
                  <select
                    value={formData.insuranceType}
                    onChange={(e) => setFormData({ ...formData, insuranceType: e.target.value as any })}
                    className="w-full px-2 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] cursor-pointer"
                  >
                    <option value="comprehensive">شامل (Comprehensive)</option>
                    <option value="third_party">ضد الغير (إلزامي)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[var(--muted)] block mb-1">تاريخ انتهاء التأمين</label>
                  <input
                    type="date"
                    value={formData.insuranceExpiry}
                    onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
                    className="w-full px-2 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] font-mono cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-xl transition-colors cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>حفظ التعديلات وتحديث السجلات</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
