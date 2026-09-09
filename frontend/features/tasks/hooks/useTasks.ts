'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useVehicles } from '@/features/vehicles';
import { useDriversList } from '@/features/drivers';
import { useToast } from '@/shared/ui/Toast';
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
  CreateTaskInput,
  UpdateTaskInput,
  TaskStatus,
  TaskStats,
} from '../types/task.types';

export const TASK_QUERY_KEYS = {
  all: ['tasks'] as const,
  detail: (id: string) => ['tasks', id] as const,
};

/**
 * Hook لجلب جميع المهام مع العلاقات
 */
export function useTasks() {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.all,
    queryFn: async ({ signal }) => {
      const result = await taskService.getTasks(signal);
      if (!result.success) {
        if (result.message === 'Request cancelled') return [];
        throw new Error(result.message);
      }
      return result.data?.tasks ?? [];
    },
    select: (tasks: BackendTask[]): TaskWithRelations[] => {
      return tasks.map((task) => {
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
      });
    },
  });
}

/**
 * Hook لإنشاء مهمة جديدة
 */
export function useCreateTask() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: CreateTaskInput) => taskService.createTask(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.addToast({ type: 'success', message: 'تم إنشاء المهمة وتعيينها بنجاح' });
        queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all });
        queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      } else {
        toast.addToast({ type: 'error', message: res.message || 'فشل إنشاء المهمة' });
      }
    },
    onError: (err: Error) => {
      toast.addToast({ type: 'error', message: err.message || 'حدث خطأ أثناء الاتصال بالخادم' });
    },
  });
}

/**
 * Hook لتعديل مهمة معلقة
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) =>
      taskService.updateTask(id, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.addToast({ type: 'success', message: 'تم تحديث بيانات المهمة بنجاح' });
        queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all });
        queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      } else {
        toast.addToast({ type: 'error', message: res.message || 'فشل تعديل المهمة' });
      }
    },
    onError: (err: Error) => {
      toast.addToast({ type: 'error', message: err.message || 'حدث خطأ أثناء الاتصال بالخادم' });
    },
  });
}

/**
 * Hook لقبول المهمة وبدء تنفيذها (للسائق)
 */
export function useAcceptTask() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => taskService.acceptTask(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.addToast({ type: 'success', message: 'تم قبول وبدء تنفيذ المهمة بنجاح' });
        queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all });
        queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      } else {
        toast.addToast({ type: 'error', message: res.message || 'فشل قبول المهمة' });
      }
    },
    onError: (err: Error) => {
      toast.addToast({ type: 'error', message: err.message || 'حدث خطأ أثناء الاتصال بالخادم' });
    },
  });
}

/**
 * Hook لإنهاء وتسليم المهمة
 */
export function useFinishTask() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => taskService.finishTask(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.addToast({ type: 'success', message: 'تم إنهاء وتسليم المهمة بنجاح' });
        queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all });
        queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      } else {
        toast.addToast({ type: 'error', message: res.message || 'فشل إنهاء المهمة' });
      }
    },
    onError: (err: Error) => {
      toast.addToast({ type: 'error', message: err.message || 'حدث خطأ أثناء الاتصال بالخادم' });
    },
  });
}

/**
 * Hook لإلغاء أو رفض المهمة
 */
export function useDeclineTask() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => taskService.declineTask(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.addToast({ type: 'success', message: 'تم إلغاء المهمة بنجاح' });
        queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all });
        queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      } else {
        toast.addToast({ type: 'error', message: res.message || 'فشل إلغاء المهمة' });
      }
    },
    onError: (err: Error) => {
      toast.addToast({ type: 'error', message: err.message || 'حدث خطأ أثناء الاتصال بالخادم' });
    },
  });
}

/**
 * Hook لإدارة واجهة صفحة المهام والتحكم بالحالات
 */
export function useTasksPage() {
  const { user, logout } = useAuth();
  const tasksQuery = useTasks();
  const vehiclesQuery = useVehicles();
  const driversQuery = useDriversList();

  const [activeTab, setActiveTab] = useState<'all' | TaskStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<TaskWithRelations | null>(null);
  const [selectedTaskForDecline, setSelectedTaskForDecline] = useState<TaskWithRelations | null>(null);

  const rawTasks = tasksQuery.data ?? [];

  // إحصائيات المهام
  const stats: TaskStats = useMemo(() => {
    const total = rawTasks.length;
    let pending = 0;
    let inProgress = 0;
    let finished = 0;
    let declined = 0;

    for (const t of rawTasks) {
      if (t.status === 'pending') pending++;
      else if (t.status === 'inprogress') inProgress++;
      else if (t.status === 'finished') finished++;
      else if (t.status === 'declined') declined++;
    }

    const completionRate = total > 0 ? Math.round((finished / total) * 100) : 0;
    return { total, pending, inProgress, finished, declined, completionRate };
  }, [rawTasks]);

  // فلترة المهام حسب التبويب والبحث
  const filteredTasks = useMemo(() => {
    return rawTasks.filter((task) => {
      if (activeTab !== 'all' && task.status !== activeTab) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const descMatch = task.description?.toLowerCase().includes(q) ?? false;
        const titleMatch = task.title?.toLowerCase().includes(q) ?? false;
        const driverMatch = task.driverName?.toLowerCase().includes(q) ?? false;
        const vehicleMatch =
          task.vehicleModel?.toLowerCase().includes(q) ||
          String(task.vehiclePlate).toLowerCase().includes(q);

        if (!descMatch && !titleMatch && !driverMatch && !vehicleMatch) {
          return false;
        }
      }
      return true;
    });
  }, [rawTasks, activeTab, searchQuery]);

  return {
    tasks: filteredTasks,
    allTasksCount: rawTasks.length,
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    error: tasksQuery.error,
    refetch: tasksQuery.refetch,
    isRefetching: tasksQuery.isRefetching,

    stats,

    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,

    isCreateModalOpen,
    setIsCreateModalOpen,
    selectedTaskForDetails,
    setSelectedTaskForDetails,
    selectedTaskForDecline,
    setSelectedTaskForDecline,

    vehicles: vehiclesQuery.data ?? [],
    drivers: driversQuery.data ?? [],
    isLoadingRelations: vehiclesQuery.isLoading || driversQuery.isLoading,

    userName: user?.name || user?.email || 'المستخدم',
    menuOpen,
    setMenuOpen,
    logout,
  };
}
