import type {
  FuelStatus,
  BackendFuelRecord,
  PopulatedVehicle,
  PopulatedUser,
} from '../types/fuel.types';

export function getFuelStatusConfig(status: FuelStatus) {
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

export function formatFuelDate(dateString?: string | Date): string {
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
  return `${Number(amount).toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س`;
}

export function formatLiters(qty?: number | null): string {
  if (qty === undefined || qty === null || isNaN(qty)) return '0 لتر';
  return `${Number(qty).toLocaleString('ar-SA', { maximumFractionDigits: 1 })} لتر`;
}

export function formatEfficiency(efficiency?: number | null): string {
  if (efficiency === undefined || efficiency === null || isNaN(efficiency) || efficiency <= 0) {
    return '—';
  }
  return `${efficiency.toFixed(2)} كم/لتر`;
}

export function getFuelVehicleDisplay(v: BackendFuelRecord['vehicleId']): {
  model: string;
  plate: string | number;
  expectedEfficiency?: number;
} {
  if (!v) return { model: '—', plate: '—' };
  if (typeof v === 'object') {
    const veh = v as PopulatedVehicle;
    return {
      model: veh.model || '—',
      plate: veh.plateNumber ?? '—',
      expectedEfficiency: veh.expectedFuelEfficiency,
    };
  }
  return { model: 'مركبة', plate: v };
}

export function getFuelUserDisplay(u: BackendFuelRecord['userId']): { name: string; email: string } {
  if (!u) return { name: 'المستخدم', email: '—' };
  if (typeof u === 'object') {
    const usr = u as PopulatedUser;
    return {
      name: usr.name || usr.email || 'المستخدم',
      email: usr.email || '—',
    };
  }
  return { name: 'المستخدم', email: '—' };
}
