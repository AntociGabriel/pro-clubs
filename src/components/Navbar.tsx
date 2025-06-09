'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [myTeam, setMyTeam] = useState<any>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const router = useRouter()
  const [modalRequestIndex, setModalRequestIndex] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserEmail(window.localStorage.getItem('user_email'));
    }
  }, [])

  useEffect(() => {
    if (userEmail) {
      const fetchMyTeam = () => {
        fetch(`/api/teams/search?member=${userEmail}`)
          .then(async res => {
            if (!res.ok) return {};
            const text = await res.text();
            if (!text) return {};
            try { return JSON.parse(text); } catch { return {}; }
          })
          .then(data => {
            setMyTeam(data.teams && data.teams.length > 0 ? data.teams[0] : null);
          })
          .catch(() => setMyTeam(null));
      };
      fetchMyTeam();
      const interval = setInterval(fetchMyTeam, 5000); // обновлять каждые 5 секунд
      return () => clearInterval(interval);
    }
  }, [userEmail]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (myTeam && myTeam.captain?.email === userEmail) {
      const fetchRequests = () => {
        fetch(`/api/teams/requests?teamId=${myTeam._id}&status=pending`)
          .then(res => res.json())
          .then(data => setPendingRequests(data.requests || []));
      };
      fetchRequests();
      interval = setInterval(fetchRequests, 5000); // обновлять каждые 5 секунд
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [myTeam, userEmail]);

  useEffect(() => {
    if (pendingRequests.length === 0 && showNotifications) {
      setShowNotifications(false);
      setModalRequestIndex(null);
    }
    if (modalRequestIndex !== null && (modalRequestIndex < 0 || modalRequestIndex >= pendingRequests.length)) {
      setModalRequestIndex(null);
    }
  }, [pendingRequests]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm h-16 flex items-center transition-colors">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold text-primary tracking-tight">FIFA FC</Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/tournaments" className={`text-sm font-medium transition-colors ${pathname === '/tournaments' ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}>Турниры</Link>
          <Link href="/leaderboard" className={`text-sm font-medium transition-colors ${pathname === '/leaderboard' ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}>Рейтинг</Link>
          <Link href="/community" className={`text-sm font-medium transition-colors ${pathname === '/community' ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}>Сообщество</Link>
        </div>
        <div className="flex items-center gap-4">
          {/* Оповещения */}
          {userEmail && (
            <div className="relative">
              <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors" onClick={() => { setShowNotifications(v => !v); setModalRequestIndex(null); }}>
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                {pendingRequests.length > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">{pendingRequests.length}</span>
                )}
              </button>
              {showNotifications && pendingRequests.length > 0 && (
                <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 font-bold border-b">Заявки в команду</div>
                  {pendingRequests.map((r, idx) => (
                    <button
                      key={r._id}
                      className="flex items-center gap-2 w-full px-4 py-3 border-b last:border-b-0 hover:bg-gray-100 transition text-left"
                      onClick={() => setModalRequestIndex(idx)}
                    >
                      <img src={r.user?.image || "/avatar.svg"} alt={r.user?.name} className="w-8 h-8 rounded-full object-cover" />
                      <span className="font-semibold">{r.user?.name}</span>
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
          {/* Профиль */}
          {userEmail ? (
            <div className="relative">
              <button onClick={() => setShowMenu(v => !v)} className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold focus:outline-none focus:ring-2 focus:ring-primary">
                {userEmail[0]?.toUpperCase()}
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-50">
                  <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Профиль</Link>
                  <button onClick={() => {window.localStorage.removeItem('user_email'); window.location.reload();}} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Выйти</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded hover:bg-primary hover:text-white transition-colors">Войти</Link>
              <Link href="/register" className="px-4 py-2 text-sm font-medium bg-primary text-white rounded hover:bg-primary/90 transition-colors">Регистрация</Link>
            </>
          )}
          {userEmail && (
            <>
              {myTeam ? (
                <button onClick={() => router.push(`/teams/${myTeam._id}`)} className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition">Моя команда</button>
              ) : (
                <button onClick={() => router.push('/teams/create')} className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition">Создать команду</button>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
} 