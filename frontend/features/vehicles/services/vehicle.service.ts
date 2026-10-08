import { sendRequest, postRequest, putRequest, patchRequest, deleteRequest } from '@/shared/lib/coreApi';
import { API_PATHS } from '@/shared/constants/apiPaths';
import type { ServiceResult } from '@/shared/types/api.types';
import type {
  BackendVehicle,
  CreateVehicleInput,
  UpdateVehicleInput,
  AssignDriverInput,
  ChangeVehicleStatusInput,
  VehicleStatsResponse,
  VehicleQueryParams,
  ListVehiclesResponse,
  FleetOverviewStatsResponse,
} from '../types/vehicle.types';

// ============================================================
//  Vehicle Service — Pure API Calls Layer (No localStorage/mocks)
// ============================================================

interface SingleVehicleResponse {
  vehicle: BackendVehicle;
}

export const vehicleService = {
  /**
   * جلب قائمة المركبات مع دعم كامل للترقيم والبحث والفلترة من الخادم
   */
  getVehicles(
    paramsOrSignal?: VehicleQueryParams | AbortSignal,
    signal?: AbortSignal
  ): Promise<ServiceResult<ListVehiclesResponse>> {
    let params: VehicleQueryParams | undefined;
    let actualSignal: AbortSignal | undefined = signal;

    if (paramsOrSignal && 'aborted' in paramsOrSignal) {
      actualSignal = paramsOrSignal as AbortSignal;
    } else {
      params = paramsOrSignal as VehicleQueryParams | undefined;
    }

    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.status && params.status !== 'all') searchParams.set('status', params.status);
    if (params?.vehicleType && params.vehicleType !== 'all') searchParams.set('vehicleType', params.vehicleType);
    if (params?.search && params.search.trim()) searchParams.set('search', params.search.trim());
    if (params?.withoutTeam) searchParams.set('withoutTeam', 'true');
    if (params?.teamId && params.teamId !== 'all') searchParams.set('teamId', params.teamId);

    const qs = searchParams.toString();
    const path = qs ? `${API_PATHS.VEHICLES.LIST}?${qs}` : API_PATHS.VEHICLES.LIST;
    return sendRequest<ListVehiclesResponse>(path, { signal: actualSignal });
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
   * جلب إحصائيات تشغيل المركبة (المسافة، الوقود، الصيانة، الكفاءة)
   */
  getVehicleStats(id: string, signal?: AbortSignal): Promise<ServiceResult<VehicleStatsResponse>> {
    return sendRequest<VehicleStatsResponse>(API_PATHS.VEHICLES.STATS(id), { signal });
  },

  /**
   * جلب إحصائيات الأسطول الإجمالية (نشطة، غير نشطة، في مهام، صيانة) محسوبة مباشرة في الخادم
   */
  getFleetOverviewStats(signal?: AbortSignal): Promise<ServiceResult<FleetOverviewStatsResponse>> {
    return sendRequest<FleetOverviewStatsResponse>(API_PATHS.VEHICLES.OVERVIEW_STATS, { signal });
  },

  /**
   * إنشاء مركبة جديدة
   */
  createVehicle(data: CreateVehicleInput): Promise<ServiceResult<SingleVehicleResponse>> {
    return postRequest<SingleVehicleResponse>(API_PATHS.VEHICLES.CREATE, data);
  },

  /**
   * تعديل وتحديث بيانات ومواصفات ورخص وتأمين المركبة
   */
  updateVehicle(id: string, data: UpdateVehicleInput): Promise<ServiceResult<SingleVehicleResponse>> {
    return putRequest<SingleVehicleResponse>(API_PATHS.VEHICLES.UPDATE(id), data);
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
