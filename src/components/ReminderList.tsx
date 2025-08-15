import { useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { addReminder, deleteReminder, listReminders, Reminder, saveReminders, upcomingWithin } from '@utils/reminders'
import { fmtDateISO, fmtDateVNFromISO } from '@utils/format'

export default function ReminderList({ baseDate }: { baseDate: Date }) {
  const [items, setItems] = useState<Reminder[]>(()=>listReminders())
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(fmtDateISO(baseDate))
  const [repeatYearly, setRepeatYearly] = useState(true)

  const upcoming = useMemo(()=>upcomingWithin(14, baseDate), [items, baseDate])

  const onAdd = () => {
    if (!title.trim()) return
    const r: Reminder = { id: crypto.randomUUID(), title: title.trim(), date, repeatYearly }
    addReminder(r)
    setItems(listReminders())
    setTitle('')
  }
  const onDelete = (id: string) => {
    deleteReminder(id)
    setItems(listReminders())
  }
  const onToggleRepeat = (id: string) => {
    const next = items.map((it: Reminder) => it.id===id ? { ...it, repeatYearly: !it.repeatYearly } : it)
    setItems(next)
    saveReminders(next)
  }

  return (
    <div className="space-y-4 text-sm">
      <div className="grid sm:grid-cols-2 gap-2">
        <input value={title} onChange={(e: ChangeEvent<HTMLInputElement>)=>setTitle(e.target.value)} placeholder="Tên sự kiện (sinh nhật, giỗ, kỷ niệm...)" className="border rounded-lg px-3 py-2" />
        <div className="flex items-center gap-2">
          <input type="date" value={date} onChange={(e: ChangeEvent<HTMLInputElement>)=>setDate(e.target.value)} className="border rounded-lg px-3 py-2" />
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={repeatYearly} onChange={(e: ChangeEvent<HTMLInputElement>)=>setRepeatYearly(e.target.checked)} /> Lặp hàng năm
          </label>
          <button className="btn-primary" onClick={onAdd}>Thêm</button>
        </div>
      </div>

      <div>
        <div className="font-medium mb-2">Sắp tới (14 ngày)</div>
        {upcoming.length === 0 ? (
          <div className="text-gray-500">Không có nhắc nhở sắp tới.</div>
        ) : (
          <ul className="space-y-1">
            {upcoming.map(({ r, when, daysLeft }: { r: Reminder; when: Date; daysLeft: number }) => (
              <li key={r.id} className="flex items-center justify-between p-2 rounded border border-gray-200">
                <div>
                  <div className="font-medium">{r.title}</div>
                  <div className="text-gray-600">{when.toLocaleDateString('vi-VN')} · còn {daysLeft} ngày</div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1 text-gray-700">
                    <input type="checkbox" checked={!!r.repeatYearly} onChange={()=>(onToggleRepeat(r.id))} /> Lặp năm
                  </label>
                  <button className="text-rose-600 hover:underline" onClick={()=>onDelete(r.id)}>Xóa</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <div className="font-medium mb-2">Tất cả</div>
        {items.length === 0 ? (
          <div className="text-gray-500">Chưa có nhắc nhở nào.</div>
        ) : (
          <ul className="space-y-1">
            {items.map(r => (
              <li key={r.id} className="flex items-center justify-between p-2 rounded border border-gray-200">
                <div>
                  <div className="font-medium">{r.title}</div>
                  <div className="text-gray-600">{fmtDateVNFromISO(r.date)} {r.repeatYearly ? '· lặp năm' : ''}</div>
                </div>
                <button className="text-rose-600 hover:underline" onClick={()=>onDelete(r.id)}>Xóa</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
