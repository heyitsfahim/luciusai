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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#3d3d3d' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#F5C200', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white flex flex-col" style={{ backgroundColor: '#3d3d3d' }}>
      {/* Header */}
      <header className="border-b border-white/10 flex-shrink-0" style={{ backgroundColor: '#333333' }}>
        <div className="px-4 h-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/portal" className="transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <span className="text-sm font-medium line-clamp-1" style={{ color: 'rgba(255,255,255,0.7)' }}>{activeLesson?.title || 'Select a lesson'}</span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, backgroundColor: '#F5C200' }} />
              </div>
              <span>{progressPct}%</span>
            </div>
            <button onClick={() => setSidebarOpen(s => !s)} className="transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
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
              <div className="relative w-full bg-black" style={{ paddingTop: '56.25%' }}>
                {activeLesson.video_embed_url ? (
                  <iframe src={activeLesson.video_embed_url} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                ) : activeLesson.video_url ? (
                  <video key={activeLesson.video_url} src={activeLesson.video_url} controls className="absolute inset-0 w-full h-full" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.3)' }}>
                    <div>
                      <div className="text-5xl mb-3">🎬</div>
                      <p>Video URL not configured yet</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-b border-white/10">
                <div className="max-w-3xl">
                  <h1 className="text-xl font-bold mb-2 text-white">{activeLesson.title}</h1>
                  {activeLesson.duration_minutes && (
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{activeLesson.duration_minutes} min</p>
                  )}
                  {!completedIds.has(activeLesson.id) ? (
                    <button onClick={() => markComplete(activeLesson.id)} className="mt-4 flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-colors border" style={{ backgroundColor: 'rgba(40,120,181,0.12)', borderColor: 'rgba(40,120,181,0.3)', color: '#5BA3D9' }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Mark as Complete
                    </button>
                  ) : (
                    <div className="mt-4 flex items-center gap-2 text-sm font-semibold" style={{ color: '#2878B5' }}>
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
            <div className="flex-1 flex items-center justify-center text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <div>
                <div className="text-5xl mb-3">👈</div>
                <p>Select a lesson from the sidebar</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 flex-shrink-0 border-l border-white/10 overflow-y-auto hidden lg:block" style={{ backgroundColor: '#383838' }}>
            <div className="p-4 border-b border-white/10">
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Course Content</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>{completedCount}/{totalLessons} lessons completed</p>
            </div>
            {data?.modules.map(module => (
              <div key={module.id}>
                <div className="px-4 py-2.5" style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}>
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.55)' }}>{module.title}</p>
                </div>
                {module.course_lessons?.sort((a, b) => a.position - b.position).map(lesson => (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-white/5"
                    style={activeLesson?.id === lesson.id
                      ? { backgroundColor: 'rgba(245,194,0,0.08)', borderLeft: '2px solid #F5C200' }
                      : { borderLeft: '2px solid transparent' }
                    }
                  >
                    <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center" style={
                      completedIds.has(lesson.id)
                        ? { backgroundColor: '#2878B5', color: 'white' }
                        : activeLesson?.id === lesson.id
                        ? { backgroundColor: '#F5C200', color: '#333' }
                        : { border: '1px solid rgba(255,255,255,0.2)' }
                    }>
                      {completedIds.has(lesson.id) ? (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3" fill="currentColor" style={{ color: 'rgba(255,255,255,0.35)' }} viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-2" style={{ color: activeLesson?.id === lesson.id ? '#F5C200' : 'rgba(255,255,255,0.8)' }}>
                        {lesson.title}
                      </p>
                      {lesson.duration_minutes && (
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{lesson.duration_minutes} min</p>
                      )}
                    </div>
                    {lesson.is_preview && (
                      <span className="text-xs flex-shrink-0" style={{ color: 'rgba(40,120,181,0.7)' }}>Preview</span>
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
