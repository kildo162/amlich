import { useState } from 'react'
import type { ViewMode } from '../App'
import { fmtDateISO, parseISO } from '@utils/format'
import { viWeekday } from '@utils/calendar'
import QuickConvert from './QuickConvert'

export default function Header({ view, setView, selected, onPickDate }: {
  view: ViewMode
  setView: (v: ViewMode) => void
  selected: Date
  onPickDate: (d: Date) => void
}) {
  const [openConvert, setOpenConvert] = useState(false)
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
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button className={`btn-outline ${view==='month'?'bg-gray-100':''}`} onClick={()=>setView('month')}>Tháng</button>
            <button className={`btn-outline ${view==='day'?'bg-gray-100':''}`} onClick={()=>setView('day')}>Ngày</button>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-outline" onClick={prev}>← Trước</button>
            <input
              aria-label="Chọn ngày"
              type="date"
              className="border rounded-lg px-3 py-2"
              value={fmtDateISO(selected)}
              onChange={(e)=>onPickDate(parseISO(e.target.value))}
            />
            <button className="btn-outline" onClick={next}>Sau →</button>
            <button className="btn-primary" onClick={gotoToday}>Hôm nay</button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">{viWeekday(selected)} · {selected.toLocaleDateString('vi-VN')}</div>
          <button className="text-sm text-primary hover:underline" onClick={()=>setOpenConvert(v=>!v)}>
            {openConvert? 'Ẩn chuyển đổi' : 'Chuyển đổi Âm ↔ Dương'}
          </button>
        </div>
        {openConvert && (
          <div className="mt-2 card p-3">
            <QuickConvert onPickDate={onPickDate} />
          </div>
        )}
      </div>
    </header>
  )
}
