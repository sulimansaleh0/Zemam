import { sendRequest, postRequest, deleteRequest } from '@/shared/lib/coreApi';
import { API_PATHS } from '@/shared/constants/apiPaths';
import type {
  FleetManager,
  FleetManagersResponse,
  CreateManagerInput,
} from '../types/manager.types';

export const managerService = {
  /**
   * Fetch all fleet managers of the company
   */
  async getManagers(status?: string): Promise<FleetManager[]> {
    const path = status
      ? `${API_PATHS.MANAGERS.LIST}?status=${status}`
      : API_PATHS.MANAGERS.LIST;
    const result = await sendRequest<FleetManagersResponse>(path);
    if (!result.success) {
      throw new Error(result.message || 'فشل في جلب قائمة مدراء الأساطيل');
    }
    return result.data?.fleetManagers ?? [];
  },

  /**
   * Create a new Fleet Manager and assign to team
   */
  async createManager(payload: CreateManagerInput): Promise<FleetManager | null> {
    const result = await postRequest<{ user: FleetManager }>(
      API_PATHS.MANAGERS.CREATE,
      payload
    );
    if (!result.success) {
      throw new Error(result.message || 'فشل في إنشاء حساب مدير الأسطول');
    }
    return result.data?.user ?? null;
  },

  /**
   * Deactivate / Delete a Fleet Manager
   */
  async deleteManager(id: string): Promise<void> {
    const result = await deleteRequest<void>(API_PATHS.MANAGERS.DELETE(id));
    if (!result.success) {
      throw new Error(result.message || 'فشل في تعطيل حساب مدير الأسطول');
    }
  },
};
