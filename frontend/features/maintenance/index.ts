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
  useMaintenanceStats,
  useCreateMaintenance,
  useVerifyMaintenance,
  useMaintenancePage,
} from './hooks/useMaintenance';

// ── Components ─────────────────────────────────────────────
export { MaintenanceStatsCards } from './components/MaintenanceStatsCards';
export { MaintenanceTable } from './components/MaintenanceTable';
export { MaintenanceFormModal } from './components/MaintenanceFormModal';
export { MaintenanceDetailModal } from './components/MaintenanceDetailModal';
export { VerifyMaintenanceModal } from './components/VerifyMaintenanceModal';
