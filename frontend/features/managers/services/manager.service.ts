import { sendRequest, postRequest, patchRequest, deleteRequest } from '@/shared/lib/coreApi';
import { API_PATHS } from '@/shared/constants/apiPaths';
import type {
  FleetManager,
  FleetManagersResponse,
  PaginatedManagersResponse,
  ManagersQueryParams,
  CreateManagerInput,
  ManagerStats,
} from '../types/manager.types';

export const managerService = {
  /**
   * Fetch fleet managers with server-side filters, search and pagination
   */
  async getManagers(
    params?: ManagersQueryParams | string,
    signal?: AbortSignal
  ): Promise<PaginatedManagersResponse> {
    let path: string = API_PATHS.MANAGERS.LIST;
    const queryObj: ManagersQueryParams =
      typeof params === 'string'
        ? { status: params as any }
        : params || {};

    const searchParams = new URLSearchParams();
    if (queryObj.page !== undefined) searchParams.set('page', String(queryObj.page));
    if (queryObj.limit !== undefined) searchParams.set('limit', String(queryObj.limit));
    if (queryObj.search) searchParams.set('search', queryObj.search);
    if (queryObj.status && queryObj.status !== 'all') searchParams.set('status', queryObj.status);
    if (queryObj.withoutTeam !== undefined) searchParams.set('withoutTeam', String(queryObj.withoutTeam));
    if (queryObj.teamId && queryObj.teamId !== 'all') searchParams.set('teamId', queryObj.teamId);

    const qs = searchParams.toString();
    if (qs) {
      path += `?${qs}`;
    }

    const result = await sendRequest<PaginatedManagersResponse>(path, { signal });
    if (!result.success) {
      if (result.message === 'Request cancelled') {
        return { fleetManagers: [] };
      }
      throw new Error(result.message || 'فشل في جلب قائمة مدراء الأساطيل');
    }

    return {
      fleetManagers: result.data?.fleetManagers ?? [],
      pagination: result.data?.pagination,
    };
  },

  /**
   * Fetch all fleet managers (unpaginated)
   */
  async getAllManagers(signal?: AbortSignal): Promise<FleetManager[]> {
    const res = await this.getManagers(undefined, signal);
    return res.fleetManagers;
  },

  /**
   * Fetch available fleet managers (without a team)
   */
  async getAvailableManagers(signal?: AbortSignal): Promise<FleetManager[]> {
    const result = await sendRequest<FleetManagersResponse>(
      `${API_PATHS.MANAGERS.LIST}?withoutTeam=true`,
      { signal }
    );
    if (!result.success) {
      if (result.message === 'Request cancelled') return [];
      throw new Error(result.message || 'فشل في جلب قائمة المدراء المتاحين');
    }
    const managers = result.data?.fleetManagers ?? [];
    return managers.filter((m) => !m.teamId);
  },

  /**
   * Fetch single manager by ID
   */
  async getManagerById(id: string, signal?: AbortSignal): Promise<FleetManager | null> {
    const result = await sendRequest<{ fleetManager: FleetManager }>(
      API_PATHS.MANAGERS.DETAIL(id),
      { signal }
    );
    if (!result.success) {
      if (result.message === 'Request cancelled') return null;
      throw new Error(result.message || 'فشل في جلب بيانات مدير الأسطول');
    }
    return result.data?.fleetManager ?? null;
  },

  /**
   * Create a new Fleet Manager and assign to team
   */
  async createManager(payload: CreateManagerInput): Promise<FleetManager | null> {
    const dataToSend = {
      email: payload.email,
      ...(payload.name && payload.name.trim() ? { name: payload.name.trim() } : {}),
      ...(payload.phone && payload.phone.trim() ? { phone: payload.phone.trim() } : {}),
      ...(payload.teamId && payload.teamId.trim() ? { teamId: payload.teamId.trim() } : {}),
    };
    const result = await postRequest<{ user?: FleetManager; fleetManager?: FleetManager }>(
      API_PATHS.MANAGERS.CREATE,
      dataToSend
    );
    if (!result.success) {
      throw new Error(result.message || 'فشل في إنشاء حساب مدير الأسطول');
    }
    return result.data?.fleetManager ?? result.data?.user ?? null;
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
    const result = await patchRequest<void>(API_PATHS.MANAGERS.ASSIGN(managerId), { teamId });
    if (!result.success) {
      throw new Error(result.message || 'فشل في تعيين مدير الأسطول للفريق');
    }
  },

  /**
   * Remove manager from their team (disable team assignment)
   */
  async disableManager(managerId: string): Promise<void> {
    const result = await patchRequest<void>(API_PATHS.MANAGERS.DISABLE(managerId), {});
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

  /**
   * جلب إحصائيات وأداء مدير الأسطول
   */
  async getManagerStats(managerId: string, signal?: AbortSignal): Promise<ManagerStats | null> {
    const result = await sendRequest<{ stats: ManagerStats }>(
      API_PATHS.MANAGERS.STATS(managerId),
      { signal }
    );
    if (!result.success) return null;
    return result.data?.stats ?? null;
  },
};
