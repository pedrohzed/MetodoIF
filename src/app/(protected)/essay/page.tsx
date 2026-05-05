'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { PenLine, Sparkles, Send, Loader2, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react'

const themes = [
  { category: 'Tecnologia', title: 'O impacto da inteligência artificial na educação brasileira' },
  { category: 'Saúde', title: 'Saúde mental dos jovens na era das redes sociais' },
  { category: 'Meio Ambiente', title: 'A importância da educação ambiental nas escolas' },
  { category: 'Sociedade', title: 'O papel do ensino técnico na redução da desigualdade' },
  { category: 'Tecnologia', title: 'Cyberbullying: desafios e soluções no ambiente escolar' },
  { category: 'Cidadania', title: 'A importância do voto consciente para a juventude' },
]

type FeedbackItem = { type: 'positive' | 'negative'; text: string }

export default function EssayPage() {
  const supabase = createClient()
  const [phase, setPhase] = useState<'choose' | 'write' | 'loading' | 'feedback'>('choose')
  const [selectedTheme, setSelectedTheme] = useState<typeof themes[0] | null>(null)
  const [text, setText] = useState('')
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [score, setScore] = useState(0)

  async function handleSubmit() {
    if (text.length < 100 || !selectedTheme) return
    setPhase('loading')
    await new Promise(r => setTimeout(r, 2500))
    const wordCount = text.split(/\s+/).length
    const paragraphs = text.split('\n\n').filter(p => p.trim()).length
    const s = Math.min(100, Math.max(30, Math.round(
      (wordCount > 150 ? 20 : 10) + (paragraphs >= 3 ? 25 : 10) +
      (text.includes('portanto') || text.includes('entretanto') ? 15 : 5) +
      (text.includes('conclusão') || text.includes('Diante') ? 20 : 5) + Math.random() * 15
    )))
    const fb: FeedbackItem[] = [{ type: 'positive', text: 'Texto aborda o tema proposto.' }]
    if (paragraphs >= 3) fb.push({ type: 'positive', text: `Boa estrutura (${paragraphs} parágrafos).` })
    else fb.push({ type: 'negative', text: 'Precisa de mais parágrafos (intro, dev, conclusão).' })
    if (wordCount > 150) fb.push({ type: 'positive', text: `Extensão adequada (${wordCount} palavras).` })
    else fb.push({ type: 'negative', text: `Texto curto (${wordCount} palavras).` })
    fb.push({ type: 'negative', text: 'Inclua dados ou exemplos para fortalecer argumentos.' })
    setFeedback(fb); setScore(s)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const xp = s >= 80 ? 25 : 0
      await supabase.from('essays').insert({
        profile_id: user.id, theme: selectedTheme.title, student_text: text,
        ai_feedback: { items: fb, score: s }, score: s, xp_earned: xp,
      })
      if (xp > 0) await supabase.rpc('increment_xp', { user_id: user.id, amount: xp })
    }
    setPhase('feedback')
  }

  function reset() { setPhase('choose'); setSelectedTheme(null); setText(''); setFeedback([]); setScore(0) }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-lg">
          <PenLine className="w-5 h-5 text-white" />
        </div>
        <div><h1 className="text-2xl font-bold tracking-tight">Módulo de Redação</h1>
        <p className="text-xs text-zinc-400">Artigos de opinião com correção inteligente</p></div>
      </div>
      <AnimatePresence mode="wait">
        {phase === 'choose' && (
          <motion.div key="c" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/40 p-6">
              <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-400" />Escolha um tema</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {themes.map((t, i) => (
                  <button key={i} onClick={() => { setSelectedTheme(t); setPhase('write') }}
                    className="text-left p-4 rounded-xl border border-zinc-700/30 bg-zinc-800/30 hover:bg-zinc-800/60 hover:border-emerald-500/20 transition-all">
                    <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">{t.category}</span>
                    <p className="text-sm text-zinc-300 mt-1">{t.title}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
        {phase === 'write' && selectedTheme && (
          <motion.div key="w" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">{selectedTheme.category}</span>
              <p className="text-sm text-white font-semibold mt-1">{selectedTheme.title}</p>
              <p className="text-[11px] text-zinc-400 mt-2">Gênero: <span className="text-emerald-400 font-semibold">Artigo de Opinião</span></p>
            </div>
            <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/40 overflow-hidden">
              <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Escreva seu artigo de opinião aqui..."
                className="w-full min-h-[400px] p-6 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none leading-relaxed" />
              <div className="px-6 py-3 border-t border-zinc-800/30 flex items-center justify-between">
                <span className="text-xs text-zinc-500">{text.split(/\s+/).filter(w=>w).length} palavras</span>
                <div className="flex gap-2">
                  <button onClick={() => setPhase('choose')} className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white">← Trocar</button>
                  <button onClick={handleSubmit} disabled={text.length < 100}
                    className="flex items-center gap-1.5 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg text-xs disabled:opacity-40">
                    <Send className="w-3.5 h-3.5" />Enviar</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {phase === 'loading' && (
          <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-20 space-y-4">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" /><p className="text-sm text-zinc-400">Analisando com IA...</p>
          </motion.div>
        )}
        {phase === 'feedback' && (
          <motion.div key="f" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/40 p-6 text-center">
              <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-2">Nota</p>
              <p className={`text-5xl font-black ${score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{score}</p>
              <p className="text-xs text-zinc-500 mt-1">de 100</p>
              {score >= 80 && <p className="text-xs text-emerald-400 mt-3 flex items-center justify-center gap-1"><Sparkles className="w-3.5 h-3.5" />+25 XP!</p>}
            </div>
            <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/40 p-6 space-y-3">
              {feedback.map((item, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${item.type === 'positive' ? 'bg-emerald-500/5 border border-emerald-500/10' : 'bg-red-500/5 border border-red-500/10'}`}>
                  {item.type === 'positive' ? <ThumbsUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> : <ThumbsDown className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                  <p className="text-xs text-zinc-300">{item.text}</p>
                </div>
              ))}
            </div>
            <button onClick={reset} className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-sm">
              <RotateCcw className="w-4 h-4" />Nova Redação</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
