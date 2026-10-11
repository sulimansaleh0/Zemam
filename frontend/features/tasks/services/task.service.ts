import { sendRequest, postRequest, patchRequest } from '@/shared/lib/coreApi';
import { API_PATHS } from '@/shared/constants/apiPaths';
import type { ServiceResult } from '@/shared/types/api.types';
import type {
  BackendTask,
  CreateTaskInput,
  UpdateTaskInput,
  TaskQueryParams,
  ListTasksResponse,
  TaskStats,
} from '../types/task.types';

export type { ListTasksResponse };

export interface SingleTaskResponse {
  task: BackendTask;
}

export const taskService = {
  /**
   * جلب قائمة المهام مع دعم الفلترة والبحث والترقيم
   */
  getTasks(
    params?: TaskQueryParams,
    signal?: AbortSignal
  ): Promise<ServiceResult<ListTasksResponse>> {
    let url: string = API_PATHS.TASKS.LIST;
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.page !== undefined) searchParams.set('page', String(params.page));
      if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
      if (params.search) searchParams.set('search', params.search);
      if (params.status && params.status !== 'all') searchParams.set('status', params.status);
      if (params.vehicleId) searchParams.set('vehicleId', params.vehicleId);
      if (params.driverId) searchParams.set('driverId', params.driverId);
      if (params.teamId) searchParams.set('teamId', params.teamId);
      if (params.all !== undefined) searchParams.set('all', String(params.all));

      const qs = searchParams.toString();
      if (qs) {
        url += `?${qs}`;
      }
    }
    return sendRequest<ListTasksResponse>(url, { signal });
  },

  /**
   * جلب الإحصائيات التشغيلية الصافية للمهام من الخادم
   */
  getTaskStats(signal?: AbortSignal): Promise<ServiceResult<{ stats: TaskStats }>> {
    return sendRequest<{ stats: TaskStats }>(API_PATHS.TASKS.STATS, { signal });
  },

  /**
   * جلب مهام السائق الخاص
   */
  getDriverTasks(
    params?: { page?: number; limit?: number; all?: boolean },
    signal?: AbortSignal
  ): Promise<ServiceResult<ListTasksResponse>> {
    let url: string = API_PATHS.TASKS.DRIVER_LIST;
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.page !== undefined) searchParams.set('page', String(params.page));
      if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
      if (params.all !== undefined) searchParams.set('all', String(params.all));
      const qs = searchParams.toString();
      if (qs) {
        url += `?${qs}`;
      }
    }
    return sendRequest<ListTasksResponse>(url, { signal });
  },

  /**
   * جلب تفاصيل مهمة محددة
   */
  getTaskById(id: string, signal?: AbortSignal): Promise<ServiceResult<SingleTaskResponse>> {
    return sendRequest<SingleTaskResponse>(API_PATHS.TASKS.DETAIL(id), { signal });
  },

  /**
   * إنشاء مهمة جديدة وتعيينها للمركبة والسائق
   */
  createTask(data: CreateTaskInput): Promise<ServiceResult<SingleTaskResponse>> {
    return postRequest<SingleTaskResponse>(API_PATHS.TASKS.CREATE, data);
  },

  /**
   * تحديث بيانات المهمة (مسموح فقط في حالة pending)
   */
  updateTask(id: string, data: UpdateTaskInput): Promise<ServiceResult<{ task: BackendTask }>> {
    return patchRequest<{ task: BackendTask }>(API_PATHS.TASKS.UPDATE(id), data);
  },

  /**
   * قبول المهمة وبدء تنفيذها (بواسطة السائق عند حلول موعد البدء)
   */
  acceptTask(id: string): Promise<ServiceResult<{ task: BackendTask }>> {
    return patchRequest<{ task: BackendTask }>(API_PATHS.TASKS.ACCEPT(id), {});
  },

  /**
   * إنهاء وتسليم المهمة (بواسطة السائق) مع توثيق قراءة العداد النهائية
   */
  finishTask(id: string, endOdometer?: number): Promise<ServiceResult<null>> {
    return patchRequest<null>(API_PATHS.TASKS.FINISH(id), endOdometer !== undefined ? { endOdometer } : {});
  },

  /**
   * إلغاء أو رفض المهمة مع حفظ السبب
   */
  declineTask(id: string, declineReason?: string): Promise<ServiceResult<{ task: BackendTask }>> {
    return patchRequest<{ task: BackendTask }>(API_PATHS.TASKS.DECLINE(id), { declineReason });
  },
};
