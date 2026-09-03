import type { BackendDriver, Driver } from '../types/driver.types';

// ============================================================
//  Driver Helpers — Pure Utility Functions
// ============================================================

export const DRIVER_COLORS = [
  '#2ab9a5',
  '#4e83ff',
  '#e9b35f',
  '#b880ee',
  '#7690b6',
  '#46b6c5',
  '#6d9fff',
  '#f59e0b',
  '#10b981',
  '#ec4899',
] as const;

/**
 * استخراج الأحرف الأولى للاسم أو أول حرفين من البريد الإلكتروني.
 */
export function extractInitials(name?: string, email?: string): string {
  if (!name || name === 'Default') {
    if (email) return email.slice(0, 2).toUpperCase();
    return '؟؟';
  }
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2);
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`;
}

/**
 * تحديد لون ثابت للسائق بناءً على معرفه.
 */
export function getDriverColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return DRIVER_COLORS[Math.abs(hash) % DRIVER_COLORS.length];
}

/**
 * إرجاع الاسم المعروض للسائق (الاسم الفعلي أو الجزء الأول من البريد).
 */
export function getDriverDisplayName(driver?: { name?: string; email: string } | null): string {
  if (!driver) return '';
  if (!driver.name || driver.name === 'Default') {
    return driver.email.split('@')[0];
  }
  return driver.name;
}

/**
 * استخراج معرف الفريق بأمان سواء كان teamId عبارة عن string أو كائن { _id, name }.
 */
export function getDriverTeamId(
  teamId?: string | { _id: string; name?: string } | null
): string | undefined {
  if (!teamId) return undefined;
  if (typeof teamId === 'object' && '_id' in teamId) {
    return teamId._id;
  }
  return typeof teamId === 'string' && teamId.trim() ? teamId : undefined;
}

/**
 * استخراج اسم الفريق بأمان عبر teamId وقائمة الفرق المتاحة.
 */
export function getDriverTeamName(
  teamId?: string | { _id: string; name: string } | null,
  teamsList?: Array<{ _id: string; name: string }>
): string | undefined {
  if (!teamId) return undefined;
  if (typeof teamId === 'object' && 'name' in teamId && teamId.name) {
    return teamId.name;
  }
  const id = getDriverTeamId(teamId);
  if (id && teamsList) {
    const match = teamsList.find((t) => t._id === id);
    if (match) return match.name;
  }
  return undefined;
}

/**
 * إضافة الحقول المحسوبة لبيانات السائق القادمة من الـ API.
 */
export function enrichDriver(driver: BackendDriver): Driver {
  return {
    ...driver,
    initials: extractInitials(driver.name, driver.email),
    color: getDriverColor(driver._id),
  };
}

/**
 * تحويل التاريخ إلى صيغة نسبية بالعربية.
 */
export function formatRelativeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';

    const diffMs = Date.now() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'اليوم';
    if (diffDays === 1) return 'أمس';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
    if (diffDays < 365) return `منذ ${Math.floor(diffDays / 30)} أشهر`;
    return `منذ ${Math.floor(diffDays / 365)} سنوات`;
  } catch {
    return '—';
  }
}

/**
 * تصدير بيانات السائقين إلى ملف CSV بتنسيق UTF-8 داعم للعربية.
 */
export function exportDriversCSV(drivers: Driver[]): void {
  if (typeof window === 'undefined' || drivers.length === 0) return;

  const headers = ['الرقم التعريفي', 'الاسم', 'البريد الإلكتروني', 'الحالة', 'تاريخ الانضمام'];

  const rows = drivers.map((d) => [
    d._id,
    `"${getDriverDisplayName(d)}"`,
    `"${d.email}"`,
    d.status === 'active' ? 'نشط' : 'غير نشط',
    `"${new Date(d.createdAt).toLocaleDateString('ar-SA')}"`,
  ]);

  const csvContent =
    '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `zamam_drivers_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
