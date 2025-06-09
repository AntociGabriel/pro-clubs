"use client";
import React, { useEffect, useState } from 'react';

interface AdminUser {
  email: string;
  name?: string;
  image?: string;
  platform?: string;
  country?: string;
  eaId?: string;
  positions: string[];
}

function filterUsers(users: AdminUser[], query: string): AdminUser[] {
  if (!query) return users;
  const q = query.toLowerCase();
  return users.filter(u =>
    (u.email && u.email.toLowerCase().includes(q)) ||
    (u.name && u.name.toLowerCase().includes(q)) ||
    (u.country && u.country.toLowerCase().includes(q))
  );
}

const countries = [
  "Россия", "Украина", "Беларусь", "Казахстан", "Германия", "Франция", "Италия", "Испания", "Англия", "США", "Канада", "Бразилия", "Аргентина", "Португалия", "Польша", "Турция", "Китай", "Япония", "Южная Корея", "Австралия", "Нидерланды", "Швеция", "Норвегия", "Дания", "Швейцария", "Австрия", "Бельгия", "Чехия", "Сербия", "Хорватия", "Греция", "Румыния", "Венгрия", "Словакия", "Словения", "Болгария", "Грузия", "Армения", "Азербайджан", "Узбекистан", "Эстония", "Латвия", "Литва", "Финляндия", "Ирландия", "Шотландия", "Уэльс", "Исландия", "Мексика", "Колумбия", "Чили", "Перу", "Эквадор", "Уругвай", "Парагвай", "Венесуэла", "Коста-Рика", "Панама", "Ямайка", "Египет", "Марокко", "Тунис", "Алжир", "Камерун", "Сенегал", "Нигерия", "ЮАР", "Гана", "Кот-д'Ивуар", "Мали", "Ангола", "Замбия", "Зимбабве", "Катар", "Саудовская Аравия", "ОАЭ", "Иран", "Ирак", "Израиль", "Индия", "Индонезия", "Таиланд", "Вьетнам", "Малайзия", "Сингапур", "Филиппины", "Новая Зеландия", "Кипр", "Черногория", "Македония", "Албания", "Люксембург", "Лихтенштейн", "Монако", "Сан-Марино", "Андорра", "Мальта", "Босния и Герцеговина", "Косово", "Молдова", "Белиз", "Боливия", "Гватемала", "Гондурас", "Никарагуа", "Сальвадор", "Суринам", "Тринидад и Тобаго", "Барбадос", "Багамы", "Гаити", "Доминикана", "Куба", "Пуэрто-Рико", "Гренада", "Сент-Люсия", "Сент-Винсент и Гренадины", "Антигуа и Барбуда", "Сент-Китс и Невис", "Бруней", "Монголия", "Камбоджа", "Лаос", "Мьянма", "Непал", "Пакистан", "Бангладеш", "Шри-Ланка", "Мальдивы", "Бутан", "Афганистан", "Таджикистан", "Киргизия", "Туркмения", "Папуа — Новая Гвинея", "Фиджи", "Тонга", "Самоа", "Вануату", "Соломоновы Острова", "Тувалу", "Кирибати", "Маршалловы Острова", "Палау", "Микронезия"
];
const positionsList = [
  "GK", "LB", "CB", "RB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "ST", "CF"
];
const platforms = [
  { value: "PC", label: "PC" },
  { value: "PS", label: "PlayStation" },
  { value: "Xbox", label: "Xbox" },
];

export default function UsersAdminTable() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [blockUser, setBlockUser] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Ошибка загрузки пользователей');
        setLoading(false);
      });
  }, []);

  const filtered = filterUsers(users, search);

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8">
      <h2 className="text-xl font-bold mb-4">Пользователи</h2>
      <input
        type="text"
        placeholder="Поиск по email, никнейму или стране..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4 w-full border p-2 rounded"
      />
      {loading && <div>Загрузка...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Логин</th>
                <th className="p-2 border">Страна</th>
                <th className="p-2 border">Платформа</th>
                <th className="p-2 border">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u: AdminUser) => (
                <tr key={u.email} className="hover:bg-gray-100">
                  <td className="p-2 border">{u.email}</td>
                  <td className="p-2 border">{u.name || '-'}</td>
                  <td className="p-2 border">{u.country || '-'}</td>
                  <td className="p-2 border">{u.platform || '-'}</td>
                  <td className="p-2 border text-center">
                    <button className="text-blue-600 hover:underline mr-2" onClick={() => setEditUser({ ...u, positions: u.positions || [] })}>Редактировать</button>
                    <button className="text-red-600 hover:underline" onClick={() => setBlockUser(u)}>Заблокировать</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Модальное окно редактирования пользователя */}
      {editUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setEditUser(null)} className="absolute top-3 right-3 text-gray-400 hover:text-primary text-2xl">×</button>
            <h3 className="text-xl font-bold mb-4">Редактирование пользователя</h3>
            <form
              onSubmit={async e => {
                e.preventDefault();
                setSaving(true);
                setSaveError("");
                let imageUrl = editUser.image || "";
                if (avatarFile) {
                  const data = new FormData();
                  data.append("file", avatarFile);
                  data.append("upload_preset", "YOUR_UNSIGNED_PRESET"); // заменить на ваш unsigned preset
                  const res = await fetch("https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload", {
                    method: "POST",
                    body: data,
                  });
                  const img = await res.json();
                  imageUrl = img.secure_url;
                }
                try {
                  const res = await fetch("/api/admin/users", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      ...editUser,
                      image: imageUrl,
                      positions: editUser.positions,
                    }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || "Ошибка обновления");
                  setUsers(users => users.map(u => u.email === editUser.email ? data.user : u));
                  setEditUser(null);
                  setAvatarFile(null);
                  setAvatarPreview("");
                } catch (err: any) {
                  setSaveError(err.message || "Ошибка обновления");
                } finally {
                  setSaving(false);
                }
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" value={editUser.email} disabled className="w-full border p-2 rounded bg-gray-100" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Логин (name)</label>
                <input
                  type="text"
                  value={editUser.name || ''}
                  onChange={e => setEditUser({ ...editUser, name: e.target.value })}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">EA ID</label>
                <input
                  type="text"
                  value={editUser.eaId || ''}
                  onChange={e => setEditUser({ ...editUser, eaId: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Страна</label>
                <select
                  value={editUser.country || ''}
                  onChange={e => setEditUser({ ...editUser, country: e.target.value })}
                  className="w-full border p-2 rounded"
                  required
                >
                  <option value="">Страна</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Платформа</label>
                <select
                  value={editUser.platform || ''}
                  onChange={e => setEditUser({ ...editUser, platform: e.target.value })}
                  className="w-full border p-2 rounded"
                  required
                >
                  <option value="">Платформа</option>
                  {platforms.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Аватар</label>
                {avatarPreview || editUser.image ? (
                  <img src={avatarPreview || editUser.image} alt="avatar" className="w-20 h-20 rounded-full object-cover mb-2" />
                ) : null}
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    setAvatarFile(file || null);
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = ev => setAvatarPreview(ev.target?.result as string);
                      reader.readAsDataURL(file);
                    } else {
                      setAvatarPreview("");
                    }
                  }}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Позиции</label>
                <div className="flex flex-wrap gap-2">
                  {positionsList.map(pos => (
                    <label key={pos} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={editUser.positions.includes(pos)}
                        onChange={() => {
                          setEditUser(prev => {
                            if (!prev) return null;
                            return {
                              ...prev,
                              positions: prev.positions.includes(pos)
                                ? prev.positions.filter(p => p !== pos)
                                : [...prev.positions, pos],
                            };
                          });
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{pos}</span>
                    </label>
                  ))}
                </div>
              </div>
              {saveError && <div className="text-red-600 mb-2">{saveError}</div>}
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded mt-2" disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить'}</button>
              <button type="button" onClick={() => setEditUser(null)} className="w-full bg-gray-200 text-gray-700 py-2 rounded mt-2">Отмена</button>
            </form>
          </div>
        </div>
      )}
      {/* Модальное окно блокировки пользователя */}
      {blockUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm relative">
            <button onClick={() => setBlockUser(null)} className="absolute top-3 right-3 text-gray-400 hover:text-primary text-2xl">×</button>
            <h3 className="text-xl font-bold mb-4">Заблокировать пользователя?</h3>
            <div className="mb-4">Вы уверены, что хотите заблокировать <b>{blockUser.email}</b>?</div>
            <div className="flex gap-4">
              <button onClick={() => setBlockUser(null)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded">Отмена</button>
              <button onClick={() => {/* TODO: реализовать блокировку */}} className="flex-1 bg-red-600 text-white py-2 rounded">Заблокировать</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 