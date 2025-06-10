"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const countries = [
  "Россия", "Украина", "Беларусь", "Казахстан", "Германия", "Франция", "Италия", "Испания", "Англия", "США", "Канада", "Бразилия", "Аргентина", "Португалия", "Польша", "Турция", "Китай", "Япония", "Южная Корея", "Австралия", "Нидерланды", "Швеция", "Норвегия", "Дания", "Швейцария", "Австрия", "Бельгия", "Чехия", "Сербия", "Хорватия", "Греция", "Румыния", "Венгрия", "Словакия", "Словения", "Болгария", "Грузия", "Армения", "Азербайджан", "Узбекистан", "Эстония", "Латвия", "Литва", "Финляндия", "Ирландия", "Шотландия", "Уэльс", "Исландия", "Мексика", "Колумбия", "Чили", "Перу", "Эквадор", "Уругвай", "Парагвай", "Венесуэла", "Коста-Рика", "Панама", "Ямайка", "Египет", "Марокко", "Тунис", "Алжир", "Камерун", "Сенегал", "Нигерия", "ЮАР", "Гана", "Кот-д'Ивуар", "Мали", "Ангола", "Замбия", "Зимбабве", "Катар", "Саудовская Аравия", "ОАЭ", "Иран", "Ирак", "Израиль", "Индия", "Индонезия", "Таиланд", "Вьетнам", "Малайзия", "Сингапур", "Филиппины", "Новая Зеландия", "Кипр", "Черногория", "Македония", "Албания", "Люксембург", "Лихтенштейн", "Монако", "Сан-Марино", "Андорра", "Мальта", "Босния и Герцеговина", "Косово", "Молдова", "Белиз", "Боливия", "Гватемала", "Гондурас", "Никарагуа", "Сальвадор", "Суринам", "Тринидад и Тобаго", "Барбадос", "Багамы", "Гаити", "Доминикана", "Куба", "Пуэрто-Рико", "Гренада", "Сент-Люсия", "Сент-Винсент и Гренадины", "Антигуа и Барбуда", "Сент-Китс и Невис", "Бруней", "Монголия", "Камбоджа", "Лаос", "Мьянма", "Непал", "Пакистан", "Бангладеш", "Шри-Ланка", "Мальдивы", "Бутан", "Афганистан", "Таджикистан", "Киргизия", "Туркмения", "Папуа — Новая Гвинея", "Фиджи", "Тонга", "Самоа", "Вануату", "Соломоновы Острова", "Тувалу", "Кирибати", "Маршалловы Острова", "Палау", "Микронезия" 
];

const positionsList = [
  "GK", "LB", "CB", "RB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "ST", "CF"
];

export default function RegisterForm() {
  const [form, setForm] = useState({
    email: '',
    nickname: '',
    password: '',
    image: '',
    platform: '',
    country: '',
    eaId: '',
    positions: [] as string[],
    avatarFile: null as File | null,
  });
  const [message, setMessage] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = window.localStorage.getItem('user_email');
      if (email) setIsAuth(true);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      setForm({ ...form, avatarFile: (e.target as HTMLInputElement).files?.[0] || null });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handlePositionChange = (position: string) => {
    setForm((prev) => {
      const positions = prev.positions.includes(position)
        ? prev.positions.filter((p) => p !== position)
        : [...prev.positions, position];
      return { ...prev, positions };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    let imageUrl = form.image;
    if (form.avatarFile) {
      const data = new FormData();
      data.append('file', form.avatarFile);
      imageUrl = URL.createObjectURL(form.avatarFile);
    }
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        image: imageUrl,
        positions: form.positions,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Регистрация успешна!');
      window.localStorage.setItem('user_email', form.email);
      setTimeout(() => {
        router.push('/');
      }, 1000);
      setForm({ email: '', nickname: '', password: '', image: '', platform: '', country: '', eaId: '', positions: [], avatarFile: null });
    } else {
      setMessage(data.error || 'Ошибка регистрации');
    }
  };

  if (isAuth) {
    return <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow text-center text-green-700 font-semibold">Вы уже авторизованы</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Регистрация</h2>
      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="w-full border p-2 rounded" />
        <input name="nickname" type="text" placeholder="Никнейм" value={form.nickname} onChange={handleChange} required className="w-full border p-2 rounded" />
        <input name="password" type="password" placeholder="Пароль" value={form.password} onChange={handleChange} required className="w-full border p-2 rounded" />
        <input name="avatar" type="file" accept="image/*" onChange={handleChange} className="w-full border p-2 rounded" />
        <select name="platform" value={form.platform} onChange={handleChange} required className="w-full border p-2 rounded">
          <option value="">Платформа</option>
          <option value="PC">PC</option>
          <option value="PS">PlayStation</option>
          <option value="Xbox">Xbox</option>
        </select>
        <select name="country" value={form.country} onChange={handleChange} required className="w-full border p-2 rounded">
          <option value="">Страна</option>
          {countries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input name="eaId" type="text" placeholder="EA ID" value={form.eaId} onChange={handleChange} required className="w-full border p-2 rounded" />
        
        <div className="mb-2 font-medium">Позиции:</div>
        <div className="flex flex-wrap gap-2">
          {positionsList.map((pos) => (
            <label key={pos} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={form.positions.includes(pos)}
                onChange={() => handlePositionChange(pos)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>{pos}</span>
            </label>
          ))}
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Зарегистрироваться</button>
      </form>
      {message && <div className="mt-4 text-center text-red-600">{message}</div>}
    </div>
  );
} 