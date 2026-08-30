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
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamsResponse {
  teams: Team[];
}

export interface CreateTeamInput {
  name: string;
  managerId?: string;
  driversIds?: string[];
  vehiclesIds?: string[];
}

export interface UpdateTeamInput {
  name: string;
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
  FuelRecordsCost: { totalCost: number }[];
  FuelRecords: number;
  approvedFuelRecords: number;
  declinedFuelRecords: number;
  pendingFuelRecords: number;
  maintenanceRecordsCost: { totalCost: number }[];
  maintenanceRecords: number;
  approvedMaintenanceRecords: number;
  declinedMaintenanceRecords: number;
  pendingMaintenanceRecords: number;
}

export type TeamSortOrder = 'newest' | 'oldest' | 'name';
export type TeamFilterStatus = 'all' | 'assigned' | 'unassigned';
