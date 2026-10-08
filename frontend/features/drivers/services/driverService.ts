import { sendRequest, postRequest, patchRequest, deleteRequest } from '@/shared/lib/coreApi';
import { API_PATHS } from '@/shared/constants/apiPaths';
import type { ServiceResult, PaginationInfo } from '@/shared/types/api.types';
import type {
  BackendDriver,
  CreateDriverInput,
  ChangeDriverStatusInput,
  DriversQueryParams,
  DriverStats,
} from '../types/driver.types';

// ============================================================
//  Driver Service — pure API call functions, no side effects
// ============================================================

/** شكل response قائمة السائقين من الباك اند */
export interface ListDriversResponse {
  drivers: BackendDriver[];
  pagination?: PaginationInfo;
}

export const driverService = {
  /**
   * جلب قائمة السائقين من الباك اند مع دعم الفلاتر والبحث والترقيم.
   */
  getDrivers(
    params?: DriversQueryParams,
    signal?: AbortSignal
  ): Promise<ServiceResult<ListDriversResponse>> {
    let url: string = API_PATHS.DRIVERS.LIST;
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.page !== undefined) searchParams.set('page', String(params.page));
      if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
      if (params.search) searchParams.set('search', params.search);
      if (params.status && params.status !== 'all') searchParams.set('status', params.status);
      if (params.licenseType && params.licenseType !== 'all') {
        searchParams.set('licenseType', params.licenseType);
      }
      if (params.withoutTeam !== undefined) {
        searchParams.set('withoutTeam', String(params.withoutTeam));
      }
      if (params.all !== undefined) searchParams.set('all', String(params.all));

      const qs = searchParams.toString();
      if (qs) {
        url += `?${qs}`;
      }
    }
    return sendRequest<ListDriversResponse>(url, { signal });
  },

  /**
   * جلب تفاصيل سائق واحد بالمعرف.
   */
  getDriverById(
    id: string,
    signal?: AbortSignal
  ): Promise<ServiceResult<{ driver: BackendDriver }>> {
    return sendRequest<{ driver: BackendDriver }>(API_PATHS.DRIVERS.DETAIL(id), { signal });
  },

  /**
   * جلب إحصائيات السائق التشغيلية الشاملة.
   */
  getDriverStats(
    id: string,
    signal?: AbortSignal
  ): Promise<ServiceResult<{ stats: DriverStats }>> {
    return sendRequest<{ stats: DriverStats }>(API_PATHS.DRIVERS.STATS(id), { signal });
  },

  /**
   * جلب السائقين المتاحين (بدون فريق / في المخزون العام).
   */
  getAvailableDrivers(signal?: AbortSignal): Promise<ServiceResult<ListDriversResponse>> {
    return sendRequest<ListDriversResponse>(`${API_PATHS.DRIVERS.LIST}?withoutTeam=true`, { signal });
  },

  /**
   * إنشاء سائق جديد مع بيانات الهوية والرخصة.
   */
  createDriver(data: CreateDriverInput): Promise<ServiceResult<null>> {
    const payload = {
      email: data.email,
      name: data.name.trim(),
      ...(data.phone && data.phone.trim() ? { phone: data.phone.trim() } : {}),
      ...(data.teamId && data.teamId.trim() ? { teamId: data.teamId.trim() } : {}),
      ...(data.vehicleId && data.vehicleId.trim() ? { vehicleId: data.vehicleId.trim() } : {}),
      licenseNumber: data.licenseNumber.trim(),
      ...(data.licenseTypes && data.licenseTypes.length > 0 ? { licenseTypes: data.licenseTypes } : {}),
      licenseExpiry: data.licenseExpiry,
    };
    return postRequest<null>(API_PATHS.DRIVERS.CREATE, payload);
  },

  /**
   * تغيير حالة السائق (تفعيل / تعطيل).
   */
  changeDriverStatus(id: string, data: ChangeDriverStatusInput): Promise<ServiceResult<null>> {
    return patchRequest<null>(API_PATHS.DRIVERS.CHANGE_STATUS(id), data);
  },

  /**
   * حذف سائق (soft delete).
   */
  deleteDriver(id: string): Promise<ServiceResult<null>> {
    return deleteRequest<null>(API_PATHS.DRIVERS.DELETE(id));
  },

  /**
   * تعيين مركبة لسائق.
   */
  assignVehicle(driverId: string, vehicleId: string): Promise<ServiceResult<null>> {
    return patchRequest<null>(API_PATHS.DRIVERS.ASSIGN(driverId), { vehicleId });
  },

  /**
   * فك ارتباط السائق من مركبته الحالية.
   */
  unassignVehicle(driverId: string): Promise<ServiceResult<null>> {
    return patchRequest<null>(API_PATHS.DRIVERS.DISABLE(driverId), {});
  },

  /**
   * تعيين سائق لفريق تشغيلي.
   */
  assignTeam(driverId: string, teamId: string): Promise<ServiceResult<null>> {
    return patchRequest<null>(API_PATHS.DRIVERS.ASSIGN_TEAM(driverId), { teamId });
  },

  /**
   * فك ارتباط السائق عن فريقه التشغيلي.
   */
  removeTeam(driverId: string): Promise<ServiceResult<null>> {
    return patchRequest<null>(API_PATHS.DRIVERS.REMOVE_TEAM(driverId), {});
  },
};
