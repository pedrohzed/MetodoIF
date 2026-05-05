'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Trophy, Medal, Crown, Target, MapPin, Search, Loader2, TrendingUp } from 'lucide-react'

type LeaderboardEntry = {
  id: string
  full_name: string
  xp_total: number
  campuses_courses: {
    campus_name: string
    course_name: string
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.4 },
  }),
}

export default function LeaderboardPage() {
  const supabase = useMemo(() => createClient(), [])
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  useEffect(() => {
    async function loadLeaderboard() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user?.id || null)

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, xp_total, campuses_courses(campus_name, course_name)')
        .order('xp_total', { ascending: false })
        .limit(50)

      if (data) {
        setEntries(data as unknown as LeaderboardEntry[])
      }
      setLoading(false)
    }
    loadLeaderboard()
  }, [supabase])

  const topThree = entries.slice(0, 3)
  const remaining = entries.slice(3)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-8 h-8 text-[#0A714E] animate-spin" />
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Carregando Ranking...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-[#0A714E]/10 border border-[#0A714E]/20 flex items-center justify-center shadow-lg">
          <Trophy className="w-8 h-8 text-[#0A714E]" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">Ranking Geral</h1>
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Os melhores estudantes do Método IF</p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-8">
        {/* Silver - Rank 2 */}
        {topThree[1] && (
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="order-2 md:order-1">
            <div className="relative group p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 text-center space-y-4 hover:border-zinc-700 transition-all">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-xl bg-zinc-400 flex items-center justify-center shadow-lg border-2 border-zinc-900">
                <Medal className="w-6 h-6 text-zinc-900" />
              </div>
              <div className="pt-2">
                <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">#2 Segundo</p>
                <p className="text-lg font-black text-white uppercase truncate">{topThree[1].full_name}</p>
                <div className="flex items-center justify-center gap-1.5 text-[9px] text-zinc-500 font-bold uppercase">
                   <MapPin className="w-3 h-3 text-[#C90C0F]" />
                   {topThree[1].campuses_courses?.campus_name}
                </div>
              </div>
              <div className="py-2 px-4 rounded-xl bg-zinc-800/50 inline-block">
                <p className="text-xl font-black text-zinc-300">{topThree[1].xp_total} XP</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Gold - Rank 1 */}
        {topThree[0] && (
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="order-1 md:order-2">
            <div className="relative group p-8 rounded-3xl bg-[#0A714E]/5 border-2 border-[#0A714E]/30 text-center space-y-5 shadow-[0_0_40px_rgba(10,113,78,0.1)] scale-105 md:scale-110">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-2xl bg-[#0A714E] flex items-center justify-center shadow-[0_0_20px_rgba(10,113,78,0.4)] border-4 border-zinc-950">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div className="pt-4">
                <p className="text-[10px] font-black text-[#0A714E] uppercase tracking-[0.2em] mb-1">#1 Líder</p>
                <p className="text-2xl font-black text-white uppercase truncate">{topThree[0].full_name}</p>
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 font-bold uppercase">
                   <Target className="w-3.5 h-3.5 text-[#C90C0F]" />
                   {topThree[0].campuses_courses?.course_name}
                </div>
              </div>
              <div className="py-2.5 px-6 rounded-2xl bg-[#0A714E] shadow-xl inline-block">
                <p className="text-2xl font-black text-white">{topThree[0].xp_total} XP</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bronze - Rank 3 */}
        {topThree[2] && (
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="order-3">
            <div className="relative group p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 text-center space-y-4 hover:border-zinc-700 transition-all">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-xl bg-orange-700 flex items-center justify-center shadow-lg border-2 border-zinc-900">
                <Medal className="w-6 h-6 text-zinc-900" />
              </div>
              <div className="pt-2">
                <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">#3 Terceiro</p>
                <p className="text-lg font-black text-white uppercase truncate">{topThree[2].full_name}</p>
                <div className="flex items-center justify-center gap-1.5 text-[9px] text-zinc-500 font-bold uppercase">
                   <MapPin className="w-3 h-3 text-[#C90C0F]" />
                   {topThree[2].campuses_courses?.campus_name}
                </div>
              </div>
              <div className="py-2 px-4 rounded-xl bg-zinc-800/50 inline-block">
                <p className="text-xl font-black text-orange-700">{topThree[2].xp_total} XP</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* List */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="pt-8">
         <div className="rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden">
            <div className="px-6 py-4 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between">
               <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Estudante</span>
               <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Pontuação (XP)</span>
            </div>
            <div className="divide-y divide-zinc-900">
               {remaining.map((entry, i) => (
                  <div 
                    key={entry.id} 
                    className={`flex items-center justify-between p-5 hover:bg-zinc-900/30 transition-colors ${entry.id === currentUser ? 'bg-[#0A714E]/5 border-l-2 border-[#0A714E]' : ''}`}
                  >
                     <div className="flex items-center gap-5">
                        <span className="w-8 text-xs font-black text-zinc-600">#{i + 4}</span>
                        <div>
                           <p className={`text-sm font-black uppercase tracking-tight ${entry.id === currentUser ? 'text-[#0A714E]' : 'text-white'}`}>
                             {entry.full_name}
                             {entry.id === currentUser && <span className="ml-2 px-2 py-0.5 rounded-full bg-[#0A714E] text-[8px] text-white">VOCÊ</span>}
                           </p>
                           <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-tight truncate max-w-[200px]">
                             {entry.campuses_courses?.campus_name} • {entry.campuses_courses?.course_name}
                           </p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-lg font-black text-white tracking-tighter">{entry.xp_total}</p>
                        <div className="flex items-center justify-end gap-1 text-[8px] text-[#0A714E] font-black">
                           <TrendingUp className="w-2.5 h-2.5" />
                           TOP {Math.round(((i + 4) / entries.length) * 100)}%
                        </div>
                     </div>
                  </div>
               ))}
               {entries.length === 0 && (
                 <div className="p-12 text-center">
                    <p className="text-zinc-600 text-sm font-bold uppercase tracking-widest">Nenhum recorde encontrado ainda.</p>
                 </div>
               )}
            </div>
         </div>
      </motion.div>
    </div>
  )
}
