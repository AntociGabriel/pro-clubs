'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Главная', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12l9-9 9 9"/><path d="M9 21V9h6v12"/></svg>
  ) },
  { href: '/tournaments', label: 'Турниры', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 21h8M12 17v4M7 4h10v3a5 5 0 01-10 0V4z"/><circle cx="12" cy="10" r="2"/></svg>
  ) },
  { href: '/leaderboard', label: 'Рейтинг', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="6" y="14" width="3" height="6" rx="1"/><rect x="10.5" y="10" width="3" height="10" rx="1"/><rect x="15" y="12" width="3" height="8" rx="1"/></svg>
  ) },
  { href: '/community', label: 'Сообщество', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><circle cx="7" cy="10" r="2"/><circle cx="17" cy="10" r="2"/></svg>
  ) },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden lg:flex flex-col items-center bg-white border-r border-gray-200 w-20 min-h-full pt-20 shadow-sm">
      <nav className="flex flex-col gap-6 w-full mt-4">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 py-2 w-full text-gray-400 hover:text-primary transition-colors ${pathname === item.href ? 'text-primary border-l-4 border-primary bg-gray-50' : ''}`}
            title={item.label}
          >
            {item.icon}
            <span className="text-xs font-medium hidden xl:block">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
} 