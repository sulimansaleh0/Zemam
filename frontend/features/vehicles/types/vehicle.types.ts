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
  plateNumber: string | number; // رقم اللوحة (يدعم النصوص والأرقام العربية والإنجليزية)
  vehicleType?: 'normal' | 'van' | 'truck'; // نوع المركبة (خفيف / متوسط / ثقيل)
  tankCapacity?: number;  // سعة خزان الوقود باللتر
  fuelType?: string;      // نوع الوقود (بنزين 91، بنزين 95، ديزل، هجين، كهربائي)
  currentOdometer?: number; // قراءة العداد الحالية
  expectedFuelEfficiency?: number; // كفاءة الوقود المتوقعة (كم/لتر)
  isInTask: boolean;      // هل المركبة في مهمة حالياً
  status: VehicleStatus;  // حالة المركبة (active / inactive / in_maintenance)
  insuranceNumber?: string; // رقم وثيقة التأمين
  insuranceCompany?: string; // شركة التأمين
  insuranceType?: 'comprehensive' | 'third_party'; // نوع التأمين (شامل / ضد الغير)
  insuranceExpiry?: string; // تاريخ انتهاء التأمين
  licenseNumber?: string;   // رقم رخصة السير / الاستمارة
  licenseExpiry?: string;   // تاريخ انتهاء رخصة السير
  teamId?: string | TeamSummary | null;
  companyId: string;
  driverId?: string | DriverSummary | null; // معرف أو كائن السائق المعين (إن وجد)
  createdAt?: string;
  updatedAt?: string;
}

/** حالة المركبة المعتمدة في الباك اند */
export type VehicleStatus = 'active' | 'inactive' | 'in_maintenance';

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
  plateNumber: string | number;
  teamId?: string;
  vehicleType?: 'normal' | 'van' | 'truck';
  tankCapacity?: number;
  fuelType?: string;
  currentOdometer?: number;
  expectedFuelEfficiency?: number;
  licenseNumber?: string;
  licenseExpiry?: string;
  insuranceCompany?: string;
  insuranceNumber?: string;
  insuranceType?: 'comprehensive' | 'third_party';
  insuranceExpiry?: string;
  driverId?: string;
}

/** البيانات المطلوبة لتعيين سائق لمركبة */
export interface AssignDriverInput {
  driverId: string;
}

/** البيانات المطلوبة لتغيير حالة مركبة */
export interface ChangeVehicleStatusInput {
  status: VehicleStatus;
}

/** البيانات المطلوبة لتعديل بيانات مركبة */
export interface UpdateVehicleInput {
  model?: string;
  year?: number;
  plateNumber?: string | number;
  vehicleType?: 'normal' | 'van' | 'truck';
  tankCapacity?: number;
  fuelType?: string;
  currentOdometer?: number;
  expectedFuelEfficiency?: number;
  registrationNumber?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  issuingAuthority?: string;
  insuranceCompany?: string;
  insuranceNumber?: string;
  insuranceType?: 'comprehensive' | 'third_party';
  insuranceExpiry?: string;
}

/** إحصائيات تشغيل المركبة من الباك إند */
export interface VehicleStats {
  distance: number;
  totalFuel: number;
  totalFuelCost: number;
  totalMaintenanceCost: number;
  fuelEfficiency: number;
}

export interface VehicleStatsResponse {
  stats: VehicleStats;
}

