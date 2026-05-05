'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-600/6 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[400px] h-[400px] bg-green-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Card */}
        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
          {/* Top glow line */}
          <div className="h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

          <div className="p-8 sm:p-10">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Image
                src="/logo-navbar.png"
                alt="Método IF"
                width={200}
                height={65}
                priority
                className="object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              />
            </div>

            {children}
          </div>
        </div>

        {/* Subtle glow under card */}
        <div className="absolute -bottom-4 left-[10%] right-[10%] h-8 bg-emerald-500/5 blur-2xl rounded-full" />
      </motion.div>
    </div>
  )
}
