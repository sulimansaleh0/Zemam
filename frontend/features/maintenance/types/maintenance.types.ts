// ============================================================
//  Maintenance Module Types — Aligned with Backend Maintenance Model
// ============================================================

export type MaintenanceCategory = 'Faults' | 'Periodic Maintenance';

export type MaintenancePriority = 'High' | 'low';

export type MaintenanceStatus = 'pending' | 'approved' | 'declined';

export interface PopulatedVehicle {
  _id: string;
  model: string;
  plateNumber: number | string;
  year?: number;
  type?: string;
  status?: string;
  odoMeter?: number;
}

export interface PopulatedReporter {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
}

export interface BackendMaintenanceRecord {
  _id: string;
  vehicleId: string | PopulatedVehicle;
  teamId?: string | null;
  companyId: string;
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
  odoMeter?: number;
  images?: File[];
}

export interface VerifyMaintenanceInput {
  id: string;
  status: 'approved' | 'declined';
  cost?: number;
  declineReason?: string;
  isDriverFault?: boolean;
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
}
