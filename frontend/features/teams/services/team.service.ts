import { sendRequest, postRequest, patchRequest, deleteRequest } from '@/shared/lib/coreApi';
import { API_PATHS } from '@/shared/constants/apiPaths';
import type {
  Team,
  TeamsResponse,
  TeamStatics,
  CreateTeamInput,
  UpdateTeamInput,
} from '../types/team.types';

export const teamService = {
  /**
   * Fetch all teams of the company (Admin)
   */
  async getTeams(signal?: AbortSignal): Promise<Team[]> {
    const result = await sendRequest<TeamsResponse>(API_PATHS.TEAMS.LIST, { signal });
    if (!result.success) {
      if (result.message === 'Request cancelled') return [];
      throw new Error(result.message || 'فشل في جلب قائمة الفرق');
    }
    return result.data?.teams ?? [];
  },

  /**
   * Create a new team
   */
  async createTeam(payload: CreateTeamInput): Promise<Team | null> {
    const result = await postRequest<{ team: Team }>(API_PATHS.TEAMS.CREATE, payload);
    if (!result.success) {
      throw new Error(result.message || 'فشل في إنشاء الفريق');
    }
    return result.data?.team ?? null;
  },

  /**
   * Update existing team (Name)
   */
  async updateTeam(teamId: string, payload: UpdateTeamInput): Promise<void> {
    const result = await patchRequest<void>(API_PATHS.TEAMS.BY_ID(teamId), payload);
    if (!result.success) {
      throw new Error(result.message || 'فشل في تعديل بيانات الفريق');
    }
  },

  /**
   * Delete / Soft-delete a team
   */
  async deleteTeam(teamId: string): Promise<void> {
    const result = await deleteRequest<void>(API_PATHS.TEAMS.BY_ID(teamId));
    if (!result.success) {
      throw new Error(result.message || 'فشل في حذف الفريق');
    }
  },

  /**
   * Get single team details by ID
   */
  async getTeamById(teamId: string, signal?: AbortSignal): Promise<Team> {
    const result = await sendRequest<{ team: Team }>(API_PATHS.TEAMS.BY_ID(teamId), { signal });
    if (!result.success || !result.data?.team) {
      throw new Error(result.message || 'فشل في جلب تفاصيل الفريق');
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
      return null;
    }
    return result.data?.statics ?? null;
  },
};
