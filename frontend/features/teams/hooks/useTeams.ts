'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/ui/Toast';
import { teamService } from '../services/team.service';
import type {
  Team,
  CreateTeamInput,
  UpdateTeamInput,
} from '../types/team.types';

// ============================================================
//  Query Keys
// ============================================================

export const TEAM_QUERY_KEYS = {
  all: ['teams'] as const,
  detail: (id: string) => ['teams', id] as const,
};

// ============================================================
//  Data Hooks
// ============================================================

/**
 * Hook to fetch all teams
 */
export function useTeams() {
  return useQuery({
    queryKey: TEAM_QUERY_KEYS.all,
    queryFn: ({ signal }) => teamService.getTeams(signal),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch single team detail
 */
export function useTeamDetail(id: string) {
  return useQuery({
    queryKey: TEAM_QUERY_KEYS.detail(id),
    queryFn: ({ signal }) => teamService.getTeamById(id, signal),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook to fetch team statics
 */
export function useTeamStatics(teamId?: string) {
  return useQuery({
    queryKey: ['teams', 'statics', teamId || 'all'] as const,
    queryFn: ({ signal }) => teamService.getTeamStatics(teamId, signal),
    staleTime: 1000 * 60,
  });
}

// ============================================================
//  Mutation Hooks
// ============================================================

/**
 * Hook to create a new team
 */
export function useCreateTeam() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateTeamInput) => teamService.createTeam(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['managers'] });
      addToast({
        type: 'success',
        title: 'تم إنشاء الفريق',
        message: 'تمت إضافة الفريق الجديد بنجاح',
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'خطأ في الإنشاء',
        message: err.message || 'تعذر إنشاء الفريق، حاول مرة أخرى',
      });
    },
  });
}

/**
 * Hook to update team name
 */
export function useUpdateTeam() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ teamId, payload }: { teamId: string; payload: UpdateTeamInput }) =>
      teamService.updateTeam(teamId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEYS.all });
      addToast({
        type: 'success',
        title: 'تم التعديل',
        message: 'تم تحديث بيانات الفريق بنجاح',
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'خطأ في التعديل',
        message: err.message || 'تعذر تعديل بيانات الفريق',
      });
    },
  });
}

/**
 * Hook to delete a team
 */
export function useDeleteTeam() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (teamId: string) => teamService.deleteTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['managers'] });
      addToast({
        type: 'success',
        title: 'تم الحذف',
        message: 'تم حذف الفريق بنجاح',
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'خطأ في الحذف',
        message: err.message || 'تعذر حذف الفريق',
      });
    },
  });
}
