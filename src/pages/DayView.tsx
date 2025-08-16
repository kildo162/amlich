import { useEffect, useMemo, useState } from 'react'
import { viDate, viWeekday } from '@utils/calendar'
import { getLunarHoliday, getSolarHoliday } from '@utils/holidays'
import { dayQuality } from '@utils/dayquality'
import { infoForDate, solarTermPrevNext } from '@utils/lunar'
import { getToday, lunarMonthName, fmtDateISO } from '@utils/format'
import { listReminders, REMINDERS_UPDATED_EVENT } from '@utils/reminders'

export default function DayView({ date, onPickDate, onBackToMonth }: { date: Date; onPickDate: (d: Date) => void; onBackToMonth: () => void }) {
  const info = infoForDate(date)
  const { solar, lunar, canchi, gioHoangDao, jd, tietKhi } = info
  const tk = tietKhi ?? '—'

  // Tiết khí liền trước/kế tiếp
  const { prev: prevTk, next: nextTk } = useMemo(() => solarTermPrevNext(jd), [jd])

  const solarHoliday = getSolarHoliday(solar.month, solar.day)
  const lunarHoliday = getLunarHoliday(lunar.month, lunar.day)
  const isRam = lunar.day === 15
  const isM1 = lunar.day === 1

  // Re-render khi nhắc nhở thay đổi
  const [reminderTick, setReminderTick] = useState(0)
  useEffect(() => {
    const handler = () => setReminderTick(x => x + 1)
    window.addEventListener(REMINDERS_UPDATED_EVENT as any, handler as any)
    return () => window.removeEventListener(REMINDERS_UPDATED_EVENT as any, handler as any)
  }, [])

  // Nhắc nhở trong ngày
  const dayReminders = useMemo(() => {
    const all = listReminders()
    const y = date.getFullYear()
    const m = date.getMonth() + 1
    const d = date.getDate()
    const iso = `${y.toString().padStart(4,'0')}-${m.toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}`
    return all.filter(r => {
      if (r.repeatYearly) {
        const [, rm, rd] = r.date.split('-').map(Number)
        return rm === m && rd === d
      }
      return r.date === iso
    })
  }, [date, reminderTick])

  const chiDayIndex = (jd + 1) % 12
  const q = dayQuality(chiDayIndex, lunar.month)
  const isGoodDay = q.rate === 'tốt'
  const isBadDay = q.rate === 'xấu'

  // Highlight giờ hiện tại nếu đang xem hôm nay
  const today = getToday()
  const isToday = today.getFullYear() === date.getFullYear() && today.getMonth() === date.getMonth() && today.getDate() === date.getDate()
  const now = new Date()
  const currentHourIdx = Math.floor(((now.getHours() + 1) % 24) / 2)
  const currentHourLabel = gioHoangDao[currentHourIdx]?.name

  // Điều hướng ngày trước/sau đã có ở top bar và bằng phím tắt, không cần nút riêng trong màn chi tiết
  const [shareMsg, setShareMsg] = useState<string | null>(null)
  const shareDay = async () => {
    const url = `${location.origin}${location.pathname}?view=day&d=${fmtDateISO(date)}${location.hash}`
    const title = `Lịch ngày ${viDate(date)}`
    const pieces: string[] = []
    pieces.push(`DL: ${solar.day}/${solar.month}/${solar.year}`)
    pieces.push(`AL: ${lunar.day}/${lunar.month}${lunar.leap ? ' (nhuận)' : ''}/${lunar.year}`)
    pieces.push(`Can chi: ${canchi.day}`)
    if (solarHoliday?.name) pieces.push(`Lễ DL: ${solarHoliday.name}`)
    if (lunarHoliday?.name) pieces.push(`Lễ AL: ${lunarHoliday.name}`)
    const text = pieces.join(' • ')
    try {
      const canShare = typeof (navigator as any).share === 'function'
      if (canShare) {
        await (navigator as any).share({ title, text, url })
        setShareMsg('Đã mở hộp thoại chia sẻ')
      } else if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url)
        setShareMsg('Đã sao chép liên kết vào bộ nhớ tạm')
      } else {
        // Fallback copy method
        const ta = document.createElement('textarea')
        ta.value = url
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.focus(); ta.select()
        try { document.execCommand('copy'); setShareMsg('Đã sao chép liên kết') } catch {}
        document.body.removeChild(ta)
      }
    } catch (e) {
      setShareMsg('Không thể chia sẻ')
    } finally {
      setTimeout(() => setShareMsg(null), 2000)
    }
  }

  return (
    <section className="mt-6 space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl sm:text-2xl font-semibold">
              {viWeekday(date)} · {viDate(date)}
              {(isGoodDay || isBadDay) && (
                <span className={`ml-2 align-middle px-2 py-0.5 rounded text-xs ${isGoodDay
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-400/40'
                  : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-400/40'}`}>
                  {isGoodDay ? 'Hoàng đạo' : 'Hắc đạo'}
                </span>
              )}
            </h1>
            <div className="flex items-center gap-2">
              <button className="btn-outline" onClick={onBackToMonth}>Xem tháng</button>
              <button className="btn-primary" onClick={shareDay}>Chia sẻ</button>
            </div>
          </div>
          {shareMsg && (
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2" aria-live="polite">{shareMsg}</div>
          )}
          <div className="grid sm:grid-cols-2 gap-5">
            {/* Solar (DL) */}
            <div className="bg-sky-50 dark:bg-sky-900/20 rounded-lg p-5 border border-sky-100 dark:border-sky-800">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span className="rounded px-1.5 py-0.5 text-[10px] bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-400/40">DL</span>
                <span className="font-medium">Dương lịch</span>
              </div>
              <div className="mt-1 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{solar.day}/{solar.month}/{solar.year}</div>
              {solarHoliday && (
                <div className="mt-2 text-sm leading-relaxed">
                  <span className="font-medium text-gray-700 dark:text-gray-200 mr-1">Lễ DL:</span>
                  <span className="text-red-600 dark:text-red-400">{solarHoliday.name}</span>
                </div>
              )}
              <div className="h-px my-3 bg-blue-100 dark:bg-blue-900/40" />
              <div>
                <span className="inline-flex items-center rounded px-2 py-0.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-400/40">
                  Tiết khí: <span className="ml-1 font-medium">{tk}</span>
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                <div>Trước: <span className="font-medium">{prevTk.name}</span> ({prevTk.date.day}/{prevTk.date.month}/{prevTk.date.year})</div>
                <div>Sau: <span className="font-medium">{nextTk.name}</span> ({nextTk.date.day}/{nextTk.date.month}/{nextTk.date.year})</div>
              </div>
            </div>

            {/* Lunar (AL) */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-5 border border-emerald-100 dark:border-emerald-800">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span className="rounded px-1.5 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-400/40">AL</span>
                <span className="font-medium">Âm lịch {lunar.leap ? '(Nhuận)' : ''}</span>
                {(isRam || isM1) && (
                  <span className="ml-auto rounded px-1.5 py-0.5 text-[10px] bg-primary/10 text-primary dark:bg-primary/20">{isRam ? 'Rằm' : 'Mùng 1'}</span>
                )}
              </div>
              <div className="mt-1 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{lunar.day}/{lunar.month}/{lunar.year}</div>
              <div className="text-sm text-gray-700 dark:text-gray-200 mt-1 leading-relaxed">
                Tháng {lunarMonthName(lunar.month)} · <span className="font-medium">{canchi.month}</span>
              </div>
              {lunarHoliday && (
                <div className="mt-2 text-sm leading-relaxed">
                  <span className="font-medium text-gray-700 dark:text-gray-200 mr-1">Lễ AL:</span>
                  <span className="text-red-600 dark:text-red-400">{lunarHoliday.name}</span>
                </div>
              )}
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-5 text-sm leading-relaxed">
            <div className="card p-5">
              <div className="text-gray-500">Can chi năm</div>
              <div className="font-medium">{canchi.year}</div>
            </div>
            <div className="card p-5">
              <div className="text-gray-500">Can chi tháng</div>
              <div className="font-medium">{canchi.month}</div>
            </div>
            <div className="card p-5">
              <div className="text-gray-500">Can chi ngày</div>
              <div className="font-medium">{canchi.day}</div>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="text-lg font-semibold mb-2">Ngày {q.rate}</h2>
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Trực: <span className="font-medium text-gray-800 dark:text-gray-100">{q.name}</span></div>
          <div className="text-sm leading-relaxed">
            <div className="font-medium text-emerald-700 dark:text-emerald-300">Nên làm</div>
            <ul className="list-disc ml-5 mb-2 space-y-2">
              {q.good.map((x,i)=>(<li key={i}>{x}</li>))}
            </ul>
            <div className="font-medium text-rose-700 dark:text-rose-300">Kiêng kỵ</div>
            <ul className="list-disc ml-5 space-y-2">
              {q.bad.map((x,i)=>(<li key={i}>{x}</li>))}
            </ul>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-lg font-semibold mb-3">Giờ hoàng đạo / hắc đạo</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm leading-relaxed">
          <div>
            <div className="font-medium mb-2">Giờ hoàng đạo</div>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {gioHoangDao.filter(x=>x.good).map((h,i)=>(
                <li key={i} className={`px-2 py-1 rounded bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-400/40 ${isToday && h.name===currentHourLabel ? 'ring-2 ring-emerald-300 dark:ring-emerald-400' : ''}`}>
                  <span className="font-medium">{h.name}</span> <span className="text-gray-600 dark:text-gray-300">{h.range}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-medium mb-2">Giờ hắc đạo</div>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {gioHoangDao.filter(x=>!x.good).map((h,i)=>(
                <li key={i} className={`px-2 py-1 rounded bg-rose-50 border border-rose-200 dark:bg-rose-900/20 dark:border-rose-400/40 ${isToday && h.name===currentHourLabel ? 'ring-2 ring-rose-300 dark:ring-rose-400' : ''}`}>
                  <span className="font-medium">{h.name}</span> <span className="text-gray-600 dark:text-gray-300">{h.range}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-lg font-semibold mb-2">Sự kiện trong ngày</h2>
        {(!solarHoliday && !lunarHoliday && dayReminders.length===0) ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">Không có sự kiện</div>
        ) : (
          <ul className="space-y-2 text-sm leading-relaxed">
            {solarHoliday && (
              <li className="flex items-center gap-2">
                <span className="rounded px-1.5 py-0.5 text-[10px] bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-400/40">DL</span>
                <span className="font-medium">{solarHoliday.name}</span>
              </li>
            )}
            {lunarHoliday && (
              <li className="flex items-center gap-2">
                <span className="rounded px-1.5 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-400/40">AL</span>
                <span className="font-medium">{lunarHoliday.name}</span>
              </li>
            )}
            {dayReminders.map(r => (
              <li key={r.id} className="flex items-center gap-2">
                <span className="rounded px-1.5 py-0.5 text-[10px] bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-400/40">NH</span>
                <span className="font-medium">{r.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
