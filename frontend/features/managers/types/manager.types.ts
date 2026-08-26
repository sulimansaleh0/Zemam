export interface FleetManager {
  _id: string;
  name?: string;
  email: string;
  phone?: string;
  status?: 'active' | 'inactive' | string;
  roles?: string[];
  companyId?: string;
  teamId?: string | { _id: string; name: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface FleetManagersResponse {
  fleetManagers: FleetManager[];
}

export interface CreateManagerInput {
  email: string;
  teamId: string;
}

export type ManagerFilterStatus = 'all' | 'active' | 'inactive';
export type ManagerSortOrder = 'newest' | 'oldest' | 'name';
