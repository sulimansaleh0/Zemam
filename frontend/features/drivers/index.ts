// ── Types ──────────────────────────────────────────────────
export type {
  BackendDriver,
  Driver,
  DriverStatus,
  DriverStatusFilter,
  DriverSortOrder,
  DriversQueryParams,
  DriverStats,
  CreateDriverInput,
  ChangeDriverStatusInput,
  AssignVehicleInput,
  ScoreAuditItem,
  PaginationInfo,
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
export {
  VEHICLE_TYPE_LABELS,
  getLicenseExpiryStatus,
} from './utils/licenseEligibility';

// ── Service ────────────────────────────────────────────────
export { driverService } from './services/driverService';

// ── Hooks ──────────────────────────────────────────────────
export {
  DRIVER_KEYS,
  useDrivers,
  useDriversList,
  usePaginatedDrivers,
  useDriver,
  useDriverStats,
  useAvailableDrivers,
} from './hooks/useDrivers';

export {
  useCreateDriver,
  useChangeDriverStatus,
  useDeleteDriver,
  useAssignVehicleToDriver,
  useUnassignVehicleFromDriver,
  useAssignDriverToTeam,
  useRemoveDriverFromTeam,
} from './hooks/useDriverMutations';

export { useDriversPage } from './hooks/useDriversPage';
export type { ModalState } from './hooks/useDriversPage';

export { useDriverDetailPage } from './hooks/useDriverDetailPage';

// ── Views ──────────────────────────────────────────────────
export { DriversView } from './components/DriversView';
export { DriverDetailView } from './components/DriverDetailView';

// ── Components ─────────────────────────────────────────────
export { DriverAvatar } from './components/DriverAvatar';
export { StatusPill } from './components/StatusPill';
export { DriverScoreBadge } from './components/DriverScoreBadge';
export { DriverTableToolbar } from './components/DriverTableToolbar';
export { DriverMetrics } from './components/DriverMetrics';
export { DriversTable } from './components/DriversTable';
export { DriverModal } from './components/DriverModal';
export { DriverDeleteModal } from './components/DriverDeleteModal';
export { AssignVehicleModal } from './components/AssignVehicleModal';
export { AssignDriverToTeamModal } from './components/AssignDriverToTeamModal';
