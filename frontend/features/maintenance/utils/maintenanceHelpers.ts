import type {
  MaintenanceStatus,
  MaintenancePriority,
  MaintenanceCategory,
  BackendMaintenanceRecord,
  PopulatedVehicle,
  PopulatedReporter,
} from '../types/maintenance.types';

export function getMaintenanceStatusConfig(status: MaintenanceStatus) {
  switch (status) {
    case 'pending':
      return {
        label: 'قيد المراجعة',
        bgClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        dotClass: 'bg-amber-500',
      };
    case 'approved':
      return {
        label: 'معتمدة ومقبولة',
        bgClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        dotClass: 'bg-emerald-500',
      };
    case 'declined':
      return {
        label: 'مرفوضة',
        bgClass: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        dotClass: 'bg-rose-500',
      };
    default:
      return {
        label: status,
        bgClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        dotClass: 'bg-slate-400',
      };
  }
}

export function getMaintenancePriorityConfig(priority: MaintenancePriority) {
  switch (priority) {
    case 'High':
      return {
        label: 'أولوية عالية (توقف)',
        shortLabel: 'عالية',
        bgClass: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        dotClass: 'bg-rose-500',
      };
    case 'low':
      return {
        label: 'أولوية عادية',
        shortLabel: 'عادية',
        bgClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        dotClass: 'bg-slate-400',
      };
    default:
      return {
        label: priority,
        shortLabel: priority,
        bgClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        dotClass: 'bg-slate-400',
      };
  }
}

export function getMaintenanceCategoryConfig(category: MaintenanceCategory) {
  switch (category) {
    case 'Faults':
      return {
        label: 'أعطال طارئة',
        badgeClass: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      };
    case 'Periodic Maintenance':
      return {
        label: 'صيانة دورية',
        badgeClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      };
    default:
      return {
        label: category,
        badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      };
  }
}

export function formatMaintenanceDate(dateString?: string | Date): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return '—';
  }
}

export function formatCostSAR(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ر.س';
  return `${Number(amount).toLocaleString('ar-SA')} ر.س`;
}

export function getMaintenanceVehicleDisplay(v: BackendMaintenanceRecord['vehicleId']): { model: string; plate: string | number } {
  if (!v) return { model: '—', plate: '—' };
  if (typeof v === 'object') {
    const veh = v as PopulatedVehicle;
    return {
      model: veh.model || '—',
      plate: veh.plateNumber ?? '—',
    };
  }
  return { model: 'مركبة', plate: v };
}

export function getMaintenanceReporterDisplay(r: BackendMaintenanceRecord['reportedBy']): { name: string; email: string } {
  if (!r) return { name: 'المستخدم', email: '—' };
  if (typeof r === 'object') {
    const reporter = r as PopulatedReporter;
    const fullName = [reporter.firstName, reporter.lastName].filter(Boolean).join(' ') || reporter.name;
    return {
      name: fullName || reporter.email || 'المستخدم',
      email: reporter.email || '—',
    };
  }
  return { name: 'المستخدم', email: '—' };
}
