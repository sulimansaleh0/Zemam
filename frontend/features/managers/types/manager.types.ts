import type { PaginationInfo } from '@/shared/types/api.types';
export type { PaginationInfo } from '@/shared/types/api.types';

export interface TeamSummary {
  _id: string;
  name: string;
  status?: string;
}

export interface FleetManager {
  _id: string;
  name?: string;
  email: string;
  phone?: string;
  status?: 'active' | 'inactive' | string;
  roles?: string[];
  companyId?: string;
  teamId?: string | TeamSummary | null;
  createdAt?: string;
  updatedAt?: string;
}

export type BackendFleetManager = FleetManager;

export interface FleetManagersResponse {
  fleetManagers: FleetManager[];
}

export interface PaginatedManagersResponse {
  fleetManagers: FleetManager[];
  pagination?: PaginationInfo;
}

export interface ManagersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ManagerFilterStatus;
  withoutTeam?: boolean;
  teamId?: string;
}

export interface CreateManagerInput {
  email: string;
  name: string;
  phone?: string;
  teamId?: string;
}

export interface AssignManagerInput {
  teamId: string;
}

export interface ChangeManagerStatusInput {
  status: 'active' | 'inactive';
}

export type ManagerFilterStatus = 'all' | 'active' | 'inactive';
export type ManagerSortOrder = 'newest' | 'oldest' | 'name';

export interface ManagerStats {
  totalTasks: number;
  completedTasks: number;
  delayedTasks: number;
  fuelCost: number;
  maintenanceCost: number;
  driverScore?: number;
}

export interface ManagerStatsResponse {
  stats: ManagerStats;
}
