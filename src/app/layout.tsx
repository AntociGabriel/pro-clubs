'use client'

import { Inter, Orbitron } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Sidebar from '@/components/Sidebar'
import { useState, useEffect } from 'react'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    typeof window !== 'undefined' && window.localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <html lang="ru">
      <body className={`${inter.variable} ${orbitron.variable} font-sans bg-gray-50`}>
        <Navbar />
        <div className="flex min-h-screen pt-16">
          <Sidebar />
          <div className="flex-1">
            {children}
          </div>
        </div>
        <Footer />
      </body>
    </html>
  )
} 