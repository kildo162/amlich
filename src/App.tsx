import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
const DayView = lazy(() => import('@pages/DayView'))
const MonthView = lazy(() => import('@pages/MonthView'))
import Header from '@components/Header'
import ShortcutsModal from '@components/ShortcutsModal'
import HolidaySearch from '@components/HolidaySearch'
import ReminderList from '@components/ReminderList'
import KnowledgeModal from '@components/KnowledgeModal'
import { getToday, fmtDateISO, parseISO } from '@utils/format'
import { getShowNotes, setShowNotes } from '@utils/prefs'

export type ViewMode = 'day' | 'month'

export default function App() {
  const [view, setView] = useState<ViewMode>('month')
  const [selected, setSelected] = useState<Date>(() => getToday())
  const [openKnowledge, setOpenKnowledge] = useState(false)
  const [openShortcuts, setOpenShortcuts] = useState(false)

  // Helpers for URL <-> state sync
  const buildUrl = (v: ViewMode, d: Date) => `${location.pathname}?view=${v}&d=${fmtDateISO(d)}${location.hash}`

  // install PWA service worker update toasts (vite-plugin-pwa injects registration)
  useEffect(() => {
    // Initialize from URL if present, else ensure base state
    const params = new URLSearchParams(location.search)
    const vParam = params.get('view')
    const dParam = params.get('d')
    let initView: ViewMode = vParam === 'day' ? 'day' : 'month'
    let initDate = selected
    if (dParam) {
      try { initDate = parseISO(dParam) } catch {}
    }
    setView(initView)
    setSelected(initDate)
    if (!history.state || !history.state.view) {
      history.replaceState({ view: initView, dateISO: fmtDateISO(initDate) }, '', buildUrl(initView, initDate))
    }
    const onPop = (e: PopStateEvent) => {
      const st = (e.state || {}) as { view?: ViewMode; dateISO?: string }
      let nextView: ViewMode = st.view === 'day' ? 'day' : 'month'
      let nextDate: Date | null = null
      if (st.dateISO) {
        try { nextDate = parseISO(st.dateISO) } catch {}
      }
      // Fallback to URL if state missing
      if (!nextDate) {
        const p = new URLSearchParams(location.search)
        const di = p.get('d')
        if (di) { try { nextDate = parseISO(di) } catch {} }
        const vv = p.get('view')
        if (vv === 'day' || vv === 'month') nextView = vv
      }
      setView(nextView)
      if (nextDate) setSelected(nextDate)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const onPickDateWithHistory = (d: Date) => {
    setSelected(d)
    if (view === 'day') {
      const st = { view: 'day' as ViewMode, dateISO: fmtDateISO(d) }
      history.pushState(st, '', buildUrl('day', d))
    } else {
      // Keep URL date in sync without adding history entry
      const st = { view: 'month' as ViewMode, dateISO: fmtDateISO(d) }
      history.replaceState(st, '', buildUrl('month', d))
    }
  }
  const setViewWithHistory = (v: ViewMode) => {
    if (v === 'day') {
      history.pushState({ view: 'day', dateISO: fmtDateISO(selected) }, '', buildUrl('day', selected))
    } else {
      history.pushState({ view: 'month', dateISO: fmtDateISO(selected) }, '', buildUrl('month', selected))
    }
    setView(v)
  }

  // Keyboard shortcuts (skip when typing in inputs)
  useEffect(() => {
    const isTypingTarget = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false
      const tag = el.tagName.toLowerCase()
      return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable
    }
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return
      // Focus search with '/'
      if (e.key === '/') {
        e.preventDefault()
        const el = document.getElementById('holiday-search-input') as HTMLInputElement | null
        if (el) { el.focus(); try { el.select() } catch {} }
        return
      }
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault(); const today = getToday(); onPickDateWithHistory(today)
        return
      }
      if (e.key === 'm' || e.key === 'M') { e.preventDefault(); setViewWithHistory('month'); return }
      if (e.key === 'd' || e.key === 'D') { e.preventDefault(); setViewWithHistory('day'); return }
      if (e.key === '?' ) { e.preventDefault(); setOpenShortcuts(true); return }
      if (e.key === 'n' || e.key === 'N') { e.preventDefault(); setShowNotes(!getShowNotes()); return }
      if (e.key === 'PageUp') {
        e.preventDefault(); const d = new Date(selected); d.setMonth(d.getMonth()-1); onPickDateWithHistory(d); return
      }
      if (e.key === 'PageDown') {
        e.preventDefault(); const d = new Date(selected); d.setMonth(d.getMonth()+1); onPickDateWithHistory(d); return
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault(); const d = new Date(selected); if (view==='day') d.setDate(d.getDate()-1); else d.setMonth(d.getMonth()-1); onPickDateWithHistory(d); return
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault(); const d = new Date(selected); if (view==='day') d.setDate(d.getDate()+1); else d.setMonth(d.getMonth()+1); onPickDateWithHistory(d); return
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, view])

  // Dynamic document title for better UX/SEO
  useEffect(() => {
    const dateStr = selected.toLocaleDateString('vi-VN')
    const monthStr = selected.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
    document.title = view === 'day' ? `Lịch Âm – Dương • ${dateStr}` : `Lịch Âm – Dương • ${monthStr}`

    // Update meta description (note: most crawlers won't execute JS for SPA)
    const desc = view === 'day'
      ? `Lịch Việt: ${dateStr}. Âm dương, can chi, giờ hoàng đạo, ngày tốt xấu, lễ tết, nhắc nhở.`
      : `Lịch Việt: ${monthStr}. Xem âm dương, can chi, giờ hoàng đạo, ngày tốt xấu, lễ tết.`
    let el = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute('name', 'description')
      document.head.appendChild(el)
    }
    el.setAttribute('content', desc)
  }, [view, selected])

  return (
    <div className="min-h-full">
      <Header
        view={view}
        setView={setViewWithHistory}
        selected={selected}
        onPickDate={onPickDateWithHistory}
        onOpenKnowledge={() => setOpenKnowledge(true)}
        onOpenShortcuts={() => setOpenShortcuts(true)}
      />

      <main id="main-content" tabIndex={-1} className="max-w-6xl mx-auto px-3 sm:px-6 pb-24">
        <Suspense fallback={<div className="p-6 text-sm text-gray-500">Đang tải...</div>}>
          {view === 'month' ? (
            <div className="animate-fade-in">
              <MonthView selected={selected} onPickDate={onPickDateWithHistory} switchToDay={() => setViewWithHistory('day')} />
            </div>
          ) : (
            <div className="animate-fade-in">
              <DayView date={selected} onPickDate={onPickDateWithHistory} onBackToMonth={() => history.back()} />
            </div>
          )}
        </Suspense>

        <section className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="card p-4">
            <h2 className="text-lg font-semibold mb-3">Nhắc nhở</h2>
            <ReminderList baseDate={selected} />
          </div>
          <div className="card p-4">
            <h2 className="text-lg font-semibold mb-3">Tìm kiếm ngày lễ</h2>
            <HolidaySearch />
          </div>
        </section>
      </main>
      <KnowledgeModal open={openKnowledge} onClose={() => setOpenKnowledge(false)} />
      <ShortcutsModal open={openShortcuts} onClose={() => setOpenShortcuts(false)} />
    </div>
  )
}
