'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signout } from '@/app/(auth)/actions'
import { LayoutDashboard, BookOpen, PenLine, Target, LogOut } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/exercises', label: 'Exercícios', icon: BookOpen },
  { href: '/essay', label: 'Redação', icon: PenLine },
  { href: '/simulations', label: 'Simulados', icon: Target },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-[260px] bg-black border-r border-zinc-800/60 min-h-screen fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 pb-4">
        <Image
          src="/logo-navbar.png"
          alt="Método IF"
          width={150}
          height={48}
          className="object-contain"
        />
      </div>

      {/* Divider */}
      <div className="mx-4 h-[1px] bg-zinc-900" />

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 relative ${
                isActive
                  ? 'bg-[#0A714E]/10 text-[#0A714E]'
                  : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-[50%] -translate-y-[50%] w-[3px] h-6 bg-[#0A714E] rounded-r-full" />
              )}
              <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-[#0A714E]' : 'text-zinc-600 group-hover:text-zinc-300'} transition-colors`} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="mx-4 h-[1px] bg-zinc-900" />
      <div className="p-3">
        <form action={signout}>
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-[#C90C0F] hover:bg-[#C90C0F]/5 transition-all"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Sair da Conta
          </button>
        </form>
      </div>
    </aside>
  )
}

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-zinc-800/60">
      <div className="flex justify-around items-center py-2 px-2 max-w-md mx-auto">
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[64px] ${
                isActive
                  ? 'text-[#0A714E]'
                  : 'text-zinc-600'
              }`}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {isActive && (
                  <div className="absolute -bottom-1.5 left-[50%] -translate-x-[50%] w-1 h-1 bg-[#0A714E] rounded-full" />
                )}
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest mt-0.5">{item.label}</span>
            </Link>
          )
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
