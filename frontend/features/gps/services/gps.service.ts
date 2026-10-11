import { sendRequest } from '@/shared/lib/coreApi';
import { API_PATHS } from '@/shared/constants/apiPaths';
import type { ServiceResult } from '@/shared/types/api.types';
import type { VehicleLiveTelemetry, TripSummary, DriverTelemetryPayload } from '../types/gps.types';
import { fetchPositions, zemamGeoCodec, IndexTable } from '@/shared/lib/geoSync';

export interface LiveFleetResponse {
  vehicles: VehicleLiveTelemetry[];
}

export interface TripSummaryResponse {
  summary: TripSummary;
}

export interface VehicleHistoryResponse {
  trips: TripSummary[];
}

export interface TaskLivePointData {
  lat: number;
  lng: number;
  speed: number;
  heading?: number;
  accuracy?: number;
  timestamp: string | number;
}

export interface LiveTripPathResponse {
  path: {
    taskId: string;
    vehicleId: string;
    encodedPath: string;
    points: TaskLivePointData[];
  };
}

export interface TaskLivePointsResponse {
  taskId: string;
  points: TaskLivePointData[];
  pickupLocation?: { lat: number | string; lng: number | string; address?: string };
  deliveryLocation?: { lat: number | string; lng: number | string; address?: string };
  status?: string;
  path?: {
    taskId: string;
    vehicleId: string;
    encodedPath: string;
    points: TaskLivePointData[];
  };
}

const fleetIndexTable = new IndexTable();

export const gpsService = {
  /**
   * جلب أحدث المواقع اللحظية لأسطول المركبات مع دعم البروتوكول الباينري المضغوط
   * والتراجع التلقائي إلى JSON القياسي عند عدم توفر الباينري
   */
  async getLiveFleet(signal?: AbortSignal): Promise<ServiceResult<LiveFleetResponse>> {
    try {
      const url = typeof window !== 'undefined' ? `/${API_PATHS.GPS.LIVE}` : `${process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || ''}/${API_PATHS.GPS.LIVE}`;
      const result = await fetchPositions(url, {
        codec: zemamGeoCodec,
        idOf: (n) => fleetIndexTable.idOf(n),
        init: {
          credentials: 'include',
          signal,
        },
      });

      // حفظ الفهارس المستلمة
      if (result.payload.index) {
        for (const [n, id] of result.payload.index) {
          fleetIndexTable.set(n, id);
        }
      }

      // في حال تم إرجاع مصفوفة المركبات الكاملة عبر خاصية extra
      if (Array.isArray(result.payload.vehicles)) {
        return {
          success: true,
          message: 'Fleet retrieved successfully',
          data: { vehicles: result.payload.vehicles as VehicleLiveTelemetry[] },
        };
      }

      const rawData = result.payload as any;
      if (rawData?.data?.vehicles) {
        return {
          success: true,
          message: 'Fleet retrieved successfully',
          data: { vehicles: rawData.data.vehicles },
        };
      }
      if (rawData?.vehicles) {
        return {
          success: true,
          message: 'Fleet retrieved successfully',
          data: { vehicles: rawData.vehicles },
        };
      }
    } catch {
      // التراجع التلقائي لـ sendRequest العادي
    }

    return sendRequest<LiveFleetResponse>(API_PATHS.GPS.LIVE, { signal });
  },

  /**
   * استرجاع مسار ونقاط الرحلة الحية لمهمة قيد التنفيذ
   */
  getLiveTripPath(taskId: string, signal?: AbortSignal): Promise<ServiceResult<LiveTripPathResponse>> {
    return sendRequest<LiveTripPathResponse>(API_PATHS.GPS.TRIP_PATH(taskId), { signal });
  },

  /**
   * التوافق مع استدعاء النقاط المباشرة لمهمة قيد التنفيذ
   */
  getTaskLivePoints(taskId: string, signal?: AbortSignal): Promise<ServiceResult<LiveTripPathResponse>> {
    return this.getLiveTripPath(taskId, signal);
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

  /**
   * إرسال حزمة نبضات تتبع مخزنة أثناء انقطاع الإنترنت (Batch Telemetry Sync)
   */
  sendBatchTelemetry(
    points: DriverTelemetryPayload[],
    signal?: AbortSignal
  ): Promise<ServiceResult<{ message: string; processedCount: number; droppedCount: number }>> {
    return sendRequest<{ message: string; processedCount: number; droppedCount: number }>(
      API_PATHS.GPS.BATCH_TELEMETRY,
      {
        method: 'POST',
        body: JSON.stringify({ points }),
        signal,
      }
    );
  },
};
