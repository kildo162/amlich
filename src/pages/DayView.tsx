import { useEffect, useMemo, useState } from 'react'
import { viDate, viWeekday } from '@utils/calendar'
import { getLunarHoliday, getSolarHoliday } from '@utils/holidays'
import { dayQuality } from '@utils/dayquality'
import { infoForDate } from '@utils/lunar'
import { listReminders, REMINDERS_UPDATED_EVENT } from '@utils/reminders'

export default function DayView({ date, onPickDate }: { date: Date; onPickDate: (d: Date) => void }) {
  const info = infoForDate(date)
  const { solar, lunar, canchi, gioHoangDao, jd, tietKhi } = info

  const solarHoliday = getSolarHoliday(solar.month, solar.day)
  const lunarHoliday = getLunarHoliday(lunar.month, lunar.day)

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

  const nextDay = () => onPickDate(new Date(date.getFullYear(), date.getMonth(), date.getDate()+1))
  const prevDay = () => onPickDate(new Date(date.getFullYear(), date.getMonth(), date.getDate()-1))

  return (
    <section className="mt-6 space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl sm:text-2xl font-semibold">
              {viWeekday(date)} · {viDate(date)}
              {(isGoodDay || isBadDay) && (
                <span className={`ml-2 align-middle px-2 py-0.5 rounded text-xs ${isGoodDay ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                  {isGoodDay ? 'Hoàng đạo' : 'Hắc đạo'}
                </span>
              )}
            </h1>
            <div className="flex items-center gap-2">
              <button className="btn-outline" onClick={prevDay}>← Hôm trước</button>
              <button className="btn-outline" onClick={nextDay}>Hôm sau →</button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-sky-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">Dương lịch</div>
              <div className="text-2xl font-semibold">{solar.day}/{solar.month}/{solar.year}</div>
              {solarHoliday && <div className="text-sm text-red-600 mt-1">{solarHoliday.name}</div>}
            </div>
            <div className="bg-emerald-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">Âm lịch {lunar.leap ? '(Nhuận)' : ''}</div>
              <div className="text-2xl font-semibold">{lunar.day}/{lunar.month}/{lunar.year}</div>
              {lunarHoliday && <div className="text-sm text-red-600 mt-1">{lunarHoliday.name}</div>}
            </div>
          </div>
          <div className="grid sm:grid-cols-4 gap-3 text-sm">
            <div className="card p-3">
              <div className="text-gray-500">Can chi năm</div>
              <div className="font-medium">{canchi.year}</div>
            </div>
            <div className="card p-3">
              <div className="text-gray-500">Can chi tháng</div>
              <div className="font-medium">{canchi.month}</div>
            </div>
            <div className="card p-3">
              <div className="text-gray-500">Can chi ngày</div>
              <div className="font-medium">{canchi.day}</div>
            </div>
            <div className="card p-3">
              <div className="text-gray-500">Tiết khí</div>
              <div className="font-medium">{tietKhi}</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <h2 className="text-lg font-semibold mb-2">Ngày {q.rate}</h2>
          <div className="text-sm text-gray-600 mb-1">Trực: <span className="font-medium text-gray-800">{q.name}</span></div>
          <div className="text-sm">
            <div className="font-medium text-emerald-700">Nên làm</div>
            <ul className="list-disc ml-5 mb-2">
              {q.good.map((x,i)=>(<li key={i}>{x}</li>))}
            </ul>
            <div className="font-medium text-rose-700">Kiêng kỵ</div>
            <ul className="list-disc ml-5">
              {q.bad.map((x,i)=>(<li key={i}>{x}</li>))}
            </ul>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h2 className="text-lg font-semibold mb-3">Giờ hoàng đạo / hắc đạo</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div>
            <div className="font-medium mb-1">Giờ hoàng đạo</div>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-1">
              {gioHoangDao.filter(x=>x.good).map((h,i)=>(
                <li key={i} className="px-2 py-1 rounded bg-emerald-50 border border-emerald-200">
                  <span className="font-medium">{h.name}</span> <span className="text-gray-600">{h.range}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-medium mb-1">Giờ hắc đạo</div>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-1">
              {gioHoangDao.filter(x=>!x.good).map((h,i)=>(
                <li key={i} className="px-2 py-1 rounded bg-rose-50 border border-rose-200">
                  <span className="font-medium">{h.name}</span> <span className="text-gray-600">{h.range}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h2 className="text-lg font-semibold mb-2">Sự kiện trong ngày</h2>
        {(!solarHoliday && !lunarHoliday && dayReminders.length===0) ? (
          <div className="text-sm text-gray-500">Không có sự kiện</div>
        ) : (
          <ul className="space-y-1 text-sm">
            {solarHoliday && (
              <li className="flex items-center gap-2">
                <span className="rounded px-1.5 py-0.5 text-[10px] bg-blue-50 text-blue-700 border border-blue-200">DL</span>
                <span className="font-medium">{solarHoliday.name}</span>
              </li>
            )}
            {lunarHoliday && (
              <li className="flex items-center gap-2">
                <span className="rounded px-1.5 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">AL</span>
                <span className="font-medium">{lunarHoliday.name}</span>
              </li>
            )}
            {dayReminders.map(r => (
              <li key={r.id} className="flex items-center gap-2">
                <span className="rounded px-1.5 py-0.5 text-[10px] bg-sky-50 text-sky-700 border border-sky-200">NH</span>
                <span className="font-medium">{r.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
