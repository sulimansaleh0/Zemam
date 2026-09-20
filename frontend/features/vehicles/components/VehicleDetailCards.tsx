'use client';

import React from 'react';
import Link from 'next/link';
import { Car, Building2, User, UserCheck, Unlink, Link2, Fuel, FileText, Shield } from 'lucide-react';
import type { VehicleWithRelations } from '../types/vehicle.types';

interface TeamObject {
  _id: string;
  name: string;
}

interface VehicleDetailCardsProps {
  vehicle: VehicleWithRelations;
  teamObj: TeamObject | null;
  onOpenAssignTeam: () => void;
  onRemoveTeam: () => void;
  isRemovingTeam?: boolean;
  onOpenAssignDriver: () => void;
  onUnassignDriver: () => void;
  isUnassigningDriver?: boolean;
}

export function VehicleDetailCards({
  vehicle,
  teamObj,
  onOpenAssignTeam,
  onRemoveTeam,
  isRemovingTeam = false,
  onOpenAssignDriver,
  onUnassignDriver,
  isUnassigningDriver = false,
}: VehicleDetailCardsProps) {
  const isActive = vehicle.status === 'active';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Card 1: Basic Vehicle Specs */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
        <span className="text-xs font-bold text-[var(--muted)] flex items-center gap-1.5">
          <Car className="w-4 h-4 text-blue-500" />
          المواصفات الأساسية
        </span>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted)]">سنة الصنع:</span>
            <span className="font-semibold text-[var(--text)] font-manrope">{vehicle.year}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted)]">رقم اللوحة:</span>
            <span className="font-semibold text-[var(--text)] font-mono" dir="ltr">{vehicle.plateNumber}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted)]">حالة التشغيل:</span>
            <span className="font-semibold text-[var(--text)]">
              {isActive ? 'نشطة في الخدمة' : 'معطلة عن العمل'}
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Operational Team */}
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
              في المستودع العام (غير مقيدة بفريق)
            </span>
          )}
        </div>
      </div>

      {/* Card 3: Assigned Driver */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--muted)] flex items-center gap-1.5">
            <User className="w-4 h-4 text-emerald-500" />
            السائق المسؤول
          </span>
          {vehicle.driverId ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onOpenAssignDriver}
                className="text-[11px] text-[var(--primary)] hover:underline font-semibold cursor-pointer"
              >
                تغيير
              </button>
              <button
                type="button"
                onClick={onUnassignDriver}
                disabled={isUnassigningDriver}
                className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-50"
                title="فك ارتباط السائق"
              >
                <Unlink className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAssignDriver}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] text-xs font-semibold hover:bg-[var(--primary)] hover:text-white transition-colors cursor-pointer"
            >
              <UserCheck className="w-3 h-3" />
              <span>تعيين</span>
            </button>
          )}
        </div>
        <div className="space-y-1 text-xs">
          {vehicle.driverName ? (
            <>
              <div className="font-bold text-sm text-[var(--text)]">{vehicle.driverName}</div>
              {vehicle.driverEmail && (
                <div className="font-mono text-xs text-[var(--muted)]" dir="ltr">
                  {vehicle.driverEmail}
                </div>
              )}
            </>
          ) : (
            <span className="text-xs text-[var(--muted)] italic block pt-2">
              لا يوجد سائق معين للمركبة حالياً
            </span>
          )}
        </div>
      </div>

      {/* Card 4: Fuel & Odometer Specs */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
        <span className="text-xs font-bold text-[var(--muted)] flex items-center gap-1.5">
          <Fuel className="w-4 h-4 text-amber-500" />
          مواصفات الوقود والعداد
        </span>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted)]">سعة الخزان:</span>
            <span className="font-bold text-[var(--text)] font-mono">
              {vehicle.tankCapacity ? `${vehicle.tankCapacity} لتر` : 'غير محدد'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted)]">نوع الوقود:</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              {vehicle.fuelType || 'بنزين 91'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted)]">قراءة العداد:</span>
            <span className="font-mono font-bold text-[var(--text)]">
              {vehicle.currentOdometer ? `${vehicle.currentOdometer.toLocaleString()} كم` : '0 كم'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted)]">الكفاءة المتوقعة:</span>
            <span className="font-mono text-[var(--text)]">
              {vehicle.expectedFuelEfficiency ? `${vehicle.expectedFuelEfficiency} كم/لتر` : 'غير محدد'}
            </span>
          </div>
        </div>
      </div>

      {/* Card 5: Vehicle Registration / License */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
        <span className="text-xs font-bold text-[var(--muted)] flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-purple-500" />
          رخصة السير (الاستمارة)
        </span>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted)]">رقم الاستمارة:</span>
            <span className="font-mono font-bold text-[var(--text)]">
              {vehicle.licenseNumber || 'غير مسجل'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted)]">تاريخ الانتهاء:</span>
            <span className="font-bold text-[var(--text)]">
              {vehicle.licenseExpiry
                ? new Date(vehicle.licenseExpiry).toLocaleDateString('ar-EG')
                : 'غير محدد'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted)]">حالة الاستمارة:</span>
            {vehicle.licenseExpiry ? (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  new Date(vehicle.licenseExpiry) < new Date()
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {new Date(vehicle.licenseExpiry) < new Date() ? 'منتهية الصلاحية' : 'سارية'}
              </span>
            ) : (
              <span className="text-[var(--muted)]">غير مدخل</span>
            )}
          </div>
        </div>
      </div>

      {/* Card 6: Insurance Policy */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
        <span className="text-xs font-bold text-[var(--muted)] flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-emerald-500" />
          وثيقة التأمين
        </span>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted)]">شركة التأمين:</span>
            <span className="font-semibold text-[var(--text)]">
              {vehicle.insuranceCompany || 'غير مسجل'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted)]">نوع التأمين:</span>
            <span className="font-semibold text-[var(--text)]">
              {vehicle.insuranceType === 'third_party' ? 'ضد الغير (إلزامي)' : 'تأمين شامل'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted)]">تاريخ الانتهاء:</span>
            <span className="font-bold text-[var(--text)]">
              {vehicle.insuranceExpiry
                ? new Date(vehicle.insuranceExpiry).toLocaleDateString('ar-EG')
                : 'غير محدد'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted)]">حالة التأمين:</span>
            {vehicle.insuranceExpiry ? (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  new Date(vehicle.insuranceExpiry) < new Date()
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {new Date(vehicle.insuranceExpiry) < new Date() ? 'منتهي الصلاحية' : 'ساري'}
              </span>
            ) : (
              <span className="text-[var(--muted)]">غير مدخل</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
