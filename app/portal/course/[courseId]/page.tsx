'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CourseModule, CourseLesson } from '@/types/shop'

interface CourseData {
  modules: (CourseModule & { course_lessons: CourseLesson[] })[]
  progress: { lesson_id: string; completed: boolean }[]
}

export default function CourseViewerPage({ params }: { params: { courseId: string } }) {
  const router = useRouter()
  const [data, setData] = useState<CourseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    fetch(`/api/portal/courses/${params.courseId}`)
      .then(r => {
        if (r.status === 401) { router.push('/portal/login'); return null }
        if (r.status === 403) { router.push('/portal'); return null }
        return r.json()
      })
      .then(d => {
        if (d) {
          setData(d)
          // Auto-select first lesson
          const firstLesson = d.modules[0]?.course_lessons?.[0]
          if (firstLesson) setActiveLesson(firstLesson)
          setLoading(false)
        }
      })
  }, [params.courseId, router])

  const completedIds = new Set(data?.progress.filter(p => p.completed).map(p => p.lesson_id) || [])
  const totalLessons = data?.modules.reduce((sum, m) => sum + (m.course_lessons?.length || 0), 0) || 0
  const completedCount = completedIds.size
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  const markComplete = async (lessonId: string) => {
    await fetch(`/api/portal/courses/${params.courseId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId, completed: true }),
    })
    setData(prev => prev ? {
      ...prev,
      progress: [...prev.progress.filter(p => p.lesson_id !== lessonId), { lesson_id: lessonId, completed: true }]
    } : prev)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <header className="bg-[#0d0d0d] border-b border-white/10 flex-shrink-0">
        <div className="px-4 h-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/portal" className="text-white/40 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <span className="text-sm font-medium text-white/70 line-clamp-1">{activeLesson?.title || 'Select a lesson'}</span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2 text-xs text-white/40">
              <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
              </div>
              <span>{progressPct}%</span>
            </div>
            <button onClick={() => setSidebarOpen(s => !s)} className="text-white/40 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Video area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {activeLesson ? (
            <>
              {/* Video */}
              <div className="relative w-full bg-black" style={{ paddingTop: '56.25%' }}>
                {activeLesson.video_embed_url ? (
                  <iframe
                    src={activeLesson.video_embed_url}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : activeLesson.video_url ? (
                  <video
                    key={activeLesson.video_url}
                    src={activeLesson.video_url}
                    controls
                    className="absolute inset-0 w-full h-full"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white/30">
                    <div className="text-center">
                      <div className="text-5xl mb-3">🎬</div>
                      <p>Video URL not configured yet</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Lesson info */}
              <div className="p-6 border-b border-white/10">
                <div className="max-w-3xl">
                  <h1 className="text-xl font-bold mb-2">{activeLesson.title}</h1>
                  {activeLesson.duration_minutes && (
                    <p className="text-white/40 text-sm">{activeLesson.duration_minutes} min</p>
                  )}
                  {!completedIds.has(activeLesson.id) && (
                    <button
                      onClick={() => markComplete(activeLesson.id)}
                      className="mt-4 flex items-center gap-2 bg-green-400/10 hover:bg-green-400/20 border border-green-400/20 text-green-400 text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Mark as Complete
                    </button>
                  )}
                  {completedIds.has(activeLesson.id) && (
                    <div className="mt-4 flex items-center gap-2 text-green-400 text-sm font-semibold">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                      Completed
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/30">
              <div className="text-center">
                <div className="text-5xl mb-3">👈</div>
                <p>Select a lesson from the sidebar</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 flex-shrink-0 bg-[#0d0d0d] border-l border-white/10 overflow-y-auto hidden lg:block">
            <div className="p-4 border-b border-white/10">
              <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Course Content</p>
              <p className="text-xs text-white/25 mt-1">{completedCount}/{totalLessons} lessons completed</p>
            </div>
            {data?.modules.map(module => (
              <div key={module.id}>
                <div className="px-4 py-2.5 bg-white/3">
                  <p className="text-xs font-bold text-white/60 uppercase tracking-wide">{module.title}</p>
                </div>
                {module.course_lessons?.sort((a, b) => a.position - b.position).map(lesson => (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 ${
                      activeLesson?.id === lesson.id ? 'bg-amber-400/5 border-l-2 border-l-amber-400' : ''
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${
                      completedIds.has(lesson.id)
                        ? 'bg-green-400 text-white'
                        : activeLesson?.id === lesson.id
                        ? 'bg-amber-400 text-black'
                        : 'border border-white/20'
                    }`}>
                      {completedIds.has(lesson.id) ? (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3 text-white/40" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium line-clamp-2 ${activeLesson?.id === lesson.id ? 'text-amber-400' : 'text-white/80'}`}>
                        {lesson.title}
                      </p>
                      {lesson.duration_minutes && (
                        <p className="text-white/25 text-xs mt-0.5">{lesson.duration_minutes} min</p>
                      )}
                    </div>
                    {lesson.is_preview && (
                      <span className="text-xs text-blue-400/60 flex-shrink-0">Preview</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
