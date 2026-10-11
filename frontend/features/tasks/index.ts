// ── Types ──────────────────────────────────────────────────
export type {
  TaskStatus,
  LocationPoint,
  PopulatedDriver,
  PopulatedVehicle,
  PopulatedTeam,
  BackendTask,
  TaskWithRelations,
  CreateTaskInput,
  UpdateTaskInput,
  TaskStats,
  TaskQueryParams,
  ListTasksResponse,
} from './types/task.types';

// ── Schema ─────────────────────────────────────────────────
export { createTaskSchema, locationPointSchema } from './schemas/task.schema';
export type { CreateTaskFormValues } from './schemas/task.schema';

// ── Service ────────────────────────────────────────────────
export { taskService } from './services/task.service';

// ── Helpers ────────────────────────────────────────────────
export {
  getTaskStatusConfig,
  formatTaskDateTime,
  getVehicleDisplay,
  getDriverDisplay,
  getTeamDisplay,
} from './utils/taskHelpers';

// ── Hooks ──────────────────────────────────────────────────
export {
  TASK_QUERY_KEYS,
  useTasks,
  usePaginatedTasks,
  useTask,
  useTaskStats,
  useDriverTasks,
  enrichTask,
} from './hooks/useTasks';

export {
  useCreateTask,
  useUpdateTask,
  useAcceptTask,
  useFinishTask,
  useDeclineTask,
} from './hooks/useTaskMutations';

export { useTasksPage } from './hooks/useTasksPage';
export { useTaskRoutePicker } from './hooks/useTaskRoutePicker';

// ── Components ─────────────────────────────────────────────
export { TasksView } from './components/TasksView';
export { TaskStatsCards } from './components/TaskStatsCards';
export { TaskTableToolbar } from './components/TaskTableToolbar';
export { TasksTable } from './components/TasksTable';
export { TaskFormModal } from './components/TaskFormModal';
export { TaskDetailModal } from './components/TaskDetailModal';
export { TaskDetailMapSection } from './components/TaskDetailMapSection';
export { DeclineTaskModal } from './components/DeclineTaskModal';
export { TaskRouteMapPicker } from './components/TaskRouteMapPicker';
export { TaskPlaceSearchBar } from './components/TaskPlaceSearchBar';
export { TaskRouteMetrics } from './components/TaskRouteMetrics';
export {
  fetchDrivingRoute,
  searchPlaces,
} from './utils/mapHelpers';
