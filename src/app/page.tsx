'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Sparkles, Target, Zap, Trophy, CheckCircle2, ShieldCheck, PlayCircle } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6 },
  }),
}

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#0A714E]/30 selection:text-white overflow-x-hidden">
      {/* Subtle Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#0A714E15,transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,#C90C0F08,transparent_40%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Navbar */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex items-center justify-between px-6 lg:px-16 py-4"
      >
        <Image src="/logo-navbar.png" alt="Método IF" width={160} height={50} className="object-contain" priority />
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:block text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
            Acessar Plataforma
          </Link>
          <Link
            href="/register"
            className="px-6 py-2.5 bg-zinc-900 border border-zinc-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-all shadow-xl"
          >
            Matricule-se
          </Link>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-12 lg:pt-24 pb-20">
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-[#0A714E]/10 border border-[#0A714E]/20 text-[#0A714E] text-[10px] font-black tracking-widest uppercase"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Edital 2026 • Vagas Abertas
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95] max-w-4xl text-white uppercase"
        >
          DOMINE O IFRN COM O <span className="text-[#0A714E]">MÉTODO IF</span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-6 text-sm md:text-base text-zinc-500 max-w-2xl leading-relaxed font-medium"
        >
          A única plataforma gamificada e inteligente desenhada exclusivamente para garantir sua aprovação no Ensino Médio Técnico do IFRN. 
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <Link
            href="/register"
            className="group relative flex items-center gap-2 px-10 py-5 bg-[#0A714E] text-white font-black rounded-2xl transition-all hover:scale-105 shadow-[0_0_30px_rgba(10,113,78,0.25)] uppercase tracking-widest text-xs"
          >
            Começar Agora
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <button className="flex items-center gap-2 px-8 py-5 text-zinc-400 font-black hover:text-white transition-all uppercase tracking-widest text-xs">
            <PlayCircle className="w-5 h-5 text-[#C90C0F]" />
            Ver demonstração
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8 w-full max-w-5xl"
        >
          {[
            { label: 'Aprovados', value: '450+', icon: Trophy, color: '#0A714E' },
            { label: 'Questões', value: '5.000+', icon: Target, color: '#C90C0F' },
            { label: 'Simulados', value: '120+', icon: Zap, color: '#0A714E' },
            { label: 'Nota Média', value: '870', icon: ShieldCheck, color: '#C90C0F' },
          ].map((stat) => (
            <div key={stat.label} className="p-6 rounded-2xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm group hover:border-[#0A714E]/30 transition-all">
              <stat.icon className="w-5 h-5 mx-auto mb-4" style={{ color: stat.color }} />
              <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Trust Section */}
      <section className="relative z-10 py-24 px-6 lg:px-16 border-t border-zinc-900 bg-black">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl space-y-6">
               <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase leading-tight">
                 POR QUE SOMOS <span className="text-[#0A714E]">O MELHOR</span> MÉTODO?
               </h2>
               <div className="space-y-4">
                 {[
                   'Banco de questões atualizado semanalmente',
                   'Correção de redação com feedback detalhado',
                   'Ranking em tempo real entre todos os alunos',
                   'Simulados idênticos à prova oficial do IFRN'
                 ].map(item => (
                   <div key={item} className="flex items-center gap-3">
                     <CheckCircle2 className="w-5 h-5 text-[#0A714E] shrink-0" />
                     <span className="text-sm font-bold text-zinc-400 uppercase tracking-tight">{item}</span>
                   </div>
                 ))}
               </div>
            </div>
            <div className="relative w-full max-w-sm aspect-square">
               <div className="absolute inset-0 bg-[#0A714E]/20 blur-[80px] rounded-full" />
               <div className="relative z-10 h-full rounded-3xl border border-zinc-800 bg-zinc-900/40 p-1 flex items-center justify-center overflow-hidden">
                  <div className="text-center p-8 space-y-4">
                     <div className="w-16 h-16 rounded-2xl bg-[#0A714E] flex items-center justify-center mx-auto shadow-xl">
                        <Zap className="w-8 h-8 text-white" />
                     </div>
                     <p className="text-xl font-black text-white uppercase">SISTEMA INTELIGENTE</p>
                     <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                       Nossa plataforma identifica seus pontos fracos e cria um plano de estudos personalizado para sua aprovação.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 lg:px-16 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <Image src="/logo-navbar.png" alt="Método IF" width={120} height={40} className="object-contain opacity-50" />
          <div className="flex gap-8">
            <Link href="#" className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-white">Termos</Link>
            <Link href="#" className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-white">Privacidade</Link>
            <Link href="#" className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-white">Suporte</Link>
          </div>
          <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">© 2025 MÉTODO IF. TODOS OS DIREITOS RESERVADOS.</p>
        </div>
      </footer>
    </div>
  )
}
