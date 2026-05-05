'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Filter, Play, CheckCircle2, XCircle, ChevronRight,
  Loader2, Sparkles, ArrowRight, RotateCcw, Trophy, Hash
} from 'lucide-react'

type Question = {
  id: string
  subject: string
  topic: string
  statement: string
  alternatives: { A: string; B: string; C: string; D: string }
  correct_alternative: string
  explanation: string
  difficulty: string
}

const subjects = ['Português', 'Matemática']
const difficulties = ['Fácil', 'Médio', 'Difícil']
const questionCounts = [5, 10, 15, 20]

const topicsBySubject: Record<string, string[]> = {
  'Português': ['Variação Linguística', 'Coesão e Coerência', 'Redes Semânticas', 'Leitura de Gêneros', 'Interpretação de Texto'],
  'Matemática': ['Conjuntos e Operações', 'Álgebra', 'Equações', 'Grandezas Proporcionais', 'Geometria Plana'],
}

export default function ExercisesPage() {
  const supabase = createClient()
  const [phase, setPhase] = useState<'filter' | 'solving' | 'results'>('filter')
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [questionCount, setQuestionCount] = useState(10)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [results, setResults] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 })
  const [loading, setLoading] = useState(false)

  const fetchQuestions = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('questions').select('*')
    
    if (selectedSubjects.length > 0) {
      query = query.in('subject', selectedSubjects)
    }
    if (selectedTopics.length > 0) {
      query = query.in('topic', selectedTopics)
    }
    if (selectedDifficulty) {
      query = query.eq('difficulty', selectedDifficulty)
    }
    
    query = query.limit(questionCount)

    const { data } = await query
    if (data && data.length > 0) {
      setQuestions(data as Question[])
      setPhase('solving')
    }
    setLoading(false)
  }, [supabase, selectedSubjects, selectedTopics, selectedDifficulty, questionCount])

  async function handleAnswer(letter: string) {
    if (showFeedback) return
    setSelectedAnswer(letter)
    setShowFeedback(true)

    const q = questions[currentIdx]
    const isCorrect = letter === q.correct_alternative

    if (isCorrect) {
      setResults(prev => ({ ...prev, correct: prev.correct + 1 }))
    }
    setResults(prev => ({ ...prev, total: prev.total + 1 }))

    // Save submission
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const xpEarned = isCorrect ? 10 : 0
      await supabase.from('submissions').insert({
        profile_id: user.id,
        question_id: q.id,
        selected_alternative: letter,
        is_correct: isCorrect,
        xp_earned: xpEarned,
      })
      if (isCorrect) {
        await supabase.rpc('increment_xp', { user_id: user.id, amount: 10 })
      }
    }
  }

  function handleNext() {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    } else {
      setPhase('results')
    }
  }

  function toggleSubject(s: string) {
    setSelectedSubjects(prev => 
      prev.includes(s) ? prev.filter(i => i !== s) : [...prev, s]
    )
    // Clear topics that are not in selected subjects
    setSelectedTopics(prev => prev.filter(t => {
      return Object.entries(topicsBySubject).some(([subj, topics]) => 
        (prev.includes(s) ? subj !== s : true) && topics.includes(t)
      )
    }))
  }

  function toggleTopic(t: string) {
    setSelectedTopics(prev => 
      prev.includes(t) ? prev.filter(i => i !== t) : [...prev, t]
    )
  }

  function handleRestart() {
    setPhase('filter')
    setQuestions([])
    setCurrentIdx(0)
    setSelectedAnswer(null)
    setShowFeedback(false)
    setResults({ correct: 0, total: 0 })
  }

  const currentQuestion = questions[currentIdx]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#0A714E] flex items-center justify-center shadow-lg border border-[#007A3F]/30">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Motor de Exercícios</h1>
          <p className="text-xs text-zinc-400">Pratique questões reais do IFRN</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* FILTER PHASE */}
        {phase === 'filter' && (
          <motion.div
            key="filter"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border border-zinc-800/80 bg-black/60 p-6 space-y-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
                <Filter className="w-4 h-4 text-[#0A714E]" />
                Personalize sua Prática
              </div>

              {/* Subject */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Matérias</label>
                <div className="flex flex-wrap gap-2">
                  {subjects.map(s => (
                    <button
                      key={s}
                      onClick={() => toggleSubject(s)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                        selectedSubjects.includes(s)
                          ? 'bg-[#0A714E] border-[#0A714E] text-white shadow-[0_0_15px_rgba(10,113,78,0.2)]'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topics */}
              {selectedSubjects.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Assuntos Específicos</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedSubjects.flatMap(s => topicsBySubject[s] || []).map(t => (
                      <button
                        key={t}
                        onClick={() => toggleTopic(t)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                          selectedTopics.includes(t)
                            ? 'bg-[#007A3F] border-[#007A3F] text-white'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Question Count */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5" /> Quantidade
                  </label>
                  <div className="flex gap-2">
                    {questionCounts.map(count => (
                      <button
                        key={count}
                        onClick={() => setQuestionCount(count)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                          questionCount === count
                            ? 'bg-[#0A714E] border-[#0A714E] text-white'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Dificuldade</label>
                  <div className="flex gap-2">
                    {difficulties.map(d => (
                      <button
                        key={d}
                        onClick={() => setSelectedDifficulty(selectedDifficulty === d ? '' : d)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                          selectedDifficulty === d
                            ? 'bg-[#0A714E] border-[#0A714E] text-white'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={fetchQuestions}
              disabled={selectedSubjects.length === 0 || loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-[#0A714E] hover:bg-[#007A3F] text-white font-black rounded-2xl transition-all shadow-lg hover:shadow-[#0A714E]/20 disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wide text-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              Gerar Questões
            </button>
          </motion.div>
        )}

        {/* SOLVING PHASE */}
        {phase === 'solving' && currentQuestion && (
          <motion.div
            key={`question-${currentIdx}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Header / Info */}
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-[#C90C0F] animate-pulse" />
                 <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Questão {currentIdx + 1} de {questions.length}</span>
               </div>
               <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                 {currentQuestion.subject} • {currentQuestion.difficulty}
               </span>
            </div>

            {/* Progress */}
            <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
              <motion.div
                className="h-full bg-[#0A714E]"
                initial={{ width: 0 }}
                animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question card */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-sm overflow-hidden shadow-2xl">
              <div className="p-6 sm:p-8">
                <p className="text-base sm:text-lg text-zinc-200 leading-relaxed font-medium whitespace-pre-wrap">{currentQuestion.statement}</p>
              </div>

              {/* Alternatives */}
              <div className="px-6 sm:px-8 pb-8 space-y-3">
                {Object.entries(currentQuestion.alternatives).map(([letter, text]) => {
                  const isSelected = selectedAnswer === letter
                  const isCorrect = letter === currentQuestion.correct_alternative
                  let classes = 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-[#0A714E]/50'

                  if (showFeedback) {
                    if (isCorrect) classes = 'bg-[#0A714E]/10 border-[#0A714E] text-[#0A714E]'
                    else if (isSelected && !isCorrect) classes = 'bg-[#C90C0F]/10 border-[#C90C0F] text-[#C90C0F]'
                    else classes = 'bg-zinc-950/40 border-zinc-900 text-zinc-600'
                  } else if (isSelected) {
                    classes = 'bg-[#0A714E]/5 border-[#0A714E]/50 text-[#0A714E]'
                  }

                  return (
                    <button
                      key={letter}
                      onClick={() => handleAnswer(letter)}
                      disabled={showFeedback}
                      className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all text-left group ${classes}`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                        isSelected ? 'bg-current text-black' : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700'
                      }`}>
                        {letter}
                      </span>
                      <span className="flex-1 mt-1 text-sm sm:text-base leading-snug">{text}</span>
                      {showFeedback && isCorrect && <CheckCircle2 className="w-5 h-5 text-[#0A714E] shrink-0 mt-1" />}
                      {showFeedback && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-[#C90C0F] shrink-0 mt-1" />}
                    </button>
                  )
                })}
              </div>

              {/* Explanation */}
              {showFeedback && currentQuestion.explanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="px-6 sm:px-8 pb-8"
                >
                  <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-6 bg-[#C90C0F] rounded-full" />
                      <span className="text-xs font-black text-white uppercase tracking-widest">Explicação do Professor</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed italic">{currentQuestion.explanation}</p>
                  </div>
                </motion.div>
              )}
            </div>

            {showFeedback && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end pt-2">
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-8 py-3.5 bg-white text-black font-black rounded-xl hover:bg-zinc-200 transition-all text-sm uppercase tracking-wider"
                >
                  {currentIdx < questions.length - 1 ? 'Próxima Questão' : 'Finalizar e Ver Resultado'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* RESULTS PHASE */}
        {phase === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#0A714E]" />
              
              <div className="w-20 h-20 rounded-2xl bg-[#0A714E]/10 border border-[#0A714E]/20 flex items-center justify-center mx-auto shadow-inner">
                <Trophy className="w-10 h-10 text-[#0A714E]" />
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white tracking-tight uppercase">Treino Concluído</h2>
                <p className="text-zinc-500 text-sm font-medium">Você está cada vez mais perto da sua vaga no IFRN!</p>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-3xl font-black text-white">{results.total}</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Questões</p>
                </div>
                <div className="space-y-1 p-4 rounded-2xl bg-[#0A714E]/5 border border-[#0A714E]/10">
                  <p className="text-3xl font-black text-[#0A714E]">{results.correct}</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Acertos</p>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-black text-white">{results.total > 0 ? Math.round((results.correct / results.total) * 100) : 0}%</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Precisão</p>
                </div>
              </div>

              {results.correct > 0 && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Ganhou +{results.correct * 10} XP
                </div>
              )}

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleRestart}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#0A714E] hover:bg-[#007A3F] text-white font-black rounded-2xl transition-all uppercase tracking-wide text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Novo Simulado
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-black rounded-2xl transition-all border border-zinc-800 uppercase tracking-wide text-sm"
                >
                  Voltar ao Início
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
