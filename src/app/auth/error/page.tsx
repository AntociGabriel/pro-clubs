'use client';

import React from 'react';
import Link from 'next/link';

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Произошла ошибка
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            При попытке входа произошла ошибка. Пожалуйста, попробуйте снова.
          </p>
        </div>
        <div className="text-center">
          <Link
            href="/auth"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Вернуться на страницу входа
          </Link>
        </div>
      </div>
    </div>
  );
} 