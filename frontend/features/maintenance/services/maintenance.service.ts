import { sendRequest, postRequest, patchRequest } from '@/shared/lib/coreApi';
import { API_PATHS } from '@/shared/constants/apiPaths';
import type { ServiceResult } from '@/shared/types/api.types';
import type {
  BackendMaintenanceRecord,
  CreateMaintenanceInput,
  VerifyMaintenanceInput,
  MaintenanceStats,
  MaintenanceFilters,
  PaginationInfo,
} from '../types/maintenance.types';

export interface ListMaintenanceResponse {
  records: BackendMaintenanceRecord[];
  pagination?: PaginationInfo;
}

export interface MaintenanceStatsResponse {
  stats: MaintenanceStats;
}

export interface CreateMaintenanceResponse {
  record: BackendMaintenanceRecord;
}

export const maintenanceService = {
  /**
   * جلب قائمة سجلات الصيانة مع إمكانية الفلترة والبحث والترقيم
   */
  getMaintenanceRecords(
    filters?: MaintenanceFilters,
    signal?: AbortSignal
  ): Promise<ServiceResult<ListMaintenanceResponse>> {
    const params = new URLSearchParams();

    if (filters?.status && filters.status !== 'all') {
      params.set('status', filters.status);
    }
    if (filters?.category && filters.category !== 'all') {
      params.set('category', filters.category);
    }
    if (filters?.vehicleId && filters.vehicleId !== 'all') {
      params.set('vehicleId', filters.vehicleId);
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
    if (filters?.all !== undefined) {
      params.set('all', String(filters.all));
    }

    const queryString = params.toString();
    const path = queryString
      ? `${API_PATHS.MAINTENANCE.LIST}?${queryString}`
      : API_PATHS.MAINTENANCE.LIST;

    return sendRequest<ListMaintenanceResponse>(path, { signal });
  },

  /**
   * جلب إحصائيات وتقارير الصيانة والتكاليف
   */
  getMaintenanceStats(signal?: AbortSignal): Promise<ServiceResult<MaintenanceStatsResponse>> {
    return sendRequest<MaintenanceStatsResponse>(API_PATHS.MAINTENANCE.STATS, { signal });
  },

  /**
   * إنشاء وتوثيق طلب أو بلاغ صيانة جديد (يدعم رفع حتى 4 صور عبر FormData وقراءة العداد)
   */
  createMaintenanceRecord(
    data: CreateMaintenanceInput
  ): Promise<ServiceResult<CreateMaintenanceResponse>> {
    const formData = new FormData();
    formData.append('vehicleId', data.vehicleId);
    formData.append('description', data.description);
    formData.append('priority', data.priority);
    formData.append('category', data.category);

    if (data.cost !== undefined && data.cost !== null && !isNaN(data.cost)) {
      formData.append('cost', String(data.cost));
    }

    if (data.odometer !== undefined && data.odometer !== null && !isNaN(data.odometer)) {
      formData.append('odometer', String(data.odometer));
    }

    if (data.images && data.images.length > 0) {
      data.images.forEach((file) => {
        formData.append('images', file);
      });
    }

    return postRequest<CreateMaintenanceResponse>(API_PATHS.MAINTENANCE.CREATE, formData);
  },

  /**
   * اعتماد أو رفض طلب الصيانة وتحديث التكلفة ومسؤولية السائق
   */
  verifyMaintenanceRecord(data: VerifyMaintenanceInput): Promise<ServiceResult<null>> {
    const payload: Record<string, unknown> = {
      status: data.status,
    };

    if (data.cost !== undefined && data.cost !== null) {
      payload.cost = data.cost;
    }

    if (data.status === 'declined' && data.declineReason) {
      payload.declineReason = data.declineReason;
    }

    if (data.status === 'approved' && data.isDriverFault !== undefined) {
      payload.isDriverFault = Boolean(data.isDriverFault);
    }

    if (data.status === 'approved' && data.driverId) {
      payload.driverId = data.driverId;
    }

    return patchRequest<null>(API_PATHS.MAINTENANCE.VERIFY(data.id), payload);
  },
};
