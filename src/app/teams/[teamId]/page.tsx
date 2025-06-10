'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

interface Team {
  _id: string;
  name: string;
  logo: string;
  captain: {
    _id: string;
    email: string;
    name: string;
    nickname: string;
    image: string;
  };
  members: Array<{
    _id: string;
    email: string;
    name: string;
    nickname: string;
    image: string;
  }>;
}

export default function TeamDetailsPage({ params }: { params: { teamId: string } }) {
  const { data: session } = useSession();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeam();
  }, [params.teamId]);

  const fetchTeam = async () => {
    try {
      const response = await fetch(`/api/teams/${params.teamId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch team');
      }
      const data = await response.json();
      setTeam(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch team');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading team details...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!team) return <div className="text-center py-8">Team not found</div>;

  const isCaptain = team.captain.email === session?.user?.email;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-center space-x-6 mb-8">
            <div className="relative w-24 h-24">
              <Image
                src={team.logo || '/default-team-logo.png'}
                alt={team.name}
                fill
                className="object-cover rounded-full"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{team.name}</h1>
              <p className="text-gray-600">
                Captain: {team.captain.nickname || team.captain.name}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Team Members</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Captain */}
              <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-3">
                <div className="relative w-12 h-12">
                  <Image
                    src={team.captain.image || '/default-avatar.png'}
                    alt={team.captain.nickname || team.captain.name}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
                <div>
                  <p className="font-medium">{team.captain.nickname || team.captain.name}</p>
                  <p className="text-sm text-gray-500">Captain</p>
                </div>
              </div>

              {/* Members */}
              {team.members.map((member) => (
                <div key={member._id} className="bg-gray-50 rounded-lg p-4 flex items-center space-x-3">
                  <div className="relative w-12 h-12">
                    <Image
                      src={member.image || '/default-avatar.png'}
                      alt={member.nickname || member.name}
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{member.nickname || member.name}</p>
                    <p className="text-sm text-gray-500">Member</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {isCaptain && (
            <div className="mt-8">
              <Link
                href={`/teams/${team._id}/requests`}
                className="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
              >
                Manage Join Requests
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 