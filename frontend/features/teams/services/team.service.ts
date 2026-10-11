import { sendRequest, postRequest, patchRequest, deleteRequest } from '@/shared/lib/coreApi';
import { API_PATHS } from '@/shared/constants/apiPaths';
import type {
  Team,
  TeamsResponse,
  PaginatedTeamsResponse,
  GetTeamsParams,
  TeamStatics,
  CreateTeamInput,
  UpdateTeamInput,
} from '../types/team.types';
import type { ServiceFailure } from '@/shared/types/api.types';

function createTeamApiError(result: ServiceFailure): Error {
  const details = [
    result.status ? `HTTP ${result.status}` : undefined,
    result.code,
    result.message,
  ].filter(Boolean);
  const error = new Error(details.join(' - '));
  Object.assign(error, {
    status: result.status,
    code: result.code,
    fieldErrors: result.fieldErrors,
  });
  return error;
}

export const teamService = {
  /**
   * Fetch all teams of the company (Admin)
   */
  async getTeams(signal?: AbortSignal): Promise<Team[]> {
    const result = await sendRequest<TeamsResponse>(API_PATHS.TEAMS.LIST, { signal });
    if (!result.success) {
      if (result.message === 'Request cancelled') return [];
      throw createTeamApiError(result);
    }
    return result.data?.teams ?? [];
  },

  /**
   * Fetch paginated teams with search and filters
   */
  async getPaginatedTeams(
    params: GetTeamsParams = {},
    signal?: AbortSignal
  ): Promise<PaginatedTeamsResponse> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.managerFilter && params.managerFilter !== 'all') {
      query.set('managerFilter', params.managerFilter);
    }
    query.set('all', 'false');

    const url = `${API_PATHS.TEAMS.LIST}?${query.toString()}`;
    const result = await sendRequest<PaginatedTeamsResponse>(url, { signal });
    if (!result.success) {
      if (result.message === 'Request cancelled') {
        return {
          teams: [],
          pagination: {
            total: 0,
            page: params.page || 1,
            limit: params.limit || 10,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        };
      }
      throw createTeamApiError(result);
    }

    return (
      result.data ?? {
        teams: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      }
    );
  },

  /**
   * Create a new team
   */
  async createTeam(payload: CreateTeamInput): Promise<Team | null> {
    const result = await postRequest<{ team: Team }>(API_PATHS.TEAMS.CREATE, payload);
    if (!result.success) {
      throw createTeamApiError(result);
    }
    return result.data?.team ?? null;
  },

  /**
   * Update existing team (Name / Status)
   */
  async updateTeam(teamId: string, payload: UpdateTeamInput): Promise<Team | null> {
    const result = await patchRequest<{ team: Team }>(API_PATHS.TEAMS.BY_ID(teamId), payload);
    if (!result.success) {
      throw createTeamApiError(result);
    }
    return result.data?.team ?? null;
  },

  /**
   * Delete / Soft-delete a team
   */
  async deleteTeam(teamId: string): Promise<void> {
    const result = await deleteRequest<void>(API_PATHS.TEAMS.BY_ID(teamId));
    if (!result.success) {
      throw createTeamApiError(result);
    }
  },

  /**
   * Get single team details by ID
   */
  async getTeamById(teamId: string, signal?: AbortSignal): Promise<Team> {
    const result = await sendRequest<{ team: Team }>(API_PATHS.TEAMS.BY_ID(teamId), { signal });
    if (!result.success || !result.data?.team) {
      if (!result.success) throw createTeamApiError(result);
      throw new Error('فشل في جلب تفاصيل الفريق: لم يُرجع الخادم بيانات الفريق');
    }
    return result.data.team;
  },

  /**
   * Get team statics with normalized numeric costs
   */
  async getTeamStatics(teamId?: string, signal?: AbortSignal): Promise<TeamStatics | null> {
    const path = teamId
      ? `${API_PATHS.TEAMS.STATICS}?teamId=${teamId}`
      : API_PATHS.TEAMS.STATICS;
    const result = await sendRequest<{ statics: TeamStatics }>(path, { signal });
    if (!result.success) {
      if (result.message === 'Request cancelled') return null;
      throw createTeamApiError(result);
    }

    const statics = result.data?.statics;
    if (!statics) return null;

    const fuelCost =
      typeof statics.FuelRecordsCost === 'number'
        ? statics.FuelRecordsCost
        : Array.isArray(statics.FuelRecordsCost)
        ? statics.FuelRecordsCost[0]?.totalCost || 0
        : 0;

    const maintenanceCost =
      typeof statics.maintenanceRecordsCost === 'number'
        ? statics.maintenanceRecordsCost
        : Array.isArray(statics.maintenanceRecordsCost)
        ? statics.maintenanceRecordsCost[0]?.totalCost || 0
        : 0;

    return {
      ...statics,
      FuelRecordsCost: fuelCost,
      maintenanceRecordsCost: maintenanceCost,
    };
  },

  /**
   * تعيين موارد (سائقين ومركبات) دفعة واحدة للفريق
   */
  async assignResources(
    teamId: string,
    payload: { driverIds?: string[]; vehicleIds?: string[]; driversIds?: string[]; vehiclesIds?: string[] }
  ): Promise<void> {
    const dataToSend = {
      ...payload,
      driversIds: payload.driversIds || payload.driverIds,
      vehiclesIds: payload.vehiclesIds || payload.vehicleIds,
      driverIds: payload.driverIds || payload.driversIds,
      vehicleIds: payload.vehicleIds || payload.vehiclesIds,
    };
    const result = await patchRequest<void>(API_PATHS.TEAMS.ASSIGN_RESOURCES(teamId), dataToSend);
    if (!result.success) {
      throw createTeamApiError(result);
    }
  },
};
