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
  getDrivers(): Promise<ServiceResult<ListDriversResponse>> {
    return sendRequest<ListDriversResponse>(API_PATHS.DRIVERS.LIST);
  },

  /**
   * إنشاء سائق جديد.
   * الباك اند يقبل email فقط — يُحفظ الاسم كـ "Default" تلقائياً.
   */
  createDriver(data: CreateDriverInput): Promise<ServiceResult<null>> {
    return postRequest<null>(API_PATHS.DRIVERS.CREATE, data);
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
};
