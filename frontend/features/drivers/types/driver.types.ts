// ============================================================
//  Driver Types — aligned with backend User model (driver role)
// ============================================================

export interface ScoreAuditItem {
  pointsChange: number;
  reason: string;
  category: 'maintenance' | 'task' | 'fuel' | 'manual';
  date: string;
  relatedId?: string;
}

/** شكل بيانات السائق كما يرجعها الباك اند */
export interface BackendDriver {
  _id: string;
  name: string;           // defaults to "Default" إذا لم يُحدَّد
  email: string;
  phone?: string;
  role?: string;
  roles?: string[];
  status: DriverStatus;
  licenseNumber?: string; // رقم رخصة القيادة
  licenseTypes?: ('normal' | 'van' | 'truck')[]; // فئات رخصة القيادة المصرح له بها
  licenseExpiry?: string; // تاريخ انتهاء رخصة القيادة
  driverScore?: number;   // تقييم السائق التراكمي (0 - 100)
  scoreHistory?: ScoreAuditItem[]; // سجل الشفافية للتقييم
  totalTasksCompleted?: number;
  delayedTasksCount?: number;
  faultIncidentsCount?: number;
  companyId: string;
  teamId?: string | { _id: string; name: string } | null;
  isDeleted: boolean;
  createdAt: string;      // ISO 8601
  updatedAt: string;      // ISO 8601
}

/** السائق بعد enrichment في الفرونت اند */
export interface Driver extends BackendDriver {
  /** الأحرف الأولى للاسم — محسوبة في الفرونت اند */
  initials: string;
  /** لون الأفاتار — محدد بشكل ثابت بناءً على الـ ID */
  color: string;
  /** تفاصيل المركبة المعينة له حالياً (إن وجدت) */
  assignedVehicle?: {
    _id: string;
    model: string;
    year: number;
    plateNumber: string | number;
    vehicleType?: 'normal' | 'van' | 'truck';
  };
}

/** حالة السائق — تعكس قيم الباك اند مباشرة */
export type DriverStatus = 'active' | 'inactive';

/** خيارات فلترة الحالة في الـ UI */
export type DriverStatusFilter = 'all' | 'active' | 'inactive';

/** خيارات ترتيب القائمة */
export type DriverSortOrder = 'newest' | 'oldest' | 'name';

// ── API Inputs ──────────────────────────────────────────────

/** البيانات المرسلة لإنشاء سائق */
export interface CreateDriverInput {
  email: string;
  name?: string;
  phone?: string;
  teamId?: string;
  vehicleId?: string;
  licenseNumber?: string;
  licenseTypes?: ('normal' | 'van' | 'truck')[];
  licenseExpiry?: string;
}

/** البيانات المرسلة لتغيير حالة سائق */
export interface ChangeDriverStatusInput {
  status: DriverStatus;
}

/** البيانات المرسلة لتعيين مركبة لسائق */
export interface AssignVehicleInput {
  vehicleId: string;
}
