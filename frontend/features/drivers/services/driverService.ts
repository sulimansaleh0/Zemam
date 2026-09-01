import { sendRequest, postRequest, patchRequest, deleteRequest } from '@/shared/lib/coreApi';
import { API_PATHS } from '@/shared/constants/apiPaths';
import type { ServiceResult } from '@/shared/types/api.types';
import type { BackendDriver, CreateDriverInput, ChangeDriverStatusInput } from '../types/driver.types';

// ============================================================
//  Driver Service — pure API call functions, no side effects
// ============================================================

/** شكل response قائمة السائقين من الباك اند */
interface ListDriversResponse {
  drivers: BackendDriver[];
}

export const driverService = {
  /**
   * جلب قائمة سائقي الفريق من الباك اند.
   */
  getDrivers(signal?: AbortSignal): Promise<ServiceResult<ListDriversResponse>> {
    return sendRequest<ListDriversResponse>(API_PATHS.DRIVERS.LIST, { signal });
  },

  /**
   * جلب السائقين المتاحين (بدون فريق / في المخزون العام).
   */
  getAvailableDrivers(signal?: AbortSignal): Promise<ServiceResult<ListDriversResponse>> {
    return sendRequest<ListDriversResponse>(`${API_PATHS.DRIVERS.LIST}?withoutTeam=true`, { signal });
  },

  /**
   * إنشاء سائق جديد.
   * الباك اند يقبل email فقط — يُحفظ الاسم كـ "Default" تلقائياً.
   */
  createDriver(data: CreateDriverInput): Promise<ServiceResult<null>> {
    const payload = {
      email: data.email,
      ...(data.name && data.name.trim() ? { name: data.name.trim() } : {}),
      ...(data.phone && data.phone.trim() ? { phone: data.phone.trim() } : {}),
      ...(data.teamId && data.teamId.trim() ? { teamId: data.teamId.trim() } : {}),
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
   * حذف سائق (soft delete — يضع isDeleted: true).
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
