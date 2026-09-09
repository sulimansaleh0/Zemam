import type {
  TaskStatus,
  BackendTask,
  PopulatedDriver,
  PopulatedVehicle,
  PopulatedTeam,
} from '../types/task.types';

export function getTaskStatusConfig(status: TaskStatus) {
  switch (status) {
    case 'pending':
      return {
        label: 'قيد الانتظار',
        bgClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        dotClass: 'bg-amber-500',
      };
    case 'inprogress':
      return {
        label: 'قيد التنفيذ',
        bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        dotClass: 'bg-blue-500',
      };
    case 'finished':
      return {
        label: 'مكتملة',
        bgClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        dotClass: 'bg-emerald-500',
      };
    case 'declined':
      return {
        label: 'ملغية',
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

export function formatTaskDateTime(dateString?: string | Date): string {
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

export function getVehicleDisplay(v: BackendTask['vehicleId']): { model: string; plate: string | number } {
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

export function getDriverDisplay(d: BackendTask['driverId']): { name: string; phone: string } {
  if (!d) return { name: 'غير معين', phone: '—' };
  if (typeof d === 'object') {
    const drv = d as PopulatedDriver;
    return {
      name: drv.name || drv.email || 'سائق',
      phone: drv.phone || '—',
    };
  }
  return { name: 'سائق', phone: '—' };
}

export function getTeamDisplay(t: BackendTask['teamId']): string {
  if (!t) return '—';
  if (typeof t === 'object') {
    return (t as PopulatedTeam).name || '—';
  }
  return '—';
}
