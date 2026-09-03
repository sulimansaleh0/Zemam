import type { FleetManager } from '../types/manager.types';
import type { Team } from '@/features/teams/types/team.types';

// ============================================================
//  Fleet Manager Helpers — Pure Utility Functions
// ============================================================

/**
 * استخراج معرف الفريق بأمان
 */
export function getManagerTeamId(
  teamId?: string | { _id: string; name?: string } | null
): string | undefined {
  if (!teamId) return undefined;
  if (typeof teamId === 'object' && '_id' in teamId) {
    return teamId._id;
  }
  return typeof teamId === 'string' && teamId.trim() ? teamId : undefined;
}

/**
 * استخراج اسم الفريق المسند لمدير الأسطول بأمان
 */
export function getManagerTeamName(
  teamId?: string | { _id: string; name?: string } | null,
  teamsList?: Team[]
): string | undefined {
  if (!teamId) return undefined;
  if (typeof teamId === 'object' && 'name' in teamId && teamId.name) {
    return teamId.name;
  }
  const id = getManagerTeamId(teamId);
  if (id && teamsList) {
    const match = teamsList.find((t) => t._id === id);
    if (match) return match.name;
  }
  return undefined;
}

/**
 * استخراج الاسم المعروض للمدير
 */
export function getManagerDisplayName(manager: FleetManager): string {
  if (manager.name && manager.name.trim() && manager.name !== 'Default') {
    return manager.name.trim();
  }
  return manager.email ? manager.email.split('@')[0] : 'مدير أسطول';
}

/**
 * تصدير بيانات مدراء الأساطيل كملف CSV
 */
export function exportManagersCSV(managers: FleetManager[], teamsList: Team[]): void {
  if (typeof window === 'undefined' || managers.length === 0) return;

  const headers = ['الرقم التعريفي', 'الاسم', 'البريد الإلكتروني', 'رقم الهاتف', 'الحالة', 'الفريق'];

  const rows = managers.map((m) => [
    m._id,
    `"${m.name || getManagerDisplayName(m)}"`,
    `"${m.email}"`,
    `"${m.phone || 'غير مسجل'}"`,
    (m.status || 'active').toLowerCase() === 'active' ? 'نشط' : 'معطل',
    `"${getManagerTeamName(m.teamId, teamsList) || 'غير معين'}"`,
  ]);

  const csvContent =
    '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `zamam_managers_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
