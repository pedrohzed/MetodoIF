'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import {
  TrendingUp, BookOpen, PenLine, Target, Zap, Trophy, Users,
  GraduationCap, ArrowRight, Flame, MapPin
} from 'lucide-react'

type Profile = {
  full_name: string
  xp_total: number
  campuses_courses: {
    campus_name: string
    course_name: string
    shift: string
    competition_rate: number
    total_slots: number
    total_candidates: number
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function DashboardClient() {
  const supabase = useMemo(() => createClient(), [])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [totalSubs, setTotalSubs] = useState(0)
  const [correctSubs, setCorrectSubs] = useState(0)
  const [totalEssays, setTotalEssays] = useState(0)

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: p } = await supabase
      .from('profiles')
      .select('*, campuses_courses(*)')
      .eq('id', user.id)
      .single()
    if (p) setProfile(p as unknown as Profile)

    const { count: ts } = await supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('profile_id', user.id)
    const { count: cs } = await supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('profile_id', user.id).eq('is_correct', true)
    const { count: te } = await supabase.from('essays').select('*', { count: 'exact', head: true }).eq('profile_id', user.id)

    setTotalSubs(ts || 0)
    setCorrectSubs(cs || 0)
    setTotalEssays(te || 0)
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  if (!profile) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-[#0A714E]/30 border-t-[#0A714E] rounded-full animate-spin" />
    </div>
  )

  const campus = profile.campuses_courses
  const accuracy = totalSubs ? Math.round((correctSubs / totalSubs) * 100) : 0
  const xp = profile.xp_total || 0
  const level = Math.floor(xp / 100) + 1
  const xpInLevel = xp % 100

  const chartData = totalSubs > 0
    ? [
        { name: 'Corretas', value: correctSubs },
        { name: 'Incorretas', value: totalSubs - correctSubs },
      ]
    : [{ name: 'Vazio', value: 1 }]

  const COLORS = totalSubs > 0 ? ['#0A714E', '#1a1a1a'] : ['#1a1a1a']

  const quickActions = [
    { href: '/exercises', icon: BookOpen, title: 'Exercícios', desc: 'Resolver questões por assunto', color: '#0A714E' },
    { href: '/essay', icon: PenLine, title: 'Redação', desc: 'Escrever artigo de opinião', color: '#007A3F' },
    { href: '/simulations', icon: Target, title: 'Simulado', desc: 'Simular prova de 4 horas', color: '#0A714E' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white uppercase">
            Olá, <span className="text-[#0A714E]">{profile.full_name || 'Estudante'}</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1 flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#C90C0F]" />
            {campus?.campus_name} — {campus?.course_name} ({campus?.shift})
          </p>
        </div>
        {/* XP Badge */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-zinc-800/60 bg-zinc-900/40">
          <div className="relative w-11 h-11">
            <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1a1a1a" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#0A714E" strokeWidth="3" strokeDasharray={`${xpInLevel}, 100`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-[#0A714E]">{level}</span>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#C90C0F]" />
              <span className="text-xs font-black text-white">{xp} XP</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">Nível {level} • {100 - xpInLevel} XP restante</p>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: TrendingUp, label: 'Concorrência', value: campus?.competition_rate?.toFixed(2) || '—', sub: 'candidatos/vaga', highlight: true },
          { icon: BookOpen, label: 'Questões', value: String(totalSubs), sub: `${accuracy}% acertos`, highlight: false },
          { icon: PenLine, label: 'Redações', value: String(totalEssays), sub: 'escritas', highlight: false },
          { icon: Zap, label: 'XP Total', value: String(xp), sub: `Nível ${level}`, highlight: false },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i + 1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className={`rounded-2xl p-4 border transition-all ${
              stat.highlight
                ? 'bg-[#0A714E]/5 border-[#0A714E]/20'
                : 'bg-zinc-900/40 border-zinc-800/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-2.5">
              <stat.icon className={`w-4 h-4 ${stat.highlight ? 'text-[#0A714E]' : 'text-zinc-500'}`} />
              <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{stat.label}</span>
            </div>
            <p className={`text-2xl font-black tracking-tighter ${stat.highlight ? 'text-[#0A714E]' : 'text-white'}`}>{stat.value}</p>
            <p className="text-[11px] text-zinc-500 font-medium">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart + Competition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Donut chart */}
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className="rounded-2xl border border-zinc-800/50 bg-zinc-900/40 p-6">
          <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
            <Target className="w-4 h-4 text-[#0A714E]" />
            Desempenho nas Questões
          </h3>
          <div className="flex items-center gap-6">
            <div className="w-28 h-28">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={32} outerRadius={50} paddingAngle={totalSubs > 0 ? 4 : 0} dataKey="value" strokeWidth={0}>
                    {chartData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0A714E]" />
                <span className="text-xs text-zinc-400 font-medium">Corretas: <span className="text-white font-bold">{correctSubs}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                <span className="text-xs text-zinc-400 font-medium">Incorretas: <span className="text-white font-bold">{totalSubs - correctSubs}</span></span>
              </div>
              <div className="text-xs text-zinc-500 pt-1 font-bold">
                Taxa de acerto: <span className="text-[#0A714E]">{accuracy}%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Competition card */}
        <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible" className="rounded-2xl border border-zinc-800/50 bg-zinc-900/40 p-6">
          <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
            <Trophy className="w-4 h-4 text-[#C90C0F]" />
            Panorama da Concorrência
          </h3>
          {campus && (
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-zinc-800/40 p-3 text-center border border-zinc-800">
                <GraduationCap className="w-4 h-4 text-zinc-500 mx-auto mb-1.5" />
                <p className="text-xl font-black text-white">{campus.total_slots}</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">Vagas</p>
              </div>
              <div className="rounded-xl bg-zinc-800/40 p-3 text-center border border-zinc-800">
                <Users className="w-4 h-4 text-zinc-500 mx-auto mb-1.5" />
                <p className="text-xl font-black text-white">{campus.total_candidates}</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">Candidatos</p>
              </div>
              <div className="rounded-xl bg-[#0A714E]/10 border border-[#0A714E]/20 p-3 text-center">
                <TrendingUp className="w-4 h-4 text-[#0A714E] mx-auto mb-1.5" />
                <p className="text-xl font-black text-[#0A714E]">{campus.competition_rate.toFixed(2)}</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">C/Vaga</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible">
        <h3 className="text-[10px] font-black text-zinc-500 mb-3 uppercase tracking-widest">Ações Rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map(action => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-center gap-4 p-4 rounded-2xl border border-zinc-800/50 bg-zinc-900/40 hover:border-[#0A714E]/40 hover:bg-zinc-900/60 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 group-hover:bg-[#0A714E] group-hover:border-[#0A714E] transition-all duration-300">
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white uppercase tracking-tight">{action.title}</p>
                <p className="text-[10px] text-zinc-500 font-medium truncate">{action.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-700 group-hover:text-[#0A714E] group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
