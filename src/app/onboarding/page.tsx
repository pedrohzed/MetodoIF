'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, GraduationCap, TrendingUp, ArrowRight, Loader2, Users, Trophy } from 'lucide-react'

type CampusCourse = {
  id: string
  campus_name: string
  course_name: string
  shift: string
  competition_rate: number
  total_slots: number
  total_candidates: number
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  
  const [campusCourses, setCampusCourses] = useState<CampusCourse[]>([])
  const [campuses, setCampuses] = useState<string[]>([])
  const [selectedCampus, setSelectedCampus] = useState('')
  const [filteredCourses, setFilteredCourses] = useState<CampusCourse[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCampusCourses() {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await supabase
          .from('campuses_courses')
          .select('*')
          .order('campus_name')
          .order('course_name')
        
        if (error) {
          console.error('Error fetching campuses:', error)
          setError('Erro ao carregar dados do IFRN. Verifique sua conexão.')
          return
        }

        if (data && data.length > 0) {
          setCampusCourses(data)
          const uniqueCampuses = Array.from(new Set(data.map(cc => cc.campus_name)))
          setCampuses(uniqueCampuses)
        } else {
          setError('Nenhum campus encontrado no banco de dados.')
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('Ocorreu um erro inesperado.')
      } finally {
        setLoading(false)
      }
    }
    fetchCampusCourses()
  }, [supabase])

  useEffect(() => {
    if (selectedCampus) {
      const courses = campusCourses.filter(cc => cc.campus_name === selectedCampus)
      setFilteredCourses(courses)
      setSelectedCourseId('')
    }
  }, [selectedCampus, campusCourses])

  function handleCampusSelect(campus: string) {
    setSelectedCampus(campus)
    setStep(2)
  }

  function handleCourseSelect(courseId: string) {
    setSelectedCourseId(courseId)
    setStep(3)
  }

  async function handleSubmit() {
    if (!selectedCourseId) return
    setSaving(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { 
        router.push('/login')
        return 
      }
      
      const { error: updateError } = await supabase.from('profiles').update({
        campus_course_id: selectedCourseId,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id)

      if (!updateError) {
        router.push('/dashboard')
      } else {
        console.error('Update error:', updateError)
        setError('Erro ao salvar sua escolha. Tente novamente.')
        setSaving(false)
      }
    } catch (err) {
      console.error('Submit error:', err)
      setError('Ocorreu um erro ao salvar os dados.')
      setSaving(false)
    }
  }

  const selectedCourse = campusCourses.find(cc => cc.id === selectedCourseId)

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#0A714E] animate-spin" />
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest animate-pulse">Carregando IFRN...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-12 relative">
      <div className="relative z-10 w-full max-w-lg space-y-8">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
          <Image src="/logo-navbar.png" alt="Método IF" width={180} height={55} className="object-contain" priority />
        </motion.div>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                s <= step ? 'bg-[#0A714E] text-white' : 'bg-zinc-900 text-zinc-600'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`w-12 h-[1px] transition-all ${s < step ? 'bg-[#0A714E]' : 'bg-zinc-900'}`} />}
            </div>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-xl bg-[#C90C0F]/10 border border-[#C90C0F]/20 text-[#C90C0F] text-xs font-bold text-center uppercase tracking-wide">
            {error}
          </motion.div>
        )}

        {/* Card */}
        <motion.div
          layout
          className="rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md overflow-hidden shadow-2xl"
        >
          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Campus */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0A714E]/10 border border-[#0A714E]/20 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-[#0A714E]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black uppercase tracking-tight">Escolha seu Campus</h2>
                      <p className="text-xs text-zinc-500 font-medium">Onde você pretende estudar?</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-[360px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                    {campuses.length > 0 ? (
                      campuses.map(campus => (
                        <button
                          key={campus}
                          onClick={() => handleCampusSelect(campus)}
                          className={`text-left px-4 py-3.5 rounded-xl border transition-all text-sm font-bold uppercase tracking-tight ${
                            selectedCampus === campus
                              ? 'bg-[#0A714E] border-[#0A714E] text-white shadow-lg shadow-[#0A714E]/10'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          {campus}
                        </button>
                      ))
                    ) : (
                      !loading && !error && <p className="text-center text-zinc-600 py-8 text-xs font-bold uppercase tracking-widest">Nenhum campus disponível.</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Course */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0A714E]/10 border border-[#0A714E]/20 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-[#0A714E]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black uppercase tracking-tight">Escolha seu Curso</h2>
                      <p className="text-xs text-zinc-500 font-bold uppercase text-[#0A714E]">{selectedCampus}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {filteredCourses.map(cc => (
                      <button
                        key={cc.id}
                        onClick={() => handleCourseSelect(cc.id)}
                        className={`text-left px-4 py-4 rounded-xl border transition-all ${
                          selectedCourseId === cc.id
                            ? 'bg-[#0A714E]/5 border-[#0A714E] shadow-inner'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <p className={`text-sm font-black uppercase tracking-tight ${selectedCourseId === cc.id ? 'text-white' : 'text-zinc-300'}`}>
                          {cc.course_name}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                          <span>{cc.shift}</span>
                          <span className="w-1 h-1 rounded-full bg-zinc-700" />
                          <span className="text-[#0A714E]">{cc.competition_rate.toFixed(2)} c/v</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setStep(1)} className="text-[10px] font-black text-zinc-600 hover:text-zinc-400 transition-colors uppercase tracking-widest flex items-center gap-2">
                    ← Voltar para Campi
                  </button>
                </motion.div>
              )}

              {/* Step 3: Confirm */}
              {step === 3 && selectedCourse && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#C90C0F]/10 border border-[#C90C0F]/20 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-[#C90C0F]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black uppercase tracking-tight">Tudo pronto!</h2>
                      <p className="text-xs text-zinc-500 font-medium">Confirme os detalhes da sua escolha</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-black">Campus</p>
                        <p className="text-sm font-bold text-white mt-1 uppercase">{selectedCourse.campus_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-black">Turno</p>
                        <p className="text-sm font-bold text-white mt-1 uppercase">{selectedCourse.shift}</p>
                      </div>
                    </div>
                    <div className="h-[1px] bg-zinc-900" />
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-black">Curso</p>
                      <p className="text-base font-black text-[#0A714E] mt-1 uppercase tracking-tight">{selectedCourse.course_name}</p>
                    </div>
                    <div className="h-[1px] bg-zinc-900" />
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl bg-zinc-900 p-3 text-center border border-zinc-800">
                        <p className="text-lg font-black text-white">{selectedCourse.competition_rate.toFixed(2)}</p>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase">c/vaga</p>
                      </div>
                      <div className="rounded-xl bg-zinc-900 p-3 text-center border border-zinc-800">
                        <p className="text-lg font-black text-white">{selectedCourse.total_slots}</p>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase">vagas</p>
                      </div>
                      <div className="rounded-xl bg-zinc-900 p-3 text-center border border-zinc-800">
                        <p className="text-lg font-black text-white">{selectedCourse.total_candidates}</p>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase">cand.</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 py-4.5 bg-[#0A714E] hover:bg-[#007A3F] text-white font-black rounded-xl transition-all shadow-lg hover:shadow-[#0A714E]/20 disabled:opacity-50 text-sm uppercase tracking-widest"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Entrar na Plataforma
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <button onClick={() => setStep(2)} className="w-full text-[10px] font-black text-zinc-600 hover:text-zinc-400 transition-colors text-center uppercase tracking-widest">
                    ← Trocar Curso
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
