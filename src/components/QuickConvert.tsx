import { useMemo, useState } from 'react'
import { convertLunar2Solar, convertSolar2Lunar } from '@utils/lunar'
import { fmtDateISO, parseISO } from '@utils/format'

export default function QuickConvert({ onPickDate }: { onPickDate: (d: Date) => void }) {
  const [mode, setMode] = useState<'d2a'|'a2d'>('d2a')
  const [solar, setSolar] = useState<Date>(()=>new Date())
  const [lunarInput, setLunarInput] = useState({ d: 1, m: 1, y: 2000, leap: false })

  const lunarResult = useMemo(()=>{
    const d=solar.getDate(), m=solar.getMonth()+1, y=solar.getFullYear()
    return convertSolar2Lunar(d,m,y)
  }, [solar])

  const solarResult = useMemo(()=>{
    const s = convertLunar2Solar(lunarInput.d, lunarInput.m, lunarInput.y, lunarInput.leap)
    if (s.year === 0) return null
    return new Date(s.year, s.month-1, s.day)
  }, [lunarInput])

  return (
    <div className="grid md:grid-cols-2 gap-4 text-sm">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <button className={`btn-outline ${mode==='d2a'?'bg-gray-100':''}`} onClick={()=>setMode('d2a')}>Dương → Âm</button>
          <button className={`btn-outline ${mode==='a2d'?'bg-gray-100':''}`} onClick={()=>setMode('a2d')}>Âm → Dương</button>
        </div>

        {mode==='d2a' ? (
          <div className="space-y-2">
            <label className="block">Chọn ngày dương</label>
            <input type="date" className="border rounded-lg px-3 py-2" value={fmtDateISO(solar)} onChange={e=>setSolar(parseISO(e.target.value))}/>
            <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
              Kết quả âm: <span className="font-medium">{lunarResult.day}/{lunarResult.month}{lunarResult.leap?' (nhuận)':''}/{lunarResult.year}</span>
            </div>
            <button className="btn-primary" onClick={()=>onPickDate(solar)}>Đặt làm ngày đang xem</button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
              <div>
                <label className="block">Ngày (âm)</label>
                <input type="number" min={1} max={30} className="w-full border rounded-lg px-3 py-2" value={lunarInput.d} onChange={e=>setLunarInput(v=>({...v, d: Number(e.target.value)}))}/>
              </div>
              <div>
                <label className="block">Tháng (âm)</label>
                <input type="number" min={1} max={12} className="w-full border rounded-lg px-3 py-2" value={lunarInput.m} onChange={e=>setLunarInput(v=>({...v, m: Number(e.target.value)}))}/>
              </div>
              <div>
                <label className="block">Năm (âm)</label>
                <input type="number" min={1900} max={2100} className="w-full border rounded-lg px-3 py-2" value={lunarInput.y} onChange={e=>setLunarInput(v=>({...v, y: Number(e.target.value)}))}/>
              </div>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={lunarInput.leap} onChange={e=>setLunarInput(v=>({...v, leap: e.target.checked}))}/>
                Nhuận
              </label>
            </div>
            {solarResult ? (
              <div className="p-2 rounded bg-sky-50 border border-sky-200">
                Kết quả dương: <span className="font-medium">{solarResult.toLocaleDateString('vi-VN')}</span>
              </div>
            ) : (
              <div className="text-rose-600">Tổ hợp tháng nhuận không hợp lệ.</div>
            )}
            {solarResult && <button className="btn-primary" onClick={()=>onPickDate(solarResult)}>Đặt làm ngày đang xem</button>}
          </div>
        )}
      </div>
    </div>
  )
}
