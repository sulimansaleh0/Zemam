// ============================================================
//  Fuel Module Types — Strictly aligned with Backend Fuel Model
// ============================================================

export type FuelStatus = 'pending' | 'approved' | 'declined';

export type FuelIssueType = 'high_consumption' | 'possible_leak' | 'efficiency_deviation' | null;

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

export interface FuelLocation {
  lat?: number;
  lng?: number;
  address?: string;
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
  voidedBy?: string | PopulatedUser | null;
  voidedAt?: string | null;
  voidReason?: string | null;
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
  isFullTank: boolean;
  cost: number;
  qty: number;
  image: File; // صورة فاتورة الوقود مطلوبة إجبارياً
  odometer?: number;
  location?: FuelLocation;
}

export interface VerifyFuelInput {
  id: string;
  status: 'approved' | 'declined';
}

export interface VoidFuelInput {
  id: string;
  reason?: string;
}

export interface FuelStats {
  totalRecords: number;
  totalCost: number;
  totalQty: number;
  pending: number;
  approved: number;
  declined: number;
  averageEfficiency: number;
  fuelBalanceLitres: number;
}

import type { PaginationInfo } from '@/shared/types/api.types';
export type { PaginationInfo };

export interface PaginatedFuelResult {
  records: FuelRecordWithRelations[];
  pagination: PaginationInfo;
}

export interface FuelFilters {
  status?: FuelStatus | 'all';
  vehicleId?: string;
  driverId?: string;
  userId?: string;
  search?: string;
  page?: number;
  limit?: number;
  all?: boolean;
}

