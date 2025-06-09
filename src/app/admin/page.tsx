"use client";
import UsersAdminTable from './users';

export default function AdminPage() {
  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-xl shadow">
      <h1 className="text-3xl font-bold mb-6">Админ-панель</h1>
      <div className="text-gray-700 text-lg mb-4">
        Добро пожаловать в административную панель платформы!<br/>
        Здесь вы сможете управлять пользователями, турнирами, контентом и настройками сайта.
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="p-6 bg-gray-50 rounded shadow text-center">
          <div className="text-2xl mb-2">👤</div>
          <div className="font-semibold mb-1">Пользователи</div>
          <div className="text-sm text-gray-500">Просмотр, поиск, блокировка, редактирование</div>
        </div>
        <div className="p-6 bg-gray-50 rounded shadow text-center">
          <div className="text-2xl mb-2">🏆</div>
          <div className="font-semibold mb-1">Турниры</div>
          <div className="text-sm text-gray-500">Создание, управление, результаты</div>
        </div>
        <div className="p-6 bg-gray-50 rounded shadow text-center">
          <div className="text-2xl mb-2">⚙️</div>
          <div className="font-semibold mb-1">Настройки</div>
          <div className="text-sm text-gray-500">Общие параметры платформы</div>
        </div>
      </div>
      <UsersAdminTable />
    </div>
  );
} 