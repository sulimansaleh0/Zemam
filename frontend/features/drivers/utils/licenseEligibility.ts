import type { BackendVehicle } from '@/features/vehicles/types/vehicle.types';
import type { Driver, BackendDriver } from '../types/driver.types';

export const VEHICLE_TYPE_LABELS: Record<'normal' | 'van' | 'truck', string> = {
  normal: 'سيارة خاصة (خفيف)',
  van: 'فان / حافلة (متوسط)',
  truck: 'شاحنة نقل (ثقيل)',
};

export const LICENSE_TYPE_HIERARCHY: Record<'normal' | 'van' | 'truck', number> = {
  normal: 1, // فئة خفيف
  van: 2,    // فئة متوسط
  truck: 3,  // فئة ثقيل
};

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
  driverHighestCategory?: 'normal' | 'van' | 'truck';
  isExpired?: boolean;
}

/**
 * فحص أهلية السائق لقيادة مركبة معينة بناءً على الهرمية المتبعة في الدول العربية:
 * رخصة الثقيل تؤهل لقيادة (الثقيل + المتوسط + الخفيف)
 * رخصة المتوسط تؤهل لقيادة (المتوسط + الخفيف)
 * رخصة الخفيف تؤهل لقيادة (الخفيف) فقط
 */
export function checkDriverVehicleEligibility(
  driver: Driver | BackendDriver,
  vehicle: BackendVehicle | { vehicleType?: 'normal' | 'van' | 'truck' }
): EligibilityResult {
  const licenseTypes = Array.isArray(driver.licenseTypes) ? driver.licenseTypes : [];
  const licenseExpiry = driver.licenseExpiry;

  // 1. فحص وجود بيانات الرخصة
  if (!driver.licenseNumber || licenseTypes.length === 0) {
    return {
      eligible: false,
      reason: 'بيانات رخصة قيادة السائق غير مكتملة أو غير محددة',
    };
  }

  // 2. فحص سريان صلاحية الرخصة
  if (licenseExpiry) {
    const expiryDate = new Date(licenseExpiry);
    const now = new Date();
    if (expiryDate <= now) {
      return {
        eligible: false,
        isExpired: true,
        reason: `رخصة القيادة منتهية الصلاحية منذ ${expiryDate.toLocaleDateString('ar-EG')}`,
      };
    }
  }

  const vehicleType = vehicle.vehicleType || 'normal';
  const vehicleLevel = LICENSE_TYPE_HIERARCHY[vehicleType] || 1;

  // تحديد أعلى مستوى رخصة يحمله السائق
  let driverMaxLevel = 0;
  let driverHighestCategory: 'normal' | 'van' | 'truck' = 'normal';

  for (const lt of licenseTypes) {
    const level = LICENSE_TYPE_HIERARCHY[lt] || 0;
    if (level > driverMaxLevel) {
      driverMaxLevel = level;
      driverHighestCategory = lt;
    }
  }

  // 3. التحقق وفق الهرمية
  if (driverMaxLevel >= vehicleLevel) {
    return {
      eligible: true,
      driverHighestCategory,
    };
  }

  const requiredLabel = VEHICLE_TYPE_LABELS[vehicleType] || vehicleType;
  const currentLabel = VEHICLE_TYPE_LABELS[driverHighestCategory] || 'غير محددة';

  return {
    eligible: false,
    driverHighestCategory,
    reason: `رخصة السائق الحالية (${currentLabel}) لا تؤهله لقيادة ${requiredLabel}. تتطلب رخصة فئة أعلى.`,
  };
}

/**
 * حساب النسبة المتبقية لصلاحية الرخصة بالأيام وحالتها
 */
export function getLicenseExpiryStatus(expiryDateStr?: string): {
  status: 'valid' | 'expiring_soon' | 'expired' | 'unknown';
  daysLeft: number | null;
  text: string;
} {
  if (!expiryDateStr) {
    return { status: 'unknown', daysLeft: null, text: 'غير محدد' };
  }

  const expiry = new Date(expiryDateStr);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return { status: 'expired', daysLeft, text: `منتهية منذ ${Math.abs(daysLeft)} يوم` };
  }
  if (daysLeft <= 30) {
    return { status: 'expiring_soon', daysLeft, text: `تنتهي خلال ${daysLeft} يوم` };
  }
  return { status: 'valid', daysLeft, text: `سارية (${daysLeft} يوم متبقي)` };
}
