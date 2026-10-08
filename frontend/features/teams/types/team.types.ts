import type { PaginationInfo } from '@/shared/types/api.types';

export interface FleetManagerSummary {
  _id: string;
  name?: string;
  email: string;
  phone?: string;
  status?: string;
}

export interface Team {
  _id: string;
  name: string;
  companyId: string;
  managerId?: string | FleetManagerSummary | null;
  status?: 'active' | 'inactive';
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamsResponse {
  teams: Team[];
}

export interface PaginatedTeamsResponse {
  teams: Team[];
  pagination: PaginationInfo;
}

export interface GetTeamsParams {
  search?: string;
  status?: 'active' | 'inactive';
  managerFilter?: TeamFilterStatus;
  page?: number;
  limit?: number;
  all?: boolean;
}

export interface CreateTeamInput {
  name: string;
  managerId?: string;
  driversIds?: string[];
  vehiclesIds?: string[];
}

export interface UpdateTeamInput {
  name: string;
  status?: 'active' | 'inactive';
}

export interface TeamStatics {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  finishedTasks: number;
  declinedTasks: number;
  totalVehicles: number;
  activeVehicles: number;
  availableVehicles: number;
  FuelRecordsCost: number | { totalCost: number }[];
  FuelRecords: number;
  approvedFuelRecords: number;
  declinedFuelRecords: number;
  pendingFuelRecords: number;
  maintenanceRecordsCost: number | { totalCost: number }[];
  maintenanceRecords: number;
  approvedMaintenanceRecords: number;
  declinedMaintenanceRecords: number;
  pendingMaintenanceRecords: number;
}

export type TeamSortOrder = 'newest' | 'oldest' | 'name';
export type TeamFilterStatus = 'all' | 'assigned' | 'unassigned';

export interface AssignTeamResourcesInput {
  driverIds?: string[];
  vehicleIds?: string[];
  driversIds?: string[];
  vehiclesIds?: string[];
}
