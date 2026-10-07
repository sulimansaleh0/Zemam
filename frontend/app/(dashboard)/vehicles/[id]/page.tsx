'use client';

import { useParams } from 'next/navigation';
import { VehicleDetailView } from '@/features/vehicles';

export default function VehicleDetailPage() {
  const params = useParams();
  const vehicleId = String(params?.id || '');

  return <VehicleDetailView vehicleId={vehicleId} />;
}
