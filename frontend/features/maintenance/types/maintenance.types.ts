// ============================================================
//  Maintenance Module Types — Aligned with Backend Maintenance Model
// ============================================================

import type { PaginationInfo } from '@/shared/types/api.types';

export type { PaginationInfo };

export type MaintenanceCategory = 'Faults' | 'Periodic Maintenance';

export type MaintenancePriority = 'high' | 'low';

export type MaintenanceStatus = 'pending' | 'approved' | 'declined';

export interface PopulatedVehicle {
  _id: string;
  model: string;
  plateNumber: number | string;
  year?: number;
  type?: string;
  status?: string;
  currentOdometer?: number;
  odoMeter?: number;
}

export interface PopulatedReporter {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  role?: string;
}

export interface BackendMaintenanceRecord {
  _id: string;
  vehicleId: string | PopulatedVehicle;
  teamId?: string | null;
  companyId: string;
  driverId?: string | PopulatedReporter | null;
  description: string;
  images?: string[];
  cost?: number;
  category: MaintenanceCategory;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  reportedBy: string | PopulatedReporter;
  odoMeter?: number;
  declineReason?: string;
  isDriverFault?: boolean;
  driverFaultProcessed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecordWithRelations extends BackendMaintenanceRecord {
  vehicleModel: string;
  vehiclePlate: string | number;
  reporterName: string;
  reporterEmail: string;
  formattedDate: string;
}

export interface CreateMaintenanceInput {
  vehicleId: string;
  description: string;
  cost?: number;
  priority: MaintenancePriority;
  category: MaintenanceCategory;
  images?: File[];
  odometer?: number;
}

export interface VerifyMaintenanceInput {
  id: string;
  status: 'approved' | 'declined';
  cost?: number;
  declineReason?: string;
  isDriverFault?: boolean;
  driverId?: string;
}

export interface MaintenanceStats {
  totalRecords: number;
  totalCost: number;
  pending: number;
  approved: number;
  declined: number;
}

export interface MaintenanceFilters {
  status?: MaintenanceStatus | 'all';
  category?: MaintenanceCategory | 'all';
  vehicleId?: string;
  search?: string;
  page?: number;
  limit?: number;
  all?: boolean | string;
}

export interface PaginatedMaintenanceResult {
  records: MaintenanceRecordWithRelations[];
  pagination?: PaginationInfo;
}
