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
    formData.append('liters', String(payload.liters));
    formData.append('cost', String(payload.cost));
    formData.append('fuelType', payload.fuelType);
    formData.append('odometer', String(payload.odometer));
    if (payload.notes) formData.append('notes', payload.notes);
    if (payload.receiptPhoto) formData.append('receiptPhoto', payload.receiptPhoto);

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
          liters: payload.liters,
          cost: payload.cost,
          fuelType: payload.fuelType,
          odometer: payload.odometer,
          notes: payload.notes,
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
    const formData = new FormData();
    formData.append('vehicleId', payload.vehicleId);
    formData.append('type', payload.type);
    formData.append('description', payload.description);
    formData.append('urgency', payload.urgency);
    if (payload.odometer) formData.append('odometer', String(payload.odometer));
    if (payload.lat) formData.append('lat', String(payload.lat));
    if (payload.lng) formData.append('lng', String(payload.lng));

    if (payload.damagePhotos && payload.damagePhotos.length > 0) {
      payload.damagePhotos.forEach((photo) => {
        formData.append('photos', photo);
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
          type: payload.type,
          description: payload.description,
          urgency: payload.urgency,
          odometer: payload.odometer,
        },
        createdAt: Date.now(),
      });
      return true;
    }
  },
};
