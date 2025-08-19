import { useEffect, useState } from 'react'
import type { ViewMode } from '../App'
import { fmtDateISO, parseISO } from '@utils/format'
import { viWeekday } from '@utils/calendar'
import QuickConvert from './QuickConvert'
import { applyTheme, getInitialTheme, toggleTheme } from '@utils/theme'

export default function Header({ view, setView, selected, onPickDate, onOpenKnowledge, onOpenShortcuts }: {
  view: ViewMode
  setView: (v: ViewMode) => void
  selected: Date
  onPickDate: (d: Date) => void
  onOpenKnowledge: () => void
  onOpenShortcuts: () => void
}) {
  const [openConvert, setOpenConvert] = useState(false)
  const [theme, setTheme] = useState<'light'|'dark'>(() => getInitialTheme())
  useEffect(() => { applyTheme(theme) }, [])
  const onToggleTheme = () => setTheme(toggleTheme())
  const gotoToday = () => onPickDate(new Date())
  const prev = () => {
    const d = new Date(selected)
    if (view === 'month') d.setMonth(d.getMonth() - 1)
    else d.setDate(d.getDate() - 1)
    onPickDate(d)
  }
  const next = () => {
    const d = new Date(selected)
    if (view === 'month') d.setMonth(d.getMonth() + 1)
    else d.setDate(d.getDate() + 1)
    onPickDate(d)
  }

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/70 backdrop-blur border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-3 sm:px-5 py-0.5 flex items-center gap-2">
          {/* Left: segmented control + navigation */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-0" role="group" aria-label="Chuyển đổi chế độ xem">
              <button
                className={`btn-ghost px-1.5 py-0.5 ${view==='month' ? 'bg-gray-100 dark:bg-gray-700 font-semibold shadow-inner' : ''}`}
                onClick={()=>setView('month')}
                aria-pressed={view==='month'}
                aria-label="Xem tháng"
              >
                🗓️ <span className="hidden sm:inline ml-1">Tháng</span>
              </button>
              <button
                className={`btn-ghost px-1.5 py-0.5 ${view==='day' ? 'bg-gray-100 dark:bg-gray-700 font-semibold shadow-inner' : ''}`}
                onClick={()=>setView('day')}
                aria-pressed={view==='day'}
                aria-label="Xem ngày"
              >
                📅 <span className="hidden sm:inline ml-1">Ngày</span>
              </button>
            </div>
            <button className="btn-ghost px-1.5 py-0.5" onClick={prev} aria-label="Trước">←</button>
            <input
              aria-label="Chọn ngày"
              type="date"
              className="h-7 border rounded-md px-2 py-0.5 text-sm bg-white text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
              value={fmtDateISO(selected)}
              onChange={(e)=>onPickDate(parseISO(e.target.value))}
            />
            <button className="btn-ghost px-1.5 py-0.5" onClick={next} aria-label="Sau">→</button>
            <button className="btn-primary btn-sm px-1.5 py-0.5" onClick={gotoToday} aria-label="Hôm nay">📍 <span className="hidden sm:inline ml-1">Hôm nay</span></button>
          </div>

          {/* Center: date summary, hidden on small screens */}
          <div className="hidden md:block text-xs sm:text-sm text-gray-600 dark:text-gray-300 flex-1 text-center">
            {viWeekday(selected)} · {selected.toLocaleDateString('vi-VN')}
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1.5">
            <button className="btn-ghost px-1.5 py-0.5" onClick={onOpenKnowledge} aria-label="Kiến thức">📘 <span className="hidden sm:inline">Kiến thức</span></button>
            <button className="btn-ghost px-1.5 py-0.5" onClick={onOpenShortcuts} aria-label="Phím tắt">❓ <span className="hidden sm:inline">Phím tắt</span></button>
            <button className="btn-ghost px-1.5 py-0.5" onClick={onToggleTheme} aria-label="Đổi giao diện">
              {theme==='dark' ? '☀' : '🌙'} <span className="hidden sm:inline">{theme==='dark' ? 'Sáng' : 'Tối'}</span>
            </button>
            <button className="btn-ghost px-1.5 py-0.5 text-primary" onClick={()=>setOpenConvert(v=>!v)} aria-label={openConvert? 'Ẩn chuyển đổi' : 'Chuyển đổi Âm Dương'}>
              ⇄ <span className="hidden sm:inline ml-1">{openConvert? 'Ẩn chuyển đổi' : 'Chuyển đổi Âm ↔ Dương'}</span>
            </button>
          </div>
        </div>
      </header>
      {openConvert && (
        <div className="max-w-6xl mx-auto px-3 sm:px-5 mt-2">
          <div className="card p-3">
            <QuickConvert onPickDate={onPickDate} />
          </div>
        </div>
      )}
    </>
  )
}
