'use client';

import { useQuery } from '@tanstack/react-query';
import { taskKeys } from '@/shared/constants/queryKeys';
import { taskService } from '../services/task.service';
import {
  getVehicleDisplay,
  getDriverDisplay,
  getTeamDisplay,
  formatTaskDateTime,
} from '../utils/taskHelpers';
import type {
  BackendTask,
  TaskWithRelations,
  TaskQueryParams,
} from '../types/task.types';

// Re-export query keys for convenience and backward compatibility
export const TASK_QUERY_KEYS = taskKeys;

export function enrichTask(task: BackendTask): TaskWithRelations {
  const veh = getVehicleDisplay(task.vehicleId);
  const drv = getDriverDisplay(task.driverId);
  const team = getTeamDisplay(task.teamId);
  const formattedStartTime = formatTaskDateTime(task.startTime);

  return {
    ...task,
    vehicleModel: veh.model,
    vehiclePlate: veh.plate,
    driverName: drv.name,
    driverPhone: drv.phone,
    teamName: team,
    formattedStartTime,
  };
}

/**
 * Hook لجلب جميع المهام مع دعم الفلترة حسب المركبة أو السائق أو الحالة
 */
export function useTasks(paramsOrVehicleId?: TaskQueryParams | string, options?: { enabled?: boolean }) {
  const filterParams: TaskQueryParams | undefined =
    typeof paramsOrVehicleId === 'string'
      ? { vehicleId: paramsOrVehicleId }
      : paramsOrVehicleId;

  return useQuery({
    queryKey: taskKeys.list(filterParams),
    queryFn: async ({ signal }) => {
      const result = await taskService.getTasks(filterParams, signal);
      if (!result.success) {
        if (result.message === 'Request cancelled') return [];
        throw new Error(result.message);
      }
      return result.data?.tasks ?? [];
    },
    enabled: options?.enabled,
    select: (tasks: BackendTask[]): TaskWithRelations[] => {
      return (tasks || []).map(enrichTask);
    },
  });
}

/**
 * Hook لجلب المهام المقسمة إلى صفحات مع بيانات الترقيم من الخادم (Server-Side Pagination)
 */
export function usePaginatedTasks(params?: TaskQueryParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: async ({ signal }) => {
      const result = await taskService.getTasks(params, signal);
      if (!result.success) {
        if (result.message === 'Request cancelled') {
          return { tasks: [] as TaskWithRelations[], pagination: undefined };
        }
        throw new Error(result.message);
      }
      return {
        tasks: (result.data?.tasks ?? []).map(enrichTask),
        pagination: result.data?.pagination,
      };
    },
    enabled: options?.enabled,
  });
}

/**
 * Hook لجلب تفاصيل مهمة واحدة بالمعرف
 */
export function useTask(id: string | null | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: id ? taskKeys.detail(id) : ['tasks', 'null'],
    queryFn: async ({ signal }) => {
      if (!id) return null;
      const res = await taskService.getTaskById(id, signal);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data.task;
    },
    enabled: Boolean(id && options?.enabled !== false),
    select: (task: BackendTask | null): TaskWithRelations | null => {
      return task ? enrichTask(task) : null;
    },
  });
}

/**
 * Hook لجلب مهام السائق الميداني
 */
export function useDriverTasks(params?: { page?: number; limit?: number; all?: boolean }) {
  return useQuery({
    queryKey: taskKeys.driverTasks(params),
    queryFn: async ({ signal }) => {
      const result = await taskService.getDriverTasks(params, signal);
      if (!result.success) {
        if (result.message === 'Request cancelled') return [];
        throw new Error(result.message);
      }
      return result.data?.tasks ?? [];
    },
    select: (tasks: BackendTask[]): TaskWithRelations[] => {
      return (tasks || []).map(enrichTask);
    },
  });
}

/**
 * Hook لجلب الإحصائيات التشغيلية الصافية للمهام مباشرة من الخادم (دون أي حسابات محلية بالواجهة)
 */
export function useTaskStats() {
  return useQuery({
    queryKey: taskKeys.stats,
    queryFn: async ({ signal }) => {
      const res = await taskService.getTaskStats(signal);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data.stats;
    },
    staleTime: 30 * 1000,
  });
}

