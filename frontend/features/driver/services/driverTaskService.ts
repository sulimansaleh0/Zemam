'use client';

import type {
  DriverTask,
  FuelLogPayload,
  MaintenanceReportPayload,
} from '../types/driverPwa.types';
import {
  cacheTasksLocally,
  getCachedTasksLocally,
  queueOfflineAction,
  getOfflineActions,
  removeOfflineAction,
} from './driverStorage';

function getAuthHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  return { ...customHeaders };
}

export const driverTaskService = {
  /**
   * جلب مهام السائق الميدانية (مع دعم الكاش عند انقطاع الإنترنت)
   */
  async getTasks(): Promise<{ tasks: DriverTask[]; fromCache?: boolean }> {
    try {
      if (navigator.onLine) {
        let res = await fetch('/api/task/driver', {
          credentials: 'include',
          headers: getAuthHeaders(),
        });
        if (!res.ok) {
          res = await fetch('/api/task', {
            credentials: 'include',
            headers: getAuthHeaders(),
          });
        }

        if (res.ok) {
          const data = await res.json();
          const list = data?.tasks || data?.data?.tasks || [];
          // حفظ في الكاش المحلي IndexedDB
          await cacheTasksLocally(list);
          return { tasks: list, fromCache: false };
        }
      }
    } catch (err) {
      console.warn('[driverTaskService] fetch failed, falling back to cache:', err);
    }

    // إذا فشل الطلب أو بدون اتصال
    const cached = await getCachedTasksLocally();
    return { tasks: cached, fromCache: true };
  },

  /**
   * قبول وبدء المهمة
   */
  async acceptTask(taskId: string): Promise<boolean> {
    if (navigator.onLine) {
      const res = await fetch(`/api/task/${taskId}/accept`, {
        method: 'PATCH',
        credentials: 'include',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.msg || error?.message || 'فشل قبول المهمة');
      }
      return true;
    } else {
      // حفظ الإجراء محلياً
      await queueOfflineAction({
        id: `accept_${taskId}_${Date.now()}`,
        type: 'ACCEPT_TASK',
        url: `/api/task/${taskId}/accept`,
        method: 'PATCH',
        body: {},
        createdAt: Date.now(),
      });
      return true;
    }
  },

  /**
   * إنهاء وتسليم المهمة مع قراءة العداد وصورة التسليم الميدانية
   */
  async finishTask(
    taskId: string,
    payload: { endOdometer?: number; proofPhotoFile?: File | null }
  ): Promise<boolean> {
    if (navigator.onLine) {
      const formData = new FormData();
      if (payload.endOdometer) {
        formData.append('endOdometer', String(payload.endOdometer));
      }
      if (payload.proofPhotoFile) {
        formData.append('proofPhoto', payload.proofPhotoFile);
      }

      let res: Response;
      if (!payload.proofPhotoFile) {
        res = await fetch(`/api/task/${taskId}/finish`, {
          method: 'PATCH',
          credentials: 'include',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ endOdometer: payload.endOdometer }),
        });
      } else {
        res = await fetch(`/api/task/${taskId}/finish`, {
          method: 'PATCH',
          credentials: 'include',
          headers: getAuthHeaders(),
          body: formData,
        });
      }

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.msg || error?.message || 'تعذر تسليم المهمة');
      }
      return true;
    } else {
      await queueOfflineAction({
        id: `finish_${taskId}_${Date.now()}`,
        type: 'FINISH_TASK',
        url: `/api/task/${taskId}/finish`,
        method: 'PATCH',
        body: { endOdometer: payload.endOdometer },
        createdAt: Date.now(),
      });
      return true;
    }
  },

  /**
   * تسجيل فاتورة وقود ميدانية
   */
  async submitFuel(payload: FuelLogPayload): Promise<boolean> {
    const formData = new FormData();
    formData.append('vehicleId', payload.vehicleId);
    formData.append('qty', String(payload.liters));
    formData.append('liters', String(payload.liters));
    formData.append('cost', String(payload.cost));
    formData.append('fuelType', payload.fuelType);
    formData.append('odometer', String(payload.odometer));
    formData.append('isFullTank', 'true');
    if (payload.notes) formData.append('notes', payload.notes);
    if (payload.receiptPhoto) {
      formData.append('image', payload.receiptPhoto);
    }

    if (navigator.onLine) {
      const res = await fetch('/api/fuel', {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.msg || err?.message || 'فشل تسجيل فاتورة الوقود');
      }
      return true;
    } else {
      await queueOfflineAction({
        id: `fuel_${Date.now()}`,
        type: 'SUBMIT_FUEL',
        url: '/api/fuel',
        method: 'POST',
        body: {
          vehicleId: payload.vehicleId,
          qty: payload.liters,
          cost: payload.cost,
          fuelType: payload.fuelType,
          odometer: payload.odometer,
          isFullTank: true,
          notes: payload.notes,
          image: 'https://placehold.co/600x400?text=Offline+Fuel+Receipt',
        },
        createdAt: Date.now(),
      });
      return true;
    }
  },

  /**
   * تسجيل بلاغ صيانة أو عطل طارئ
   */
  async submitMaintenance(payload: MaintenanceReportPayload): Promise<boolean> {
    const category = payload.type === 'routine' ? 'Periodic Maintenance' : 'Faults';
    const priority = payload.urgency === 'low' ? 'low' : 'High';

    const formData = new FormData();
    formData.append('vehicleId', payload.vehicleId);
    formData.append('category', category);
    formData.append('priority', priority);
    formData.append('description', payload.description);
    if (payload.odometer) {
      formData.append('odometer', String(payload.odometer));
    }
    formData.append('cost', '0');

    if (payload.damagePhotos && payload.damagePhotos.length > 0) {
      payload.damagePhotos.forEach((photo) => {
        formData.append('images', photo);
      });
    }

    if (navigator.onLine) {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.msg || err?.message || 'فشل إرسال بلاغ الصيانة');
      }
      return true;
    } else {
      await queueOfflineAction({
        id: `maint_${Date.now()}`,
        type: 'SUBMIT_MAINTENANCE',
        url: '/api/maintenance',
        method: 'POST',
        body: {
          vehicleId: payload.vehicleId,
          category,
          priority,
          description: payload.description,
          odometer: payload.odometer,
          cost: 0,
        },
        createdAt: Date.now(),
      });
      return true;
    }
  },

  /**
   * مزامنة وإعادة إرسال العمليات المخزنة محلياً عند عودة الاتصال
   */
  async flushOfflineActions(): Promise<{ total: number; succeeded: number }> {
    if (!navigator.onLine) return { total: 0, succeeded: 0 };
    const actions = await getOfflineActions();
    if (!actions || actions.length === 0) return { total: 0, succeeded: 0 };

    let succeeded = 0;
    actions.sort((a, b) => a.createdAt - b.createdAt);

    for (const action of actions) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        const body = JSON.stringify(action.body || {});

        const res = await fetch(action.url, {
          method: action.method,
          credentials: 'include',
          headers: getAuthHeaders(headers),
          body,
        });

        // 200/201: النجاح، 400/404/409: عمليات منتهية الصلاحية أو مكررة يتم إزالتها لتجنب انسداد الطابور
        if (res.ok || res.status === 400 || res.status === 404 || res.status === 409) {
          await removeOfflineAction(action.id);
          if (res.ok) succeeded++;
        }
      } catch (err) {
        console.warn(`[driverTaskService] Failed to replay action ${action.id}:`, err);
        break;
      }
    }

    return { total: actions.length, succeeded };
  },
};
