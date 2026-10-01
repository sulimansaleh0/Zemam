'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertService } from '../services/alert.service';
import type { BackendAlert } from '../types/alert.types';

export const ALERT_QUERY_KEYS = {
  all: ['alerts'] as const,
  unread: ['alerts', 'unread'] as const,
};

export function useAlerts(unreadOnly: boolean = false) {
  return useQuery({
    queryKey: unreadOnly ? ALERT_QUERY_KEYS.unread : ALERT_QUERY_KEYS.all,
    queryFn: async ({ signal }) => {
      const res = await alertService.getAlerts(unreadOnly, signal);
      if (!res.success) {
        if (res.message === 'Request cancelled') return [];
        return [];
      }
      return res.data?.alerts ?? [];
    },
    refetchInterval: 30000, // استعلام دوري كل 30 ثانية
  });
}

export function useMarkAlertRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const res = await alertService.markAsRead(alertId);
      if (!res.success) throw new Error(res.message);
      return res.data.alert;
    },
    onSuccess: (updatedAlert) => {
      queryClient.setQueryData<BackendAlert[]>(ALERT_QUERY_KEYS.all, (old) => {
        if (!old) return [];
        return old.map((a) => (a._id === updatedAlert._id ? updatedAlert : a));
      });
      queryClient.setQueryData<BackendAlert[]>(ALERT_QUERY_KEYS.unread, (old) => {
        if (!old) return [];
        return old.filter((a) => a._id !== updatedAlert._id);
      });
      queryClient.invalidateQueries({ queryKey: ALERT_QUERY_KEYS.all });
    },
  });
}
