"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Вход выполнен успешно!');
      window.localStorage.setItem('user_email', form.email);
      setTimeout(() => {
        router.push('/');
      }, 1000);
      setForm({ email: '', password: '' });
    } else {
      setMessage(data.error || 'Ошибка входа');
    }
  };

  if (isAuth) {
    return <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow text-center text-green-700 font-semibold">Вы уже авторизованы</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Вход</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="w-full border p-2 rounded" />
        <input name="password" type="password" placeholder="Пароль" value={form.password} onChange={handleChange} required className="w-full border p-2 rounded" />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Войти</button>
      </form>
      {message && <div className="mt-4 text-center text-red-600">{message}</div>}
    </div>
  );
};

export default LoginPage; 