'use client';

import { useParams } from 'next/navigation';
import { TeamDetailView } from '@/features/teams';

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = String(params?.id || '');

  return <TeamDetailView teamId={teamId} />;
}
