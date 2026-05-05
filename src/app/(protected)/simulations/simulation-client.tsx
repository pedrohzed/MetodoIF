'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Target, Clock, AlertCircle, Play, ChevronRight, 
  BookOpen, PenLine, Trophy, Timer, CheckCircle2, XCircle,
  Loader2, RotateCcw, ChevronLeft, Send, Save, Layout
} from 'lucide-react'

type Question = {
  id: string
  subject: string
  topic: string
  statement: string
  alternatives: { A: string; B: string; C: string; D: string }
  correct_alternative: string
}

export default function SimulationClient() {
  const supabase = createClient()
  const [phase, setPhase] = useState<'info' | 'active' | 'results'>('info')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [essayText, setEssayText] = useState('')
  const [timeLeft, setTimeLeft] = useState(14400) // 4 hours in seconds
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState({ score: 0, total: 0, correct: 0 })

  const startSimulation = async () => {
    setLoading(true)
    // Fetch 20 PT and 20 MT (capped at what we have for now)
    const { data: pt } = await supabase.from('questions').select('*').eq('subject', 'Português').limit(20)
    const { data: mt } = await supabase.from('questions').select('*').eq('subject', 'Matemática').limit(20)
    
    if (pt && mt) {
      setQuestions([...pt, ...mt] as Question[])
      setPhase('active')
    }
    setLoading(false)
  }

  // Timer logic
  useEffect(() => {
    if (phase !== 'active' || timeLeft <= 0) return
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [phase, timeLeft])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const finishSimulation = async () => {
    setLoading(true)
    let correctCount = 0
    questions.forEach(q => {
      if (answers[q.id] === q.correct_alternative) correctCount++
    })

    const score = Math.round((correctCount / questions.length) * 100)
    setResults({ score, total: questions.length, correct: correctCount })
    
    // Save results (logic simplified for now)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
       await supabase.from('submissions').insert(
         questions.map(q => ({
            profile_id: user.id,
            question_id: q.id,
            selected_alternative: answers[q.id] || null,
            is_correct: answers[q.id] === q.correct_alternative,
            xp_earned: answers[q.id] === q.correct_alternative ? 5 : 0 // Less XP per question in simulation
         }))
       )
       if (score >= 70) {
         await supabase.rpc('increment_xp', { user_id: user.id, amount: 100 }) // Bonus for completion
       }
    }

    setPhase('results')
    setLoading(false)
  }

  if (phase === 'active') {
    const q = questions[currentIdx]
    const isEssay = currentIdx === questions.length // After all questions

    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col">
        {/* Header Simulation */}
        <header className="px-6 py-4 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="px-3 py-1.5 rounded-lg bg-[#C90C0F]/10 border border-[#C90C0F]/20 flex items-center gap-2">
                 <Timer className="w-4 h-4 text-[#C90C0F]" />
                 <span className="text-sm font-black text-white font-mono">{formatTime(timeLeft)}</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                 <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Progresso:</span>
                 <div className="w-32 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0A714E]" style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }} />
                 </div>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              <button onClick={() => {}} className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
                <Save className="w-3.5 h-3.5" /> Pausar
              </button>
              <button 
                onClick={finishSimulation}
                className="px-6 py-2.5 bg-[#0A714E] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#007A3F] transition-all shadow-lg"
              >
                Finalizar
              </button>
           </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
           {/* Sidebar Navigation */}
           <aside className="w-72 border-r border-zinc-900 bg-black p-6 overflow-y-auto hidden lg:block">
              <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-6">Cartão de Respostas</h3>
              <div className="grid grid-cols-5 gap-2">
                 {questions.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIdx(i)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black border transition-all ${
                        currentIdx === i 
                          ? 'bg-[#0A714E] border-[#0A714E] text-white' 
                          : answers[questions[i].id] 
                            ? 'bg-zinc-800 border-zinc-700 text-zinc-300' 
                            : 'bg-transparent border-zinc-800 text-zinc-600 hover:border-zinc-700'
                      }`}
                    >
                      {i + 1}
                    </button>
                 ))}
              </div>
              <div className="mt-8 pt-8 border-t border-zinc-900">
                 <button 
                   onClick={() => setCurrentIdx(questions.length)}
                   className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                     currentIdx === questions.length ? 'bg-[#0A714E]/10 border-[#0A714E] text-[#0A714E]' : 'bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-700'
                   }`}
                 >
                   <PenLine className="w-4 h-4" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Redação</span>
                 </button>
              </div>
           </aside>

           {/* Main Content */}
           <main className="flex-1 overflow-y-auto p-6 lg:p-12 bg-black relative">
              <div className="max-w-3xl mx-auto space-y-8">
                 {currentIdx < questions.length ? (
                   <motion.div key={q.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 pb-20">
                      <div className="flex items-center gap-3">
                         <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-black text-zinc-500 uppercase tracking-tighter">
                           {q.subject} • Questão {currentIdx + 1}
                         </span>
                      </div>
                      
                      <p className="text-lg sm:text-xl text-zinc-200 leading-relaxed font-medium whitespace-pre-wrap">{q.statement}</p>

                      <div className="space-y-3">
                         {Object.entries(q.alternatives).map(([letter, text]) => (
                            <button
                              key={letter}
                              onClick={() => setAnswers({ ...answers, [q.id]: letter })}
                              className={`w-full flex items-start gap-4 p-5 rounded-2xl border transition-all text-left ${
                                answers[q.id] === letter
                                  ? 'bg-[#0A714E]/10 border-[#0A714E] text-white'
                                  : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                              }`}
                            >
                               <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                                 answers[q.id] === letter ? 'bg-[#0A714E] text-white' : 'bg-zinc-800 text-zinc-500'
                               }`}>
                                 {letter}
                               </span>
                               <span className="flex-1 mt-1">{text}</span>
                            </button>
                         ))}
                      </div>
                   </motion.div>
                 ) : (
                   <motion.div key="essay" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20">
                      <div className="flex items-center gap-3">
                         <span className="px-3 py-1 rounded-full bg-[#C90C0F]/10 border border-[#C90C0F]/20 text-[10px] font-black text-[#C90C0F] uppercase tracking-tighter">
                           Prova III • Redação
                         </span>
                      </div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tight">Artigo de Opinião</h2>
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
                         <p className="text-sm text-zinc-400 leading-relaxed italic">
                           "Discorra sobre os desafios da inclusão digital para os jovens moradores de comunidades quilombolas no interior do Rio Grande do Norte."
                         </p>
                      </div>
                      <textarea
                        value={essayText}
                        onChange={(e) => setEssayText(e.target.value)}
                        placeholder="Inicie sua redação aqui..."
                        className="w-full min-h-[500px] p-8 bg-zinc-950 border border-zinc-800 rounded-3xl text-zinc-200 focus:outline-none focus:border-[#0A714E] transition-all resize-none leading-relaxed font-medium"
                      />
                   </motion.div>
                 )}
              </div>

              {/* Bottom Navigation */}
              <div className="fixed bottom-0 left-0 lg:left-72 right-0 p-4 border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between">
                 <button
                   disabled={currentIdx === 0}
                   onClick={() => setCurrentIdx(prev => prev - 1)}
                   className="flex items-center gap-2 px-6 py-3 text-zinc-500 font-bold hover:text-white disabled:opacity-0 transition-all uppercase tracking-widest text-[10px]"
                 >
                    <ChevronLeft className="w-4 h-4" /> Anterior
                 </button>
                 <button
                   onClick={() => {
                     if (currentIdx < questions.length) setCurrentIdx(prev => prev + 1)
                     else finishSimulation()
                   }}
                   className="flex items-center gap-2 px-10 py-3 bg-white text-black font-black rounded-xl hover:bg-zinc-200 transition-all uppercase tracking-widest text-[10px]"
                 >
                    {currentIdx < questions.length ? 'Próxima' : 'Enviar Tudo'} <ChevronRight className="w-4 h-4" />
                 </button>
              </div>
           </main>
        </div>
      </div>
    )
  }

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
          <motion.div key="info" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { icon: Clock, label: 'Duração', value: '4 Horas' },
                   { icon: Target, label: 'Questões', value: '40 Total' },
                   { icon: PenLine, label: 'Redação', value: '1 Texto' }
                 ].map((item) => (
                   <div key={item.label} className="rounded-2xl bg-black border border-zinc-800 p-5 text-center">
                      <item.icon className="w-6 h-6 text-[#0A714E] mx-auto mb-3" />
                      <p className="text-2xl font-black text-white">{item.value}</p>
                      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">{item.label}</p>
                   </div>
                 ))}
               </div>

               <div className="space-y-4">
                  <div className="flex items-center gap-2">
                     <div className="w-1 h-4 bg-[#C90C0F] rounded-full" />
                     <h3 className="text-sm font-black text-white uppercase tracking-wider">Instruções Importantes</h3>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Este simulado reproduz as condições exatas do IFRN. Ao clicar em iniciar, o tempo começará a contar. Você pode navegar entre as questões e a redação usando o menu lateral.
                  </p>
               </div>

               <button
                 onClick={startSimulation}
                 disabled={loading}
                 className="w-full flex items-center justify-center gap-2 py-5 bg-[#0A714E] hover:bg-[#007A3F] text-white font-black rounded-2xl transition-all shadow-xl uppercase tracking-widest text-sm"
               >
                 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-4 fill-current" />}
                 Iniciar Exame Oficial
               </button>
            </div>
          </motion.div>
        )}

        {phase === 'results' && (
           <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto">
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center space-y-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#0A714E]" />
                <div className="w-20 h-20 rounded-2xl bg-[#0A714E]/10 border border-[#0A714E]/20 flex items-center justify-center mx-auto">
                  <Trophy className="w-10 h-10 text-[#0A714E]" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-white tracking-tight uppercase">Simulado Finalizado</h2>
                  <p className="text-zinc-500 text-sm font-medium">Sua nota foi computada no ranking geral.</p>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-3xl font-black text-white">{results.correct}</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">Acertos</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#0A714E]/5 border border-[#0A714E]/10">
                    <p className="text-3xl font-black text-[#0A714E]">{results.score}%</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">Aproveitamento</p>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-white">{results.score >= 70 ? '+100' : '0'}</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">XP Bônus</p>
                  </div>
                </div>
                <button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full py-4 bg-[#0A714E] text-white font-black rounded-2xl uppercase tracking-widest text-sm"
                >
                  Voltar ao Dashboard
                </button>
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
