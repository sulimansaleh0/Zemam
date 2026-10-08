// ============================================================
//  Driver Types — aligned with backend User model (driver role)
// ============================================================

export type { PaginationInfo } from '@/shared/types/api.types';

export interface ScoreAuditItem {
  pointsChange: number;
  reason: string;
  category: 'maintenance' | 'task' | 'fuel' | 'manual';
  date?: string;
  createdAt?: string;
  relatedId?: string;
}

/** شكل بيانات السائق كما يرجعها الباك اند */
export interface BackendDriver {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  roles?: string[];
  status: DriverStatus;
  licenseNumber?: string;
  licenseTypes?: ('normal' | 'van' | 'truck')[];
  licenseExpiry?: string;
  driverScore?: number;
  scoreHistory?: ScoreAuditItem[];
  totalTasksCompleted?: number;
  delayedTasksCount?: number;
  faultIncidentsCount?: number;
  companyId: string;
  teamId?: string | { _id: string; name: string } | null;
  assignedVehicle?: {
    _id: string;
    model: string;
    year: number;
    plateNumber: string | number;
    vehicleType?: 'normal' | 'van' | 'truck';
    fuelType?: string;
  } | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

/** السائق بعد enrichment في الفرونت اند */
export interface Driver extends BackendDriver {
  /** الأحرف الأولى للاسم */
  initials: string;
  /** لون الأفاتار الثابت */
  color: string;
  /** تفاصيل المركبة المعينة له حالياً (إن وجدت) */
  assignedVehicle?: {
    _id: string;
    model: string;
    year: number;
    plateNumber: string | number;
    vehicleType?: 'normal' | 'van' | 'truck';
    fuelType?: string;
  } | null;
}

/** حالة السائق التشغيلية */
export type DriverStatus = 'active' | 'inactive';

/** خيارات فلترة الحالة في الـ UI */
export type DriverStatusFilter = 'all' | 'active' | 'inactive';

/** خيارات ترتيب القائمة */
export type DriverSortOrder = 'newest' | 'oldest' | 'name';

/** استعلامات البحث والترقيم من جهة الخادم */
export interface DriversQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  licenseType?: string;
  withoutTeam?: boolean | string;
  all?: boolean | string;
  teamId?: string;
}

/** إحصائيات السائق التشغيلية الشاملة من الخادم */
export interface DriverStats {
  totalTasks: number;
  finishedTasks: number;
  inProgressTasks: number;
  onTimeRate: number;
  totalFuelCost: number;
  totalFuelQty: number;
  fuelRecordsCount: number;
  driverScore: number;
  faultIncidentsCount: number;
}

// ── API Inputs ──────────────────────────────────────────────

/** البيانات المرسلة لإنشاء سائق */
export interface CreateDriverInput {
  email: string;
  name: string;
  phone?: string;
  teamId?: string;
  vehicleId?: string;
  licenseNumber: string;
  licenseTypes?: ('normal' | 'van' | 'truck')[];
  licenseExpiry: string;
}

/** البيانات المرسلة لتغيير حالة سائق */
export interface ChangeDriverStatusInput {
  status: DriverStatus;
}

/** البيانات المرسلة لتعيين مركبة لسائق */
export interface AssignVehicleInput {
  vehicleId: string;
}
