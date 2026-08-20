'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  CalendarClock,
  ClipboardCheck,
  Fuel,
  MoreHorizontal,
  Phone,
  ShieldCheck,
  Star,
  Trash2,
  UserCheck,
  UserRound,
  UserX,
  Wrench,
} from 'lucide-react';
import { useToast } from '@/shared/ui/Toast';
import { Driver } from '../types/driver.types';
import { DriverAvatar } from './DriverAvatar';
import { StatusPill } from './StatusPill';
import { PerformanceChart } from './PerformanceChart';
import { ActivityContent } from './ActivityContent';

interface DetailPanelProps {
  driver: Driver | null;
  onEdit: (driver: Driver) => void;
  onToggleStatus: (id: number) => void;
  onDelete: (driver: Driver) => void;
}

export function DetailPanel({
  driver,
  onEdit,
  onToggleStatus,
  onDelete,
}: DetailPanelProps) {
  const { addToast } = useToast();
  const [tab, setTab] = useState<'المهام' | 'البلاغات' | 'الوقود'>('المهام');
  const [menuOpen, setMenuOpen] = useState(false);

  if (!driver) {
    return (
      <section className="zd-panel zd-rise zd-d3 flex min-h-[400px] items-center justify-center rounded-2xl p-6 text-center text-[var(--zd-muted)]">
        اختر سائقاً من القائمة لعرض تفاصيل ملفه
      </section>
    );
  }

  // فحص هل تنتهي الرخصة قريباً
  const isExpiringSoon = (() => {
    if (!driver.expiry) return { isSoon: false, daysLeft: 0 };
    const expDate = new Date(driver.expiry).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
    return { isSoon: diffDays >= 0 && diffDays <= 60, daysLeft: diffDays };
  })();

  const tabItems = [
    { label: 'المهام', icon: ClipboardCheck },
    { label: 'البلاغات', icon: Wrench },
    { label: 'الوقود', icon: Fuel },
  ] as const;

  const isInactive = driver.status === 'غير نشط';

  return (
    <section
      className="zd-panel zd-rise zd-d3 min-w-0 overflow-hidden rounded-2xl transition-all xl:sticky xl:top-5 xl:self-start"
      aria-labelledby="driver-profile-title"
    >
      {/* ── Top Header & Actions ── */}
      <div className="relative border-b border-[var(--zd-line)] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <DriverAvatar
              driver={driver}
              size="h-14 w-14 rounded-2xl text-[14px]"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="driver-profile-title"
                  className="truncate text-[17px] font-bold text-[var(--zd-text)]"
                >
                  {driver.name}
                </h2>
                <StatusPill status={driver.status} />
              </div>
              <p className="mt-0.5 text-[11px] text-[var(--zd-muted)]">
                سائق منذ {driver.joinedDate || 'فبراير ٢٠٢٣'} · آخر نشاط{' '}
                {driver.lastSeen}
              </p>
            </div>
          </div>

          {/* ── Dropdown Menu ── */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="المزيد من الإجراءات"
              aria-expanded={menuOpen}
              className="zd-focus rounded-lg p-2 text-[var(--zd-muted)] hover:bg-[var(--zd-surface-2)] transition-colors"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>

            {menuOpen && (
              <>
                <button
                  aria-label="إغلاق القائمة"
                  onClick={() => setMenuOpen(false)}
                  className="fixed inset-0 z-10"
                />
                <div className="absolute left-0 top-10 z-20 w-44 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-1.5 shadow-xl transition-all">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(driver);
                    }}
                    className="zd-focus flex w-full items-center gap-2 rounded-lg px-3 py-2 text-right text-[11px] text-[var(--zd-text)] hover:bg-[var(--zd-surface-2)]"
                  >
                    تعديل البيانات
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onToggleStatus(driver.id);
                    }}
                    className="zd-focus flex w-full items-center gap-2 rounded-lg px-3 py-2 text-right text-[11px] text-[var(--zd-text)] hover:bg-[var(--zd-surface-2)]"
                  >
                    {isInactive ? (
                      <>
                        <UserCheck className="h-3.5 w-3.5 text-[var(--zd-teal)]" />
                        تفعيل الحساب
                      </>
                    ) : (
                      <>
                        <UserX className="h-3.5 w-3.5 text-[var(--zd-amber)]" />
                        تعطيل الحساب
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      addToast({
                        type: 'info',
                        title: 'تصدير النشاط',
                        message: `تم تجهيز ملف نشاط السائق (${driver.name})`,
                      });
                    }}
                    className="zd-focus flex w-full items-center gap-2 rounded-lg px-3 py-2 text-right text-[11px] text-[var(--zd-text)] hover:bg-[var(--zd-surface-2)]"
                  >
                    تصدير النشاط
                  </button>

                  <div className="my-1 border-t border-[var(--zd-line)]" />

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(driver);
                    }}
                    className="zd-focus flex w-full items-center gap-2 rounded-lg px-3 py-2 text-right text-[11px] text-[var(--zd-red)] hover:bg-[var(--zd-red)]/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    حذف السجل
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Driver Quick Details Grid ── */}
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3">
            <Phone className="h-3.5 w-3.5 text-[var(--zd-blue)]" />
            <small className="mt-2 block text-[9px] text-[var(--zd-muted)]">
              رقم الجوال
            </small>
            <b className="mt-0.5 block text-[11px] text-[var(--zd-text)] font-semibold">
              {driver.phone}
            </b>
          </div>

          <div className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] p-3">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--zd-teal)]" />
            <small className="mt-2 block text-[9px] text-[var(--zd-muted)]">
              رقم الرخصة
            </small>
            <b className="mt-0.5 block font-manrope text-[11px] text-[var(--zd-text)] font-semibold">
              {driver.license}
            </b>
          </div>

          <div
            className={`col-span-2 rounded-xl border p-3 sm:col-span-1 ${
              isExpiringSoon.isSoon
                ? 'border-[var(--zd-amber)]/40 bg-[var(--zd-amber)]/10'
                : 'border-[var(--zd-line)] bg-[var(--zd-surface)]'
            }`}
          >
            <CalendarClock
              className={`h-3.5 w-3.5 ${
                isExpiringSoon.isSoon
                  ? 'text-[var(--zd-amber)]'
                  : 'text-[var(--zd-blue)]'
              }`}
            />
            <small className="mt-2 block text-[9px] text-[var(--zd-muted)]">
              انتهاء الرخصة
            </small>
            <b
              className={`mt-0.5 block text-[11px] font-semibold ${
                isExpiringSoon.isSoon
                  ? 'text-[var(--zd-amber)]'
                  : 'text-[var(--zd-text)]'
              }`}
            >
              {driver.expiryLabel}
            </b>
          </div>
        </div>

        {/* ── Expiry Warning Alert ── */}
        {isExpiringSoon.isSoon && (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2.5 rounded-xl border border-[var(--zd-amber)]/35 bg-[var(--zd-amber)]/15 p-3 text-[10px] leading-5 text-[var(--zd-amber)] font-medium"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <b>تنبيه هام:</b> تنتهي رخصة {driver.name} خلال {isExpiringSoon.daysLeft} يوماً.
              يُرجى اتخاذ إجراءات التجديد قبل انتهاء الصلاحية.
            </span>
          </div>
        )}
      </div>

      {/* ── Performance Chart & Rating ── */}
      <div className="border-b border-[var(--zd-line)] p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[14px] font-bold text-[var(--zd-text)]">
              مؤشر الأداء
            </h3>
            <p className="mt-0.5 text-[10px] text-[var(--zd-muted)]">
              تقييم مُحتسب من الرحلات المكتملة والمهام
            </p>
          </div>
          <div className="text-left">
            <div className="flex items-center justify-end gap-1 font-manrope text-[22px] font-extrabold text-[var(--zd-text)]">
              <Star className="h-4 w-4 fill-[var(--zd-amber)] text-[var(--zd-amber)]" />
              {driver.rating}
            </div>
            <div className="text-[9px] font-medium text-[var(--zd-teal)]">
              أعلى من ٨٦٪ من السائقين
            </div>
          </div>
        </div>

        <div className="mt-4">
          <PerformanceChart score={driver.score || 92} driverName={driver.name} />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-[var(--zd-surface)] border border-[var(--zd-line)] py-2">
            <b className="font-manrope text-[15px] font-bold text-[var(--zd-text)]">
              {driver.trips}
            </b>
            <small className="mt-0.5 block text-[9px] text-[var(--zd-muted)]">
              رحلة مكتملة
            </small>
          </div>
          <div className="rounded-lg bg-[var(--zd-surface)] border border-[var(--zd-line)] py-2">
            <b className="font-manrope text-[15px] font-bold text-[var(--zd-text)]">
              {driver.tasks}
            </b>
            <small className="mt-0.5 block text-[9px] text-[var(--zd-muted)]">
              مهمة منجزة
            </small>
          </div>
          <div className="rounded-lg bg-[var(--zd-surface)] border border-[var(--zd-line)] py-2">
            <b className="font-manrope text-[15px] font-bold text-[var(--zd-teal)]">
              ٩٨٪
            </b>
            <small className="mt-0.5 block text-[9px] text-[var(--zd-muted)]">
              في الموعد
            </small>
          </div>
        </div>
      </div>

      {/* ── Activity Tabs ── */}
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-bold text-[var(--zd-text)]">
              سجل النشاط
            </h3>
            <p className="mt-0.5 text-[10px] text-[var(--zd-muted)]">
              نظرة موحدة على المهام، الوقود وبلاغات السائق
            </p>
          </div>
          <button
            onClick={() =>
              addToast({
                type: 'info',
                title: 'سجل النشاط',
                message: `عرض سجل النشاط الكامل للسائق ${driver.name}`,
              })
            }
            className="zd-focus text-[10px] font-medium text-[var(--zd-blue)] hover:underline"
          >
            عرض الكل
          </button>
        </div>

        {/* ── Tab Selector ── */}
        <div
          className="mt-4 flex gap-1 rounded-xl bg-[var(--zd-surface-2)] p-1"
          role="tablist"
          aria-label="أقسام نشاط السائق"
        >
          {tabItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setTab(label)}
              role="tab"
              aria-selected={tab === label}
              className={`zd-focus flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[10px] font-semibold transition-all ${
                tab === label
                  ? 'bg-[var(--zd-blue)] text-white shadow-xs'
                  : 'text-[var(--zd-muted)] hover:text-[var(--zd-text)]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        <ActivityContent tab={tab} driver={driver} />
      </div>

      {/* ── Bottom Action Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--zd-line)] bg-[var(--zd-detail-bg)] px-5 py-4 sm:px-6 transition-colors">
        <span className="flex items-center gap-1.5 text-[10px] text-[var(--zd-muted)]">
          <UserRound className="h-3.5 w-3.5" />
          إجراءات إدارة الأسطول
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleStatus(driver.id)}
            className={`zd-focus rounded-xl border px-3 py-2 text-[10px] font-semibold transition-colors ${
              isInactive
                ? 'border-[var(--zd-teal)]/40 text-[var(--zd-teal)] hover:bg-[var(--zd-teal)]/10'
                : 'border-[var(--zd-red)]/40 text-[var(--zd-red)] hover:bg-[var(--zd-red)]/10'
            }`}
          >
            {isInactive ? 'تفعيل الحساب' : 'تعطيل الحساب'}
          </button>

          <button
            onClick={() => onEdit(driver)}
            className="zd-focus rounded-xl bg-[var(--zd-blue)] px-4 py-2 text-[10px] font-semibold text-white hover:opacity-90 shadow-xs transition-all"
          >
            تعديل البيانات
          </button>
        </div>
      </div>
    </section>
  );
}
