import { sendRequest, postRequest, patchRequest, deleteRequest } from '@/shared/lib/coreApi';
import { API_PATHS } from '@/shared/constants/apiPaths';
import type { ServiceResult } from '@/shared/types/api.types';
import type {
  BackendVehicle,
  CreateVehicleInput,
  AssignDriverInput,
  ChangeVehicleStatusInput,
} from '../types/vehicle.types';

// ============================================================
//  Vehicle Service — Pure API Calls Layer (No localStorage/mocks)
// ============================================================

interface ListVehiclesResponse {
  vehicles: BackendVehicle[];
}

interface SingleVehicleResponse {
  vehicle: BackendVehicle;
}

export const vehicleService = {
  /**
   * جلب قائمة جميع المركبات
   */
  getVehicles(signal?: AbortSignal): Promise<ServiceResult<ListVehiclesResponse>> {
    return sendRequest<ListVehiclesResponse>(API_PATHS.VEHICLES.LIST, { signal });
  },

  /**
   * جلب المركبات المتاحة (بدون فريق / في المخزون العام)
   */
  getAvailableVehicles(signal?: AbortSignal): Promise<ServiceResult<ListVehiclesResponse>> {
    return sendRequest<ListVehiclesResponse>(`${API_PATHS.VEHICLES.LIST}?withoutTeam=true`, { signal });
  },

  /**
   * جلب تفاصيل مركبة محددة
   */
  getVehicleById(id: string, signal?: AbortSignal): Promise<ServiceResult<SingleVehicleResponse>> {
    return sendRequest<SingleVehicleResponse>(API_PATHS.VEHICLES.DETAIL(id), { signal });
  },

  /**
   * إنشاء مركبة جديدة
   */
  createVehicle(data: CreateVehicleInput): Promise<ServiceResult<SingleVehicleResponse>> {
    return postRequest<SingleVehicleResponse>(API_PATHS.VEHICLES.CREATE, data);
  },

  /**
   * تغيير حالة المركبة (نشطة / غير نشطة)
   */
  changeVehicleStatus(
    id: string,
    data: ChangeVehicleStatusInput
  ): Promise<ServiceResult<null>> {
    return patchRequest<null>(API_PATHS.VEHICLES.CHANGE_STATUS(id), data);
  },

  /**
   * تعيين سائق للمركبة
   */
  assignDriver(
    vehicleId: string,
    data: AssignDriverInput
  ): Promise<ServiceResult<null>> {
    return patchRequest<null>(API_PATHS.DRIVERS.ASSIGN(data.driverId), { vehicleId });
  },

  /**
   * فك ارتباط السائق عن المركبة
   */
  unassignDriver(driverId: string): Promise<ServiceResult<null>> {
    return patchRequest<null>(API_PATHS.DRIVERS.DISABLE(driverId), {});
  },

  /**
   * تعيين مركبة لفريق تشغيلي
   */
  assignTeam(vehicleId: string, teamId: string): Promise<ServiceResult<null>> {
    return patchRequest<null>(API_PATHS.VEHICLES.ASSIGN_TEAM(vehicleId), { teamId });
  },

  /**
   * فك ارتباط مركبة عن فريقها التشغيلي
   */
  removeTeam(vehicleId: string): Promise<ServiceResult<null>> {
    return patchRequest<null>(API_PATHS.VEHICLES.REMOVE_TEAM(vehicleId), {});
  },

  /**
   * حذف مركبة (Soft Delete)
   */
  deleteVehicle(vehicleId: string): Promise<ServiceResult<null>> {
    return deleteRequest<null>(API_PATHS.VEHICLES.DELETE(vehicleId));
  },
};
