import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface TeamRequest {
  _id: string;
  user: {
    _id: string;
    name: string;
    nickname: string;
    image?: string;
  };
  team: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

interface TeamRequestsProps {
  teamId: string;
}

export default function TeamRequests({ teamId }: TeamRequestsProps) {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<TeamRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [teamId]);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`/api/teams/requests?teamId=${teamId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch requests');
      }

      setRequests(data.requests);
    } catch (err: any) {
      setError(err.message);
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
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to handle request');
      }

      // Update the request in the local state
      setRequests(prev =>
        prev.map(req =>
          req._id === requestId ? { ...req, status } : req
        )
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading requests...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">{error}</div>;
  }

  if (requests.length === 0) {
    return <div className="text-center py-4 text-gray-600">No pending requests</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Join Requests</h3>
      {requests.map((request) => (
        <div
          key={request._id}
          className="bg-white rounded-lg shadow-md p-4"
        >
          <div className="flex items-center space-x-4">
            {request.user.image && (
              <div className="relative w-12 h-12">
                <Image
                  src={request.user.image}
                  alt={`${request.user.nickname || request.user.name} avatar`}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h4 className="font-medium">
                {request.user.nickname || request.user.name}
              </h4>
              {request.message && (
                <p className="text-gray-600 text-sm mt-1">{request.message}</p>
              )}
              <p className="text-gray-500 text-sm">
                {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
            {request.status === 'pending' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRequest(request._id, 'accepted')}
                  className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRequest(request._id, 'rejected')}
                  className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            )}
            {request.status !== 'pending' && (
              <span
                className={`px-3 py-1 rounded-md text-sm ${
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
  );
} 