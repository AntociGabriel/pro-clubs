"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// Типы для участников и заявок
interface User {
  _id: string;
  name: string;
  image?: string;
  email: string;
}

interface Team {
  _id: string;
  name: string;
  logo?: string;
  captain: User;
  members: User[];
  requests: User[];
  elo?: number;
}

// TODO: заменить на реального текущего пользователя
const mockCurrentUserId = "mock-user-id";

// Toast-компонент
function Toast({ message, onClose }: { message: string, onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div className="fixed top-6 right-6 bg-black text-white px-4 py-2 rounded shadow-lg z-[9999] animate-fade-in">
      {message}
    </div>
  );
}

export default function TeamPage() {
  const { id } = useParams();
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestStatus, setRequestStatus] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestPlatform, setRequestPlatform] = useState('');
  const [requestPositions, setRequestPositions] = useState<string[]>([]);
  const [requestMessage, setRequestMessage] = useState('');
  const platforms = [
    { value: 'PC', label: 'PC' },
    { value: 'PS', label: 'PlayStation' },
    { value: 'Xbox', label: 'Xbox' },
  ];
  const positionsList = [
    'GK', 'LB', 'CB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF'
  ];
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [myRequest, setMyRequest] = useState<any | null>(null);
  const [modalRequestIndex, setModalRequestIndex] = useState<number | null>(null);

  useEffect(() => {
    setUserEmail(typeof window !== 'undefined' ? window.localStorage.getItem('user_email') : null);
    setLoading(true);
    fetch(`/api/teams?id=${id}`)
      .then(res => res.json())
      .then(data => {
        setTeam(data.team || null);
        setLoading(false);
      })
      .catch(() => {
        setError("Ошибка загрузки команды");
        setLoading(false);
      });
    // Получаем заявки
    fetch(`/api/teams/requests?teamId=${id}&status=pending`)
      .then(res => res.json())
      .then(data => setPendingRequests(data.requests || []));
  }, [id]);

  useEffect(() => {
    if (!userEmail || !id) return;
    // Получаем заявку пользователя в эту команду
    fetch(`/api/teams/requests?teamId=${id}&status=pending`)
      .then(res => res.json())
      .then(data => {
        if (!data.requests) return setMyRequest(null);
        const req = data.requests.find((r: any) => r.user?.email === userEmail);
        setMyRequest(req || null);
      });
  }, [userEmail, id, loading]);

  if (loading) return <div className="max-w-2xl mx-auto mt-10">Загрузка...</div>;
  if (error || !team) return <div className="max-w-2xl mx-auto mt-10 text-red-600">{error || "Команда не найдена"}</div>;

  const isCaptain = team.captain?.email === userEmail;
  const isMember = team.members.some(m => m.email === userEmail);

  // Функция для обновления данных команды
  const refreshTeam = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/teams?id=${id}`);
      const data = await res.json();
      setTeam(data.team || null);
    } catch {
      setError("Ошибка загрузки команды");
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async () => {
    setRequestStatus("");
    if (!userEmail) {
      setRequestStatus("Не удалось определить email пользователя");
      setToast("Не удалось определить email пользователя");
      return;
    }
    // Получаем userId по email
    const userRes = await fetch(`/api/users?email=${encodeURIComponent(userEmail)}`);
    const userData = await userRes.json();
    if (!userRes.ok || !userData.user || !userData.user._id) {
      setRequestStatus("Пользователь не найден");
      setToast("Пользователь не найден");
      return;
    }
    const userId = userData.user._id;
    const res = await fetch("/api/teams/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, teamId: team._id, platform: requestPlatform, positions: requestPositions, message: requestMessage }),
    });
    const data = await res.json();
    if (res.ok) {
      setRequestStatus("Заявка отправлена");
      setToast("Заявка отправлена");
      await refreshTeam();
      // Обновить заявку
      fetch(`/api/teams/requests?teamId=${id}&status=pending`)
        .then(res => res.json())
        .then(data => {
          if (!data.requests) return setMyRequest(null);
          const req = data.requests.find((r: any) => r.user?.email === userEmail);
          setMyRequest(req || null);
        });
    } else {
      setRequestStatus(data.error || "Ошибка");
      setToast(data.error || "Ошибка");
    }
  };

  const handleWithdrawRequest = async () => {
    setRequestStatus("");
    if (!userEmail) {
      setRequestStatus("Не удалось определить email пользователя");
      setToast("Не удалось определить email пользователя");
      return;
    }
    // Получаем userId по email
    const userRes = await fetch(`/api/users?email=${encodeURIComponent(userEmail)}`);
    const userData = await userRes.json();
    if (!userRes.ok || !userData.user || !userData.user._id) {
      setRequestStatus("Пользователь не найден");
      setToast("Пользователь не найден");
      return;
    }
    const userId = userData.user._id;
    const res = await fetch("/api/teams/request", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, teamId: team._id }),
    });
    const data = await res.json();
    if (res.ok) {
      setRequestStatus("Заявка отозвана");
      setToast("Заявка отозвана");
      await refreshTeam();
      // Обновить заявку
      fetch(`/api/teams/requests?teamId=${id}&status=pending`)
        .then(res => res.json())
        .then(data => {
          if (!data.requests) return setMyRequest(null);
          const req = data.requests.find((r: any) => r.user?.email === userEmail);
          setMyRequest(req || null);
        });
    } else {
      setRequestStatus(data.error || "Ошибка");
      setToast(data.error || "Ошибка");
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white rounded-xl shadow p-6 flex flex-col md:flex-row gap-8">
      {/* Левая колонка: инфо о команде и игроки */}
      <div className="w-full md:w-1/3">
        <div className="flex flex-col items-center mb-6">
          {team.logo ? (
            <img src={team.logo} alt={team.name} className="w-24 h-24 rounded-full object-cover border mb-2" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-400 mb-2">{team.name[0]}</div>
          )}
          <div className="text-2xl font-bold mb-1">{team.name}</div>
          <div className="text-gray-500 text-sm flex items-center gap-2 mb-1">
            Капитан: {team.captain?.name}
            {team.captain?.image && <img src={team.captain.image} alt="cap" className="w-7 h-7 rounded-full inline-block ml-1" />}
          </div>
          <div className="text-sm text-gray-700 mb-2">ELO: <b>{team.elo || 1000}</b></div>
        </div>
        <div className="mb-6">
          <div className="font-semibold mb-2">Состав:</div>
          <div className="flex flex-col gap-2">
            {team.members.map(m => (
              <Link key={m._id} href={`/profile/${m._id}`} className="flex items-center gap-2 bg-gray-50 rounded px-3 py-1 hover:bg-gray-100 transition">
                <img src={m.image || "/avatar.svg"} alt={m.name} className="w-8 h-8 rounded-full object-cover" />
                <span>{m.name}</span>
                {team.captain?.email === m.email && <span className="text-xs text-blue-600 ml-1">(капитан)</span>}
              </Link>
            ))}
          </div>
        </div>
        {!isMember && !myRequest && (
          <button onClick={() => setShowRequestModal(true)} className="bg-blue-600 text-white px-6 py-2 rounded mt-4">Подать заявку</button>
        )}
        {!isMember && myRequest && (
          <button
            onClick={handleWithdrawRequest}
            className="bg-red-600 text-white px-6 py-2 rounded mt-4"
          >
            Отозвать заявку
          </button>
        )}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowRequestModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-primary text-2xl">×</button>
              <h3 className="text-xl font-bold mb-4">Заявка на вступление</h3>
              <form onSubmit={async e => {
                e.preventDefault();
                setRequestStatus('');
                if (!userEmail) {
                  setRequestStatus('Не удалось определить email пользователя');
                  return;
                }
                // Получаем userId по email
                const userRes = await fetch(`/api/users?email=${encodeURIComponent(userEmail)}`);
                const userData = await userRes.json();
                if (!userRes.ok || !userData.user || !userData.user._id) {
                  setRequestStatus('Пользователь не найден');
                  return;
                }
                const userId = userData.user._id;
                const res = await fetch('/api/teams/request', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId,
                    teamId: team._id,
                    platform: requestPlatform,
                    positions: requestPositions,
                    message: requestMessage,
                  }),
                });
                const data = await res.json();
                if (res.ok) {
                  setRequestStatus('Заявка отправлена');
                  setShowRequestModal(false);
                } else {
                  setRequestStatus(data.error || 'Ошибка');
                }
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Платформа</label>
                  <select value={requestPlatform} onChange={e => setRequestPlatform(e.target.value)} required className="w-full border p-2 rounded">
                    <option value="">Выберите платформу</option>
                    {platforms.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Позиции</label>
                  <div className="flex flex-wrap gap-2">
                    {positionsList.map(pos => (
                      <label key={pos} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={requestPositions.includes(pos)}
                          onChange={() => setRequestPositions(prev => prev.includes(pos) ? prev.filter(p => p !== pos) : [...prev, pos])}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{pos}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Сообщение</label>
                  <textarea value={requestMessage} onChange={e => setRequestMessage(e.target.value)} className="w-full border p-2 rounded" rows={3} placeholder="Сообщение для капитана (необязательно)" />
                </div>
                {requestStatus && <div className="text-red-600 mb-2">{requestStatus}</div>}
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded mt-2">Отправить заявку</button>
              </form>
            </div>
          </div>
        )}
        {requestStatus && <div className="mt-4 text-green-600">{requestStatus}</div>}
      </div>
      {/* Правая колонка: поле и заявки */}
      <div className="flex-1">
        <div className="mb-8">
          <div className="font-semibold mb-2">Схема поля (макет):</div>
          <div className="relative w-full max-w-md aspect-[16/10] bg-green-100 border border-green-300 rounded-xl flex items-center justify-center mx-auto">
            {/* Здесь будет drag&drop */}
            <span className="text-gray-400">Скоро: расстановка игроков на поле</span>
          </div>
        </div>
        {isCaptain && (
          <div className="mb-6">
            <div className="font-semibold mb-2">Заявки на вступление:</div>
            {pendingRequests.length === 0 ? (
              <div className="text-gray-400">Нет заявок</div>
            ) : (
              <div className="flex flex-col gap-2">
                {pendingRequests.map((r, idx) => (
                  <button
                    key={r._id}
                    className="flex items-center gap-2 bg-gray-50 rounded px-3 py-2 hover:bg-gray-100 transition text-left"
                    onClick={() => setModalRequestIndex(idx)}
                  >
                    <img src={r.user?.image || "/avatar.svg"} alt={r.user?.name} className="w-8 h-8 rounded-full object-cover" />
                    <span>{r.user?.name}</span>
                  </button>
                ))}
              </div>
            )}
            {/* Модальное окно с деталями заявки */}
            {modalRequestIndex !== null && pendingRequests[modalRequestIndex] && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
                <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
                  <button onClick={() => setModalRequestIndex(null)} className="absolute top-3 right-3 text-gray-400 hover:text-primary text-2xl">×</button>
                  <div className="flex items-center gap-3 mb-4">
                    <img src={pendingRequests[modalRequestIndex].user?.image || "/avatar.svg"} alt={pendingRequests[modalRequestIndex].user?.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <div className="font-bold text-lg">{pendingRequests[modalRequestIndex].user?.name}</div>
                      <div className="text-xs text-gray-500">{pendingRequests[modalRequestIndex].user?.email}</div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Платформа: </span>
                    <span>{pendingRequests[modalRequestIndex].platform}</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Позиции: </span>
                    <span>{pendingRequests[modalRequestIndex].positions.join(', ')}</span>
                  </div>
                  {pendingRequests[modalRequestIndex].message && (
                    <div className="mb-2">
                      <span className="font-semibold">Сообщение: </span>
                      <span>{pendingRequests[modalRequestIndex].message}</span>
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <button className="text-green-600 hover:underline" onClick={async () => {
                      await fetch("/api/teams/requests", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ requestId: pendingRequests[modalRequestIndex]._id, action: "accept" }),
                      });
                      setPendingRequests(reqs => reqs.filter((_, i) => i !== modalRequestIndex));
                      setModalRequestIndex(null);
                    }}>Принять</button>
                    <button className="text-red-600 hover:underline" onClick={async () => {
                      await fetch("/api/teams/requests", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ requestId: pendingRequests[modalRequestIndex]._id, action: "reject" }),
                      });
                      setPendingRequests(reqs => reqs.filter((_, i) => i !== modalRequestIndex));
                      setModalRequestIndex(null);
                    }}>Отклонить</button>
                  </div>
                  {/* Кнопки для перехода между заявками */}
                  {pendingRequests.length > 1 && (
                    <div className="flex justify-between mt-6">
                      <button
                        className="text-blue-600 hover:underline disabled:text-gray-400"
                        onClick={() => setModalRequestIndex(i => (i !== null ? (i - 1 + pendingRequests.length) % pendingRequests.length : 0))}
                        disabled={pendingRequests.length < 2}
                      >
                        ← Предыдущая
                      </button>
                      <button
                        className="text-blue-600 hover:underline disabled:text-gray-400"
                        onClick={() => setModalRequestIndex(i => (i !== null ? (i + 1) % pendingRequests.length : 0))}
                        disabled={pendingRequests.length < 2}
                      >
                        Следующая →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
} 