'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Driver, DriverFormData, DriverStatus } from '../types/driver.types';

interface DriverModalProps {
  editing: Driver | null;
  onClose: () => void;
  onSave: (formData: DriverFormData) => void;
}

export function DriverModal({ editing, onClose, onSave }: DriverModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [license, setLicense] = useState('');
  const [expiry, setExpiry] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [status, setStatus] = useState<DriverStatus>('نشط');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setPhone(editing.phone);
      setLicense(editing.license);
      setExpiry(editing.expiry);
      setVehicle(editing.vehicle !== '—' ? editing.vehicle : '');
      setVehicleType(
        editing.vehicleType !== 'غير مخصص' ? editing.vehicleType : ''
      );
      setStatus(editing.status);
    } else {
      setName('');
      setPhone('');
      setLicense('');
      setExpiry(new Date().toISOString().split('T')[0]);
      setVehicle('');
      setVehicleType('');
      setStatus('نشط');
    }
    setErrors({});
  }, [editing]);

  // إغلاق النافذة عند الضغط على Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'يرجى إدخال اسم السائق الكامل';
    }
    if (!phone.trim()) {
      newErrors.phone = 'يرجى إدخال رقم الجوال';
    }
    if (!license.trim()) {
      newErrors.license = 'يرجى إدخال رقم الرخصة';
    }
    if (!expiry) {
      newErrors.expiry = 'يرجى تحديد تاريخ انتهاء الرخصة';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      name,
      phone,
      license,
      expiry,
      vehicle: vehicle.trim() || '—',
      vehicleType: vehicleType.trim() || 'غير مخصص',
      status,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="driver-modal-title"
    >
      <div className="w-full max-w-[520px] rounded-2xl border border-[var(--zd-line)] bg-[var(--zd-surface)] shadow-2xl transition-all">
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between border-b border-[var(--zd-line)] p-5">
          <div>
            <h2
              id="driver-modal-title"
              className="text-[16px] font-bold text-[var(--zd-text)]"
            >
              {editing ? 'تعديل بيانات السائق' : 'إضافة سائق جديد'}
            </h2>
            <p className="mt-0.5 text-[10px] text-[var(--zd-muted)]">
              {editing
                ? 'تحديث بيانات الرخصة والمركبة المخصصة'
                : 'أدخل الحقول الأساسية لإنشاء سجل السائق الجديد'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق النموذج"
            className="zd-focus rounded-lg p-2 text-[var(--zd-muted)] hover:bg-[var(--zd-surface-2)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Modal Form ── */}
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {/* الاسم الكامل */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-[var(--zd-text)]">
              الاسم الكامل <span className="text-[var(--zd-red)]">*</span>
            </label>
            <input
              type="text"
              placeholder="مثال: خالد محمد السبيعي"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              className={`zd-focus h-11 w-full rounded-xl border bg-[var(--zd-input-bg)] px-3 text-[12px] text-[var(--zd-text)] outline-none transition-colors ${
                errors.name
                  ? 'border-[var(--zd-red)]'
                  : 'border-[var(--zd-line)] focus:border-[var(--zd-blue)]'
              }`}
            />
            {errors.name && (
              <span className="mt-1 block text-[10px] text-[var(--zd-red)] font-medium">
                {errors.name}
              </span>
            )}
          </div>

          {/* رقم الجوال ورقم الرخصة */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-[var(--zd-text)]">
                رقم الجوال <span className="text-[var(--zd-red)]">*</span>
              </label>
              <input
                type="text"
                dir="ltr"
                placeholder="05xxxxxxxx"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                }}
                className={`zd-focus h-11 w-full rounded-xl border bg-[var(--zd-input-bg)] px-3 text-[12px] text-[var(--zd-text)] text-right outline-none transition-colors ${
                  errors.phone
                    ? 'border-[var(--zd-red)]'
                    : 'border-[var(--zd-line)] focus:border-[var(--zd-blue)]'
                }`}
              />
              {errors.phone && (
                <span className="mt-1 block text-[10px] text-[var(--zd-red)] font-medium">
                  {errors.phone}
                </span>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-[var(--zd-text)]">
                رقم الرخصة <span className="text-[var(--zd-red)]">*</span>
              </label>
              <input
                type="text"
                placeholder="L-1234567"
                value={license}
                onChange={(e) => {
                  setLicense(e.target.value);
                  if (errors.license)
                    setErrors((prev) => ({ ...prev, license: '' }));
                }}
                className={`zd-focus h-11 w-full rounded-xl border font-manrope bg-[var(--zd-input-bg)] px-3 text-[12px] text-[var(--zd-text)] outline-none transition-colors ${
                  errors.license
                    ? 'border-[var(--zd-red)]'
                    : 'border-[var(--zd-line)] focus:border-[var(--zd-blue)]'
                }`}
              />
              {errors.license && (
                <span className="mt-1 block text-[10px] text-[var(--zd-red)] font-medium">
                  {errors.license}
                </span>
              )}
            </div>
          </div>

          {/* تاريخ انتهاء الرخصة والحالة */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-[var(--zd-text)]">
                تاريخ انتهاء الرخصة <span className="text-[var(--zd-red)]">*</span>
              </label>
              <input
                type="date"
                value={expiry}
                onChange={(e) => {
                  setExpiry(e.target.value);
                  if (errors.expiry)
                    setErrors((prev) => ({ ...prev, expiry: '' }));
                }}
                className={`zd-focus h-11 w-full rounded-xl border bg-[var(--zd-input-bg)] px-3 text-[12px] text-[var(--zd-text)] outline-none transition-colors ${
                  errors.expiry
                    ? 'border-[var(--zd-red)]'
                    : 'border-[var(--zd-line)] focus:border-[var(--zd-blue)]'
                }`}
              />
              {errors.expiry && (
                <span className="mt-1 block text-[10px] text-[var(--zd-red)] font-medium">
                  {errors.expiry}
                </span>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-[var(--zd-text)]">
                حالة السائق
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DriverStatus)}
                className="zd-focus h-11 w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-input-bg)] px-3 text-[12px] text-[var(--zd-text)] outline-none focus:border-[var(--zd-blue)] transition-colors cursor-pointer"
              >
                <option value="نشط">نشط</option>
                <option value="في الصيانة">في الصيانة</option>
                <option value="في إجازة">في إجازة</option>
                <option value="غير نشط">غير نشط</option>
              </select>
            </div>
          </div>

          {/* المركبة ونوع المركبة (اختياري) */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-[var(--zd-text)]">
                المركبة المخصصة (اختياري)
              </label>
              <input
                type="text"
                placeholder="مثال: أ ب ج — ١٢٣٤"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                className="zd-focus h-11 w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-input-bg)] px-3 text-[12px] text-[var(--zd-text)] outline-none focus:border-[var(--zd-blue)] transition-colors"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-[var(--zd-text)]">
                نوع المركبة (اختياري)
              </label>
              <input
                type="text"
                placeholder="مثال: فان توصيل / شاحنة"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="zd-focus h-11 w-full rounded-xl border border-[var(--zd-line)] bg-[var(--zd-input-bg)] px-3 text-[12px] text-[var(--zd-text)] outline-none focus:border-[var(--zd-blue)] transition-colors"
              />
            </div>
          </div>

          {/* ملاحظة تنظيمية */}
          <p className="rounded-xl bg-[var(--zd-surface-2)] border border-[var(--zd-line)] px-3.5 py-2.5 text-[10px] leading-5 text-[var(--zd-muted)]">
            ملاحظة: البيانات المدخلة ستكون متاحة فوراً في لوحة التحكم وتخضع لسياسات
            إدارة أسطول زمام.
          </p>

          {/* ── Modal Footer Buttons ── */}
          <div className="flex justify-end gap-2 border-t border-[var(--zd-line)] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="zd-focus rounded-xl border border-[var(--zd-line)] px-4 py-2.5 text-[11px] font-semibold text-[var(--zd-muted)] hover:text-[var(--zd-text)] transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="zd-focus rounded-xl bg-[var(--zd-blue)] px-5 py-2.5 text-[11px] font-semibold text-white shadow-sm hover:opacity-95 transition-opacity"
            >
              {editing ? 'حفظ التعديلات' : 'إضافة السائق'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
