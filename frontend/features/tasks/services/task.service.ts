import { sendRequest, postRequest, patchRequest } from '@/shared/lib/coreApi';
import { API_PATHS } from '@/shared/constants/apiPaths';
import type { ServiceResult } from '@/shared/types/api.types';
import type {
  BackendTask,
  CreateTaskInput,
  UpdateTaskInput,
} from '../types/task.types';

export interface ListTasksResponse {
  tasks: BackendTask[];
}

export interface SingleTaskResponse {
  task: BackendTask;
}

export const taskService = {
  /**
   * جلب قائمة جميع المهام للشركة أو الفريق الحالي
   */
  getTasks(signal?: AbortSignal): Promise<ServiceResult<ListTasksResponse>> {
    return sendRequest<ListTasksResponse>(API_PATHS.TASKS.LIST, { signal });
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
  updateTask(id: string, data: UpdateTaskInput): Promise<ServiceResult<null>> {
    return patchRequest<null>(API_PATHS.TASKS.UPDATE(id), data);
  },

  /**
   * قبول المهمة وبدء تنفيذها (بواسطة السائق عند حلول موعد البدء)
   */
  acceptTask(id: string): Promise<ServiceResult<null>> {
    return patchRequest<null>(API_PATHS.TASKS.ACCEPT(id), {});
  },

  /**
   * إنهاء وتسليم المهمة (بواسطة السائق)
   */
  finishTask(id: string): Promise<ServiceResult<null>> {
    return patchRequest<null>(API_PATHS.TASKS.FINISH(id), {});
  },

  /**
   * إلغاء أو رفض المهمة مع حفظ السبب
   */
  declineTask(id: string, declineReason?: string): Promise<ServiceResult<null>> {
    return patchRequest<null>(API_PATHS.TASKS.DECLINE(id), { declineReason });
  },
};
