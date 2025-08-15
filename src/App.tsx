import { useEffect, useMemo, useState } from 'react'
import DayView from '@pages/DayView'
import MonthView from '@pages/MonthView'
import Header from '@components/Header'
import HolidaySearch from '@components/HolidaySearch'
import ReminderList from '@components/ReminderList'
import { getToday } from '@utils/format'

export type ViewMode = 'day' | 'month'

export default function App() {
  const [view, setView] = useState<ViewMode>('month')
  const [selected, setSelected] = useState<Date>(() => getToday())

  // install PWA service worker update toasts (vite-plugin-pwa injects registration)
  useEffect(() => {
    // noop for now
  }, [])

  const onPickDate = (d: Date) => setSelected(d)

  return (
    <div className="min-h-full">
      <Header view={view} setView={setView} selected={selected} onPickDate={onPickDate} />

      <main className="max-w-6xl mx-auto px-3 sm:px-6 pb-24">
        {view === 'month' ? (
          <MonthView selected={selected} onPickDate={onPickDate} switchToDay={() => setView('day')} />
        ) : (
          <DayView date={selected} onPickDate={onPickDate} />
        )}

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
    </div>
  )
}
