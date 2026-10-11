'use client';

import { useParams } from 'next/navigation';
import { DriverDetailView } from '@/features/drivers';

export default function DriverDetailPage() {
  const params = useParams();
  const driverId = String(params?.id || '');

  return <DriverDetailView driverId={driverId} />;
}
