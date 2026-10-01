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
  FuelStats,
  FuelFilters,
} from './types/fuel.types';

// ── Schema ─────────────────────────────────────────────────
export {
  createFuelSchema,
  verifyFuelSchema,
} from './schemas/fuel.schema';
export type {
  CreateFuelFormValues,
  VerifyFuelFormValues,
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
  FUEL_QUERY_KEYS,
  useFuel,
  useFuelStats,
  useCreateFuel,
  useVerifyFuel,
  useFuelPage,
} from './hooks/useFuel';

// ── Components ─────────────────────────────────────────────
export { FuelStatsCards } from './components/FuelStatsCards';
export { FuelTable } from './components/FuelTable';
export { FuelFormModal } from './components/FuelFormModal';
export { FuelDetailModal } from './components/FuelDetailModal';
export { VerifyFuelModal } from './components/VerifyFuelModal';
