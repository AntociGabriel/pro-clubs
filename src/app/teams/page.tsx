'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import TeamList from '@/components/teams/TeamList';

export default function TeamsPage() {
  const { data: session } = useSession();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Teams</h1>
        {session?.user && (
          <Link
            href="/teams/create"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Create Team
          </Link>
        )}
      </div>

      <TeamList />
    </div>
  );
} 