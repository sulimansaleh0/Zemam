/**
 * ============================================================
 *  Centralized Query Key Factories — Single Source of Truth
 * ============================================================
 *
 * كل الـ hooks اللي بتستخدم React Query لازم تستورد مفاتيحها من هون،
 * بدل ما تعرّف نسخة محلية خاصة فيها. هاد بيمنع الـ key collisions
 * (نفس المفتاح بمعنيين مختلفين بملفين مختلفين) وبيسهّل الـ invalidation
 * الهرمي (مثال: invalidate كل شي تحت ['vehicles'] بضربة وحدة).
 *
 * القاعدة: كل factory بترجع array بصيغة `as const` عشان TypeScript
 * يقدر يستنتج النوع الدقيق (tuple)، وهاد مطلوب لـ React Query
 * لمطابقة المفاتيح بدقة وقت الـ invalidation.
 */

export const vehicleKeys = {
  all: ['vehicles'] as const,
  detail: (id: string) => ['vehicles', id] as const,
};

export const driverKeys = {
  all: ['drivers'] as const,
  detail: (id: string) => ['drivers', id] as const,
};

export const teamKeys = {
  all: ['teams'] as const,
  detail: (id: string) => ['teams', id] as const,
  // "تحليلي" — staleTime أقصر (30-60 ثانية) لأنها بيانات مجمّعة
  // بتتأثر بشكل غير مباشر من أي mutation بأي موديول تاني
  statics: (teamId?: string) => ['teams', 'statics', teamId ?? 'all'] as const,
};

export const managerKeys = {
  all: ['managers'] as const,
  byStatus: (status?: string) => ['managers', { status }] as const,
  available: ['managers', 'available'] as const,
};
