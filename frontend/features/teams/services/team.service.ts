import { sendRequest, postRequest, patchRequest, deleteRequest } from '@/shared/lib/coreApi';
import { API_PATHS } from '@/shared/constants/apiPaths';
import type {
  Team,
  TeamsResponse,
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
   * Update existing team (Name)
   */
  async updateTeam(teamId: string, payload: UpdateTeamInput): Promise<void> {
    const result = await patchRequest<void>(API_PATHS.TEAMS.BY_ID(teamId), payload);
    if (!result.success) {
      throw createTeamApiError(result);
    }
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
   * Get team statics
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
    return result.data?.statics ?? null;
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
