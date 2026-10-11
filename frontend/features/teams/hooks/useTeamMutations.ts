import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/ui/Toast';
import { teamService } from '../services/team.service';
import { teamKeys, driverKeys, vehicleKeys, managerKeys } from '@/shared/constants/queryKeys';
import type {
  CreateTeamInput,
  UpdateTeamInput,
} from '../types/team.types';

/**
 * Hook to create a new team with Invalidate on Success
 */
export function useCreateTeam() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateTeamInput) => teamService.createTeam(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      queryClient.invalidateQueries({ queryKey: managerKeys.all });
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
 * Hook to update team name / status with Invalidate on Success
 */
export function useUpdateTeam() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ teamId, payload }: { teamId: string; payload: UpdateTeamInput }) =>
      teamService.updateTeam(teamId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(variables.teamId) });
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
 * Hook to delete a team with Invalidate on Success
 */
export function useDeleteTeam() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (teamId: string) => teamService.deleteTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      queryClient.invalidateQueries({ queryKey: managerKeys.all });
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

/**
 * Hook to assign resources (drivers and vehicles) to a team
 */
export function useAssignResources() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({
      teamId,
      payload,
    }: {
      teamId: string;
      payload: { driverIds?: string[]; vehicleIds?: string[] };
    }) => teamService.assignResources(teamId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(variables.teamId) });
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      addToast({
        type: 'success',
        title: 'تم تعيين الموارد',
        message: 'تم تعيين الموارد المحددة للفريق بنجاح',
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'خطأ في التعيين',
        message: err.message || 'تعذر تعيين الموارد للفريق',
      });
    },
  });
}
