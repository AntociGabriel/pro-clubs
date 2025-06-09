"use client";
import React, { useState } from 'react';

const CLOUDINARY_CLOUD_NAME = 'dcxyabzas';
const CLOUDINARY_UPLOAD_PRESET = 'unsigned-profile';

const countries = [
  "Россия", "Украина", "Беларусь", "Казахстан", "Германия", "Франция", "Италия", "Испания", "Англия", "США", "Канада", "Бразилия", "Аргентина", "Португалия", "Польша", "Турция", "Китай", "Япония", "Южная Корея", "Австралия", "Нидерланды", "Швеция", "Норвегия", "Дания", "Швейцария", "Австрия", "Бельгия", "Чехия", "Сербия", "Хорватия", "Греция", "Румыния", "Венгрия", "Словакия", "Словения", "Болгария", "Грузия", "Армения", "Азербайджан", "Узбекистан", "Эстония", "Латвия", "Литва", "Финляндия", "Ирландия", "Шотландия", "Уэльс", "Исландия", "Мексика", "Колумбия", "Чили", "Перу", "Эквадор", "Уругвай", "Парагвай", "Венесуэла", "Коста-Рика", "Панама", "Ямайка", "Египет", "Марокко", "Тунис", "Алжир", "Камерун", "Сенегал", "Нигерия", "ЮАР", "Гана", "Кот-д'Ивуар", "Мали", "Ангола", "Замбия", "Зимбабве", "Катар", "Саудовская Аравия", "ОАЭ", "Иран", "Ирак", "Израиль", "Индия", "Индонезия", "Таиланд", "Вьетнам", "Малайзия", "Сингапур", "Филиппины", "Новая Зеландия", "Кипр", "Черногория", "Македония", "Албания", "Люксембург", "Лихтенштейн", "Монако", "Сан-Марино", "Андорра", "Мальта", "Босния и Герцеговина", "Косово", "Молдова", "Белиз", "Боливия", "Гватемала", "Гондурас", "Никарагуа", "Сальвадор", "Суринам", "Тринидад и Тобаго", "Барбадос", "Багамы", "Гаити", "Доминикана", "Куба", "Пуэрто-Рико", "Гренада", "Сент-Люсия", "Сент-Винсент и Гренадины", "Антигуа и Барбуда", "Сент-Китс и Невис", "Бруней", "Монголия", "Камбоджа", "Лаос", "Мьянма", "Непал", "Пакистан", "Бангладеш", "Шри-Ланка", "Мальдивы", "Бутан", "Афганистан", "Таджикистан", "Киргизия", "Туркмения", "Папуа — Новая Гвинея", "Фиджи", "Тонга", "Самоа", "Вануату", "Соломоновы Острова", "Тувалу", "Кирибати", "Маршалловы Острова", "Палау", "Микронезия"
];

const positionsList = [
  "GK", "LB", "CB", "RB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "ST", "CF"
];

const ProfilePage = () => {
  const [form, setForm] = useState({
    email: '',
    name: '',
    image: '',
    platform: '',
    country: '',
    eaId: '',
    nickname: '',
    originId: '',
    positions: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [edit, setEdit] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Для примера: email пользователя можно получить из localStorage или query
  React.useEffect(() => {
    const email = window.localStorage.getItem('user_email') || '';
    if (email) {
      fetch(`/api/profile?email=${encodeURIComponent(email)}`)
        .then(res => res.json())
        .then(data => {
          if (data.email) {
            setForm({
              email: data.email,
              name: data.name || '',
              image: data.image || '',
              platform: data.platform || '',
              country: data.country || '',
              eaId: data.eaId || '',
              nickname: data.nickname || '',
              originId: data.originId || '',
              positions: (data.positions || []).join(','),
              password: '',
            });
            setLoaded(true);
          }
        });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePositionChange = (position: string) => {
    const arr = form.positions ? form.positions.split(',').map((p) => p.trim()) : [];
    const newArr = arr.includes(position)
      ? arr.filter((p) => p !== position)
      : [...arr, position];
    setForm({ ...form, positions: newArr.join(',') });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.secure_url) {
      setForm(f => ({ ...f, image: data.secure_url }));
    } else {
      alert('Ошибка загрузки аватара');
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        positions: form.positions.split(',').map((p) => p.trim()),
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Профиль обновлён!');
      setForm(f => ({ ...f, password: '' }));
      setEdit(false);
    } else {
      setMessage(data.error || 'Ошибка обновления');
    }
  };

  if (!loaded) {
    return <div className="text-center mt-10">Загрузка профиля...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow flex flex-col gap-8">
      {/* Профиль */}
      <div className="flex flex-col md:flex-row items-center gap-6">
        <img
          src={form.image || '/images/default-avatar.png'}
          alt="Аватар"
          className="w-32 h-32 rounded-full object-cover border-4 border-primary shadow"
        />
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">{form.name || 'Без имени'}</span>
            <span className="text-sm text-gray-400">{form.country}</span>
          </div>
          <div className="flex gap-4 flex-wrap text-gray-600 mt-2">
            <span><b>Платформа:</b> {form.platform || '-'}</span>
            <span><b>EA ID:</b> {form.eaId || '-'}</span>
            <span><b>Email:</b> {form.email}</span>
          </div>
          <div className="flex gap-4 flex-wrap text-gray-600 mt-2">
            {form.nickname && <span><b>Логин:</b> {form.nickname}</span>}
            {form.originId && <span><b>Origin ID:</b> {form.originId}</span>}
            <span><b>Позиции:</b> {form.positions || '-'}</span>
          </div>
          <button onClick={() => setEdit(true)} className="mt-4 px-5 py-2 bg-primary text-white rounded hover:bg-primary/90 transition">Редактировать профиль</button>
        </div>
      </div>

      {/* Модальное окно настроек */}
      {edit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setEdit(false)} className="absolute top-3 right-3 text-gray-400 hover:text-primary text-2xl">×</button>
            <h3 className="text-xl font-bold mb-4">Настройки профиля</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="email" type="email" value={form.email} disabled className="w-full border p-2 rounded bg-gray-100" />
              <input name="nickname" type="text" value={form.nickname || ''} disabled className="w-full border p-2 rounded bg-gray-100" placeholder="Логин (никнейм)" />
              <input name="originId" type="text" value={form.originId || ''} disabled className="w-full border p-2 rounded bg-gray-100" placeholder="Origin ID" />
              <input name="name" type="text" placeholder="Имя" value={form.name} onChange={handleChange} className="w-full border p-2 rounded" />
              <div className="flex items-center gap-4">
                <img src={form.image || '/images/default-avatar.png'} alt="Аватар" className="w-16 h-16 rounded-full object-cover border-2 border-primary" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="block" />
                {uploading && <span className="text-xs text-gray-400 ml-2">Загрузка...</span>}
              </div>
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
              <div>
                <div className="mb-2 font-medium">Позиции:</div>
                <div className="flex flex-wrap gap-2">
                  {positionsList.map((pos) => {
                    const arr = form.positions ? form.positions.split(',').map((p) => p.trim()) : [];
                    return (
                      <label key={pos} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={arr.includes(pos)}
                          onChange={() => handlePositionChange(pos)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{pos}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <input name="password" type="password" placeholder="Новый пароль (если нужно сменить)" value={form.password} onChange={handleChange} className="w-full border p-2 rounded" />
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Сохранить</button>
            </form>
            {message && <div className="mt-4 text-center text-green-600">{message}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage; 