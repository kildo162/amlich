import { useEffect, useMemo, useState } from 'react'
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
  const weeks = getMonthMatrix(selected)
  const monthLabel = selected.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })

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

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl sm:text-2xl font-semibold">{monthLabel}</h1>
        <div className="text-sm text-gray-500">Chọn ngày để xem chi tiết</div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] gap-3">
        <div>
          <div className="grid grid-cols-7 text-center text-[11px] sm:text-xs font-medium text-gray-500">
            {['T2','T3','T4','T5','T6','T7','CN'].map((h, i) => (
              <div key={h} className={`py-1.5 ${i===6?'text-amber-700':''}`}>{h}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
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

              const cellBase = 'relative aspect-[6/5] p-1.5 sm:p-2 text-left rounded-lg border hover:ring-1 hover:ring-primary/40 overflow-hidden'
              const cellTone = isSel
                ? 'border-primary bg-sky-50'
                : isToday
                  ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-400'
                  : isWeekend
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-gray-200 bg-white'
              const cellDim = isCurMonth ? '' : 'opacity-50'

              const dateNumCls = `text-lg sm:text-xl font-bold ${isToday ? 'text-emerald-700' : (isWeekend ? 'text-amber-700' : 'text-gray-900')}`
              const lunarBadgeCls = `px-1.5 py-0.5 rounded ${isM1||isRam ? 'bg-primary/10 text-primary font-semibold' : 'bg-gray-100 text-gray-600'} text-[10px] sm:text-xs`
              const dayDotCls = `absolute top-1 right-1 h-2 w-2 rounded-full ${isGoodDay ? 'bg-emerald-500' : isBadDay ? 'bg-rose-500' : 'bg-gray-300'}`
              const remindDotCls = 'absolute top-1.5 left-1.5 h-2 w-2 rounded-full bg-blue-500'

              return (
                <button
                  key={idx}
                  onClick={() => { onPickDate(d); switchToDay() }}
                  className={`${cellBase} ${cellTone} ${cellDim}`}
                  title={`${d.toLocaleDateString('vi-VN')} • AL ${lunar.day}/${lunar.month}${lunar.leap?' (nhuận)':''}${holidayName? ' • '+holidayName:''}${hasReminder?' • Có nhắc nhở':''}`}
                  aria-current={isToday ? 'date' : undefined}
                >
                  {(isGoodDay || isBadDay) && (
                    <span className={dayDotCls} title={isGoodDay ? 'Ngày hoàng đạo' : 'Ngày hắc đạo'} aria-label={isGoodDay ? 'Ngày hoàng đạo' : 'Ngày hắc đạo'} />
                  )}
                  {hasReminder && (
                    <span className={remindDotCls} title="Nhắc nhở" aria-label="Nhắc nhở" />
                  )}
                  <div className="pt-0.5 pr-5">
                    <div className={dateNumCls}>{d.getDate()}</div>
                  </div>
                  <div className={`absolute bottom-1 right-1 ${lunarBadgeCls}`}>{lunar.day}</div>
                  {holidayName && (
                    <div className="absolute bottom-1.5 left-1.5 right-12 text-[10px] sm:text-xs text-red-600 line-clamp-2">{holidayName}</div>
                  )}
                </button>
              )
            })}
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
                    <div className="min-w-[44px] text-right font-medium text-gray-800">{e.date.getDate()}/{e.date.getMonth()+1}</div>
                    <div className="flex-1">
                      <div className="font-medium">{e.label}</div>
                      <div className="text-gray-500">AL {lunar.day}/{lunar.month}</div>
                    </div>
                    <span className={`mt-0.5 rounded px-1.5 py-0.5 text-[10px] ${e.type==='solar'?'bg-blue-50 text-blue-700 border border-blue-200': e.type==='lunar' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-sky-50 text-sky-700 border border-sky-200'}`}>{e.type==='solar'?'DL': e.type==='lunar' ? 'AL' : 'NH'}</span>
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
