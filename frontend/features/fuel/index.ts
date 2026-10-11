// ── Types ──────────────────────────────────────────────────
export type {
  FuelStatus,
  FuelIssueType,
  PopulatedVehicle,
  PopulatedUser,
  BackendFuelRecord,
  FuelRecordWithRelations,
  CreateFuelInput,
  VerifyFuelInput,
  VoidFuelInput,
  FuelStats,
  FuelFilters,
  PaginationInfo,
  PaginatedFuelResult,
} from './types/fuel.types';

// ── Schema ─────────────────────────────────────────────────
export {
  createFuelSchema,
  verifyFuelSchema,
  voidFuelSchema,
} from './schemas/fuel.schema';
export type {
  CreateFuelFormValues,
  VerifyFuelFormValues,
  VoidFuelFormValues,
} from './schemas/fuel.schema';

// ── Service ────────────────────────────────────────────────
export { fuelService } from './services/fuel.service';

// ── Helpers ────────────────────────────────────────────────
export {
  getFuelStatusConfig,
  formatFuelDate,
  formatCostSAR,
  formatLiters,
  formatEfficiency,
  getFuelVehicleDisplay,
  getFuelUserDisplay,
} from './utils/fuelHelpers';

// ── Hooks ──────────────────────────────────────────────────
export {
  useFuel,
  usePaginatedFuel,
  useFuelStats,
  useCreateFuel,
  useVerifyFuel,
  useVoidFuel,
  useFuelPage,
} from './hooks/useFuel';
export { useFuelMutations } from './hooks/useFuelMutations';

// ── Components ─────────────────────────────────────────────
export { FuelView } from './components/FuelView';
export { FuelStatsCards } from './components/FuelStatsCards';
export { FuelTable } from './components/FuelTable';
export { FuelTableToolbar } from './components/FuelTableToolbar';
export { FuelFormModal } from './components/FuelFormModal';
export { FuelDetailModal } from './components/FuelDetailModal';
export { VerifyFuelModal } from './components/VerifyFuelModal';
