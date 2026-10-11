// ── Types ──────────────────────────────────────────────────
export type {
  BackendVehicle,
  VehicleStatus,
  VehicleWithRelations,
  CreateVehicleInput,
  AssignDriverInput,
  ChangeVehicleStatusInput,
  UpdateVehicleInput,
  VehicleStats,
  VehicleStatsResponse,
  DriverSummary,
  TeamSummary,
  PaginationInfo,
  VehicleQueryParams,
  FleetOverviewStats,
} from './types/vehicle.types';

// ── Schema ─────────────────────────────────────────────────
export { vehicleFormSchema, assignDriverSchema } from './schemas/vehicle.schema';
export type { VehicleFormValues, AssignDriverFormValues } from './schemas/vehicle.schema';

// ── Service ────────────────────────────────────────────────
export { vehicleService } from './services/vehicle.service';

// ── Utils & Helpers ────────────────────────────────────────
export {
  getVehicleTeamId,
  getVehicleTeamName,
  getVehicleDriverId,
  getVehicleDriverName,
  exportVehiclesCSV,
} from './utils/vehicleHelpers';

// ── Hooks ──────────────────────────────────────────────────
export {
  VEHICLE_QUERY_KEYS,
  useVehicles,
  usePaginatedVehicles,
  useFleetOverviewStats,
  useAvailableVehicles,
  useVehicleDetail,
  useVehicleStats,
} from './hooks/useVehicles';

export {
  useCreateVehicle,
  useUpdateVehicle,
  useChangeVehicleStatus,
  useAssignDriver,
  useUnassignDriver,
  useAssignVehicleToTeam,
  useRemoveVehicleFromTeam,
  useDeleteVehicle,
} from './hooks/useVehicleMutations';

export { useVehiclesPage } from './hooks/useVehiclesPage';
export { useVehicleDetailPage } from './hooks/useVehicleDetailPage';

// ── Components ─────────────────────────────────────────────
export { VehiclesView }             from './components/VehiclesView';
export { VehicleDetailView }         from './components/VehicleDetailView';
export { VehiclesTable }             from './components/VehiclesTable';
export { VehicleFormModal }          from './components/VehicleFormModal';
export { AssignDriverModal }         from './components/AssignDriverModal';
export { ToggleVehicleStatusModal }   from './components/ToggleVehicleStatusModal';
export { AssignVehicleToTeamModal }   from './components/AssignVehicleToTeamModal';
export { ConfirmDeleteVehicleModal } from './components/ConfirmDeleteVehicleModal';
export { VehicleStatsCards }         from './components/VehicleStatsCards';
export { VehicleStatusBadge }        from './components/VehicleStatusBadge';
export { VehicleDetailCards }        from './components/VehicleDetailCards';
export { EditVehicleModal }           from './components/EditVehicleModal';
