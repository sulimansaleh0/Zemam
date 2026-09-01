// ── Types ──────────────────────────────────────────────────
export type {
  BackendVehicle,
  VehicleStatus,
  VehicleWithRelations,
  CreateVehicleInput,
  AssignDriverInput,
  ChangeVehicleStatusInput,
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
  useAvailableDrivers,
  useCreateVehicle,
  useChangeVehicleStatus,
  useAssignDriver,
  useUnassignDriver,
  useAssignVehicleToTeam,
  useRemoveVehicleFromTeam,
  useDeleteVehicle,
  useVehiclesPage,
  useVehicleDetailPage,
} from './hooks/useVehicles';

// ── Components ─────────────────────────────────────────────
export { VehiclesTable }             from './components/VehiclesTable';
export { VehicleFormModal }          from './components/VehicleFormModal';
export { AssignDriverModal }         from './components/AssignDriverModal';
export { DeleteVehicleModal, DeleteVehicleModal as ChangeVehicleStatusModal } from './components/DeleteVehicleModal';
export { AssignVehicleToTeamModal }   from './components/AssignVehicleToTeamModal';
export { ConfirmDeleteVehicleModal } from './components/ConfirmDeleteVehicleModal';
export { VehicleStatsCards }         from './components/VehicleStatsCards';
export { VehicleStatusBadge }        from './components/VehicleStatusBadge';
export { VehicleDetailCards }        from './components/VehicleDetailCards';
