'use client'

import { useState } from 'react'
import { register } from '../actions'
import Link from 'next/link'
import { UserPlus, Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  async function handleSubmit(formData: FormData) {
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)
    setError(null)
    const result = await register(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">Criar Conta</h1>
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
          Junte-se a centenas de alunos aprovados
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-[#C90C0F]/10 border border-[#C90C0F]/20 rounded-xl px-4 py-3 text-[#C90C0F] text-xs font-bold uppercase">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="fullName" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            Nome Completo
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              placeholder="Como você quer ser chamado?"
              className="w-full pl-11 pr-4 py-3.5 bg-black border border-zinc-800 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:border-[#0A714E] transition-all text-sm font-medium"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="seu@email.com"
              className="w-full pl-11 pr-4 py-3.5 bg-black border border-zinc-800 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:border-[#0A714E] transition-all text-sm font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••"
                className="w-full pl-11 pr-11 py-3.5 bg-black border border-zinc-800 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:border-[#0A714E] transition-all text-sm font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              Confirmar Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="••••••"
                className="w-full pl-11 pr-11 py-3.5 bg-black border border-zinc-800 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:border-[#0A714E] transition-all text-sm font-medium"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-4 bg-[#0A714E] hover:bg-[#007A3F] text-white font-black rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-widest"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Criar minha conta
            </>
          )}
        </button>
      </form>

      <p className="text-center text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
        Já tem uma conta?{' '}
        <Link href="/login" className="text-[#0A714E] hover:text-[#007A3F] transition-colors">
          Fazer Login
        </Link>
      </p>
    </div>
  )
}
