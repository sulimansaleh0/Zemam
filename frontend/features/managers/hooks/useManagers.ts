import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useTeams } from '@/features/teams';
import { useToast } from '@/shared/ui/Toast';
import { managerService } from '../services/manager.service';
import { managerKeys, teamKeys } from '@/shared/constants/queryKeys';
import type { CreateManagerInput, FleetManager } from '../types/manager.types';

// ============================================================
//  Query Keys — إعادة تصدير من المصدر المركزي للتوافق الخلفي
// ============================================================

export const MANAGER_QUERY_KEYS = managerKeys;

// ============================================================
//  Data Hooks
// ============================================================

/**
 * Hook to fetch all fleet managers
 */
export function useManagers(status?: string) {
  return useQuery({
    queryKey: managerKeys.byStatus(status),
    queryFn: ({ signal }) => managerService.getManagers(status, signal),
  });
}

/**
 * Hook to fetch available fleet managers (unassigned / no team)
 */
export function useAvailableManagers() {
  return useQuery({
    queryKey: managerKeys.available,
    queryFn: ({ signal }) => managerService.getAvailableManagers(signal),
  });
}

// ============================================================
//  Mutation Hooks
// ============================================================

/**
 * Hook to create a new fleet manager
 */
export function useCreateManager() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateManagerInput) => managerService.createManager(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: managerKeys.all });
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      addToast({
        type: 'success',
        title: 'تم إنشاء الحساب',
        message: 'تمت إضافة مدير الأسطول بنجاح',
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'خطأ في الإضافة',
        message: err.message || 'تعذر إضافة مدير الأسطول، حاول مرة أخرى',
      });
    },
  });
}

/**
 * Hook to assign a fleet manager to a team
 */
export function useAssignManager() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ managerId, teamId }: { managerId: string; teamId: string }) =>
      managerService.assignManager(managerId, teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: managerKeys.all });
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      addToast({
        type: 'success',
        title: 'تم تعيين المدير',
        message: 'تم ربط مدير الأسطول بالفريق بنجاح',
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'فشل التعيين',
        message: err.message || 'تعذر تعيين مدير الأسطول للفريق',
      });
    },
  });
}

/**
 * Hook to remove a fleet manager from their team
 */
export function useDisableManager() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (managerId: string) => managerService.disableManager(managerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: managerKeys.all });
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      addToast({
        type: 'info',
        title: 'فك الارتباط',
        message: 'تم فك ارتباط مدير الأسطول عن فريقه بنجاح',
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'فشل فك الارتباط',
        message: err.message || 'تعذر فك ارتباط مدير الأسطول',
      });
    },
  });
}

/**
 * Hook to toggle/change fleet manager status (active/inactive)
 */
export function useChangeManagerStatus() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ managerId, status }: { managerId: string; status: 'active' | 'inactive' }) =>
      managerService.changeManagerStatus(managerId, status),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: managerKeys.all });
      const label = status === 'active' ? 'تفعيل' : 'تعطيل';
      addToast({
        type: 'info',
        title: 'تحديث الحالة',
        message: `تم ${label} حساب مدير الأسطول بنجاح`,
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'فشل تغيير الحالة',
        message: err.message || 'تعذر تغيير حالة مدير الأسطول',
      });
    },
  });
}

/**
 * Hook to deactivate / delete a fleet manager
 */
export function useDeleteManager() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (managerId: string) => managerService.deleteManager(managerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: managerKeys.all });
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      addToast({
        type: 'info',
        title: 'تم الحذف',
        message: 'تم حذف حساب مدير الأسطول بنجاح',
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'خطأ في الحذف',
        message: err.message || 'تعذر حذف حساب مدير الأسطول',
      });
    },
  });
}

// ============================================================
//  Page Hook — Orchestrates the Fleet Managers page
// ============================================================

export function useManagersPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isFleetManager =
    user?.role === 'fleet_manager' || user?.role === 'fleet-manager';

  const {
    data: managersList = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useManagers();

  const { data: teamsList = [] } = useTeams();

  const changeStatusMutation = useChangeManagerStatus();
  const disableTeamMutation = useDisableManager();

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedManagerForDelete, setSelectedManagerForDelete] = useState<{
    manager: FleetManager;
    teamName?: string;
  } | null>(null);
  const [selectedManagerForAssign, setSelectedManagerForAssign] = useState<FleetManager | null>(
    null
  );
  const [selectedTeamIdForCreate, setSelectedTeamIdForCreate] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (isFleetManager) {
      router.replace('/dashboard');
    }
  }, [isFleetManager, router]);

  const userName = user?.name || user?.email?.split('@')[0] || '';

  const handleOpenAdd = useCallback((teamId?: string) => {
    setSelectedTeamIdForCreate(teamId);
    setIsCreateModalOpen(true);
  }, []);

  const handleOpenDelete = useCallback((manager: FleetManager, teamName?: string) => {
    setSelectedManagerForDelete({ manager, teamName });
  }, []);

  const handleToggleStatus = useCallback((manager: FleetManager) => {
    const currentActive = (manager.status || 'active').toLowerCase() === 'active';
    changeStatusMutation.mutate({
      managerId: manager._id,
      status: currentActive ? 'inactive' : 'active',
    });
  }, [changeStatusMutation]);

  const handleDisableTeam = useCallback((manager: FleetManager) => {
    disableTeamMutation.mutate(manager._id);
  }, [disableTeamMutation]);

  return {
    // Auth & Permission
    isFleetManager,
    userName,
    menuOpen,
    setMenuOpen,
    logout,

    // Data
    managersList,
    teamsList,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,

    // Modal states
    isCreateModalOpen,
    setIsCreateModalOpen,
    selectedManagerForDelete,
    setSelectedManagerForDelete,
    selectedManagerForAssign,
    setSelectedManagerForAssign,
    selectedTeamIdForCreate,
    setSelectedTeamIdForCreate,

    // Actions
    handleOpenAdd,
    handleOpenDelete,
    handleToggleStatus,
    handleDisableTeam,
  };
}
