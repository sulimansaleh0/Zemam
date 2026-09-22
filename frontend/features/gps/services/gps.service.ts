import { sendRequest } from '@/shared/lib/coreApi';
import { API_PATHS } from '@/shared/constants/apiPaths';
import type { ServiceResult } from '@/shared/types/api.types';
import type { VehicleLiveTelemetry, TripSummary } from '../types/gps.types';

export interface LiveFleetResponse {
  vehicles: VehicleLiveTelemetry[];
}

export interface TripSummaryResponse {
  summary: TripSummary;
}

export interface VehicleHistoryResponse {
  trips: TripSummary[];
}

export const gpsService = {
  /**
   * جلب أحدث المواقع اللحظية لأسطول المركبات (حسب صلاحيات المستخدم: كل الشركة للأدمن، وفريقه لمدير الأسطول)
   */
  getLiveFleet(signal?: AbortSignal): Promise<ServiceResult<LiveFleetResponse>> {
    return sendRequest<LiveFleetResponse>(API_PATHS.GPS.LIVE, { signal });
  },

  /**
   * استرجاع ملخص رحلة مكتملة بواسطة معرّف المهمة
   */
  getTripSummary(taskId: string, signal?: AbortSignal): Promise<ServiceResult<TripSummaryResponse>> {
    return sendRequest<TripSummaryResponse>(API_PATHS.GPS.TRIP_SUMMARY(taskId), { signal });
  },

  /**
   * استرجاع سجل الرحلات السابقة لمركبة محددة
   */
  getVehicleHistory(vehicleId: string, signal?: AbortSignal): Promise<ServiceResult<VehicleHistoryResponse>> {
    return sendRequest<VehicleHistoryResponse>(API_PATHS.GPS.VEHICLE_HISTORY(vehicleId), { signal });
  },
};
