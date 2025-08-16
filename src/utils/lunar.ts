// Âm dương lịch Việt Nam (TZ +7). Chính xác 1900–2100 cho chuyển đổi.
// Thuật toán thiên văn phổ biến (NQH/astro) không phụ thuộc API ngoài.

export type SolarDate = { day: number; month: number; year: number }
export type LunarDate = { day: number; month: number; year: number; leap: boolean; jd: number }

const TZ = 7
export const CAN = ['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý']
export const CHI = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi']

function INT(n: number) { return Math.floor(n) }

export function jdFromDate(d: number, m: number, y: number) {
  const a = INT((14-m)/12), yy = y+4800-a, mm = m+12*a-3
  let jd = d + INT((153*mm+2)/5) + 365*yy + INT(yy/4) - INT(yy/100) + INT(yy/400) - 32045
  if (jd < 2299161) jd = d + INT((153*mm+2)/5) + 365*yy + INT(yy/4) - 32083
  return jd
}

export function jdToDate(jd: number): SolarDate {
  let a,b,c,d,e,m
  if (jd > 2299160) { a = jd+32044; b = INT((4*a+3)/146097); c = a - INT(b*146097/4) }
  else { b = 0 as any; c = jd + 32082 }
  d = INT((4*c+3)/1461); e = c - INT(1461*d/4); m = INT((5*e+2)/153)
  return { day: e-INT((153*m+2)/5)+1, month: m+3-12*INT(m/10), year: b*100+d-4800+INT(m/10) }
}

function NewMoon(k: number) {
  const T=k/1236.85, T2=T*T, T3=T2*T, dr=Math.PI/180
  let jd1=2415020.75933+29.53058868*k+0.0001178*T2-0.000000155*T3
  jd1+=0.00033*Math.sin((166.56+132.87*T-0.009173*T2)*dr)
  const M=359.2242+29.10535608*k-0.0000333*T2-0.00000347*T3
  const Mpr=306.0253+385.81691806*k+0.0107306*T2+0.00001236*T3
  const F=21.2964+390.67050646*k-0.0016528*T2-0.00000239*T3
  let C1=(0.1734-0.000393*T)*Math.sin(M*dr)+0.0021*Math.sin(2*M*dr)
  C1+=-0.4068*Math.sin(Mpr*dr)+0.0161*Math.sin(2*Mpr*dr)-0.0004*Math.sin(3*Mpr*dr)
  C1+=0.0104*Math.sin(2*F*dr)-0.0051*Math.sin((M+Mpr)*dr)-0.0074*Math.sin((M-Mpr)*dr)
  C1+=0.0004*Math.sin((2*F+M)*dr)-0.0004*Math.sin((2*F-M)*dr)-0.0006*Math.sin((2*F+Mpr)*dr)
  C1+=0.0010*Math.sin((2*F-Mpr)*dr)+0.0005*Math.sin((2*Mpr+M)*dr)
  const deltat = T<-11 ? 0.001+0.000839*T+0.0002261*T2-0.00000845*T3-0.000000081*T*T3 : -0.000278+0.000265*T+0.000262*T2
  return jd1 + C1 - deltat
}
function getNewMoonDay(k: number, tz: number) { return INT(NewMoon(k)+0.5+tz/24) }

function SunLongitude(jdn: number){
  const T=(jdn-2451545.0)/36525, T2=T*T, dr=Math.PI/180
  const M=357.52910+35999.05030*T-0.0001559*T2-0.00000048*T*T2
  const L0=280.46645+36000.76983*T+0.0003032*T2
  let DL=(1.914600-0.004817*T-0.000014*T2)*Math.sin(dr*M)
  DL+=(0.019993-0.000101*T)*Math.sin(2*dr*M)+0.000290*Math.sin(3*dr*M)
  let L=(L0+DL)*dr; L-=2*Math.PI*INT(L/(2*Math.PI)); return L
}
function getSunLongitude(jdn:number,tz:number){ return INT(SunLongitude(jdn-0.5-tz/24)/Math.PI*6) }

function getLunarMonth11(y:number,tz:number){
  const off = jdFromDate(31,12,y)-2415021
  const k = INT(off/29.530588853)
  let nm = getNewMoonDay(k, tz)
  if (getSunLongitude(nm, tz) >= 9) nm = getNewMoonDay(k-1, tz)
  return nm
}
function getLeapMonthOffset(a11:number,tz:number){
  const k=INT(0.5+(a11-2415021.076998695)/29.530588853)
  let last=0, i=1, arc=getSunLongitude(getNewMoonDay(k+i,tz),tz)
  do { last=arc; i++; arc=getSunLongitude(getNewMoonDay(k+i,tz),tz) } while(arc!==last && i<15)
  return i-1
}

export function convertSolar2Lunar(d:number,m:number,y:number):LunarDate{
  const dayNumber=jdFromDate(d,m,y)
  const k=INT((dayNumber-2415021.076998695)/29.530588853)
  let monthStart=getNewMoonDay(k+1,TZ); if(monthStart>dayNumber) monthStart=getNewMoonDay(k,TZ)
  let a11=getLunarMonth11(y,TZ), b11=a11, lunarYear:number
  if(a11>=monthStart){ lunarYear=y; a11=getLunarMonth11(y-1,TZ) } else { lunarYear=y+1; b11=getLunarMonth11(y+1,TZ) }
  const lunarDay=dayNumber-monthStart+1
  const diff=INT((monthStart-a11)/29)
  let lunarLeap=false
  let lunarMonth=diff+11
  if(b11-a11>365){ const leapMonthDiff=getLeapMonthOffset(a11,TZ); if(diff>=leapMonthDiff){ lunarMonth=diff+10; if(diff===leapMonthDiff) lunarLeap=true } }
  if(lunarMonth>12) lunarMonth-=12
  if(lunarMonth>=11 && diff<4) lunarYear-=1
  return { day:lunarDay, month:lunarMonth, year:lunarYear, leap:lunarLeap, jd: dayNumber }
}

export function convertLunar2Solar(lDay:number,lMonth:number,lYear:number,lLeap:boolean):SolarDate{
  let a11:number,b11:number
  if(lMonth<11){ a11=getLunarMonth11(lYear-1,TZ); b11=getLunarMonth11(lYear,TZ) }
  else { a11=getLunarMonth11(lYear,TZ); b11=getLunarMonth11(lYear+1,TZ) }
  let k=INT(0.5+(a11-2415021.076998695)/29.530588853)
  let off=lMonth-11; if(off<0) off+=12
  if(b11-a11>365){ const leapOff=getLeapMonthOffset(a11,TZ); const leapMonth=leapOff-2<0?leapOff+10:leapOff-2
    if(lLeap && lMonth!==leapMonth) return { day:0, month:0, year:0 }
    if(lLeap || off>=leapOff) off+=1
  }
  const monthStart=getNewMoonDay(k+off,TZ)
  return jdToDate(monthStart + lDay - 1)
}

// Can Chi
export function canChiYear(lunarYear:number){ const can=CAN[(lunarYear+6)%10], chi=CHI[(lunarYear+8)%12]; return `${can} ${chi}` }
export function canChiDayFromJd(jd:number){ const can=CAN[(jd+9)%10], chi=CHI[(jd+1)%12]; return `${can} ${chi}` }
export function canChiMonth(lunarYear:number,lunarMonth:number){
  const canYear=(lunarYear+6)%10
  // Month stem: month 1 stem depends on year's stem group.
  // Correct formula: (yearStem*2 + lunarMonth + 1) % 10
  const can=CAN[(canYear*2 + lunarMonth + 1)%10]
  const chi=CHI[(lunarMonth+1)%12]
  return `${can} ${chi}`
}
export function canChiHourFromJd(jd:number, hour:number){
  const chiIndex = INT(((hour+1)%24)/2) % 12
  const canDay = (jd+9)%10
  const can = CAN[(canDay*2 + chiIndex)%10]
  const chi = CHI[chiIndex]
  return `${can} ${chi}`
}

// Giờ hoàng đạo theo địa chi ngày
const GIO_HD = [
  '110100101100','001101001011','110011010010','101100110100',
  '010110011010','101011001101','010101100110','011010110011',
  '001101011001','100110101100','010011010110','101001101011'
]
export const HOUR_LABELS = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi']
export const HOUR_RANGES = ['23:00-01:00','01:00-03:00','03:00-05:00','05:00-07:00','07:00-09:00','09:00-11:00','11:00-13:00','13:00-15:00','15:00-17:00','17:00-19:00','19:00-21:00','21:00-23:00']
export function gioHoangDaoFromJd(jd:number){
  const chiDay = (jd+1)%12
  const mask = GIO_HD[chiDay]
  return HOUR_LABELS.map((name,idx)=>({ name, range:HOUR_RANGES[idx], good: mask[idx]==='1' }))
}

// Tiết khí (24 solar terms) tên tiếng Việt, bắt đầu từ Lập Xuân (315°)
export const SOLAR_TERMS_VN = [
  'Lập xuân','Vũ thủy','Kinh trập','Xuân phân','Thanh minh','Cốc vũ',
  'Lập hạ','Tiểu mãn','Mang chủng','Hạ chí','Tiểu thử','Đại thử',
  'Lập thu','Xử thử','Bạch lộ','Thu phân','Hàn lộ','Sương giáng',
  'Lập đông','Tiểu tuyết','Đại tuyết','Đông chí','Tiểu hàn','Đại hàn'
]
// Lấy kinh độ mặt trời theo độ, hiệu chỉnh múi giờ VN giống như getSunLongitude
export function solarLongitudeDeg(jdn:number){
  const L = SunLongitude(jdn - 0.5 - TZ/24)
  return (L*180/Math.PI + 360) % 360
}
export function solarTermIndexFromJd(jdn:number){
  const deg = solarLongitudeDeg(jdn)
  // 315° là mốc Lập xuân
  const idx = Math.floor(((deg - 315 + 360) % 360) / 15)
  return idx
}
export function solarTermNameFromJd(jdn:number){ return SOLAR_TERMS_VN[solarTermIndexFromJd(jdn)] }

// Tìm mốc bắt đầu (JDN) của tiết khí chứa ngày jd
export function solarTermStartJd(jd:number){
  const idx = solarTermIndexFromJd(jd)
  let j = jd
  while (solarTermIndexFromJd(j-1) === idx) j--
  return j
}
// Ngày bắt đầu tiết khí kế tiếp (so với jd)
export function nextSolarTermStartJd(jd:number){
  const idx = solarTermIndexFromJd(jd)
  let j = jd+1
  while (solarTermIndexFromJd(j) === idx) j++
  return j
}
// Ngày bắt đầu tiết khí liền trước (so với jd)
export function prevSolarTermStartJd(jd:number){
  const start = solarTermStartJd(jd)
  let k = start-1
  const prevIdx = solarTermIndexFromJd(k)
  while (solarTermIndexFromJd(k-1) === prevIdx) k--
  return k
}
export function solarTermPrevNext(jd:number){
  const prevJd = prevSolarTermStartJd(jd)
  const nextJd = nextSolarTermStartJd(jd)
  return {
    prev: { jd: prevJd, name: solarTermNameFromJd(prevJd), date: jdToDate(prevJd) },
    next: { jd: nextJd, name: solarTermNameFromJd(nextJd), date: jdToDate(nextJd) },
  }
}

// Tiện ích gộp: tính toàn bộ thông tin cho một ngày dương
export function infoForDate(date: Date){
  const d=date.getDate(), m=date.getMonth()+1, y=date.getFullYear()
  const jd=jdFromDate(d,m,y)
  const lunar=convertSolar2Lunar(d,m,y)
  const ccYear=canChiYear(lunar.year)
  const ccMonth=canChiMonth(lunar.year,lunar.month)
  const ccDay=canChiDayFromJd(jd)
  const gio=gioHoangDaoFromJd(jd)
  const tietKhi = solarTermNameFromJd(jd)
  return { jd, solar:{day:d,month:m,year:y}, lunar, canchi:{ year:ccYear, month:ccMonth, day:ccDay }, gioHoangDao: gio, tietKhi }
}
