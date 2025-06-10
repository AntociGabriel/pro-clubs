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

export default function TeamList() {
  const { data: session, status } = useSession();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinMessage, setJoinMessage] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }
      const data = await response.json();
      setTeams(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (teamId: string) => {
    if (!session?.user?.email) {
      alert('Please sign in to request to join a team');
      return;
    }

    try {
      const response = await fetch('/api/teams/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId,
          message: joinMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send join request');
      }

      alert('Join request sent successfully!');
      setSelectedTeam(null);
      setJoinMessage('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send join request');
    }
  };

  if (loading) return <div className="text-center py-8">Loading teams...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teams.map((team) => {
        const isMember = team.members.some(member => member.email === session?.user?.email);
        const isCaptain = team.captain.email === session?.user?.email;
        const canJoin = status === 'authenticated' && !isMember && !isCaptain;

        return (
          <div key={team._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <div className="relative w-16 h-16">
                  <Image
                    src={team.logo || '/default-team-logo.png'}
                    alt={team.name}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
                <div>
                  <Link href={`/teams/${team._id}`} className="text-xl font-semibold hover:text-blue-600">
                    {team.name}
                  </Link>
                  <p className="text-gray-600">Captain: {team.captain.nickname || team.captain.name}</p>
                  <p className="text-gray-600">Members: {team.members.length}</p>
                </div>
              </div>

              {canJoin && (
                <div className="mt-4">
                  {selectedTeam === team._id ? (
                    <div className="space-y-2">
                      <textarea
                        value={joinMessage}
                        onChange={(e) => setJoinMessage(e.target.value)}
                        placeholder="Why do you want to join this team?"
                        className="w-full p-2 border rounded"
                        rows={3}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleJoinRequest(team._id)}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                          Send Request
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTeam(null);
                            setJoinMessage('');
                          }}
                          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedTeam(team._id)}
                      className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Request to Join
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
} 