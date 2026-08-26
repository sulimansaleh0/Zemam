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
    queryFn: teamService.getTeams,
    staleTime: 1000 * 60 * 2, // 2 minutes
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
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateTeamInput) => teamService.createTeam(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEYS.all });
      toast({
        title: 'تم إنشاء الفريق',
        description: 'تمت إضافة الفريق الجديد بنجاح',
        type: 'success',
      });
    },
    onError: (err: Error) => {
      toast({
        title: 'خطأ في الإنشاء',
        description: err.message || 'تعذر إنشاء الفريق، حاول مرة أخرى',
        type: 'error',
      });
    },
  });
}

/**
 * Hook to update team name
 */
export function useUpdateTeam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ teamId, payload }: { teamId: string; payload: UpdateTeamInput }) =>
      teamService.updateTeam(teamId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEYS.all });
      toast({
        title: 'تم التعديل',
        description: 'تم تحديث بيانات الفريق بنجاح',
        type: 'success',
      });
    },
    onError: (err: Error) => {
      toast({
        title: 'خطأ في التعديل',
        description: err.message || 'تعذر تعديل بيانات الفريق',
        type: 'error',
      });
    },
  });
}

/**
 * Hook to delete a team
 */
export function useDeleteTeam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (teamId: string) => teamService.deleteTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEYS.all });
      toast({
        title: 'تم الحذف',
        description: 'تم حذف الفريق بنجاح',
        type: 'success',
      });
    },
    onError: (err: Error) => {
      toast({
        title: 'خطأ في الحذف',
        description: err.message || 'تعذر حذف الفريق',
        type: 'error',
      });
    },
  });
}
