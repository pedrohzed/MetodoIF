'use client'

import { Target, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function SimulationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Simulados Completos</h1>
          <p className="text-xs text-zinc-400">Simule o exame oficial do IFRN</p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/40 p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-zinc-800/40 p-4 text-center">
            <Clock className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-white">4 horas</p>
            <p className="text-[10px] text-zinc-500 mt-1">Duração</p>
          </div>
          <div className="rounded-xl bg-zinc-800/40 p-4 text-center">
            <Target className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-white">40</p>
            <p className="text-[10px] text-zinc-500 mt-1">Questões (20 PT + 20 MT)</p>
          </div>
          <div className="rounded-xl bg-zinc-800/40 p-4 text-center">
            <AlertCircle className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-white">1</p>
            <p className="text-[10px] text-zinc-500 mt-1">Redação</p>
          </div>
        </div>

        <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/15 p-4">
          <p className="text-xs text-zinc-400 leading-relaxed">
            O simulado reproduz as condições reais do Exame de Seleção: 20 questões de Português, 20 de Matemática e 1 Redação (Artigo de Opinião), com cronômetro de 4 horas. Você pode pausar e retomar a qualquer momento.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/exercises"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all hover:shadow-[0_0_24px_rgba(16,185,129,0.25)] text-sm"
          >
            <Target className="w-4 h-4" />
            Praticar Questões Primeiro
          </Link>
        </div>

        <p className="text-center text-xs text-zinc-600">
          Módulo de simulado completo com cronômetro em breve — pratique exercícios individuais enquanto isso.
        </p>
      </div>
    </div>
  )
}
