'use client';

import { useQuery } from '@tanstack/react-query';
import { managerService } from '../services/manager.service';
import { managerKeys } from '@/shared/constants/queryKeys';
import type {
  FleetManager,
  ManagersQueryParams,
  PaginatedManagersResponse,
  ManagerStats,
} from '../types/manager.types';

// ============================================================
//  Centralized Query Keys re-export
// ============================================================

export const MANAGER_QUERY_KEYS = managerKeys;

// ============================================================
//  Data Query Hooks
// ============================================================

/**
 * Hook to fetch fleet managers (returns array of managers for backward compatibility)
 */
export function useManagers(params?: ManagersQueryParams | string) {
  const queryObj = typeof params === 'string' ? { status: params as any } : params;
  return useQuery({
    queryKey: managerKeys.list(queryObj),
    queryFn: ({ signal }) => managerService.getManagers(queryObj, signal),
    select: (data: PaginatedManagersResponse): FleetManager[] => data.fleetManagers ?? [],
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to fetch all fleet managers unpaginated
 */
export function useAllManagers() {
  return useQuery({
    queryKey: managerKeys.all,
    queryFn: ({ signal }) => managerService.getAllManagers(signal),
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to fetch paginated fleet managers with pagination metadata
 */
export function usePaginatedManagers(params: ManagersQueryParams) {
  return useQuery({
    queryKey: managerKeys.list(params),
    queryFn: ({ signal }) => managerService.getManagers(params, signal),
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to fetch available fleet managers (unassigned / without team)
 */
export function useAvailableManagers() {
  return useQuery({
    queryKey: managerKeys.available,
    queryFn: ({ signal }) => managerService.getAvailableManagers(signal),
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to fetch single fleet manager by ID
 */
export function useManager(id?: string) {
  return useQuery({
    queryKey: id ? managerKeys.detail(id) : ['manager', 'empty'],
    queryFn: ({ signal }) => (id ? managerService.getManagerById(id, signal) : null),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to fetch manager performance statistics
 */
export function useManagerStats(managerId?: string, enabled: boolean = true) {
  return useQuery<ManagerStats | null>({
    queryKey: managerId ? managerKeys.stats(managerId) : ['manager-stats', 'empty'],
    queryFn: ({ signal }) => (managerId ? managerService.getManagerStats(managerId, signal) : null),
    enabled: Boolean(managerId && enabled),
    staleTime: 60 * 1000,
  });
}

// ============================================================
//  Re-exports for backwards compatibility
// ============================================================

export {
  useCreateManager,
  useAssignManager,
  useDisableManager,
  useChangeManagerStatus,
  useDeleteManager,
} from './useManagerMutations';

export { useManagersPage } from './useManagersPage';
