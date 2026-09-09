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
  useCreateTask,
  useUpdateTask,
  useAcceptTask,
  useFinishTask,
  useDeclineTask,
  useTasksPage,
} from './hooks/useTasks';
