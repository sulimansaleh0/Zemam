import type { Team, FleetManagerSummary } from '../types/team.types';
import type { FleetManager } from '@/features/managers/types/manager.types';
import type { VehicleWithRelations } from '@/features/vehicles/types/vehicle.types';

// ============================================================
//  Team Helpers — Pure Utility Functions
// ============================================================

/**
 * استخراج معرف مدير الفريق بأمان
 */
export function getTeamManagerId(
  managerId?: string | FleetManagerSummary | null
): string | undefined {
  if (!managerId) return undefined;
  if (typeof managerId === 'object' && '_id' in managerId) {
    return managerId._id;
  }
  return typeof managerId === 'string' && managerId.trim() ? managerId : undefined;
}

/**
 * استخراج اسم مدير الفريق بأمان
 */
export function getTeamManagerName(
  managerId?: string | FleetManagerSummary | null,
  managersList?: FleetManager[]
): string | undefined {
  if (!managerId) return undefined;
  if (typeof managerId === 'object') {
    if (managerId.name && managerId.name !== 'Default') return managerId.name;
    if (managerId.email) return managerId.email.split('@')[0];
  }
  const id = getTeamManagerId(managerId);
  if (id && managersList) {
    const match = managersList.find((m) => m._id === id);
    if (match) {
      if (match.name && match.name !== 'Default') return match.name;
      if (match.email) return match.email.split('@')[0];
    }
  }
  return undefined;
}

/**
 * استخراج البريد الإلكتروني لمدير الفريق بأمان
 */
export function getTeamManagerEmail(
  managerId?: string | FleetManagerSummary | null,
  managersList?: FleetManager[]
): string | undefined {
  if (!managerId) return undefined;
  if (typeof managerId === 'object' && managerId.email) {
    return managerId.email;
  }
  const id = getTeamManagerId(managerId);
  if (id && managersList) {
    const match = managersList.find((m) => m._id === id);
    if (match?.email) return match.email;
  }
  return undefined;
}

/**
 * حساب عدد المركبات لكل فريق
 */
export function calculateTeamVehicleCounts(
  vehicles: VehicleWithRelations[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  vehicles.forEach((v) => {
    const teamId =
      typeof v.teamId === 'object' && v.teamId !== null ? v.teamId._id : v.teamId;
    if (teamId) {
      counts[teamId] = (counts[teamId] || 0) + 1;
    }
  });
  return counts;
}

/**
 * تصدير بيانات الفرق إلى ملف CSV
 */
export function exportTeamsCSV(
  teams: Team[],
  managersList: FleetManager[],
  vehicleCounts: Record<string, number>
): void {
  if (typeof window === 'undefined' || teams.length === 0) return;

  const headers = ['الرقم التعريفي', 'اسم الفريق', 'المدير المسؤول', 'بريد المدير', 'عدد المركبات', 'تاريخ الإنشاء'];

  const rows = teams.map((t) => [
    t._id,
    `"${t.name}"`,
    `"${getTeamManagerName(t.managerId, managersList) || 'غير معين'}"`,
    `"${getTeamManagerEmail(t.managerId, managersList) || '—'}"`,
    vehicleCounts[t._id] || 0,
    t.createdAt ? new Date(t.createdAt).toLocaleDateString('ar-SA') : '—',
  ]);

  const csvContent =
    '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `zamam_teams_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
