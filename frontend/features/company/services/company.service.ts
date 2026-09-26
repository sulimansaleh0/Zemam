import { sendRequest } from '@/shared/lib/coreApi';
import { API_PATHS } from '@/shared/constants/apiPaths';

export interface CompanyStatics {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  finishedTasks: number;
  declinedTasks: number;
  totalVehicles: number;
  activeVehicles: number;
  availableVehicles: number;
  FuelRecordsCost: number;
  FuelRecords: number;
  approvedFuelRecords: number;
  declinedFuelRecords: number;
  pendingFuelRecords: number;
  maintenanceRecordsCost: number;
  maintenanceRecords: number;
  approvedMaintenanceRecords: number;
  declinedMaintenanceRecords: number;
  pendingMaintenanceRecords: number;
}

export const companyService = {
  /**
   * Fetch aggregate company-wide statistics (Admin)
   */
  async getCompanyStatics(signal?: AbortSignal): Promise<CompanyStatics | null> {
    const result = await sendRequest<CompanyStatics>(API_PATHS.COMPANY.STATICS, { signal });
    if (!result.success) {
      return null;
    }
    return result.data ?? null;
  },
};
