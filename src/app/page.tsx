'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserEmail(window.localStorage.getItem('user_email'));
    }
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center justify-center pt-16 pb-12 bg-white border-b border-gray-200">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight text-center">FIFA FC Platform</h1>
        <p className="text-lg md:text-2xl text-gray-500 mb-8 max-w-2xl text-center">Присоединяйтесь к крупнейшему сообществу FIFA игроков</p>
        <div className="flex gap-4 justify-center mb-4">
          {!userEmail && (
            <>
              <Link href="/register" className="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-all text-lg">Начать игру</Link>
              <Link href="/login" className="px-8 py-3 border border-primary text-primary rounded-lg font-semibold transition-all text-lg hover:bg-primary hover:text-white">Войти</Link>
            </>
          )}
        </div>
        {userEmail && (
          <div className="mt-2 text-gray-600 text-lg flex items-center gap-2 justify-center">
            <span>Вы вошли как</span>
            <span className="font-bold text-primary">{userEmail}</span>
            <button onClick={() => {window.localStorage.removeItem('user_email'); window.location.reload();}} className="ml-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-primary hover:text-white transition-all">Выйти</button>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <img src="/images/trophy.svg" alt="Турниры" className="w-14 h-14 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Турниры</h3>
              <p className="text-gray-500">Участвуйте в регулярных турнирах и выигрывайте призы</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <img src="/images/leaderboard.svg" alt="Рейтинг" className="w-14 h-14 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Рейтинг</h3>
              <p className="text-gray-500">Соревнуйтесь с другими игроками и поднимайтесь в рейтинге</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <img src="/images/community.svg" alt="Сообщество" className="w-14 h-14 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Сообщество</h3>
              <p className="text-gray-500">Общайтесь с другими игроками и находите партнеров для игры</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 