import { sendRequest, postRequest, patchRequest } from '@/shared/lib/coreApi';
import { API_PATHS } from '@/shared/constants/apiPaths';
import type { ServiceResult } from '@/shared/types/api.types';
import type {
  BackendFuelRecord,
  CreateFuelInput,
  VerifyFuelInput,
  VoidFuelInput,
  FuelStats,
  FuelFilters,
  PaginationInfo,
} from '../types/fuel.types';

export interface ListFuelResponse {
  records: BackendFuelRecord[];
  pagination?: PaginationInfo;
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

export interface VoidFuelResponse {
  record: BackendFuelRecord;
}

export const fuelService = {
  /**
   * جلب قائمة سجلات واستهلاك الوقود مع الفلترة والبحث والترقيم
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
    if (filters?.driverId && filters.driverId !== 'all') {
      params.set('driverId', filters.driverId);
    }
    if (filters?.userId && filters.userId !== 'all') {
      params.set('userId', filters.userId);
    }
    if (filters?.search && filters.search.trim()) {
      params.set('search', filters.search.trim());
    }
    if (filters?.page) {
      params.set('page', String(filters.page));
    }
    if (filters?.limit) {
      params.set('limit', String(filters.limit));
    }
    if (filters?.all) {
      params.set('all', 'true');
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
    formData.append('isFullTank', String(data.isFullTank));
    formData.append('cost', String(data.cost));
    formData.append('qty', String(data.qty));
    formData.append('image', data.image);

    if (data.odometer !== undefined && data.odometer !== null) {
      formData.append('odometer', String(data.odometer));
    }

    if (data.location) {
      if (data.location.lat !== undefined) formData.append('location[lat]', String(data.location.lat));
      if (data.location.lng !== undefined) formData.append('location[lng]', String(data.location.lng));
      if (data.location.address) formData.append('location[address]', data.location.address);
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

  /**
   * إلغاء اعتماد إيصال الوقود وعكس رصيد الوقود في خزان المركبة
   */
  voidFuelRecord(data: VoidFuelInput): Promise<ServiceResult<VoidFuelResponse>> {
    return patchRequest<VoidFuelResponse>(API_PATHS.FUEL.VOID(data.id), {
      reason: data.reason,
    });
  },
};
