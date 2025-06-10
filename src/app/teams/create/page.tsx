'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CreateTeamForm from '@/components/teams/CreateTeamForm';

export default function CreateTeamPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Create New Team</h1>
      <CreateTeamForm />
    </div>
  );
} 