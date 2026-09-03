// ── Types ──────────────────────────────────────────────────
export type {
  BackendDriver,
  Driver,
  DriverStatus,
  DriverStatusFilter,
  DriverSortOrder,
  CreateDriverInput,
  ChangeDriverStatusInput,
  AssignVehicleInput,
} from './types/driver.types';

// ── Schema ─────────────────────────────────────────────────
export { createDriverSchema } from './schemas/driver.schema';
export type { CreateDriverFormValues } from './schemas/driver.schema';

// ── Helpers / Utils ────────────────────────────────────────
export {
  enrichDriver,
  extractInitials,
  getDriverColor,
  getDriverDisplayName,
  getDriverTeamId,
  getDriverTeamName,
  formatRelativeDate,
  exportDriversCSV,
} from './utils/driverHelpers';

// ── Service ────────────────────────────────────────────────
export { driverService } from './services/driverService';

// ── Hooks ──────────────────────────────────────────────────
export {
  DRIVER_KEYS,
  useDriversList,
  useCreateDriver,
  useChangeDriverStatus,
  useDeleteDriver,
  useAssignVehicleToDriver,
  useUnassignVehicleFromDriver,
  useAssignDriverToTeam,
  useRemoveDriverFromTeam,
  useDriversPage,
  useDriverDetailPage,
} from './hooks/useDrivers';
export type { ModalState } from './hooks/useDrivers';

// ── Components ─────────────────────────────────────────────
export { DriverAvatar } from './components/DriverAvatar';
export { StatusPill } from './components/StatusPill';
export { DriverMetrics } from './components/DriverMetrics';
export { DriverRow } from './components/DriverRow';
export { DriverCard } from './components/DriverCard';
export { DriversList } from './components/DriversList';
export { PerformanceChart } from './components/PerformanceChart';
export { ActivityContent, ACTIVITY_TAB_ITEMS } from './components/ActivityContent';
export type { ActivityTab, ActivityTabItem } from './components/ActivityContent';
export { DetailPanel } from './components/DetailPanel';
export { DriverDetailCards } from './components/DriverDetailCards';
export { DriverModal } from './components/DriverModal';
export { DriverDeleteModal } from './components/DriverDeleteModal';
export { AssignVehicleModal } from './components/AssignVehicleModal';
export { AssignDriverToTeamModal } from './components/AssignDriverToTeamModal';


