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
}

export interface UpdateTeamInput {
  name: string;
}

export type TeamSortOrder = 'newest' | 'oldest' | 'name';
export type TeamFilterStatus = 'all' | 'assigned' | 'unassigned';
