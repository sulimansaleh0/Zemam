'use client';

import { useState, useMemo } from 'react';
import { useDebounce } from '@/shared/hooks';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useVehicles } from '@/features/vehicles';
import { useDriversList } from '@/features/drivers';
import { useTeams } from '@/features/teams';
import { usePaginatedTasks, useTaskStats } from './useTasks';
import {
  useCreateTask,
  useUpdateTask,
  useDeclineTask,
} from './useTaskMutations';
import type {
  TaskWithRelations,
  CreateTaskInput,
  TaskStatus,
  TaskStats,
  TaskQueryParams,
} from '../types/task.types';

const DEFAULT_STATS: TaskStats = {
  total: 0,
  pending: 0,
  inProgress: 0,
  finished: 0,
  declined: 0,
  delayed: 0,
  completionRate: 0,
};

export function useTasksPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | TaskStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 350);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  // Reset page when tab changes
  const handleTabChange = (tab: 'all' | TaskStatus) => {
    setActiveTab(tab);
    setPage(1);
  };

  // Query parameters sent directly to server
  const queryParams: TaskQueryParams = useMemo(() => {
    return {
      page,
      limit,
      search: debouncedSearch.trim() || undefined,
      status: activeTab === 'all' ? undefined : activeTab,
    };
  }, [page, limit, debouncedSearch, activeTab]);

  // Queries
  const tasksQuery = usePaginatedTasks(queryParams);
  const statsQuery = useTaskStats();
  const vehiclesQuery = useVehicles();
  const driversQuery = useDriversList();
  const teamsQuery = useTeams();

  // Mutations
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const declineTaskMutation = useDeclineTask();

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskWithRelations | null>(null);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<TaskWithRelations | null>(null);
  const [selectedTaskForDecline, setSelectedTaskForDecline] = useState<TaskWithRelations | null>(null);

  const tasks = tasksQuery.data?.tasks ?? [];
  const pagination = tasksQuery.data?.pagination;
  const totalCount = pagination?.total ?? tasks.length;
  const totalPages = pagination?.totalPages ?? 1;
  const stats = statsQuery.data ?? DEFAULT_STATS;

  const handleFormSubmit = async (data: CreateTaskInput) => {
    if (taskToEdit) {
      await updateTaskMutation.mutateAsync({ id: taskToEdit._id, data });
      setTaskToEdit(null);
    } else {
      await createTaskMutation.mutateAsync(data);
      setIsCreateModalOpen(false);
    }
  };

  const handleConfirmDecline = async (reason: string) => {
    if (!selectedTaskForDecline) return;
    await declineTaskMutation.mutateAsync({
      id: selectedTaskForDecline._id,
      declineReason: reason,
    });
    setSelectedTaskForDecline(null);
  };

  const handleOpenEdit = (task: TaskWithRelations) => {
    setTaskToEdit(task);
    setIsCreateModalOpen(true);
  };

  return {
    tasks,
    totalCount,
    allTasksCount: stats.total,
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    error: tasksQuery.error,
    refetch: tasksQuery.refetch,
    isRefetching: tasksQuery.isRefetching,

    stats,

    activeTab,
    setActiveTab: handleTabChange,
    searchQuery,
    setSearchQuery: handleSearchChange,

    page,
    setPage,
    limit,
    setLimit,
    totalPages,

    isCreateModalOpen,
    setIsCreateModalOpen,
    taskToEdit,
    setTaskToEdit,
    handleOpenEdit,
    selectedTaskForDetails,
    setSelectedTaskForDetails,
    selectedTaskForDecline,
    setSelectedTaskForDecline,

    vehicles: vehiclesQuery.data ?? [],
    drivers: driversQuery.data ?? [],
    teams: teamsQuery.data ?? [],
    isLoadingRelations:
      vehiclesQuery.isLoading || driversQuery.isLoading || teamsQuery.isLoading,

    isSubmitting: createTaskMutation.isPending || updateTaskMutation.isPending,
    isDeclining: declineTaskMutation.isPending,
    handleFormSubmit,
    handleConfirmDecline,

    userName: user?.name || user?.email || 'المستخدم',
  };
}
