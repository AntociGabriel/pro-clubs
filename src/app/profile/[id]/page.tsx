'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface TeamMember {
  id: string;
  name: string;
  nickname: string;
  image: string;
}

interface ProfileData {
  id: string;
  name: string;
  nickname: string;
  image: string;
  platform: string;
  country: string;
  positions: string[];
  team?: {
    id: string;
    name: string;
    members: TeamMember[];
  };
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = params?.id as string;

  useEffect(() => {
    if (!id) {
      router.replace('/profile');
      return;
    }

    const fetchProfile = async () => {
      try {
        console.log('Fetching profile for ID:', id);
        const response = await fetch(`/api/profile?id=${id}`);
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Profile fetch error:', errorData);
          throw new Error('Профиль не найден');
        }
        const data = await response.json();
        console.log('Profile data received:', data);
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки профиля');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, router]);

  if (!id) {
    return null;
  }

  if (loading) {
    return <div>Загрузка профиля...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!profile) {
    return <div>Профиль не найден</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <img 
          src={profile.image || '/default-avatar.png'} 
          alt={profile.name}
          className="w-24 h-24 rounded-full"
        />
        <div>
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          <p className="text-gray-600">@{profile.nickname}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Информация</h2>
          <p>Платформа: {profile.platform}</p>
          <p>Страна: {profile.country}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Позиции</h2>
          <ul className="list-disc pl-5">
            {profile.positions?.map((pos: string) => (
              <li key={pos}>{pos}</li>
            ))}
          </ul>
        </div>
      </div>

      {profile.team && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-4">Команда: {profile.team.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {profile.team.members.map((member) => (
              <div key={member.id} className="flex items-center gap-2">
                <img
                  src={member.image || '/default-avatar.png'}
                  alt={member.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-gray-500">@{member.nickname}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}