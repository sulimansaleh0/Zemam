import { sendRequest } from '@/shared/lib/coreApi';
import { API_PATHS } from '@/shared/constants/apiPaths';
import type { ServiceResult } from '@/shared/types/api.types';
import type {
  VehicleLiveTelemetry,
  TripSummary,
  DriverTelemetryPayload,
  FleetStats,
} from '../types/gps.types';
import { fetchPositions, zemamGeoCodec, IndexTable } from '@/shared/lib/geoSync';

export interface LiveFleetQuery {
  status?: string;
  search?: string;
  teamId?: string;
  page?: number;
  limit?: number;
}

export interface LiveFleetResponse {
  vehicles: VehicleLiveTelemetry[];
  allVehicles?: VehicleLiveTelemetry[];
  stats?: FleetStats;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
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
    pickupLocation?: { lat: number | string; lng: number | string; address?: string };
    deliveryLocation?: { lat: number | string; lng: number | string; address?: string };
    taskStatus?: string;
    taskTitle?: string;
  };
  pickupLocation?: { lat: number | string; lng: number | string; address?: string };
  deliveryLocation?: { lat: number | string; lng: number | string; address?: string };
  taskStatus?: string;
  taskTitle?: string;
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
  async getLiveFleet(
    query?: LiveFleetQuery,
    signal?: AbortSignal
  ): Promise<ServiceResult<LiveFleetResponse>> {
    const queryParams = new URLSearchParams();
    if (query?.status && query.status !== 'all') queryParams.set('status', query.status);
    if (query?.search?.trim()) queryParams.set('search', query.search.trim());
    if (query?.teamId) queryParams.set('teamId', query.teamId);
    if (query?.page) queryParams.set('page', String(query.page));
    if (query?.limit) queryParams.set('limit', String(query.limit));
    const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';

    try {
      const url =
        typeof window !== 'undefined'
          ? `/${API_PATHS.GPS.LIVE}${qs}`
          : `${process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || ''}/${API_PATHS.GPS.LIVE}${qs}`;

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

      const payloadAny = result.payload as any;
      if (Array.isArray(payloadAny.vehicles)) {
        return {
          success: true,
          message: 'Fleet retrieved successfully',
          data: {
            vehicles: payloadAny.vehicles as VehicleLiveTelemetry[],
            allVehicles: payloadAny.allVehicles,
            stats: payloadAny.stats,
            pagination: payloadAny.pagination,
          },
        };
      }

      const rawData = result.payload as any;
      if (rawData?.data?.vehicles) {
        return {
          success: true,
          message: 'Fleet retrieved successfully',
          data: {
            vehicles: rawData.data.vehicles,
            allVehicles: rawData.data.allVehicles,
            stats: rawData.data.stats,
            pagination: rawData.data.pagination,
          },
        };
      }
      if (rawData?.vehicles) {
        return {
          success: true,
          message: 'Fleet retrieved successfully',
          data: {
            vehicles: rawData.vehicles,
            allVehicles: rawData.allVehicles,
            stats: rawData.stats,
            pagination: rawData.pagination,
          },
        };
      }
    } catch {
      // التراجع التلقائي لـ sendRequest العادي
    }

    return sendRequest<LiveFleetResponse>(`${API_PATHS.GPS.LIVE}${qs}`, { signal });
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
