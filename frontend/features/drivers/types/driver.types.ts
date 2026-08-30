// ============================================================
//  Driver Types — aligned with backend User model (driver role)
// ============================================================

/** شكل بيانات السائق كما يرجعها الباك اند */
export interface BackendDriver {
  _id: string;
  name: string;           // defaults to "Default" إذا لم يُحدَّد
  email: string;
  roles: string[];
  status: DriverStatus;
  companyId: string;
  teamId: string;
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
    plateNumber: number;
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
  teamId?: string;
}

/** البيانات المرسلة لتغيير حالة سائق */
export interface ChangeDriverStatusInput {
  status: DriverStatus;
}

/** البيانات المرسلة لتعيين مركبة لسائق */
export interface AssignVehicleInput {
  vehicleId: string;
}
