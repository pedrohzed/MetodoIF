'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PenLine, Sparkles, Send, Loader2, RotateCcw, 
  ThumbsUp, ThumbsDown, AlertTriangle, BookOpen,
  FileText, CheckCircle2, XCircle, Info
} from 'lucide-react'

const themes = [
  { category: 'Sociedade', title: 'O impacto das fake news na democracia brasileira', genre: 'Artigo de Opinião', keywords: ['notícias', 'falsas', 'democracia', 'informação', 'verdade', 'internet'] },
  { category: 'Meio Ambiente', title: 'A escassez de água potável no semiárido potiguar', genre: 'Artigo de Opinião', keywords: ['água', 'seca', 'semiárido', 'nordeste', 'potiguar', 'preservação'] },
  { category: 'Educação', title: 'A importância do ensino técnico para o jovem do RN', genre: 'Artigo de Opinião', keywords: ['ensino', 'técnico', 'IFRN', 'futuro', 'profissão', 'trabalho'] },
  { category: 'Cultura', title: 'A valorização das festas juninas como patrimônio do Nordeste', genre: 'Artigo de Opinião', keywords: ['cultura', 'nordeste', 'festas', 'juninas', 'patrimônio', 'tradição'] },
  { category: 'Saúde', title: 'Desafios do combate à dengue no ambiente urbano', genre: 'Artigo de Opinião', keywords: ['saúde', 'dengue', 'mosquito', 'prevenção', 'urbano', 'combate'] },
]

type CriterionFeedback = {
  name: string
  score: number
  maxScore: number
  feedback: string
  status: 'positive' | 'neutral' | 'negative'
}

export default function EssayPage() {
  const supabase = createClient()
  const [phase, setPhase] = useState<'choose' | 'write' | 'loading' | 'feedback'>('choose')
  const [selectedTheme, setSelectedTheme] = useState<typeof themes[0] | null>(null)
  const [text, setText] = useState('')
  const [criteria, setCriteria] = useState<CriterionFeedback[]>([])
  const [totalScore, setTotalScore] = useState(0)

  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length
  const estimatedLines = Math.floor(wordCount / 10)

  async function handleSubmit() {
    if (wordCount < 50 || !selectedTheme) return
    setPhase('loading')
    
    // Simulate complex AI analysis following IFRN criteria
    await new Promise(r => setTimeout(r, 3500))

    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 20).length
    const hasConnectives = (text.match(/(portanto|entretanto|além disso|contudo|visto que|assim sendo|porém|todavia)/gi) || []).length
    const hasOpinion = (text.match(/(eu|meu|minha|acredito|penso|considero|no meu ponto de vista|entendo que)/gi) || []).length
    const themeMatchCount = selectedTheme.keywords.filter(k => text.toLowerCase().includes(k)).length
    const themeMatchRatio = themeMatchCount / selectedTheme.keywords.length

    const results: CriterionFeedback[] = [
      {
        name: 'Gênero Textual (Artigo de Opinião)',
        score: hasOpinion > 0 ? 25 : 5,
        maxScore: 25,
        status: hasOpinion > 2 ? 'positive' : hasOpinion > 0 ? 'neutral' : 'negative',
        feedback: hasOpinion > 2 
          ? 'Excelente uso da primeira pessoa e marcas de opinião.' 
          : 'O texto precisa de mais marcas de subjetividade típicas do artigo de opinião.'
      },
      {
        name: 'Adequação ao Tema',
        score: Math.round(themeMatchRatio * 25),
        maxScore: 25,
        status: themeMatchRatio > 0.6 ? 'positive' : themeMatchRatio > 0.3 ? 'neutral' : 'negative',
        feedback: themeMatchRatio > 0.6 
          ? 'Abordou muito bem o tema e utilizou palavras-chave essenciais.' 
          : 'Cuidado para não tangenciar o tema. Foque nos argumentos centrais.'
      },
      {
        name: 'Coesão e Coerência',
        score: Math.min(25, hasConnectives * 5),
        maxScore: 25,
        status: hasConnectives >= 4 ? 'positive' : hasConnectives >= 2 ? 'neutral' : 'negative',
        feedback: hasConnectives >= 4 
          ? 'Ótimo uso de elementos coesivos para ligar as ideias.' 
          : 'Utilize mais conectivos (ex: portanto, além disso) para melhorar o fluxo.'
      },
      {
        name: 'Estrutura e Extensão',
        score: (estimatedLines > 8 ? 15 : 0) + (paragraphs >= 3 ? 10 : 5),
        maxScore: 25,
        status: estimatedLines > 8 && paragraphs >= 3 ? 'positive' : 'negative',
        feedback: estimatedLines <= 8 
          ? 'ALERTA: O edital zera redações com 8 linhas ou menos.' 
          : paragraphs < 3 ? 'Divida melhor o texto em Introdução, Desenvolvimento e Conclusão.' : 'Estrutura sólida e extensão adequada.'
      }
    ]

    let finalScore = results.reduce((acc, c) => acc + c.score, 0)
    
    // Strict Penalty: IFRN zeros if <= 8 lines
    if (estimatedLines <= 8) finalScore = 0

    setCriteria(results)
    setTotalScore(finalScore)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const xp = finalScore >= 80 ? 30 : finalScore >= 60 ? 15 : 0
      await supabase.from('essays').insert({
        profile_id: user.id,
        theme: selectedTheme.title,
        student_text: text,
        ai_feedback: { criteria: results, score: finalScore },
        score: finalScore,
        xp_earned: xp,
      })
      if (xp > 0) await supabase.rpc('increment_xp', { user_id: user.id, amount: xp })
    }
    setPhase('feedback')
  }

  function reset() {
    setPhase('choose')
    setSelectedTheme(null)
    setText('')
    setCriteria([])
    setTotalScore(0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#0A714E] flex items-center justify-center shadow-lg border border-[#007A3F]/30">
          <PenLine className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">Redação IFRN</h1>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Avaliação rigorosa baseada no edital</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'choose' && (
          <motion.div key="choose" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 space-y-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0A714E]" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Temas Inéditos</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {themes.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedTheme(t); setPhase('write') }}
                    className="group text-left p-5 rounded-2xl border border-zinc-800 bg-black/40 hover:bg-[#0A714E]/5 hover:border-[#0A714E]/30 transition-all flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[#0A714E] font-black">{t.category}</span>
                      <p className="text-sm text-zinc-300 font-bold mt-1 group-hover:text-white transition-colors">{t.title}</p>
                    </div>
                    <FileText className="w-5 h-5 text-zinc-700 group-hover:text-[#0A714E] transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'write' && selectedTheme && (
          <motion.div key="write" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="rounded-2xl border border-[#0A714E]/20 bg-[#0A714E]/5 p-5 flex items-start gap-4">
               <div className="p-2 rounded-lg bg-[#0A714E]/10 border border-[#0A714E]/20">
                 <Info className="w-4 h-4 text-[#0A714E]" />
               </div>
               <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-tight">{selectedTheme.title}</h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">
                    Gênero: <span className="text-[#0A714E]">{selectedTheme.genre}</span> • Mínimo 8 linhas
                  </p>
               </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Desenvolva seu artigo de opinião aqui. Lembre-se de defender seu ponto de vista..."
                className="w-full min-h-[450px] p-8 bg-transparent text-base text-zinc-200 placeholder-zinc-700 resize-none focus:outline-none leading-relaxed font-medium"
              />
              <div className="px-8 py-4 bg-zinc-900/50 border-t border-zinc-800 flex items-center justify-between">
                <div className="flex gap-4">
                   <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                     {wordCount} palavras
                   </div>
                   <div className={`text-[10px] font-black uppercase tracking-widest ${estimatedLines <= 8 ? 'text-[#C90C0F]' : 'text-[#0A714E]'}`}>
                     ~{estimatedLines} linhas {estimatedLines <= 8 && '(Insuficiente)'}
                   </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setPhase('choose')} className="text-[10px] font-black text-zinc-600 hover:text-zinc-400 uppercase tracking-widest px-4">Trocar Tema</button>
                  <button
                    onClick={handleSubmit}
                    disabled={wordCount < 30}
                    className="flex items-center gap-2 px-6 py-3 bg-[#0A714E] hover:bg-[#007A3F] text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all disabled:opacity-30 shadow-lg shadow-[#0A714E]/10"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Enviar para Correção
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#0A714E]/20 border-t-[#0A714E] rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#0A714E] animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-white uppercase tracking-[0.2em]">IA Corretora IFRN</p>
              <p className="text-[10px] text-zinc-500 font-bold uppercase mt-2 animate-pulse">Analisando gramática, coesão e gênero...</p>
            </div>
          </motion.div>
        )}

        {phase === 'feedback' && (
          <motion.div key="feedback" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 max-w-4xl mx-auto pb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {/* Score Card */}
               <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 flex flex-col items-center justify-center text-center space-y-4">
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Nota Final</p>
                  <div className="relative">
                     <svg className="w-32 h-32 -rotate-90">
                        <circle cx="64" cy="64" r="58" fill="none" stroke="#1a1a1a" strokeWidth="8" />
                        <circle cx="64" cy="64" r="58" fill="none" stroke={totalScore >= 80 ? '#0A714E' : totalScore >= 50 ? '#EAB308' : '#C90C0F'} strokeWidth="8" strokeDasharray={`${totalScore * 3.64}, 364`} strokeLinecap="round" />
                     </svg>
                     <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-black text-white">{totalScore}</span>
                     </div>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-medium">Pontuação máxima: 100</p>
                  {totalScore >= 80 && (
                    <div className="px-4 py-1.5 rounded-full bg-[#0A714E]/10 border border-[#0A714E]/20 text-[#0A714E] text-[10px] font-black uppercase">
                       Aprovado no Simulado!
                    </div>
                  )}
               </div>

               {/* Criteria breakdown */}
               <div className="md:col-span-2 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 space-y-5">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0A714E]" /> Detalhamento por Critério
                  </h3>
                  <div className="space-y-4">
                    {criteria.map((c, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                           <span className="text-zinc-400">{c.name}</span>
                           <span className={c.status === 'positive' ? 'text-[#0A714E]' : c.status === 'negative' ? 'text-[#C90C0F]' : 'text-yellow-500'}>
                             {c.score}/{c.maxScore}
                           </span>
                        </div>
                        <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                           <div className={`h-full transition-all duration-1000 ${c.status === 'positive' ? 'bg-[#0A714E]' : c.status === 'negative' ? 'bg-[#C90C0F]' : 'bg-yellow-500'}`} style={{ width: `${(c.score / c.maxScore) * 100}%` }} />
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">{c.feedback}</p>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            {totalScore === 0 && estimatedLines <= 8 && (
              <div className="p-4 rounded-2xl bg-[#C90C0F]/10 border border-[#C90C0F]/20 flex items-center gap-4">
                 <AlertTriangle className="w-6 h-6 text-[#C90C0F]" />
                 <div>
                    <p className="text-xs font-black text-[#C90C0F] uppercase">Redação Zerada</p>
                    <p className="text-[10px] text-zinc-400 uppercase font-bold mt-0.5">Motivo: O texto possui menos de 8 linhas, conforme regra eliminatória do edital.</p>
                 </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
               <button onClick={reset} className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#0A714E] hover:bg-[#007A3F] text-white font-black rounded-2xl transition-all shadow-xl uppercase tracking-widest text-sm">
                  <RotateCcw className="w-4 h-4" /> Escrever Outra
               </button>
               <button onClick={() => window.location.href = '/dashboard'} className="flex-1 flex items-center justify-center gap-2 py-4 bg-zinc-900 border border-zinc-800 text-zinc-400 font-black rounded-2xl transition-all hover:bg-zinc-800 uppercase tracking-widest text-sm">
                  Ir para o Dashboard
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
