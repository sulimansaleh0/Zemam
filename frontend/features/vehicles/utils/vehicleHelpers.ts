import type { VehicleWithRelations } from '../types/vehicle.types';

// ============================================================
//  Vehicle Helpers — Pure Utility Functions
// ============================================================

/**
 * استخراج معرف الفريق بأمان سواء كان teamId عبارة عن string أو كائن { _id, name }.
 */
export function getVehicleTeamId(
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
export function getVehicleTeamName(
  teamId?: string | { _id: string; name: string } | null,
  teamsList?: Array<{ _id: string; name: string }>
): string | undefined {
  if (!teamId) return undefined;
  if (typeof teamId === 'object' && 'name' in teamId && teamId.name) {
    return teamId.name;
  }
  const id = getVehicleTeamId(teamId);
  if (id && teamsList) {
    const match = teamsList.find((t) => t._id === id);
    if (match) return match.name;
  }
  return undefined;
}

/**
 * استخراج معرف السائق بأمان سواء كان driverId عبارة عن string أو كائن { _id, name }.
 */
export function getVehicleDriverId(
  driverId?: string | { _id: string; name?: string; email?: string } | null
): string | undefined {
  if (!driverId) return undefined;
  if (typeof driverId === 'object' && '_id' in driverId) {
    return driverId._id;
  }
  return typeof driverId === 'string' && driverId.trim() ? driverId : undefined;
}

/**
 * استخراج اسم السائق المعروض بأمان.
 */
export function getVehicleDriverName(
  driverId?: string | { _id: string; name?: string; email?: string } | null,
  driversList?: Array<{ _id: string; name?: string; email?: string }>
): string | undefined {
  if (!driverId) return undefined;
  if (typeof driverId === 'object') {
    if (driverId.name && driverId.name !== 'Default') return driverId.name;
    if (driverId.email) return driverId.email.split('@')[0];
  }
  const id = getVehicleDriverId(driverId);
  if (id && driversList) {
    const match = driversList.find((d) => d._id === id);
    if (match) {
      if (match.name && match.name !== 'Default') return match.name;
      if (match.email) return match.email.split('@')[0];
    }
  }
  return undefined;
}

/**
 * تصدير بيانات المركبات إلى ملف CSV بتنسيق UTF-8.
 */
export function exportVehiclesCSV(vehicles: VehicleWithRelations[]): void {
  if (typeof window === 'undefined' || vehicles.length === 0) return;

  const headers = ['الرقم التعريفي', 'الموديل', 'سنة الصنع', 'رقم اللوحة', 'الحالة', 'السائق', 'الفريق'];

  const rows = vehicles.map((v) => [
    v._id,
    `"${v.model}"`,
    v.year,
    v.plateNumber,
    v.status === 'active' ? 'نشطة' : 'معطلة',
    `"${v.driverName || 'غير معين'}"`,
    `"${v.teamName || 'المستودع العام'}"`,
  ]);

  const csvContent =
    '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `zamam_vehicles_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
