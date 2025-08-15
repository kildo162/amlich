import { useMemo, useState } from 'react'
import { searchHolidays } from '@utils/holidays'

export default function HolidaySearch() {
  const [q, setQ] = useState('')
  const results = useMemo(()=>searchHolidays(q), [q])

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <input
          value={q}
          onChange={e=>setQ(e.target.value)}
          placeholder="Nhập tên ngày lễ (ví dụ: Tết, rằm, giỗ tổ...)"
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>
      {q && (
        <div className="text-sm text-gray-500 mb-2">{results.length} kết quả</div>
      )}
      <ul className="space-y-2">
        {results.map((r,i)=>(
          <li key={i} className="p-2 rounded border border-gray-200">
            <div className="text-sm"><span className="font-medium">{r.name}</span> · <span className="text-gray-600">{r.type === 'dương' ? `${r.d}/${r.m} (dương)` : `${r.d}/${r.m} (âm)`}</span></div>
          </li>
        ))}
        {!q && (
          <li className="text-sm text-gray-500">Gợi ý: "Tết", "Quốc khánh", "Rằm"...</li>
        )}
      </ul>
    </div>
  )
}
