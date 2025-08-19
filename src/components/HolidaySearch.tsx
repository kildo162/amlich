import { useMemo, useState } from 'react'
import { searchHolidays } from '@utils/holidays'

export default function HolidaySearch() {
  const [q, setQ] = useState('')
  const results = useMemo(()=>searchHolidays(q), [q])

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <input
          id="holiday-search-input"
          value={q}
          onChange={e=>setQ(e.target.value)}
          aria-label="Tìm kiếm ngày lễ"
          placeholder="Nhập tên ngày lễ (ví dụ: Tết, rằm, giỗ tổ...)"
          className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>
      {q && (
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{results.length} kết quả</div>
      )}
      <ul className="space-y-2">
        {results.map((r,i)=>(
          <li key={i} className="card p-2 flex items-center justify-between gap-2">
            <div className="text-sm">
              <span className="font-medium">{r.name}</span>
              <span className="ml-1 text-gray-600 dark:text-gray-400">· {r.d}/{r.m} {r.type === 'dương' ? '(dương)' : '(âm)'}
              </span>
            </div>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] ${r.type==='dương'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-400/40'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-400/40'}`}
            >
              {r.type==='dương' ? 'DL' : 'AL'}
            </span>
          </li>
        ))}
        {!q && (
          <li className="text-sm text-gray-500">Gợi ý: "Tết", "Quốc khánh", "Rằm"...</li>
        )}
      </ul>
    </div>
  )
}
