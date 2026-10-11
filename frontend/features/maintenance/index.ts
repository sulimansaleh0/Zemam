// ── Types ──────────────────────────────────────────────────
export type {
  MaintenanceCategory,
  MaintenancePriority,
  MaintenanceStatus,
  PopulatedVehicle,
  PopulatedReporter,
  BackendMaintenanceRecord,
  MaintenanceRecordWithRelations,
  CreateMaintenanceInput,
  VerifyMaintenanceInput,
  MaintenanceStats,
  MaintenanceFilters,
  PaginationInfo,
  PaginatedMaintenanceResult,
} from './types/maintenance.types';

// ── Schema ─────────────────────────────────────────────────
export {
  createMaintenanceSchema,
  verifyMaintenanceSchema,
} from './schemas/maintenance.schema';
export type {
  CreateMaintenanceFormValues,
  VerifyMaintenanceFormValues,
} from './schemas/maintenance.schema';

// ── Service ────────────────────────────────────────────────
export { maintenanceService } from './services/maintenance.service';

// ── Helpers ────────────────────────────────────────────────
export {
  getMaintenanceStatusConfig,
  getMaintenancePriorityConfig,
  getMaintenanceCategoryConfig,
  formatMaintenanceDate,
  formatCostSAR,
  getMaintenanceVehicleDisplay,
  getMaintenanceReporterDisplay,
} from './utils/maintenanceHelpers';

// ── Hooks ──────────────────────────────────────────────────
export {
  MAINTENANCE_QUERY_KEYS,
  useMaintenance,
  usePaginatedMaintenance,
  useMaintenanceStats,
} from './hooks/useMaintenance';

export {
  useCreateMaintenance,
  useVerifyMaintenance,
  useMaintenanceMutations,
} from './hooks/useMaintenanceMutations';

export { useMaintenancePage } from './hooks/useMaintenancePage';

// ── Components ─────────────────────────────────────────────
export { MaintenanceView } from './components/MaintenanceView';
export { MaintenanceStatsCards } from './components/MaintenanceStatsCards';
export { MaintenanceTable } from './components/MaintenanceTable';
export { MaintenanceTableToolbar } from './components/MaintenanceTableToolbar';
export { MaintenanceFormModal } from './components/MaintenanceFormModal';
export { MaintenanceDetailModal } from './components/MaintenanceDetailModal';
export { VerifyMaintenanceModal } from './components/VerifyMaintenanceModal';
