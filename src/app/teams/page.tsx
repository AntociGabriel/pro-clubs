"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

const platforms = [
  { value: "", label: "Все платформы" },
  { value: "PC", label: "PC" },
  { value: "PS", label: "PlayStation" },
  { value: "Xbox", label: "Xbox" },
];
const countries = [
  "Россия", "Украина", "Беларусь", "Казахстан", "Германия", "Франция", "Италия", "Испания", "Англия", "США", "Канада", "Бразилия", "Аргентина", "Португалия", "Польша", "Турция", "Китай", "Япония", "Южная Корея", "Австралия", "Нидерланды", "Швеция", "Норвегия", "Дания", "Швейцария", "Австрия", "Бельгия", "Чехия", "Сербия", "Хорватия", "Греция", "Румыния", "Венгрия", "Словакия", "Словения", "Болгария", "Грузия", "Армения", "Азербайджан", "Узбекистан", "Эстония", "Латвия", "Литва", "Финляндия", "Ирландия", "Шотландия", "Уэльс", "Исландия", "Мексика", "Колумбия", "Чили", "Перу", "Эквадор", "Уругвай", "Парагвай", "Венесуэла", "Коста-Рика", "Панама", "Ямайка", "Египет", "Марокко", "Тунис", "Алжир", "Камерун", "Сенегал", "Нигерия", "ЮАР", "Гана", "Кот-д'Ивуар", "Мали", "Ангола", "Замбия", "Зимбабве", "Катар", "Саудовская Аравия", "ОАЭ", "Иран", "Ирак", "Израиль", "Индия", "Индонезия", "Таиланд", "Вьетнам", "Малайзия", "Сингапур", "Филиппины", "Новая Зеландия", "Кипр", "Черногория", "Македония", "Албания", "Люксембург", "Лихтенштейн", "Монако", "Сан-Марино", "Андорра", "Мальта", "Босния и Герцеговина", "Косово", "Молдова", "Белиз", "Боливия", "Гватемала", "Гондурас", "Никарагуа", "Сальвадор", "Суринам", "Тринидад и Тобаго", "Барбадос", "Багамы", "Гаити", "Доминикана", "Куба", "Пуэрто-Рико", "Гренада", "Сент-Люсия", "Сент-Винсент и Гренадины", "Антигуа и Барбуда", "Сент-Китс и Невис", "Бруней", "Монголия", "Камбоджа", "Лаос", "Мьянма", "Непал", "Пакистан", "Бангладеш", "Шри-Ланка", "Мальдивы", "Бутан", "Афганистан", "Таджикистан", "Киргизия", "Туркмения", "Папуа — Новая Гвинея", "Фиджи", "Тонга", "Самоа", "Вануату", "Соломоновы Острова", "Тувалу", "Кирибати", "Маршалловы Острова", "Палау", "Микронезия"
];

type Team = {
  _id: string;
  name: string;
  logo?: string;
  captain: { name: string; image?: string };
  members: { name: string; image?: string }[];
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("");
  const [country, setCountry] = useState("");
  const mockCurrentUserId = "mock-user-id";
  const [myTeam, setMyTeam] = useState<Team | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("query", search);
    if (platform) params.append("platform", platform);
    if (country) params.append("country", country);
    fetch(`/api/teams/search?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setTeams(data.teams || []);
        setLoading(false);
      });
  }, [search, platform, country]);

  useEffect(() => {
    // Получить команду пользователя
    fetch(`/api/teams/search?member=${mockCurrentUserId}`)
      .then(res => res.text())
      .then(text => {
        if (!text) return null;
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      })
      .then(data => {
        setMyTeam(data && data.teams && data.teams.length > 0 ? data.teams[0] : null);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">Команды</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3"
        />
        <select
          value={platform}
          onChange={e => setPlatform(e.target.value)}
          className="border p-2 rounded w-full md:w-1/4"
        >
          {platforms.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <select
          value={country}
          onChange={e => setCountry(e.target.value)}
          className="border p-2 rounded w-full md:w-1/4"
        >
          <option value="">Все страны</option>
          {countries.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <div>Загрузка...</div>
      ) : teams.length === 0 ? (
        <div className="text-gray-500">Нет команд</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map(team => (
            <Link key={team._id} href={`/teams/${team._id}`} className="block bg-gray-50 rounded-xl shadow p-4 hover:shadow-lg transition">
              <div className="flex items-center gap-4 mb-2 relative">
                {team.logo ? (
                  <img src={team.logo} alt={team.name} className="w-14 h-14 rounded-full object-cover border" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-400">{team.name[0]}</div>
                )}
                {team.logo && (
                  <div className="absolute -left-3 -top-3 w-7 h-7 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-lg font-bold text-primary shadow">
                    {team.name[0]}
                  </div>
                )}
                <div>
                  <div className="font-bold text-lg">{team.name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span>Капитан: {team.captain?.name}</span>
                    {team.captain?.image && <img src={team.captain.image} alt="cap" className="w-6 h-6 rounded-full inline-block ml-1" />}
                  </div>
                </div>
              </div>
              <div className="flex -space-x-2 mt-2">
                {team.members.slice(0, 5).map((m, i) => (
                  <img key={i} src={m.image || "/avatar.svg"} alt={m.name} className="w-8 h-8 rounded-full border-2 border-white" />
                ))}
                {team.members.length > 5 && (
                  <span className="ml-2 text-xs text-gray-500">+{team.members.length - 5} ещё</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
      {myTeam && (
        <div className="mb-4">
          <a href={`/teams/${myTeam._id}`} className="inline-block bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition">Моя команда: {myTeam.name}</a>
        </div>
      )}
    </div>
  );
} 