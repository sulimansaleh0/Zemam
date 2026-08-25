// ============================================================
//  Vehicle Types — aligned with Backend Vehicle model
// ============================================================

/** شكل بيانات المركبة كما يرجعها الباك اند */
export interface BackendVehicle {
  _id: string;
  model: string;          // اسم وموديل المركبة
  year: number;           // سنة الصنع
  plateNumber: number;    // رقم اللوحة
  isInTask: boolean;      // هل المركبة في مهمة حالياً
  status: VehicleStatus;  // حالة المركبة (active / inactive)
  teamId: string;
  companyId: string;
  driverId?: string;      // معرف السائق المعين (إن وجد)
  createdAt?: string;
  updatedAt?: string;
}

/** حالة المركبة المعتمدة في الباك اند */
export type VehicleStatus = 'active' | 'inactive';

/** واجهة المركبة الموسعة في الفرونت إند مع تفاصيل السائق المدمج */
export interface VehicleWithRelations extends BackendVehicle {
  driverName?: string;
  driverEmail?: string;
}

// ── API Inputs ──────────────────────────────────────────────

/** البيانات المطلوبة لإنشاء مركبة جديدة */
export interface CreateVehicleInput {
  model: string;
  year: number;
  plateNumber: number;
}

/** البيانات المطلوبة لتعيين سائق لمركبة */
export interface AssignDriverInput {
  driverId: string;
}

/** البيانات المطلوبة لتغيير حالة مركبة */
export interface ChangeVehicleStatusInput {
  status: VehicleStatus;
}
