import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="relative bg-dark text-light/80 py-8 mt-12 border-t border-secondary/40 overflow-hidden">
      {/* SVG световой эффект */}
      <svg className="absolute left-1/2 bottom-0 -translate-x-1/2 z-0 pointer-events-none" width="800" height="120" viewBox="0 0 800 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="400" cy="60" rx="320" ry="40" fill="url(#footer_radial)" fillOpacity="0.18"/>
        <defs>
          <radialGradient id="footer_radial" cx="0" cy="0" r="1" gradientTransform="translate(400 60) scale(320 40)" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6C5CE7"/>
            <stop offset="1" stopColor="#00B894" stopOpacity="0"/>
          </radialGradient>
        </defs>
      </svg>
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-display font-bold text-white">FIFA FC</span>
          <span className="text-xs text-light/50 ml-2">© {new Date().getFullYear()} Все права защищены</span>
        </div>
        <div className="flex gap-6">
          <Link href="/" className="hover:text-primary transition-colors">Главная</Link>
          <Link href="/tournaments" className="hover:text-primary transition-colors">Турниры</Link>
          <Link href="/leaderboard" className="hover:text-primary transition-colors">Рейтинг</Link>
          <Link href="/community" className="hover:text-primary transition-colors">Сообщество</Link>
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-primary transition-colors" aria-label="Telegram"><svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M21 3L3.94 10.19c-.7.28-.69.67-.12.84l4.32 1.35 2.02 6.13c.27.77.52.96 1.06.96.43 0 .62-.2.85-.44l2.06-2.01 4.29 3.16c.79.44 1.36.21 1.56-.73l2.83-13.06c.28-1.28-.47-1.8-1.3-1.39z" fill="#6C5CE7"/></svg></a>
          <a href="#" className="hover:text-primary transition-colors" aria-label="VK"><svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12.02 17.5h-.04c-4.13 0-6.5-2.8-6.6-7.7h2.2c.07 3.2 1.47 4.5 2.57 4.8V9.8h2.1v2.7c1.1-.1 2.26-1.4 2.65-2.7h2.1c-.3 1.7-1.5 3-2.3 3.5.8.3 2.1 1.3 2.6 3.2h-2.2c-.36-1.1-1.25-2-2.5-2.1v2.1z" fill="#00B894"/></svg></a>
        </div>
      </div>
    </footer>
  )
} 