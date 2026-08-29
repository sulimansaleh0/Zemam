import { sendRequest, postRequest, patchRequest } from '@/shared/lib/coreApi';
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
  getVehicles(): Promise<ServiceResult<ListVehiclesResponse>> {
    return sendRequest<ListVehiclesResponse>(API_PATHS.VEHICLES.LIST);
  },

  /**
   * جلب تفاصيل مركبة محددة
   */
  getVehicleById(id: string): Promise<ServiceResult<SingleVehicleResponse>> {
    return sendRequest<SingleVehicleResponse>(API_PATHS.VEHICLES.DETAIL(id));
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
    return postRequest<null>(API_PATHS.DRIVERS.ASSIGN(data.driverId), { vehicleId });
  },

  /**
   * فك ارتباط السائق عن المركبة
   */
  unassignDriver(driverId: string): Promise<ServiceResult<null>> {
    return postRequest<null>(API_PATHS.DRIVERS.DISABLE(driverId), {});
  },
};
