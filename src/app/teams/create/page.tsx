"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// TODO: заменить на реального пользователя
const mockCurrentUserId = "mock-user-id";

export default function CreateTeamPage() {
  const [name, setName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [myTeam, setMyTeam] = useState<any>(null);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLogoFile(file || null);
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setLogoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setLogoPreview("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!userEmail) {
      setError("Не удалось определить email пользователя. Войдите в аккаунт.");
      setLoading(false);
      return;
    }
    let logoUrl = "";
    if (logoFile) {
      const data = new FormData();
      data.append("file", logoFile);
      data.append("upload_preset", "YOUR_UNSIGNED_PRESET"); // заменить на ваш unsigned preset
      const res = await fetch("https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload", {
        method: "POST",
        body: data,
      });
      const img = await res.json();
      logoUrl = img.secure_url;
    }
    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, logo: logoUrl, captainEmail: userEmail }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      router.push(`/teams/${data.team._id}`);
    } else {
      setError(data.error || "Ошибка создания команды");
    }
  };

  useEffect(() => {
    setUserEmail(typeof window !== 'undefined' ? window.localStorage.getItem('user_email') : null);
    setLoadingTeam(true);
    fetch(`/api/teams/search?member=${mockCurrentUserId}`)
      .then(async res => {
        if (!res.ok) return {};
        const text = await res.text();
        if (!text) return {};
        try { return JSON.parse(text); } catch { return {}; }
      })
      .then(data => {
        setMyTeam(data.teams && data.teams.length > 0 ? data.teams[0] : null);
        setLoadingTeam(false);
      })
      .catch(() => {
        setMyTeam(null);
        setLoadingTeam(false);
      });
  }, []);

  if (loadingTeam) return <div className="max-w-md mx-auto mt-10">Загрузка...</div>;
  if (myTeam) return <div className="max-w-md mx-auto mt-10 bg-white rounded-xl shadow p-6 text-center text-blue-700 font-semibold">Вы уже состоите в команде <a href={`/teams/${myTeam._id}`} className="underline">{myTeam.name}</a>. Создать новую команду нельзя.</div>;

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-xl shadow p-6">
      <h1 className="text-2xl font-bold mb-6">Создать команду</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Название команды</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Логотип</label>
          {logoPreview && <img src={logoPreview} alt="logo" className="w-20 h-20 rounded-full object-cover mb-2" />}
          <input type="file" accept="image/*" onChange={handleLogoChange} className="w-full border p-2 rounded" />
        </div>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded" disabled={loading}>
          {loading ? "Создание..." : "Создать команду"}
        </button>
      </form>
    </div>
  );
} 