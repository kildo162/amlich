import { useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { addReminder, deleteReminder, listReminders, Reminder, saveReminders, upcomingWithin } from '@utils/reminders'
import { fmtDateISO, fmtDateVNFromISO } from '@utils/format'

export default function ReminderList({ baseDate }: { baseDate: Date }) {
  const [items, setItems] = useState<Reminder[]>(()=>listReminders())
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(fmtDateISO(baseDate))
  const [repeatYearly, setRepeatYearly] = useState(true)
  const [liveMsg, setLiveMsg] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editRepeat, setEditRepeat] = useState(false)
  const titleRef = useRef<HTMLInputElement | null>(null)
  const editTitleRef = useRef<HTMLInputElement | null>(null)

  const upcoming = useMemo(()=>upcomingWithin(14, baseDate), [items, baseDate])

  const onAdd = () => {
    if (!title.trim()) return
    const r: Reminder = { id: crypto.randomUUID(), title: title.trim(), date, repeatYearly }
    addReminder(r)
    setItems(listReminders())
    setTitle('')
    setLiveMsg(`Đã thêm nhắc nhở: ${r.title} – ${fmtDateVNFromISO(r.date)}`)
    setTimeout(() => setLiveMsg(''), 1200)
    // focus back to title input for quick entry
    try { titleRef.current?.focus() } catch {}
  }

  const onStartEdit = (r: Reminder) => {
    setEditingId(r.id)
    setEditTitle(r.title)
    setEditDate(r.date)
    setEditRepeat(!!r.repeatYearly)
    setTimeout(() => { try { editTitleRef.current?.focus() } catch {} }, 0)
  }
  const onCancelEdit = () => {
    if (editingId) {
      const cur = items.find(it => it.id === editingId)
      if (cur) {
        setLiveMsg(`Đã hủy chỉnh sửa: ${cur.title}`)
        setTimeout(() => setLiveMsg(''), 1000)
      }
    }
    setEditingId(null)
    try { titleRef.current?.focus() } catch {}
  }
  const onSaveEdit = () => {
    if (!editingId) return
    const next = items.map((it: Reminder) => it.id===editingId ? { ...it, title: editTitle.trim() || it.title, date: editDate, repeatYearly: editRepeat } : it)
    setItems(next)
    saveReminders(next)
    setLiveMsg(`Đã lưu nhắc nhở: ${editTitle.trim() || '(không tiêu đề)'} – ${fmtDateVNFromISO(editDate)}`)
    setTimeout(() => setLiveMsg(''), 1200)
    setEditingId(null)
    try { titleRef.current?.focus() } catch {}
  }
  const onDelete = (id: string) => {
    const cur = items.find(it => it.id === id)
    deleteReminder(id)
    setItems(listReminders())
    if (cur) {
      setLiveMsg(`Đã xóa nhắc nhở: ${cur.title} – ${fmtDateVNFromISO(cur.date)}`)
      setTimeout(() => setLiveMsg(''), 1200)
    }
  }
  const onToggleRepeat = (id: string) => {
    const target = items.find((it: Reminder) => it.id === id)
    const next = items.map((it: Reminder) => it.id===id ? { ...it, repeatYearly: !it.repeatYearly } : it)
    setItems(next)
    saveReminders(next)
    if (target) {
      const turnedOn = !target.repeatYearly
      setLiveMsg(`Đã ${turnedOn ? 'bật' : 'tắt'} lặp năm cho: ${target.title}`)
      setTimeout(() => setLiveMsg(''), 1000)
    }
  }

  return (
    <div className="space-y-4 text-sm">
      {/* aria-live region for reminder actions */}
      <div aria-live="polite" className="sr-only" role="status">{liveMsg}</div>
      <div className="grid sm:grid-cols-2 gap-2">
        <label htmlFor="rem-title" className="sr-only">Tiêu đề nhắc nhở</label>
        <input
          id="rem-title"
          value={title}
          onChange={(e: ChangeEvent<HTMLInputElement>)=>setTitle(e.target.value)}
          placeholder="Tên sự kiện (sinh nhật, giỗ, kỷ niệm...)"
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40"
          ref={titleRef}
          onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); onAdd() } }}
        />
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="rem-date" className="sr-only">Ngày (Dương lịch)</label>
          <input
            id="rem-date"
            type="date"
            value={date}
            onChange={(e: ChangeEvent<HTMLInputElement>)=>setDate(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 shrink-0"
            onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); onAdd() } }}
          />
          <label className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={repeatYearly} onChange={(e: ChangeEvent<HTMLInputElement>)=>setRepeatYearly(e.target.checked)} /> Lặp hàng năm
          </label>
          <button className="btn-primary shrink-0 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!title.trim()} onClick={onAdd}>Thêm</button>
        </div>
      </div>

      <div>
        <div className="font-medium mb-2">Sắp tới (14 ngày)</div>
        {upcoming.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400">Không có nhắc nhở sắp tới.</div>
        ) : (
          <ul className="space-y-1">
            {upcoming.map(({ r, when, daysLeft }: { r: Reminder; when: Date; daysLeft: number }) => (
              <li key={r.id} className="p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                {editingId === r.id ? (
                  <div className="grid sm:grid-cols-[minmax(0,1fr)_auto] gap-2 items-start">
                    <div className="grid sm:grid-cols-2 gap-2">
                      <label htmlFor={`edit-title-${r.id}`} className="sr-only">Tiêu đề</label>
                      <input
                        id={`edit-title-${r.id}`}
                        value={editTitle}
                        onChange={(e: ChangeEvent<HTMLInputElement>)=>setEditTitle(e.target.value)}
                        placeholder="Tiêu đề"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40"
                        ref={editTitleRef}
                        onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); onSaveEdit() } if(e.key==='Escape'){ e.preventDefault(); onCancelEdit() } }}
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <label htmlFor={`edit-date-${r.id}`} className="sr-only">Ngày</label>
                        <input
                          id={`edit-date-${r.id}`}
                          type="date"
                          value={editDate}
                          onChange={(e: ChangeEvent<HTMLInputElement>)=>setEditDate(e.target.value)}
                          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 shrink-0"
                          onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); onSaveEdit() } if(e.key==='Escape'){ e.preventDefault(); onCancelEdit() } }}
                        />
                        <label className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <input type="checkbox" checked={editRepeat} onChange={(e: ChangeEvent<HTMLInputElement>)=>setEditRepeat(e.target.checked)} /> Lặp năm
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <button className="btn-primary btn-sm" onClick={onSaveEdit}>Lưu</button>
                      <button className="btn-ghost" onClick={onCancelEdit}>Hủy</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-medium">{r.title}</div>
                      <div className="text-gray-600 dark:text-gray-400">{when.toLocaleDateString('vi-VN')} · còn {daysLeft} ngày</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1 text-gray-700 dark:text-gray-300">
                        <input aria-label={`Lặp năm cho ${r.title}`} type="checkbox" checked={!!r.repeatYearly} onChange={()=>(onToggleRepeat(r.id))} /> Lặp năm
                      </label>
                      <button aria-label={`Sửa nhắc nhở: ${r.title}`} className="text-sky-700 dark:text-sky-300 hover:underline" onClick={()=>onStartEdit(r)}>Sửa</button>
                      <button aria-label={`Xóa nhắc nhở: ${r.title}`} className="text-rose-600 dark:text-rose-400 hover:underline" onClick={()=>onDelete(r.id)}>Xóa</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <div className="font-medium mb-2">Tất cả</div>
        {items.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400">Chưa có nhắc nhở nào.</div>
        ) : (
          <ul className="space-y-1">
            {items.map(r => (
              <li key={r.id} className="p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                {editingId === r.id ? (
                  <div className="grid sm:grid-cols-[minmax(0,1fr)_auto] gap-2 items-start">
                    <div className="grid sm:grid-cols-2 gap-2">
                      <label htmlFor={`edit-title-${r.id}`} className="sr-only">Tiêu đề</label>
                      <input
                        id={`edit-title-${r.id}`}
                        value={editTitle}
                        onChange={(e: ChangeEvent<HTMLInputElement>)=>setEditTitle(e.target.value)}
                        placeholder="Tiêu đề"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40"
                        ref={editTitleRef}
                        onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); onSaveEdit() } if(e.key==='Escape'){ e.preventDefault(); onCancelEdit() } }}
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <label htmlFor={`edit-date-${r.id}`} className="sr-only">Ngày</label>
                        <input
                          id={`edit-date-${r.id}`}
                          type="date"
                          value={editDate}
                          onChange={(e: ChangeEvent<HTMLInputElement>)=>setEditDate(e.target.value)}
                          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 shrink-0"
                          onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); onSaveEdit() } if(e.key==='Escape'){ e.preventDefault(); onCancelEdit() } }}
                        />
                        <label className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <input type="checkbox" checked={editRepeat} onChange={(e: ChangeEvent<HTMLInputElement>)=>setEditRepeat(e.target.checked)} /> Lặp năm
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <button className="btn-primary btn-sm" onClick={onSaveEdit}>Lưu</button>
                      <button className="btn-ghost" onClick={onCancelEdit}>Hủy</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-medium">{r.title}</div>
                      <div className="text-gray-600 dark:text-gray-400">{fmtDateVNFromISO(r.date)} {r.repeatYearly ? '· lặp năm' : ''}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button aria-label={`Sửa nhắc nhở: ${r.title}`} className="text-sky-700 dark:text-sky-300 hover:underline" onClick={()=>onStartEdit(r)}>Sửa</button>
                      <button aria-label={`Xóa nhắc nhở: ${r.title}`} className="text-rose-600 dark:text-rose-400 hover:underline" onClick={()=>onDelete(r.id)}>Xóa</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
