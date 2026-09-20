'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Building2, Car, Unlink, Link2, FileText } from 'lucide-react';
import type { Driver } from '../types/driver.types';
import { formatRelativeDate } from '../utils/driverHelpers';
import { DriverScoreCard } from './DriverScoreCard';

interface TeamObject {
  _id: string;
  name: string;
}

interface DriverDetailCardsProps {
  driver: Driver;
  teamObj: TeamObject | null;
  onOpenAssignTeam: () => void;
  onRemoveTeam: () => void;
  isRemovingTeam?: boolean;
  onOpenAssignVehicle: () => void;
  onUnassignVehicle: () => void;
  isUnassigningVehicle?: boolean;
}

export function DriverDetailCards({
  driver,
  teamObj,
  onOpenAssignTeam,
  onRemoveTeam,
  isRemovingTeam = false,
  onOpenAssignVehicle,
  onUnassignVehicle,
  isUnassigningVehicle = false,
}: DriverDetailCardsProps) {
  const isActive = driver.status === 'active';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Card 1: Basic Info */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
        <span className="text-xs font-bold text-[var(--muted)] flex items-center gap-1.5">
          <Mail className="w-4 h-4 text-blue-500" />
          البيانات الأساسية
        </span>
        <div className="space-y-2 text-xs">
          <div>
            <span className="text-[var(--muted)] block">البريد الإلكتروني:</span>
            <span className="font-semibold text-[var(--text)] font-mono" dir="ltr">
              {driver.email}
            </span>
          </div>
          <div>
            <span className="text-[var(--muted)] block">تاريخ الانضمام:</span>
            <span className="font-semibold text-[var(--text)]">
              {formatRelativeDate(driver.createdAt)}
            </span>
          </div>
          <div>
            <span className="text-[var(--muted)] block">حالة الحساب:</span>
            <span className="font-semibold text-[var(--text)]">
              {isActive ? 'نشط ويعمل' : 'معطل مؤقتاً'}
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Team */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--muted)] flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-indigo-500" />
            الفريق التشغيلي
          </span>
          {teamObj ? (
            <button
              type="button"
              onClick={onRemoveTeam}
              disabled={isRemovingTeam}
              className="p-1 rounded-lg text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer disabled:opacity-50"
              title="فك الارتباط عن الفريق"
            >
              <Unlink className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAssignTeam}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] text-xs font-semibold hover:bg-[var(--primary)] hover:text-white transition-colors cursor-pointer"
            >
              <Link2 className="w-3 h-3" />
              <span>تعيين</span>
            </button>
          )}
        </div>
        <div className="space-y-1 text-xs">
          {teamObj ? (
            <>
              <Link
                href={`/teams/${teamObj._id}`}
                className="font-bold text-sm text-[var(--text)] hover:text-[var(--primary)] hover:underline block"
              >
                {teamObj.name}
              </Link>
              <span className="text-[11px] text-[var(--muted)]">فريق تشغيلي مسند</span>
            </>
          ) : (
            <span className="text-xs text-[var(--muted)] italic block pt-2">
              في المخزون العام (غير مقيد بفريق)
            </span>
          )}
        </div>
      </div>

      {/* Card 3: Vehicle */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--muted)] flex items-center gap-1.5">
            <Car className="w-4 h-4 text-emerald-500" />
            المركبة المعينة
          </span>
          {driver.assignedVehicle ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onOpenAssignVehicle}
                className="text-[11px] text-[var(--primary)] hover:underline font-semibold cursor-pointer"
              >
                تغيير
              </button>
              <button
                type="button"
                onClick={onUnassignVehicle}
                disabled={isUnassigningVehicle}
                className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-50"
                title="فك ارتباط المركبة"
              >
                <Unlink className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAssignVehicle}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] text-xs font-semibold hover:bg-[var(--primary)] hover:text-white transition-colors cursor-pointer"
            >
              <Car className="w-3 h-3" />
              <span>تعيين</span>
            </button>
          )}
        </div>
        <div className="space-y-1 text-xs">
          {driver.assignedVehicle ? (
            <>
              <div className="font-bold text-sm text-[var(--text)]">
                {driver.assignedVehicle.model} ({driver.assignedVehicle.year})
              </div>
              <div className="font-mono text-xs text-[var(--muted)]">
                لوحة: {driver.assignedVehicle.plateNumber}
              </div>
            </>
          ) : (
            <span className="text-xs text-[var(--muted)] italic block pt-2">
              لا توجد مركبة معينة حالياً
            </span>
          )}
        </div>
      </div>

      {/* Card 4: Driving License & Hierarchy Info */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3 md:col-span-3 lg:col-span-3">
        <span className="text-xs font-bold text-[var(--muted)] flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-purple-500" />
          بيانات رخصة القيادة والتأهيل المروري
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[var(--surface-2)]/60 border border-[var(--border)]">
            <span className="text-[10px] text-[var(--muted)] block">رقم رخصة القيادة:</span>
            <span className="font-mono font-bold text-sm text-[var(--text)] block mt-0.5">
              {driver.licenseNumber || 'غير مسجل'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--surface-2)]/60 border border-[var(--border)]">
            <span className="text-[10px] text-[var(--muted)] block">فئات الرخص المصرح بها:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {Array.isArray(driver.licenseTypes) && driver.licenseTypes.length > 0 ? (
                driver.licenseTypes.map((type) => (
                  <span
                    key={type}
                    className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                  >
                    {type === 'truck' ? 'شاحنة (ثقيل)' : type === 'van' ? 'فان (متوسط)' : 'سيارة (خفيف)'}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-[var(--muted)]">سيارة خاصة (خفيف)</span>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--surface-2)]/60 border border-[var(--border)]">
            <span className="text-[10px] text-[var(--muted)] block">صلاحية الرخصة:</span>
            {driver.licenseExpiry ? (
              <div className="mt-0.5">
                <span className="font-bold text-[var(--text)] block">
                  {new Date(driver.licenseExpiry).toLocaleDateString('ar-EG')}
                </span>
                <span className={`text-[10px] font-semibold ${
                  new Date(driver.licenseExpiry) < new Date() ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {new Date(driver.licenseExpiry) < new Date() ? 'منتهية الصلاحية' : 'سارية المفعول'}
                </span>
              </div>
            ) : (
              <span className="text-[11px] text-[var(--muted)] block mt-0.5">غير محدد</span>
            )}
          </div>
        </div>
      </div>

      {/* Driver Score & Performance Section */}
      <div className="md:col-span-3">
        <DriverScoreCard driver={driver} />
      </div>
    </div>
  );
}
