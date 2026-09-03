// ============================================================
//  Vehicle Types — aligned with Backend Vehicle model
// ============================================================

export interface DriverSummary {
  _id: string;
  name?: string;
  email: string;
  phone?: string;
  status?: string;
}

export interface TeamSummary {
  _id: string;
  name: string;
}

/** شكل بيانات المركبة كما يرجعها الباك اند */
export interface BackendVehicle {
  _id: string;
  model: string;          // اسم وموديل المركبة
  year: number;           // سنة الصنع
  plateNumber: number;    // رقم اللوحة
  isInTask: boolean;      // هل المركبة في مهمة حالياً
  status: VehicleStatus;  // حالة المركبة (active / inactive)
  teamId?: string | TeamSummary | null;
  companyId: string;
  driverId?: string | DriverSummary | null;      // معرف أو كائن السائق المعين (إن وجد)
  createdAt?: string;
  updatedAt?: string;
}

/** حالة المركبة المعتمدة في الباك اند */
export type VehicleStatus = 'active' | 'inactive';

/** واجهة المركبة الموسعة في الفرونت إند مع تفاصيل السائق المدمج */
export interface VehicleWithRelations extends BackendVehicle {
  driverName?: string;
  driverEmail?: string;
  teamName?: string;
}

// ── API Inputs ──────────────────────────────────────────────

/** البيانات المطلوبة لإنشاء مركبة جديدة */
export interface CreateVehicleInput {
  model: string;
  year: number;
  plateNumber: number;
  teamId?: string;
}

/** البيانات المطلوبة لتعيين سائق لمركبة */
export interface AssignDriverInput {
  driverId: string;
}

/** البيانات المطلوبة لتغيير حالة مركبة */
export interface ChangeVehicleStatusInput {
  status: VehicleStatus;
}
