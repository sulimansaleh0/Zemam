import { sendRequest, postRequest, patchRequest, deleteRequest } from '@/shared/lib/coreApi';
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
      throw new Error(result.message || 'فشل في حذف حساب مدير الأسطول');
    }
  },

  /**
   * Assign manager to a team
   */
  async assignManager(managerId: string, teamId: string): Promise<void> {
    const result = await postRequest<void>(API_PATHS.MANAGERS.ASSIGN(managerId), { teamId });
    if (!result.success) {
      throw new Error(result.message || 'فشل في تعيين مدير الأسطول للفريق');
    }
  },

  /**
   * Remove manager from their team (disable team assignment)
   */
  async disableManager(managerId: string): Promise<void> {
    const result = await postRequest<void>(API_PATHS.MANAGERS.DISABLE(managerId), {});
    if (!result.success) {
      throw new Error(result.message || 'فشل في فك ارتباط مدير الأسطول عن الفريق');
    }
  },

  /**
   * Change manager status (active/inactive)
   */
  async changeManagerStatus(managerId: string, status: 'active' | 'inactive'): Promise<void> {
    const result = await patchRequest<void>(API_PATHS.MANAGERS.CHANGE_STATUS(managerId), { status });
    if (!result.success) {
      throw new Error(result.message || 'فشل في تغيير حالة مدير الأسطول');
    }
  },
};
