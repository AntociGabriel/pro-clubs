'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface TeamRequest {
  _id: string;
  user: {
    _id: string;
    email: string;
    name: string;
    nickname: string;
    image: string;
  };
  team: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export default function TeamRequestsPage({ params }: { params: { teamId: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<TeamRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [params.teamId]);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`/api/teams/requests?teamId=${params.teamId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      const response = await fetch(`/api/teams/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          teamId: params.teamId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update request');
      }

      // Refresh the requests list
      await fetchRequests();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update request');
    }
  };

  if (loading) return <div className="text-center py-8">Loading requests...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Team Join Requests</h1>
          
          {requests.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No pending requests</p>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request._id}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative w-12 h-12">
                      <Image
                        src={request.user.image || '/default-avatar.png'}
                        alt={request.user.nickname || request.user.name}
                        fill
                        className="object-cover rounded-full"
                      />
                    </div>
                    <div>
                      <p className="font-medium">
                        {request.user.nickname || request.user.name}
                      </p>
                      <p className="text-sm text-gray-500">{request.user.email}</p>
                    </div>
                  </div>

                  {request.message && (
                    <p className="text-gray-600 mb-4">{request.message}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Requested {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                    {request.status === 'pending' ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRequest(request._id, 'accepted')}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRequest(request._id, 'rejected')}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`px-3 py-1 rounded text-sm ${
                          request.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 