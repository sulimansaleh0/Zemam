import { sendRequest, patchRequest } from '@/shared/lib/coreApi';
import { API_PATHS } from '@/shared/constants/apiPaths';
import type { ServiceResult } from '@/shared/types/api.types';
import type { AlertsResponse, MarkAlertReadResponse } from '../types/alert.types';

export const alertService = {
  /**
   * جلب التنبيهات مع خيار جلب غير المقروءة فقط
   */
  getAlerts(unreadOnly: boolean = false, signal?: AbortSignal): Promise<ServiceResult<AlertsResponse>> {
    const query = unreadOnly ? '?unread=true' : '';
    return sendRequest<AlertsResponse>(`${API_PATHS.ALERTS.LIST}${query}`, { signal });
  },

  /**
   * تعليم التنبيه كمقروء
   */
  markAsRead(alertId: string): Promise<ServiceResult<MarkAlertReadResponse>> {
    return patchRequest<MarkAlertReadResponse>(API_PATHS.ALERTS.MARK_READ(alertId), {});
  },
};
