import { useEffect, useMemo, useRef, useState } from 'react'
import { getMonthMatrix, isSameDay, isSameMonth, startOfMonth, endOfMonth } from '@utils/calendar'
import { convertSolar2Lunar, jdFromDate } from '@utils/lunar'
import { getLunarHoliday, getSolarHoliday } from '@utils/holidays'
import { dayQuality } from '@utils/dayquality'
import { listReminders, REMINDERS_UPDATED_EVENT } from '@utils/reminders'

export default function MonthView({ selected, onPickDate, switchToDay }: {
  selected: Date
  onPickDate: (d: Date) => void
  switchToDay: () => void
}) {
  // Tooltip / preview state (desktop hover + mobile long-press)
  const [preview, setPreview] = useState<{ x: number; y: number; d: Date | null; lunar?: {day:number;month:number;leap?:boolean}; holiday?: string; good?: boolean; bad?: boolean; hasReminder?: boolean } | null>(null)
  const longPressTimer = useRef<number | null>(null)
  const longPressActivated = useRef(false)
  const ignoreNextClick = useRef(false)
  const weeks = getMonthMatrix(selected)
  const monthLabel = selected.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
  // Announce month change politely for screen readers
  const prevMonthRef = useRef<string>(monthLabel)
  const [monthLiveMsg, setMonthLiveMsg] = useState('')
  useEffect(() => {
    const prev = prevMonthRef.current
    if (prev !== monthLabel) {
      setMonthLiveMsg(`Đang xem tháng ${monthLabel}`)
      prevMonthRef.current = monthLabel
      const t = setTimeout(() => setMonthLiveMsg(''), 500)
      return () => clearTimeout(t)
    }
  }, [monthLabel])

  // Re-render khi nhắc nhở thay đổi
  const [reminderTick, setReminderTick] = useState(0)
  useEffect(() => {
    const handler = () => setReminderTick(x => x + 1)
    window.addEventListener(REMINDERS_UPDATED_EVENT as any, handler as any)
    return () => window.removeEventListener(REMINDERS_UPDATED_EVENT as any, handler as any)
  }, [])

  // Thu thập sự kiện trong tháng đang xem (memo theo selected, reminderTick)
  const { events, reminderKeySet } = useMemo(() => {
    const mStart = startOfMonth(selected)
    const mEnd = endOfMonth(selected)
    const events: { date: Date; label: string; type: 'solar'|'lunar'|'reminder' }[] = []
    for (let dt = new Date(mStart); dt <= mEnd; dt.setDate(dt.getDate()+1)) {
      const solarHol = getSolarHoliday(dt.getMonth()+1, dt.getDate())
      if (solarHol) events.push({ date: new Date(dt), label: solarHol.name, type: 'solar' })
      const lunar = convertSolar2Lunar(dt.getDate(), dt.getMonth()+1, dt.getFullYear())
      const lunarHol = getLunarHoliday(lunar.month, lunar.day)
      if (lunarHol) events.push({ date: new Date(dt), label: lunarHol.name, type: 'lunar' })
    }
    const rems = listReminders()
    const reminderKeySet = new Set<string>()
    for (const r of rems) {
      const [y, m, d] = r.date.split('-').map(Number)
      let when: Date | null = null
      if (r.repeatYearly) {
        when = new Date(selected.getFullYear(), m-1, d)
      } else if (y === selected.getFullYear() && m-1 === selected.getMonth()) {
        when = new Date(y, m-1, d)
      }
      if (when && when >= mStart && when <= mEnd) {
        events.push({ date: when, label: r.title, type: 'reminder' })
        reminderKeySet.add(`${when.getFullYear()}-${when.getMonth()}-${when.getDate()}`)
      }
    }
    events.sort((a,b)=>a.date.getTime()-b.date.getTime())
    return { events, reminderKeySet }
  }, [selected, reminderTick])

  // Tạo bảng tra sự kiện theo ngày để render dot + overflow indicator
  const eventsByDay = useMemo(() => {
    const map = new Map<string, { types: Array<'solar'|'lunar'|'reminder'> }>()
    for (const e of events) {
      const k = `${e.date.getFullYear()}-${e.date.getMonth()}-${e.date.getDate()}`
      if (!map.has(k)) map.set(k, { types: [] })
      map.get(k)!.types.push(e.type)
    }
    return map
  }, [events])

  // Roving tabindex & keyboard navigation across day cells
  const flatDays = weeks.flat()
  const btnRefs = useRef<HTMLButtonElement[]>([])
  const onGridKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    const key = e.key
    if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(key)) return
    const activeEl = document.activeElement as HTMLElement | null
    const curIdx = activeEl ? btnRefs.current.findIndex(el => el === activeEl) : -1
    const total = flatDays.length
    if (curIdx < 0) return
    e.preventDefault(); e.stopPropagation()
    let nextIdx = curIdx
    if (key === 'ArrowLeft') nextIdx = Math.max(0, curIdx - 1)
    else if (key === 'ArrowRight') nextIdx = Math.min(total - 1, curIdx + 1)
    else if (key === 'ArrowUp') nextIdx = Math.max(0, curIdx - 7)
    else if (key === 'ArrowDown') nextIdx = Math.min(total - 1, curIdx + 7)
    else if (key === 'Home') nextIdx = Math.floor(curIdx / 7) * 7
    else if (key === 'End') nextIdx = Math.min(total - 1, Math.floor(curIdx / 7) * 7 + 6)
    const target = btnRefs.current[nextIdx]
    if (target) {
      const d = flatDays[nextIdx]
      onPickDate(d)
      target.focus()
    }
  }

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl sm:text-2xl font-semibold">{monthLabel}</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">Chọn ngày để xem chi tiết</div>
      </div>
      {/* aria-live region for month change announcements */}
      <div aria-live="polite" className="sr-only" role="status">{monthLiveMsg}</div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] gap-3">
        <div>
          <div className="grid grid-cols-7 text-center text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400" role="row">
            {['T2','T3','T4','T5','T6','T7','CN'].map((h, i) => (
              <div key={h} role="columnheader" className={`${'py-1.5'} ${i===6?'text-amber-700 dark:text-amber-300':''}`}>{h}</div>
            ))}
          </div>
          <div
            className="grid grid-cols-7 gap-1 sm:gap-1.5 relative"
            role="grid"
            aria-label={`Lưới lịch tháng ${monthLabel}`}
            onKeyDown={onGridKeyDown}
          >
            {weeks.flat().map((d, idx) => {
              const lunar = convertSolar2Lunar(d.getDate(), d.getMonth()+1, d.getFullYear())
              const isCurMonth = isSameMonth(d, selected)
              const isSel = isSameDay(d, selected)
              const isToday = isSameDay(d, new Date())
              // Chỉ chủ nhật là cuối tuần; Thứ 7 là ngày thường
              const isWeekend = d.getDay()===0
              const jd = jdFromDate(d.getDate(), d.getMonth()+1, d.getFullYear())
              const chiDayIndex = (jd + 1) % 12
              const q = dayQuality(chiDayIndex, lunar.month)
              const isGoodDay = q.rate === 'tốt'
              const isBadDay = q.rate === 'xấu'
              const solarHol = getSolarHoliday(d.getMonth()+1, d.getDate())
              const lunarHol = getLunarHoliday(lunar.month, lunar.day)
              const isRam = lunar.day === 15
              const isM1 = lunar.day === 1
              const holidayName = solarHol?.name || lunarHol?.name || (isRam ? 'Rằm' : isM1 ? 'Mùng 1' : '')
              const hasReminder = reminderKeySet.has(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)
              const isHoliday = !!(solarHol || lunarHol)

              const cellBase = 'relative aspect-[6/5] p-1.5 sm:p-2 text-left rounded-lg border hover:ring-1 hover:ring-primary/40 overflow-hidden transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 active:scale-[0.99] transform-gpu'
              const cellTone = isSel
                ? 'border-primary bg-sky-50 dark:bg-sky-900/20'
                : isToday
                  ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-400 dark:bg-emerald-900/20'
                  : isHoliday
                    ? 'border-rose-300 bg-rose-50 dark:border-rose-400/40 dark:bg-rose-900/20'
                    : isWeekend
                      ? 'border-amber-200 bg-amber-50 dark:border-amber-400/40 dark:bg-amber-900/20'
                      : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
              const cellDim = isCurMonth ? '' : 'opacity-50'

              const dateNumCls = `text-2xl sm:text-3xl leading-none font-bold ${isToday ? 'text-emerald-700 dark:text-emerald-300' : (isHoliday ? 'text-rose-700 dark:text-rose-300' : (isWeekend ? 'text-amber-700 dark:text-amber-300' : 'text-gray-900 dark:text-gray-100'))}`
              const lunarBadgeCls = `px-1.5 py-0.5 rounded ${isM1||isRam ? 'bg-primary/10 dark:bg-primary/20 text-primary font-semibold' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'} text-[10px] sm:text-xs`
              const dayDotCls = `absolute top-1 right-1 h-2 w-2 rounded-full ${isGoodDay ? 'bg-emerald-500' : isBadDay ? 'bg-rose-500' : 'bg-gray-300'}`
              const remindDotCls = 'absolute top-1.5 left-1.5 h-2 w-2 rounded-full bg-blue-500'
              const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
              const dayTypes = eventsByDay.get(dayKey)?.types ?? []
              const baseTypes = dayTypes.filter(t => t !== 'reminder')
              const eventDotColors = baseTypes.map(t => t==='solar' ? 'bg-blue-500' : 'bg-violet-500')

              const handleClick = () => {
                if (ignoreNextClick.current) { ignoreNextClick.current = false; return }
                onPickDate(d); switchToDay()
              }
              const showPreview = (x: number, y: number) => setPreview({ x, y, d, lunar: { day: lunar.day, month: lunar.month, leap: !!lunar.leap }, holiday: holidayName || undefined, good: isGoodDay, bad: isBadDay, hasReminder })
              const onMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                showPreview(rect.left + rect.width, rect.top)
              }
              const onMouseLeave = () => setPreview(p => (p && p.d && isSameDay(p.d, d)) ? null : p)
              const onFocus: React.FocusEventHandler<HTMLButtonElement> = (e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                showPreview(rect.left + rect.width, rect.top)
              }
              const onBlur: React.FocusEventHandler<HTMLButtonElement> = () => setPreview(p => (p && p.d && isSameDay(p.d, d)) ? null : p)
              const onTouchStart = (e: React.TouchEvent) => {
                longPressActivated.current = false
                const touch = e.touches[0]
                const startX = touch.clientX, startY = touch.clientY
                longPressTimer.current = window.setTimeout(() => {
                  longPressActivated.current = true
                  showPreview(startX + 8, startY + 8)
                }, 400) as unknown as number
              }
              const cancelLongPress = () => { if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null } }
              const onTouchMove = () => cancelLongPress()
              const onTouchEnd = (e: React.TouchEvent) => {
                cancelLongPress()
                if (longPressActivated.current) {
                  // prevent navigation caused by synthesized click
                  ignoreNextClick.current = true
                  e.preventDefault(); e.stopPropagation()
                }
              }
              return (
                <button
                  key={idx}
                  onClick={handleClick}
                  onMouseEnter={onMouseEnter}
                  onMouseLeave={onMouseLeave}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                  ref={el => { if (el) btnRefs.current[idx] = el }}
                  className={`${cellBase} ${cellTone} ${cellDim}`}
                  title={`${d.toLocaleDateString('vi-VN')} • AL ${lunar.day}/${lunar.month}${lunar.leap?' (nhuận)':''}${holidayName? ' • '+holidayName:''}${hasReminder?' • Có nhắc nhở':''}`}
                  aria-current={isToday ? 'date' : undefined}
                  role="gridcell"
                  aria-selected={isSel}
                  tabIndex={isSel ? 0 : -1}
                >
                  {(isGoodDay || isBadDay) && (
                    <span className={dayDotCls} title={isGoodDay ? 'Ngày hoàng đạo' : 'Ngày hắc đạo'} aria-label={isGoodDay ? 'Ngày hoàng đạo' : 'Ngày hắc đạo'} />
                  )}
                  {hasReminder && (
                    <span className={remindDotCls} title="Nhắc nhở" aria-label="Nhắc nhở" />
                  )}
                  <div className="absolute top-1 left-3">
                    <div className={dateNumCls}>{d.getDate()}</div>
                  </div>
                  <div className={`absolute bottom-1 right-1 ${lunarBadgeCls}`}>AL {lunar.day}</div>
                  {baseTypes.length > 0 && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5">
                      {eventDotColors.slice(0,3).map((c, i) => (
                        <span key={i} className={`h-1.5 w-1.5 rounded-full ${c}`} />
                      ))}
                      {baseTypes.length > 3 && (
                        <span className="text-[9px] text-gray-500 dark:text-gray-400">+{baseTypes.length - 3}</span>
                      )}
                    </div>
                  )}
                  {holidayName && (
                    <div className="absolute bottom-1.5 left-1.5 right-12 text-[10px] sm:text-xs text-red-600 dark:text-red-500 line-clamp-2">{holidayName}</div>
                  )}
                </button>
              )
            })}
            {preview && preview.d && (
              <div className="fixed z-40 max-w-[220px] text-xs card p-2 shadow-lg" style={{ left: Math.min(window.innerWidth-240, preview.x), top: Math.max(8, preview.y) }} role="tooltip" aria-live="polite">
                <div className="font-medium mb-1">{preview.d.toLocaleDateString('vi-VN')}</div>
                {preview.lunar && (
                  <div className="mb-1">AL {preview.lunar.day}/{preview.lunar.month}{preview.lunar.leap?' (nhuận)':''}</div>
                )}
                {preview.holiday && <div className="text-red-600 dark:text-red-400 mb-1">{preview.holiday}</div>}
                {(preview.good || preview.bad) && (
                  <div className={`${preview.good?'text-emerald-700':'text-rose-700'}`}>{preview.good?'Hoàng đạo':'Hắc đạo'}</div>
                )}
                {preview.hasReminder && <div className="text-sky-700">Có nhắc nhở</div>}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 text-[11px] text-gray-600 dark:text-gray-400 mt-2">
            <div className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Hoàng đạo</div>
            <div className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-rose-500" /> Hắc đạo</div>
            <div className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-blue-500" /> Nhắc nhở</div>
            <div className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded bg-gray-100 border text-gray-600">AL</span> Ngày âm</div>
          </div>
        </div>
        <aside className="card p-3 lg:p-4 h-max">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm sm:text-base font-semibold">Sự kiện trong tháng</h2>
            <span className="text-xs text-gray-500">{events.length} sự kiện</span>
          </div>
          {events.length===0 ? (
            <div className="text-sm text-gray-500">Không có sự kiện</div>
          ) : (
            <ul className="space-y-1 max-h-[60vh] overflow-auto pr-1">
              {events.map((e, i) => {
                const lunar = convertSolar2Lunar(e.date.getDate(), e.date.getMonth()+1, e.date.getFullYear())
                return (
                  <li key={i} className="flex items-start gap-2 text-xs sm:text-sm">
                    <div className="min-w-[44px] text-right font-medium text-gray-800 dark:text-gray-100">{e.date.getDate()}/{e.date.getMonth()+1}</div>
                    <div className="flex-1">
                      <div className="font-medium">{e.label}</div>
                      <div className="text-gray-500 dark:text-gray-400">AL {lunar.day}/{lunar.month}</div>
                    </div>
                    <span className={`mt-0.5 rounded px-1.5 py-0.5 text-[10px] ${e.type==='solar'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-400/40'
                      : e.type==='lunar'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-400/40'
                        : 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-400/40'}`}>{e.type==='solar'?'DL': e.type==='lunar' ? 'AL' : 'NH'}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </aside>
      </div>
    </section>
  )
}
