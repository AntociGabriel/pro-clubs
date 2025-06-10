"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

const CLOUDINARY_CLOUD_NAME = 'dqwqjqjqj';
const CLOUDINARY_UPLOAD_PRESET = 'ml_default';

const countries = [
  "Россия", "Украина", "Беларусь", "Казахстан", "Германия", "Франция", "Италия", "Испания", "Англия", "США", "Канада", "Бразилия", "Аргентина", "Португалия", "Польша", "Турция", "Китай", "Япония", "Южная Корея", "Австралия", "Нидерланды", "Швеция", "Норвегия", "Дания", "Швейцария", "Австрия", "Бельгия", "Чехия", "Сербия", "Хорватия", "Греция", "Румыния", "Венгрия", "Словакия", "Словения", "Болгария", "Грузия", "Армения", "Азербайджан", "Узбекистан", "Эстония", "Латвия", "Литва", "Финляндия", "Ирландия", "Шотландия", "Уэльс", "Исландия", "Мексика", "Колумбия", "Чили", "Перу", "Эквадор", "Уругвай", "Парагвай", "Венесуэла", "Коста-Рика", "Панама", "Ямайка", "Египет", "Марокко", "Тунис", "Алжир", "Камерун", "Сенегал", "Нигерия", "ЮАР", "Гана", "Кот-д'Ивуар", "Мали", "Ангола", "Замбия", "Зимбабве", "Катар", "Саудовская Аравия", "ОАЭ", "Иран", "Ирак", "Израиль", "Индия", "Индонезия", "Таиланд", "Вьетнам", "Малайзия", "Сингапур", "Филиппины", "Новая Зеландия", "Кипр", "Черногория", "Македония", "Албания", "Люксембург", "Лихтенштейн", "Монако", "Сан-Марино", "Андорра", "Мальта", "Босния и Герцеговина", "Косово", "Молдова", "Белиз", "Боливия", "Гватемала", "Гондурас", "Никарагуа", "Сальвадор", "Суринам", "Тринидад и Тобаго", "Барбадос", "Багамы", "Гаити", "Доминикана", "Куба", "Пуэрто-Рико", "Гренада", "Сент-Люсия", "Сент-Винсент и Гренадины", "Антигуа и Барбуда", "Сент-Китс и Невис", "Бруней", "Монголия", "Камбоджа", "Лаос", "Мьянма", "Непал", "Пакистан", "Бангладеш", "Шри-Ланка", "Мальдивы", "Бутан", "Афганистан", "Таджикистан", "Киргизия", "Туркмения", "Папуа — Новая Гвинея", "Фиджи", "Тонга", "Самоа", "Вануату", "Соломоновы Острова", "Тувалу", "Кирибати", "Маршалловы Острова", "Палау", "Микронезия"
];

const positionsList = [
  "GK", "LB", "CB", "RB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "ST", "CF"
];

interface Team {
  id: string;
  name: string;
  logo: string;
  members: string[];
  captain: string;
  elo: number;
  rating: number;
  joinedAt?: string;
}

interface TeamRequest {
  id: string;
  team: {
    id: string;
    name: string;
    logo: string;
  };
  status: string;
  createdAt: string;
}

const ProfilePage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    image: '',
    platform: '',
    country: '',
    eaId: '',
    positions: [] as string[],
  });
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [teamHistory, setTeamHistory] = useState<Team[]>([]);
  const [teamRequests, setTeamRequests] = useState<TeamRequest[]>([]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profile?id=${session?.user?.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      setFormData({
        name: data.name || '',
        nickname: data.nickname || '',
        image: data.image || '',
        platform: data.platform || '',
        country: data.country || '',
        eaId: data.eaId || '',
        positions: data.positions || [],
      });
      setCurrentTeam(data.currentTeam);
      setTeamHistory(data.teamHistory || []);
      setTeamRequests(data.teamRequests || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, image: data.secure_url }));
      toast.success('Avatar updated successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Profile Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center mb-8">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <Image
                src={formData.image || '/default-avatar.png'}
                alt="Profile"
                fill
                className="rounded-full object-cover"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{formData.name}</h2>
            <p className="text-gray-500">{formData.nickname}</p>
            <button
              onClick={() => router.push('/profile/edit')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Platform</h3>
                <p className="mt-1 text-sm text-gray-900">{formData.platform || 'Not specified'}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Country</h3>
                <p className="mt-1 text-sm text-gray-900">{formData.country || 'Not specified'}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">EA ID</h3>
                <p className="mt-1 text-sm text-gray-900">{formData.eaId || 'Not specified'}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Positions</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.positions.length > 0 ? (
                  formData.positions.map((position) => (
                    <span
                      key={position}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {position}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No positions specified</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Current Team Section */}
        {currentTeam && (
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Team</h3>
            <div className="flex items-center space-x-4">
              {currentTeam.logo && (
                <div className="relative w-16 h-16">
                  <Image
                    src={currentTeam.logo}
                    alt={currentTeam.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
              )}
              <div>
                <h4 className="text-lg font-medium text-gray-900">{currentTeam.name}</h4>
                <p className="text-sm text-gray-500">
                  {currentTeam.captain === session?.user?.id ? 'Captain' : 'Member'}
                </p>
                <div className="mt-2 flex items-center space-x-4">
                  <span className="text-sm text-gray-500">ELO: {currentTeam.elo}</span>
                  <span className="text-sm text-gray-500">Rating: {currentTeam.rating}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team History Section */}
        {teamHistory.length > 0 && (
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Team History</h3>
            <div className="space-y-4">
              {teamHistory.map((team) => (
                <div key={team.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  {team.logo && (
                    <div className="relative w-12 h-12">
                      <Image
                        src={team.logo}
                        alt={team.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h4 className="text-md font-medium text-gray-900">{team.name}</h4>
                    <p className="text-sm text-gray-500">
                      {team.captain === session?.user?.id ? 'Captain' : 'Member'}
                    </p>
                    <div className="mt-1 flex items-center space-x-4">
                      <span className="text-sm text-gray-500">ELO: {team.elo}</span>
                      <span className="text-sm text-gray-500">Rating: {team.rating}</span>
                      {team.joinedAt && (
                        <span className="text-sm text-gray-500">
                          Joined: {new Date(team.joinedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Requests Section */}
        {teamRequests.length > 0 && (
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Team Requests</h3>
            <div className="space-y-4">
              {teamRequests.map((request) => (
                <div key={request.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  {request.team.logo && (
                    <div className="relative w-12 h-12">
                      <Image
                        src={request.team.logo}
                        alt={request.team.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h4 className="text-md font-medium text-gray-900">{request.team.name}</h4>
                    <p className="text-sm text-gray-500">
                      Status: {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;