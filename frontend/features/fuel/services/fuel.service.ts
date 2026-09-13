import { sendRequest, postRequest, patchRequest } from '@/shared/lib/coreApi';
import { API_PATHS } from '@/shared/constants/apiPaths';
import type { ServiceResult } from '@/shared/types/api.types';
import type {
  BackendFuelRecord,
  CreateFuelInput,
  VerifyFuelInput,
  FuelStats,
  FuelFilters,
} from '../types/fuel.types';

export interface ListFuelResponse {
  records: BackendFuelRecord[];
}

export interface FuelStatsResponse {
  stats: FuelStats;
}

export interface CreateFuelResponse {
  record: BackendFuelRecord;
}

export interface VerifyFuelResponse {
  record: BackendFuelRecord;
}

export const fuelService = {
  /**
   * جلب قائمة سجلات واستهلاك الوقود مع الفلترة
   */
  getFuelRecords(
    filters?: FuelFilters,
    signal?: AbortSignal
  ): Promise<ServiceResult<ListFuelResponse>> {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') {
      params.set('status', filters.status);
    }
    if (filters?.vehicleId && filters.vehicleId !== 'all') {
      params.set('vehicleId', filters.vehicleId);
    }
    if (filters?.fuelIssue !== undefined && filters.fuelIssue !== 'all') {
      params.set('fuelIssue', String(filters.fuelIssue));
    }

    const queryString = params.toString();
    const path = queryString ? `${API_PATHS.FUEL.LIST}?${queryString}` : API_PATHS.FUEL.LIST;

    return sendRequest<ListFuelResponse>(path, { signal });
  },

  /**
   * جلب إحصائيات ومؤشرات استهلاك وكفاءة الوقود
   */
  getFuelStats(
    vehicleId?: string,
    signal?: AbortSignal
  ): Promise<ServiceResult<FuelStatsResponse>> {
    const params = new URLSearchParams();
    if (vehicleId && vehicleId !== 'all') {
      params.set('vehicleId', vehicleId);
    }

    const queryString = params.toString();
    const path = queryString ? `${API_PATHS.FUEL.STATS}?${queryString}` : API_PATHS.FUEL.STATS;

    return sendRequest<FuelStatsResponse>(path, { signal });
  },

  /**
   * تسجيل وتوثيق تعبئة وقود جديدة مع إيصال الدفع (عبر FormData)
   */
  createFuelRecord(data: CreateFuelInput): Promise<ServiceResult<CreateFuelResponse>> {
    const formData = new FormData();
    formData.append('vehicleId', data.vehicleId);
    formData.append('cost', String(data.cost));
    formData.append('qty', String(data.qty));
    formData.append('odometer', String(data.odometer));
    formData.append('isFullTank', String(data.isFullTank));

    if (data.image) {
      formData.append('image', data.image);
    }

    return postRequest<CreateFuelResponse>(API_PATHS.FUEL.CREATE, formData);
  },

  /**
   * مراجعة واعتماد أو رفض إيصال تعبئة الوقود
   */
  verifyFuelRecord(data: VerifyFuelInput): Promise<ServiceResult<VerifyFuelResponse>> {
    return patchRequest<VerifyFuelResponse>(API_PATHS.FUEL.VERIFY(data.id), {
      status: data.status,
    });
  },
};
