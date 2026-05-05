'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Target, Clock, AlertCircle, Play, ChevronRight, 
  BookOpen, PenLine, Trophy, Timer, CheckCircle2, XCircle,
  Loader2, RotateCcw
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
}

export default function SimulationsPage() {
  const [phase, setPhase] = useState<'info' | 'active' | 'results'>('info')
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#0A714E] flex items-center justify-center shadow-lg border border-[#007A3F]/30">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">Simulados Completos</h1>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Exame de Seleção Oficial IFRN</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'info' && (
          <motion.div
            key="info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 space-y-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#0A714E]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { icon: Clock, label: 'Duração', value: '4 Horas', sub: 'Tempo oficial IFRN' },
                   { icon: Target, label: 'Questões', value: '40 Total', sub: '20 PT + 20 MT' },
                   { icon: PenLine, label: 'Redação', value: '1 Texto', sub: 'Artigo de Opinião' }
                 ].map((item, i) => (
                   <div key={item.label} className="rounded-2xl bg-black border border-zinc-800 p-5 text-center group hover:border-[#0A714E]/30 transition-all">
                      <item.icon className="w-6 h-6 text-[#0A714E] mx-auto mb-3" />
                      <p className="text-2xl font-black text-white">{item.value}</p>
                      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">{item.label}</p>
                      <p className="text-[9px] text-[#0A714E] font-bold mt-2 uppercase">{item.sub}</p>
                   </div>
                 ))}
               </div>

               <div className="space-y-4">
                  <div className="flex items-center gap-2">
                     <div className="w-1 h-4 bg-[#C90C0F] rounded-full" />
                     <h3 className="text-sm font-black text-white uppercase tracking-wider">Regras do Simulado</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {[
                       'O cronômetro não para ao fechar a página',
                       'Você deve anexar a redação ao final',
                       'Questões não respondidas contam como erro',
                       'O resultado gera XP para o Ranking'
                     ].map(rule => (
                       <div key={rule} className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-zinc-800/50">
                          <CheckCircle2 className="w-4 h-4 text-[#0A714E]" />
                          <span className="text-[11px] text-zinc-400 font-medium uppercase tracking-tight">{rule}</span>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="pt-4 flex flex-col sm:flex-row gap-4">
                  <button className="flex-1 flex items-center justify-center gap-2 py-4.5 bg-[#0A714E] hover:bg-[#007A3F] text-white font-black rounded-2xl transition-all shadow-xl hover:shadow-[#0A714E]/20 uppercase tracking-widest text-sm">
                     <Play className="w-4 h-4 fill-current" />
                     Iniciar Simulado Agora
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-4.5 bg-zinc-900 border border-zinc-800 text-zinc-400 font-black rounded-2xl transition-all hover:bg-zinc-800 uppercase tracking-widest text-sm">
                     Ver Histórico
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer hint */}
      <p className="text-center text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
        Ambiente de alta performance • Método IF v2.0
      </p>
    </div>
  )
}
