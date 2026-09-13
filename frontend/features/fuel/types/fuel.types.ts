// ============================================================
//  Fuel Module Types — Strictly aligned with Backend Fuel Model
// ============================================================

export type FuelStatus = 'pending' | 'approved' | 'declined';

export type FuelIssueType = 'high_consumption' | 'possible_leak' | null;

export interface PopulatedVehicle {
  _id: string;
  model: string;
  plateNumber: number | string;
  expectedFuelEfficiency?: number;
  currentOdometer?: number;
}

export interface PopulatedUser {
  _id: string;
  name: string;
  email: string;
}

export interface BackendFuelRecord {
  _id: string;
  vehicleId: string | PopulatedVehicle;
  teamId?: string | null;
  companyId: string;
  userId: string | PopulatedUser;
  cost: number;
  qty: number;
  odometer: number;
  image: string; // رابط إيصال الوقود على Cloudinary
  isFullTank: boolean;
  distanceSinceLastFull?: number | null;
  fuelSinceLastFull?: number | null;
  fuelEfficiency?: number | null;
  fuelIssue?: boolean;
  fuelIssueType?: FuelIssueType;
  fuelIssueMessage?: string | null;
  nextOdoMeter?: number | null;
  status: FuelStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FuelRecordWithRelations extends BackendFuelRecord {
  vehicleModel: string;
  vehiclePlate: string | number;
  expectedEfficiency?: number;
  userName: string;
  userEmail: string;
  formattedDate: string;
  pricePerLiter: number; // تكلفة اللتر الواحد (cost / qty)
}

export interface CreateFuelInput {
  vehicleId: string;
  cost: number;
  qty: number;
  odometer: number;
  isFullTank: boolean;
  image: File; // صورة فاتورة الوقود مطلوبة إجبارياً
}

export interface VerifyFuelInput {
  id: string;
  status: 'approved' | 'declined';
}

export interface FuelStats {
  totalRecords: number;
  totalCost: number;
  totalQty: number;
  pending: number;
  approved: number;
  declined: number;
  fuelIssues: number;
  fullTankRecords: number;
  averageEfficiency: number;
}

export interface FuelFilters {
  status?: FuelStatus | 'all';
  vehicleId?: string;
  fuelIssue?: boolean | 'all';
}
