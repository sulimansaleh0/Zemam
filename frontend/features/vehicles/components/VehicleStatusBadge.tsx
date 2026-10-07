'use client';

import React from 'react';
import type { VehicleStatus } from '../types/vehicle.types';
import { StatusBadge } from '@/shared/ui';

interface VehicleStatusBadgeProps {
  status: VehicleStatus;
  isInTask?: boolean;
}

export function VehicleStatusBadge({ status, isInTask }: VehicleStatusBadgeProps) {
  if (status === 'in_maintenance') {
    return <StatusBadge label="قيد الصيانة - بانتظار المراجعة" variant="warning" />;
  }

  if (isInTask) {
    return <StatusBadge label="في مهمة" variant="warning" pulse />;
  }

  if (status === 'active') {
    return <StatusBadge label="جاهزة للعمل" variant="success" />;
  }

  return <StatusBadge label="غير نشطة" variant="danger" />;
}
