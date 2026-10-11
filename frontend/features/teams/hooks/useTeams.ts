import { useQuery } from '@tanstack/react-query';
import { teamService } from '../services/team.service';
import { teamKeys } from '@/shared/constants/queryKeys';
import type { Team, GetTeamsParams, PaginatedTeamsResponse } from '../types/team.types';

export const TEAM_QUERY_KEYS = teamKeys;

// Re-export mutations for backward compatibility
export * from './useTeamMutations';

/**
 * Hook to fetch all teams with memoized transformation
 */
export function useTeams() {
  return useQuery({
    queryKey: teamKeys.all,
    queryFn: ({ signal }) => teamService.getTeams(signal),
    select: (teams: Team[]) => teams,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook to fetch paginated teams with server-side filters
 */
export function usePaginatedTeams(params: GetTeamsParams = {}) {
  return useQuery<PaginatedTeamsResponse>({
    queryKey: [...teamKeys.all, 'paginated', params] as const,
    queryFn: ({ signal }) => teamService.getPaginatedTeams(params, signal),
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Hook to fetch single team detail by ID
 */
export function useTeamDetail(id: string) {
  return useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: ({ signal }) => teamService.getTeamById(id, signal),
    enabled: Boolean(id),
    staleTime: 1000 * 60,
  });
}

/**
 * Hook to fetch team statics
 */
export function useTeamStatics(teamId?: string) {
  return useQuery({
    queryKey: teamKeys.statics(teamId),
    queryFn: ({ signal }) => teamService.getTeamStatics(teamId, signal),
    staleTime: 1000 * 30, // 30 seconds
  });
}
