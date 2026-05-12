import './App.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import BottomNav from './components/BottomNav'
import { createSupabaseClient } from './lib/supabaseClient'
import { createTripStateStore } from './lib/tripStateStore'

const tabs = ['map', 'calendar', 'inspiration', 'receipts']
const tabMeta = {
  map: { label: 'Map', navLabel: 'Map', icon: '🗺️', short: 'M', helper: 'spatial route view' },
  calendar: { label: 'Calendar', navLabel: 'Calendar', icon: '📅', short: 'C', helper: 'day schedule' },
  inspiration: { label: 'Inspiration', navLabel: 'Inspiration', icon: '📌', short: 'I', helper: 'saved reels + ideas' },
  receipts: { label: 'Receipts', navLabel: 'Receipts', icon: '🧾', short: 'R', helper: 'confirmations + spend' },
}
const legacyTabMeta = {
  bookings: { label: 'Step 1: Choose Places' },
  derm: { label: 'Derm Procedures' },
  places: { label: 'Step 2: Select Date' },
  itinerary: { label: 'Step 3: Itinerary' },
}
const TRIP_START = new Date('2026-05-16T00:00:00')
const TRIP_END = new Date('2026-05-27T23:59:59')
const DAY_MS = 1000 * 60 * 60 * 24

function tripCountdownLabel(today = new Date()) {
  const current = new Date(today)
  const dayStart = new Date(current.getFullYear(), current.getMonth(), current.getDate())
  const tripStart = new Date(TRIP_START.getFullYear(), TRIP_START.getMonth(), TRIP_START.getDate())
  const tripEnd = new Date(TRIP_END.getFullYear(), TRIP_END.getMonth(), TRIP_END.getDate())

  if (dayStart < tripStart) {
    const daysUntil = Math.ceil((tripStart.getTime() - dayStart.getTime()) / DAY_MS)
    return `${daysUntil} days until Korea 🇰🇷`
  }

  if (dayStart <= tripEnd) {
    const tripDay = Math.floor((dayStart.getTime() - tripStart.getTime()) / DAY_MS) + 1
    return `Day ${tripDay} of Korea trip 🇰🇷`
  }

  return 'Back home — great trip! 🏠'
}
const bookingVoteOptions = [
  { value: 'yes', label: 'Yes', savedLabel: 'Yes' },
  { value: 'no', label: 'No', savedLabel: 'No' },
]
const plannerFilters = ['all', 'candidates', 'confirmed']
const mapDayColors = {
  'may-15': '#8d9dc3',
  'may-16': '#6f9f80',
  'may-17': '#d87a3c',
  'may-18': '#b36a84',
  'may-19': '#4f9ca8',
  'may-20': '#8aa2c7',
  'may-21': '#7b9f54',
  'may-22': '#c59a45',
  'may-23': '#a66fb2',
  'may-24': '#dc6f6f',
  'may-25': '#648c6f',
  'may-26': '#7f7f86',
  undecided: '#9a9690',
}
const mapMarkerPositions = {
  'Haus Nowhere Seongsu': { left: '37%', top: '28%' },
  'Tamburins Seongsu': { left: '47%', top: '33%' },
  'Olive Young N Seongsu': { left: '56%', top: '39%' },
  'Musinsa Standard Seongsu': { left: '63%', top: '46%' },
  'TIRTIR Seongsu': { left: '51%', top: '53%' },
  'Blue Elephant Seongsu': { left: '31%', top: '48%' },
  '동화고옥 롯데월드몰점': { left: '72%', top: '69%' },
  'Sofitel Ambassador Seoul': { left: '74%', top: '64%' },
  '리원피부과의원': { left: '66%', top: '58%' },
  'ReOne Dermatology': { left: '66%', top: '58%' },
}
const koreanPlaceNames = {
  'Haus Nowhere Seongsu': '하우스 나우웨어 성수',
  'Tamburins Seongsu': '탬버린즈 성수',
  'Olive Young N Seongsu': '올리브영N 성수',
  'Musinsa Standard Seongsu': '무신사 스탠다드 성수',
  'TIRTIR Seongsu': '티르티르 성수',
  'Blue Elephant Seongsu': '블루엘리펀트 성수',
  '동화고옥 롯데월드몰점': '동화고옥 롯데월드몰점',
  '리원피부과의원': '리원피부과의원',
}
const mapTargetAliases = {
  '리원피부과의원': ['ReOne', 'ReOne Dermatology'],
  'Sofitel Ambassador Seoul': ['Sofitel', 'hotel-area start'],
}
const dermProcedures = [
  {
    goal: 'Small nodules underneath the eyes',
    korean: '눈밑 작은 돌기: 비립종 / 한관종 / 눈밑지방 감별',
    visual: { tone: 'under-eye', tag: 'visual triage', headline: 'Lesion ID first', points: ['milia', 'syringoma', 'fat pad'] },
    bestFor: 'Tiny white bumps, syringoma-like bumps, or under-eye fat bags that need diagnosis first.',
    options: '비립종 제거, CO2 / Er:YAG laser, Agnes RF / needle RF, oculoplastic consult if it is fat repositioning.',
    howItWorks: 'Extraction opens milia; ablative laser or RF targets raised/glandular lesions. Fat bags are surgical, not a toner issue.',
    pricing: 'Usually ₩10k–50k per simple milia / mole-like lesion; syringoma RF or laser often ₩100k–500k+ per session depending on count.',
    pain: 'Low–moderate with numbing cream; under-eye RF/laser can sting.',
    downtime: 'Tiny scabs/redness 3–10 days; pigment control and sunscreen matter.',
    ask: '“이게 비립종인지 한관종인지, 아니면 눈밑지방인지 먼저 진단해 주세요.”',
  },
  {
    goal: 'Unbalanced facial color',
    korean: '얼굴톤 불균형: 잡티 / 기미 / 홍조 / 여드름자국 구분',
    visual: { tone: 'tone-map', tag: 'color map', headline: 'Pigment vs redness', points: ['brown spots', 'melasma caution', 'redness laser'] },
    bestFor: 'Brown spots, redness, post-acne marks, dullness, or mixed uneven tone.',
    options: '피코토닝 / pico toning, laser toning, IPL / BBL, Excel V / V-beam for redness, LDM as calming support.',
    howItWorks: 'Pigment lasers fragment melanin; vascular lasers target redness; IPL/BBL broadly treats brown + red but must be cautious with melasma.',
    pricing: 'Commonly ₩80k–300k per toning/IPL session; Excel V/V-beam often ₩150k–500k depending on area and clinic.',
    pain: 'Low–moderate: snapping heat for IPL/laser, vascular lasers can sting more.',
    downtime: 'Usually none to 3 days for toning; IPL/BBL spots may darken/flake 3–7 days; vascular redness/bruising can last longer.',
    ask: '“기미인지 잡티인지 홍조인지 구분해서 레이저를 추천해 주세요.”',
  },
  {
    goal: 'Double chin',
    korean: '이중턱: 지방 vs 피부처짐 vs 턱선 구조 감별',
    visual: { tone: 'chin', tag: 'contour check', headline: 'Fat vs laxity', points: ['submental fat', 'skin tightening', 'jawline angle'] },
    bestFor: 'Submental fullness, softer jawline, mild laxity, or true fat pocket.',
    options: '인모드 FX/Forma, 슈링크 / 리프테라 / 울쎄라, 윤곽주사 / 지방분해주사, 턱밑 지방흡입 consult for stronger fat removal.',
    howItWorks: 'RF/ultrasound heats fat and collagen layers for contouring/tightening; injections dissolve small fat pads; liposuction physically removes fat.',
    pricing: 'InMode/Shurink-style sessions often ₩100k–500k; Ulthera higher ₩500k–1.5M+; injections often ₩50k–300k/session; lipo much higher.',
    pain: 'Moderate for RF/ultrasound heat; injections are quick pinches; liposuction requires procedural anesthesia/recovery.',
    downtime: 'InMode can bruise/swell 2–7 days; lifting minimal to a few days; injections swell 2–5 days; lipo 1–2+ weeks.',
    ask: '“제 이중턱이 지방인지, 피부 처짐인지, 턱선 구조 문제인지 먼저 봐주세요.”',
  },
  {
    goal: 'Mole removal',
    korean: '점 제거: CO2 레이저 전 더마스코피 확인',
    visual: { tone: 'mole', tag: 'spot safety', headline: 'Dermoscopy first', points: ['benign check', 'CO2 laser', 'biopsy if suspicious'] },
    bestFor: 'Small benign moles, raised benign spots, and cosmetic spot cleanup.',
    options: 'CO2 laser mole removal, Er:YAG laser for superficial lesions, excision / biopsy if suspicious.',
    howItWorks: 'Ablative lasers shave/vaporize benign mole tissue layer by layer; suspicious changing moles should be excised and sent for pathology.',
    pricing: 'Often ₩10k–50k per small mole; larger/deeper lesions or excision/biopsy cost more.',
    pain: 'Low with numbing injection/cream; brief burning smell and pinpoint discomfort.',
    downtime: 'Scab/oozing care 5–10 days; redness can linger weeks; strict sunscreen/tape care reduces PIH.',
    ask: '“점 제거 전에 악성 가능성 없는지 더마스코피로 봐주세요.”',
  },
  {
    goal: 'General skin tone',
    korean: '전체 피부톤 / 결 / 광채 관리',
    visual: { tone: 'glow', tag: 'maintenance map', headline: 'Tone + texture plan', points: ['toning', 'skin booster', 'RF / fraxel'] },
    bestFor: 'Early-30s prevention, glow, pores/texture, fine lines, and maintenance tone.',
    options: 'Pico/laser toning, Rejuran / 리쥬란, Juvelook / 쥬베룩, 물광주사, Potenza/Secret RF/Fraxel for pores/scars, Aqua peel/Lhala peel for light maintenance.',
    howItWorks: 'Toning improves pigment uniformity; boosters hydrate or stimulate collagen; microneedle RF/fractional lasers remodel texture.',
    pricing: 'Light peels ₩50k–150k; toning ₩80k–300k; boosters often ₩200k–700k+; RF/fractional lasers vary widely ₩200k–800k+.',
    pain: 'Low for toning/peels; moderate for boosters and needle RF even with numbing.',
    downtime: 'Toning/peels 0–2 days; boosters swelling/bumps 1–3 days; RF/fraxel redness/roughness 3–7+ days.',
    ask: '“다운타임 적은 순서와 효과 좋은 순서로 옵션을 나눠서 설명해 주세요.”',
  },
]
const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY

function mapTarget(name, reason, options = {}) {
  const query = options.query ?? name

  return {
    name,
    reason,
    query,
    coords: options.coords,
    naverUrl: `https://map.naver.com/p/search/${encodeURIComponent(query)}`,
    kakaoUrl: `https://map.kakao.com/?q=${encodeURIComponent(query)}`,
  }
}

function itineraryDay(config) {
  return {
    mapLevel: 6,
    quietNote: '',
    ...config,
  }
}

const itineraryDays = [
  itineraryDay({
    key: 'may-15',
    date: 'May 15',
    label: 'Flight out',
    area: 'Ontario → Taipei',
    status: 'travel anchor',
    focus: 'This is a true flight day now: ONT departure just after midnight, then the long transit chain toward Korea.',
    logistics: {
      start: 'Ontario (ONT)',
      end: 'Overnight route via Taipei',
      note: 'China Airlines CI 23 leaves ONT at 12:10 AM on May 15, then the Korea arrival continues the next morning via Taipei.',
    },
    mapCenter: { lat: 34.056, lng: -117.6012 },
    stops: [
      { time: 'Before midnight', title: 'Final pack + document check', detail: 'Passport, chargers, meds, and airport timing should all be locked before heading out.', neighborhood: 'Home', type: 'anchor' },
      { time: 'Late night', title: 'Head to ONT', detail: 'Treat the airport drive as a serious buffer block, not flexible time.', neighborhood: 'Ontario International Airport', type: 'transit' },
      { time: '12:10 AM', title: 'CI 23 departs ONT', detail: 'First leg is Ontario to Taipei on China Airlines.', neighborhood: 'ONT → TPE', type: 'anchor' },
      { time: '5:15 AM local (May 16)', title: 'Arrive TPE', detail: 'Quick transfer rhythm before the final ICN leg.', neighborhood: 'Taipei Taoyuan', type: 'transit' },
    ],
    mapTargets: [
      mapTarget('Ontario International Airport', 'Departure airport', { query: 'Ontario International Airport', coords: { lat: 34.056, lng: -117.6012 } }),
      mapTarget('Taipei Taoyuan International Airport', 'Transit airport', { coords: { lat: 25.0797, lng: 121.2342 } }),
      mapTarget('Incheon International Airport', 'Arrival anchor in Korea', { coords: { lat: 37.4602, lng: 126.4407 } }),
    ],
  }),
  itineraryDay({
    key: 'may-16',
    date: 'May 16',
    label: 'Arrival + family home dinner',
    area: 'ICN → airport bus → 고덕 home base',
    status: 'family dinner at home',
    focus: 'Keep arrival day gentle: land, take the airport bus toward the parents’ home area, eat lunch separately as a couple, then let Mom’s home dinner be the warm first family evening.',
    logistics: {
      start: 'ICN Airport',
      end: 'Parents’ home / 고덕 area',
      note: 'CI 160 lands at ICN 11:30 AM. Plan on airport-bus logistics toward the parents’ home area. Mom has a daytime plan, so lunch is just the two of you; dinner is at home with parents.',
    },
    mapCenter: { lat: 37.5557, lng: 127.1542 },
    stops: [
      { time: '11:30', title: 'CI 160 lands at ICN', detail: 'Taipei to Seoul arrival; immigration, bags, and regroup without rushing.', neighborhood: 'Incheon Airport', type: 'anchor' },
      { time: '12:30–13:30', title: 'Airport bus toward parents’ home', detail: 'Use the bus ride as the low-stress transfer instead of making the arrival day too ambitious.', neighborhood: 'ICN → 강동 / 고덕', type: 'transit' },
      { time: 'Early afternoon', title: 'Lunch for two', detail: 'Mom has another plan at lunch, so keep this as a simple couple meal after arrival / transfer.', neighborhood: '강동 / 고덕 area', type: 'meal' },
      { time: 'Late afternoon', title: 'Arrival reset + unpack', detail: 'Build in shower, rest, and family hello time before dinner.', neighborhood: 'Parents’ home', type: 'hotel' },
      { time: 'Evening', title: 'Mom’s home dinner', detail: 'Casual first family dinner at home — warm, low-pressure, and better than forcing a restaurant right after landing.', neighborhood: 'Parents’ home / 고덕 area', type: 'meal' },
    ],
    mapTargets: [
      mapTarget('Incheon International Airport', 'Arrival airport', { coords: { lat: 37.4602, lng: 126.4407 } }),
      mapTarget('고덕역', 'Parents’ home area / airport-bus destination zone', { query: '고덕역', coords: { lat: 37.5557, lng: 127.1542 } }),
    ],
  }),
  itineraryDay({
    key: 'may-17',
    date: 'May 17',
    label: 'Seongsu beauty + shopping + family dinner',
    area: 'Seongsu → Jamsil / Songpa',
    status: 'Donghwa Gook dinner target',
    focus: 'Keep the daytime Seongsu loop walkable, then make the evening the nicer parent dinner target at Donghwa Gook in Lotte World Mall if the reservation works.',
    logistics: {
      start: '고덕 / east Seoul',
      end: 'Donghwa Gook / Lotte World Mall',
      note: 'Daytime stays clustered in Seongsu. Evening shifts to Jamsil/Songpa for the main parent dinner; Donghwa Gook Lotte World Mall is the likely reservation target.',
    },
    mapCenter: { lat: 37.532, lng: 127.078 },
    stops: [
      { time: '10:00', title: 'Leave home base', detail: 'Give yourselves a soft start so the day still feels like vacation.', neighborhood: '고덕 → Seongsu', type: 'transit' },
      { time: '11:00', title: 'Nail appointment', detail: 'Book the Sunday Seongsu nail shortlist first, then let the whole brand loop happen after.', neighborhood: 'Seongsu', type: 'beauty' },
      { time: '12:30', title: 'Haus Nowhere + Tamburins', detail: 'Start the brand loop with the Gentle Monster / Tamburins side of Seongsu while energy is highest.', neighborhood: 'Seongsu', type: 'shopping' },
      { time: '14:00', title: 'Olive Young + Musinsa Standard + Tir Tir', detail: 'Use the middle of the day for the beauty/shopping core and keep it walkable.', neighborhood: 'Seongsu', type: 'shopping' },
      { time: '16:00', title: 'Blue Elephant stop', detail: 'Leave a little flex here in case one of the viral places takes longer than expected.', neighborhood: 'Seongsu', type: 'shopping' },
      { time: '17:15–18:00', title: 'Move toward Jamsil / Lotte World Mall', detail: 'Give enough buffer to reset from shopping mode into the nicer parent dinner.', neighborhood: 'Seongsu → Jamsil', type: 'transit' },
      { time: '18:30', title: 'Donghwa Gook parent dinner target', detail: 'Likely reservation target for the main nicer family dinner. Private-room / special-occasion positioning makes this the one to book early.', neighborhood: 'Lotte World Mall / Jamsil', type: 'meal' },
    ],
    mapTargets: [
      mapTarget('Haus Nowhere Seongsu', 'Gentle Monster anchor stop', { query: '하우스 나우웨어 성수' }),
      mapTarget('Tamburins Seongsu', 'Beauty brand stop', { query: '탬버린즈 성수' }),
      mapTarget('Olive Young N Seongsu', 'Flagship beauty stop', { query: '올리브영N 성수' }),
      mapTarget('Musinsa Standard Seongsu', 'Clothing/basic shopping stop', { query: '무신사 스탠다드 성수' }),
      mapTarget('TIRTIR Seongsu', 'Beauty stop', { query: '티르티르 성수' }),
      mapTarget('Blue Elephant Seongsu', 'Eyewear stop', { query: '블루엘리펀트 성수' }),
      mapTarget('동화고옥 롯데월드몰점', 'Main parent dinner target', { query: '동화고옥 롯데월드몰점' }),
    ],
  }),
  itineraryDay({
    key: 'may-18',
    date: 'May 18',
    label: 'Embassy + lunch + Chahong Myeongdong perm',
    area: 'Gwanghwamun → Jongno → Myeongdong',
    status: 'hair appointment booked',
    focus: 'Protect the embassy interview first, eat lunch, then use the confirmed 2:00 PM Chahong Room Myeongdong perm as the afternoon anchor while you meet your friend nearby.',
    logistics: {
      start: 'U.S. Embassy Seoul',
      end: 'Myeongdong dinner with friend',
      note: 'Chahong Room Myeongdong is booked for 2:00 PM. Assume the perm takes 3–4 hours, so plan your friend meetup from about 2:15–5:30 and keep pickup flexible around 5:30–6:00 before dinner for three.',
    },
    mapCenter: { lat: 37.5638, lng: 126.9854 },
    stops: [
      { time: '08:15–08:25', title: 'Arrive for embassy buffer', detail: 'Get there early enough to protect the visa interview without adding a huge outside wait.', neighborhood: 'U.S. Embassy Seoul', type: 'anchor' },
      { time: '08:45', title: 'Embassy interview (you)', detail: 'This is the non-negotiable morning anchor.', neighborhood: 'Gwanghwamun', type: 'anchor' },
      { time: 'During interview', title: 'Girlfriend waits nearby', detail: 'Use a nearby cafe / waiting spot rather than trying to force the salon into the uncertain interview window.', neighborhood: 'Embassy area', type: 'beauty' },
      { time: 'After interview', title: 'Lunch regroup', detail: 'Eat first, then make one clean move toward Myeongdong for the confirmed salon appointment.', neighborhood: 'Jongno / Gwanghwamun', type: 'meal' },
      { time: '13:15–13:45', title: 'Move to Chahong Room Myeongdong', detail: 'Arrive a little early for consultation/photos so the 2:00 PM booking starts calmly.', neighborhood: 'Jongno → Myeongdong', type: 'transit' },
      { time: '14:00–17:30/18:00', title: 'Chahong Room Myeongdong perm (girlfriend)', detail: 'Confirmed 2:00 PM booking. Block 3–4 hours for consultation, perm process, dry/styling, and buffer before pickup.', neighborhood: 'Myeongdong', type: 'beauty' },
      { time: '14:15–17:30', title: 'Meet your friend while she is at Chahong', detail: 'Use the salon window for a relaxed catch-up nearby; stay close enough to pick her up when the stylist gives an ETA.', neighborhood: 'Myeongdong / Euljiro', type: 'anchor' },
      { time: '17:30–18:00', title: 'Pick up girlfriend at Chahong', detail: 'Check in by message around the 3-hour mark; if the perm runs long, slide dinner later rather than rushing the finish.', neighborhood: 'Myeongdong', type: 'beauty' },
      { time: '18:30', title: 'Dinner for three', detail: 'You, girlfriend, and your friend can eat together after pickup; pick somewhere close to Myeongdong/Euljiro unless the salon finishes early.', neighborhood: 'Myeongdong / Euljiro', type: 'meal' },
    ],
    mapTargets: [
      mapTarget('US Embassy Seoul', 'Your important embassy task', { query: '주한미국대사관' }),
      mapTarget('Starbucks Ima Building', 'Easy wait point near the embassy', { query: '스타벅스 이마빌딩점' }),
      mapTarget('Chahong Room Myeongdong', 'Confirmed 2:00 PM girlfriend perm booking', { query: '차홍룸 명동점' }),
      mapTarget('Myeongdong', 'Pickup and dinner zone after the appointment', { query: '명동' }),
      mapTarget('Euljiro 1-ga', 'Nearby friend meetup / dinner fallback area', { query: '을지로입구역' }),
    ],
  }),
  itineraryDay({
    key: 'may-19',
    date: 'May 19',
    label: 'Jeju east coast drive + Seongsan',
    area: 'Gimpo → Jeju → Gujwa / Seongsan',
    status: 'east day route',
    focus: 'Use the first island day for an east-coast loop instead of forcing hotel-first logistics: late lunch, a calm beach stop, then Seongsan-side views before dinner.',
    quietNote: 'Keep the east day feeling scenic and open-ended: beach walk, photo stop, then Seongsan when the light softens.',
    logistics: {
      start: 'Seoul / Gimpo Airport',
      end: 'Seongsan side dinner → Landing Jeju Shinhwa',
      note: 'Jeju Air 7C115 departs GMP at 11:35 AM on Tue May 19. After the Jeju airport shuttle and Kona EV pickup, let the route run east first so the day can hold a Gujwa / Pyeongdae stop, then Seongsan Ilchulbong area, then a late check-in back at Landing Jeju Shinhwa.',
    },
    mapCenter: { lat: 33.4556, lng: 126.9244 },
    stops: [
      { time: '08:30', title: 'Leave for Gimpo', detail: 'Start the Jeju segment with a calm transfer instead of squeezing the airport timing.', neighborhood: 'Seoul → GMP', type: 'transit' },
      { time: '09:30', title: 'Bag drop + security buffer', detail: 'Both of you are booked on 7C115 with 15 kg checked baggage, so protect this airport block.', neighborhood: 'Gimpo Airport', type: 'anchor' },
      { time: '11:35', title: 'Jeju Air 7C115 departs Gimpo', detail: 'This is the actual start of the Jeju flight segment for both of you.', neighborhood: 'GMP → CJU', type: 'anchor' },
      { time: '~12:45', title: 'Land in Jeju + move to shuttle', detail: 'Once off the plane, head toward the rental shuttle rather than lingering in the terminal.', neighborhood: 'Jeju Airport', type: 'transit' },
      { time: 'After landing', title: 'Shuttle to 특별한렌트카', detail: 'Take the rental shuttle from Jeju Airport to the pickup office at 제주특별자치도 제주시 공항로1길 38.', neighborhood: 'Jeju Airport → rental shuttle', type: 'transit' },
      { time: '13:00', title: 'Pick up Kona 2nd gen EV', detail: 'Rental window begins here and runs until May 21 at 10:00 AM.', neighborhood: '특별한렌트카', type: 'anchor' },
      { time: '14:15', title: 'Late lunch on the east side', detail: 'Make the first island meal part of the drive rather than doubling back toward the hotel.', neighborhood: 'Gujwa / Seongsan', type: 'meal' },
      { time: '16:15', title: 'Pyeongdae beach walk', detail: 'Good slot for a calm beach stop, a short walk, and a few casual couple photos before driving farther east.', neighborhood: 'Pyeongdae', type: 'shopping' },
      { time: '18:00', title: 'Seongsan Ilchulbong coastal view', detail: 'Treat Seongsan as the visual anchor for the late afternoon or early evening rather than the main timed pressure point.', neighborhood: 'Seongsan', type: 'anchor' },
      { time: '19:15', title: 'East-side seafood dinner', detail: 'Keep dinner near the Seongsan / eastern coast cluster before the longer drive back west.', neighborhood: 'Seongsan / east Jeju', type: 'meal' },
      { time: 'Late evening', title: 'Landing Jeju Shinhwa check-in', detail: 'Use the hotel as the landing point after the east-coast loop, not the first stop of the day.', neighborhood: 'Landing Jeju Shinhwa', type: 'hotel' },
    ],
    mapTargets: [
      mapTarget('Gimpo International Airport', 'Jeju departure airport', { query: '김포국제공항', coords: { lat: 37.5583, lng: 126.7906 } }),
      mapTarget('Jeju International Airport', 'Jeju arrival anchor', { coords: { lat: 33.5104, lng: 126.4914 } }),
      mapTarget('특별한렌트카', 'Rental-car pickup office', { query: '제주특별자치도 제주시 공항로1길 38', coords: { lat: 33.5049, lng: 126.4926 } }),
      mapTarget('곰막식당', 'Strong east-side uni lunch option', { query: '곰막식당' }),
      mapTarget('평대해변', 'Scenic east-coast beach stop', { query: '평대해변', coords: { lat: 33.5338, lng: 126.8356 } }),
      mapTarget('성산일출봉', 'Late-afternoon / early-evening view anchor', { query: '성산일출봉', coords: { lat: 33.4589, lng: 126.9425 } }),
      mapTarget('Landing Jeju Shinhwa', 'Jeju hotel base after the east loop', { query: '랜딩관 제주신화월드 호텔앤리조트' }),
    ],
  }),
  itineraryDay({
    key: 'may-20',
    date: 'May 20',
    label: 'Jeju west food + coast day',
    area: 'Shinhwa / Osulloc / Hyeopjae / Aewol',
    status: 'west day route',
    focus: 'Make the full Jeju day feel like a west-side food-and-coast loop: one strong lunch anchor, one easy museum / cafe block, then a beach stop before black pork dinner.',
    logistics: {
      start: 'Landing Jeju Shinhwa',
      end: 'Landing Jeju Shinhwa',
      note: 'Kona 2nd gen EV is actively with you through this whole day; keep the route simple: west-side lunch first, then Osulloc / tea-museum zone, then one beach stop, then an Aewol-side black pork dinner before returning to the hotel base.',
    },
    mapCenter: { lat: 33.3946, lng: 126.2412 },
    stops: [
      { time: 'Morning', title: 'Easy hotel start', detail: 'Do not overload the morning; leave enough margin for queue timing at lunch.', neighborhood: 'Landing Jeju Shinhwa', type: 'hotel' },
      { time: '11:00', title: 'Bar Sul Sang lunch window', detail: 'Make the imokase lunch the main midday anchor if the queue works out cleanly.', neighborhood: 'Hallim', type: 'meal' },
      { time: '14:00', title: 'Osulloc / tea museum block', detail: 'Keep this part easy and photo-friendly rather than stacking too many separate west-side stops.', neighborhood: 'Andeok / Osulloc', type: 'shopping' },
      { time: '17:00', title: 'Geumneung or nearby west beach stop', detail: 'Use one beach stop late in the day instead of trying to hit multiple coasts.', neighborhood: 'Geumneung / Hyeopjae', type: 'anchor' },
      { time: '18:45', title: 'Black pork dinner', detail: 'Close the day with a proper west-side black pork dinner rather than trying to add another sightseeing block.', neighborhood: 'Aewol', type: 'meal' },
    ],
    mapTargets: [
      mapTarget('Landing Jeju Shinhwa', 'Jeju hotel base', { query: '랜딩관 제주신화월드 호텔앤리조트' }),
      mapTarget('바다술상', 'West-side imokase lunch anchor', { query: '바다술상', coords: { lat: 33.4093, lng: 126.2613 } }),
      mapTarget('오설록 티 뮤지엄', 'Easy west-side museum / cafe block', { query: '오설록 티 뮤지엄', coords: { lat: 33.3059, lng: 126.2895 } }),
      mapTarget('금능해수욕장', 'Single west-coast beach stop', { query: '금능해수욕장', coords: { lat: 33.3904, lng: 126.2298 } }),
      mapTarget('훈도 애월흑돼지 본점', 'West-side black pork dinner option', { query: '훈도 애월흑돼지 본점' }),
    ],
  }),
  itineraryDay({
    key: 'may-21',
    date: 'May 21',
    label: 'Jeju → Seoul + Sofitel + dinner',
    area: 'Jeju → Jamsil',
    status: 'confirmed anchors',
    focus: 'This is the actual handoff day from the real Jeju segment into the Jamsil hotel stay, while the broader May 19–24 framing can still read as one continuous away block.',
    quietNote: 'Actual base shifts back to Jamsil today, even though the broader away-stretch framing still covers these dates.',
    logistics: {
      start: 'Jeju rental return flow',
      end: 'Jamsil / 본연 dinner',
      note: 'Jeju Air 7C114 departs CJU at 11:20 AM with 15 kg checked baggage. Build the morning around rental return by 10:00 AM, shuttle transfer back to the airport, then a protected check-in/security buffer before boarding.',
    },
    mapCenter: { lat: 37.5067, lng: 127.1022 },
    stops: [
      { time: '07:45', title: 'Final Jeju pack + car clear-out', detail: 'Leave enough margin to unload bags, check the car, and avoid a rushed return morning.', neighborhood: 'Landing Jeju Shinhwa', type: 'hotel' },
      { time: '08:15', title: 'Drive toward rental return', detail: 'Treat the airport side as the priority, not one more stop on the island.', neighborhood: 'Jeju → 특별한렌트카', type: 'transit' },
      { time: '09:15', title: 'Rental return + shuttle buffer', detail: 'Aim to be at the rental office early enough to finish handoff cleanly and catch the airport shuttle.', neighborhood: '특별한렌트카', type: 'transit' },
      { time: 'By 10:00', title: 'Kona EV return deadline', detail: 'Rental officially ends at 10:00 AM.', neighborhood: '특별한렌트카 / Jeju', type: 'anchor' },
      { time: '10:00–10:40', title: 'CJU bag drop + security buffer', detail: 'Both of you are booked on 7C114 with checked baggage, so keep this airport block protected.', neighborhood: 'Jeju Airport', type: 'anchor' },
      { time: '11:20', title: 'Jeju Air 7C114 departs Jeju', detail: 'This is the real island-to-Seoul handoff flight for both of you.', neighborhood: 'CJU → GMP', type: 'anchor' },
      { time: 'After landing', title: 'Move luggage + reset', detail: 'Do not overfill this middle window while shifting from airport mode into the Jamsil stay.', neighborhood: 'Transit to Jamsil', type: 'transit' },
      { time: '16:00', title: 'Sofitel check-in', detail: 'This begins the actual Jamsil hotel stretch from May 21–24.', neighborhood: 'Jamsil', type: 'hotel' },
      { time: '19:00', title: '본연 dinner reservation', detail: 'Booked through Catch Table. Wine order required. 240,000 KRW course for 2 people.', neighborhood: 'Seoul', type: 'meal' },
    ],
    mapTargets: [
      mapTarget('Jeju International Airport', 'Jeju departure airport', { coords: { lat: 33.5104, lng: 126.4914 } }),
      mapTarget('특별한렌트카', 'Rental return + shuttle handoff', { query: '제주특별자치도 제주시 공항로1길 38', coords: { lat: 33.5049, lng: 126.4926 } }),
      mapTarget('Sofitel Ambassador Seoul', 'Confirmed hotel anchor'),
      mapTarget('본연 서울', 'Catch Table reservation anchor', { query: '본연 서울' }),
      mapTarget('Jamsil', 'Neighborhood anchor', { query: '잠실', coords: { lat: 37.5133, lng: 127.1002 } }),
    ],
  }),
  itineraryDay({
    key: 'may-22',
    date: 'May 22',
    label: 'Jamsil hotel day + ReOne consult',
    area: 'Jamsil / Cheongdam / southeast Seoul',
    status: 'derm consult booked',
    focus: 'This is part of the real Jamsil hotel stretch, with ReOne now locked as the key beauty anchor at 2:00 PM.',
    quietNote: 'Still inside the broader away-stretch framing, but the real home base is Jamsil now and the main appointment is in Cheongdam.',
    logistics: {
      start: 'Sofitel / Jamsil',
      end: 'Seoul evening',
      note: 'ReOne Dermatology is confirmed for May 22 at 2:00 PM. Best shape is an easy Jamsil morning, one clean move to Cheongdam, then decide after the consult whether any same-day or next-day high-volume clinic stop is worth doing.',
    },
    mapCenter: { lat: 37.5218, lng: 127.0444 },
    stops: [
      { time: 'Morning', title: 'Easy hotel-area start', detail: 'Keep the morning light so the skin consult does not feel rushed or overpacked.', neighborhood: 'Jamsil', type: 'hotel' },
      { time: '12:00', title: 'Simple lunch before heading west', detail: 'Eat cleanly and leave enough time to move toward Cheongdam without stress.', neighborhood: 'Jamsil / Songpa', type: 'meal' },
      { time: '14:00', title: 'ReOne Dermatology consult', detail: 'Confirmed booking: ReOne on May 22 at 2:00 PM.', neighborhood: 'Cheongdam / Dosan-daero', type: 'beauty' },
      { time: 'Late afternoon', title: 'Post-consult decision block', detail: 'Use this window to decide whether only follow-up is needed or whether one larger-volume clinic should handle specific practical treatments.', neighborhood: 'Cheongdam / Gangnam', type: 'anchor' },
      { time: 'Evening', title: 'Dinner or walk', detail: 'Can stay low-friction near Jamsil if you want to keep the day easy after the consult.', neighborhood: 'Jamsil', type: 'meal' },
    ],
    mapTargets: [
      mapTarget('Sofitel Ambassador Seoul', 'Hotel base'),
      mapTarget('리원피부과의원', 'Confirmed 2:00 PM consult', { query: '리원피부과의원', coords: { lat: 37.5223, lng: 127.0399 } }),
      mapTarget('Lotte World Mall', 'Easy nearby anchor'),
      mapTarget('Seokchon Lake', 'Walkable nearby option'),
    ],
  }),
  itineraryDay({
    key: 'may-23',
    date: 'May 23',
    label: 'Open Seoul hotel day',
    area: 'Seoul',
    status: 'open planning day',
    focus: 'This is a flexible Seoul/Jamsil-base day while the broader May 19–24 framing can still quietly read as one away block.',
    quietNote: 'Real base is Seoul/Jamsil, even though this still sits inside the same away-stretch framing.',
    logistics: {
      start: 'TBD',
      end: 'TBD',
      note: 'This is where a side-by-side compare of neighborhoods becomes useful once you know what type of day you both want.',
    },
    mapCenter: { lat: 37.5665, lng: 126.978 },
    stops: [
      { time: 'Morning', title: 'Choose the day type', detail: 'Food-focused, shopping-focused, slow day, or one big reservation.', neighborhood: 'TBD', type: 'anchor' },
      { time: 'Midday', title: 'Lock lunch around the area', detail: 'Avoid choosing lunch first and area second.', neighborhood: 'TBD', type: 'meal' },
      { time: 'Afternoon', title: 'Main activity block', detail: 'Cluster by neighborhood and transit realism.', neighborhood: 'Seoul', type: 'shopping' },
      { time: 'Evening', title: 'Dinner or reset', detail: 'Can be a reservation or just a flexible close to the day.', neighborhood: 'Seoul', type: 'meal' },
    ],
    mapTargets: [
      mapTarget('Ikseondong', 'Possible date-style area', { query: '익선동' }),
      mapTarget('Seongsu', 'Possible shopping repeat', { query: '성수동' }),
      mapTarget('Apgujeong Rodeo', 'Possible beauty/shopping cluster', { query: '압구정로데오' }),
    ],
  }),
  itineraryDay({
    key: 'may-24',
    date: 'May 24',
    label: 'Return-home day + family Japanese dinner',
    area: 'Jamsil → parents’ home area / 강동·하남',
    status: 'Japanese dinner shortlist',
    focus: 'This is the day framed to parents as returning home after Jeju, so make the evening a comfortable Japanese-family-dinner slot near 강동/하남 rather than another formal event.',
    quietNote: 'Good family block, but keep it shorter and easier than a full-day parent outing so the language barrier does not become tiring.',
    logistics: {
      start: 'Jamsil / current Seoul base',
      end: '강동 / 하남 family dinner zone',
      note: 'Use the afternoon to transition back toward the parents’ side. For Japanese dinner, prioritize easy access and calm conversation; current shortlist: 스시도쿠 엔 고덕, 머무를 정 세이로무시 하남미사, 로이식당 하남미사, or 강동일식.',
    },
    mapCenter: { lat: 37.5505, lng: 127.1805 },
    stops: [
      { time: 'Morning', title: 'Hotel / luggage decision', detail: 'Make sure any check-out or movement is visible in the schedule if applicable.', neighborhood: 'Seoul', type: 'hotel' },
      { time: 'Lunch', title: 'Keep lunch light', detail: 'Protect appetite and energy for the family dinner after the return-home framing.', neighborhood: 'Jamsil / Seoul', type: 'meal' },
      { time: 'Afternoon', title: 'Move back toward parents’ side', detail: 'Treat this as the “back from Jeju / back home” transition window.', neighborhood: 'Jamsil → 강동 / 하남', type: 'transit' },
      { time: '18:30', title: 'Japanese family dinner shortlist', detail: 'Best fit looks like 스시도쿠 엔 고덕 for easy sushi near home; 하남미사 alternatives are 머무를 정 세이로무시 or 로이식당 if you want a calmer / slightly different Japanese meal.', neighborhood: '강동 / 하남', type: 'meal' },
    ],
    mapTargets: [
      mapTarget('스시도쿠 엔 고덕이케아강동 강동아이파크더리버몰점', 'Easy sushi / Japanese family dinner option near 고덕', { query: '스시도쿠 엔 고덕이케아강동 강동아이파크더리버몰점' }),
      mapTarget('머무를 정 세이로무시 하남미사점', 'Calmer Japanese-style seiro-mushi option in Hanam Misa', { query: '머무를 정 세이로무시 하남미사점' }),
      mapTarget('로이식당 하남미사 본점', 'Japanese home-style / pasta option in Hanam Misa', { query: '로이식당 하남미사 본점' }),
      mapTarget('강동일식', 'Traditional local Japanese / sashimi option', { query: '강동일식' }),
      mapTarget('고덕역', 'Parents’ side anchor', { query: '고덕역', coords: { lat: 37.5557, lng: 127.1542 } }),
    ],
  }),
  itineraryDay({
    key: 'may-25',
    date: 'May 25',
    label: 'Last full Korea day',
    area: 'Seoul',
    status: 'last full day',
    focus: 'This should feel intentional, not accidentally overstuffed because it is the final full day.',
    logistics: {
      start: 'Seoul',
      end: 'Final Korea night',
      note: 'Best used for one meaningful plan cluster plus packing buffer, rather than trying to use every last hour.',
    },
    mapCenter: { lat: 37.5665, lng: 126.978 },
    stops: [
      { time: 'Morning', title: 'Last-day priority block', detail: 'Choose the one thing that would feel worst to miss.', neighborhood: 'TBD', type: 'anchor' },
      { time: 'Lunch', title: 'Memorable meal block', detail: 'Could be casual or special, but should fit the chosen area.', neighborhood: 'Seoul', type: 'meal' },
      { time: 'Afternoon', title: 'Wrap-up shopping / packing buffer', detail: 'Leave enough margin so departure day is not chaotic.', neighborhood: 'Seoul', type: 'shopping' },
      { time: 'Evening', title: 'Final Korea night', detail: 'Good slot for a nicer dinner or gentle walk depending on energy.', neighborhood: 'Seoul', type: 'meal' },
    ],
    mapTargets: [
      mapTarget('Your Seoul hotel base', 'Use whichever hotel is active here', { query: '서울 호텔' }),
      mapTarget('Olive Young Flagship Seoul', 'Typical last-day practical stop', { query: '올리브영 서울' }),
      mapTarget('Myeongdong', 'Common final shopping fallback', { query: '명동' }),
    ],
  }),
  itineraryDay({
    key: 'may-26',
    date: 'May 26',
    label: 'Fly home',
    area: 'ICN → Taipei → ONT',
    status: 'travel anchor',
    focus: 'Departure day should be visibly protected from last-minute plan creep.',
    logistics: {
      start: 'Seoul',
      end: 'Return to Ontario via Taipei',
      note: 'CI 161 leaves ICN at 12:45 PM for Taipei, then CI 24 leaves TPE 9:10 PM and arrives ONT 6:00 PM.',
    },
    mapCenter: { lat: 37.4602, lng: 126.4407 },
    stops: [
      { time: 'Morning', title: 'Final pack + hotel checkout', detail: 'Do the boring parts early so the airport block stays calm.', neighborhood: 'Seoul', type: 'hotel' },
      { time: '12:45 PM', title: 'CI 161 departs ICN', detail: 'First return leg to Taipei.', neighborhood: 'ICN → TPE', type: 'anchor' },
      { time: '2:20 PM local', title: 'Arrive TPE', detail: 'Longer layover window before the Ontario leg.', neighborhood: 'Taipei Taoyuan', type: 'transit' },
      { time: '9:10 PM', title: 'CI 24 departs TPE', detail: 'Final leg back to Ontario.', neighborhood: 'TPE → ONT', type: 'anchor' },
      { time: '6:00 PM', title: 'Arrive ONT', detail: 'Trip close.', neighborhood: 'Ontario International Airport', type: 'anchor' },
    ],
    mapTargets: [
      mapTarget('Incheon International Airport', 'Departure anchor', { coords: { lat: 37.4602, lng: 126.4407 } }),
      mapTarget('Taipei Taoyuan International Airport', 'Return transit airport', { coords: { lat: 25.0797, lng: 121.2342 } }),
      mapTarget('Ontario International Airport', 'Final arrival airport', { query: 'Ontario International Airport', coords: { lat: 34.056, lng: -117.6012 } }),
    ],
  }),
]

const researchBoards = [
  {
    key: 'nail-brow',
    title: 'May 17 Seongsu nail shortlist',
    status: 'ready to book',
    lead: 'Eyebrow got moved to another day, so this board is now just the Sunday nail decision for the full Seongsu walk day.',
    source: 'Naver local + Sunday-hours verification + public Instagram / review signals for Seongsu nail shops',
    recommendation: 'Safest book-now option is 단니네일 because Sunday hours were explicitly verified and it fits the Seongsu day cleanly. Best higher-review backup is 여리빈네일 성수점. 오호네일 성수 is the later-hours design-forward backup.',
    mapCenter: { lat: 37.5446, lng: 127.0557 },
    mapLevel: 5,
    mapTargets: [
      mapTarget('단니네일', 'Safest Sunday-open booking anchor', { query: '단니네일 성수' }),
      mapTarget('여리빈네일 성수점', 'Highest-review Sunday-open backup', { query: '여리빈네일 성수점' }),
      mapTarget('오호네일 성수', 'Late-hours backup if you want more morning slack', { query: '오호네일 성수' }),
    ],
    comparison: [
      {
        place: '단니네일',
        area: '성수 / 연무장5가길 7 1층 121호',
        pricing: '손젤 20,000원~ · 일 10:30–21:00 · 방문자 리뷰 379',
        thumbnail: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
        youtube: '',
        instagram: '',
        note: 'Best safe pick for 5/17. Sunday hours were expanded and verified on Naver, reservation is live, and it is easy to anchor first before the rest of the Seongsu loop. English support is not explicitly stated, so send a short English 가능? note when booking.',
      },
      {
        place: '여리빈네일 성수점',
        area: '성수 / 왕십리로4길 23-1 3층 2호',
        pricing: '젤기본 35,000원~ · 매일 11:00–21:00 · 방문자 리뷰 2,663',
        thumbnail: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=800&q=80',
        youtube: '',
        instagram: '',
        note: 'Strongest review-volume option among the Sunday-open shortlist and both reservation + inquiry are surfaced on Naver. Best if she wants the safest mainstream pick with lots of proof, even if it feels a little less low-key than 단니네일.',
      },
      {
        place: '오호네일 성수',
        area: '성수 / 둘레9나길 7 1층',
        pricing: '손젤 40,000원 · 일 10:00–22:00 · 방문자 리뷰 222',
        thumbnail: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=800&q=80',
        youtube: '',
        instagram: 'https://www.instagram.com/ohho_nail',
        note: 'Design-forward backup with the latest closing time in the shortlist, so it is useful if you want a slower morning before heading to Seongsu. Smaller review base than 여리빈, but Sunday hours are clearly open and the public Instagram link is easy to share.',
      },
    ],
  },
  {
    key: 'headspa',
    title: 'EcoJardin headspa in Jamsil',
    status: 'decision pending',
    lead: 'This now reflects the likely shift toward Jamsil instead of staying near 고덕.',
    source: 'Naver / travel listings for 에코자르뎅 잠실롯데타워점',
    recommendation: 'EcoJardin in Jamsil is now the lead headspa option if you want the experience anchored around Jamsil logistics.',
    comparison: [
      {
        place: '에코자르뎅 잠실롯데타워점',
        area: '잠실 롯데월드타워몰 B1',
        pricing: '줄기세포/프리미엄 헤드스파 roughly 114,000 KRW class from public listings',
        thumbnail: 'https://search.pstatic.net/common?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNTAxMjFfMTI4%2FMDAxNzM3NDY3OTI3ODg5.bNyn2W3mUwfMW-lLi6U-VXlM8w6vwsdZ5zeH6sKAz78g.Abdi5halhiy0F3ZyHevB2fpZo_106PU4GlIlDOAfnh4g.JPEG%2Foutput_1540197840.jpg&type=fff208_208_ar',
        youtube: 'https://www.youtube.com/results?search_query=%EC%97%90%EC%BD%94%EC%9E%90%EB%A5%B4%EB%8E%85+%EC%9E%A0%EC%8B%A4',
        instagram: '',
        note: 'Public listings describe it as a premium scalp-spa experience in the Jamsil / Lotte Tower area with late hours around 10:30–22:00.',
      },
    ],
  },
  {
    key: 'hair-perm',
    title: 'Chahong Myeongdong hair-perm booking',
    status: 'booked',
    lead: 'Chahong Room Myeongdong is now booked for May 18 at 2:00 PM for girlfriend’s perm. Treat this as the fixed afternoon anchor after the embassy/lunch block.',
    source: 'Discord booking update + Naver local review / pricing scan + live itinerary update',
    recommendation: 'Keep the salon window open for 3–4 hours. Best personal plan: you meet your friend nearby during the appointment, pick her up around 5:30–6:00, then all three go to dinner around Myeongdong/Euljiro.',
    mapCenter: { lat: 37.5638, lng: 126.9854 },
    mapLevel: 5,
    mapTargets: [
      mapTarget('Chahong Room Myeongdong', 'Confirmed May 18, 2:00 PM girlfriend perm booking', { query: '차홍룸 명동점' }),
      mapTarget('Myeongdong', 'Pickup and dinner zone', { query: '명동' }),
      mapTarget('Euljiro 1-ga', 'Nearby friend meetup / dinner fallback area', { query: '을지로입구역' }),
    ],
    spotlights: [
      {
        title: 'Chahong Room Myeongdong',
        tag: 'Booked',
        price: '일반펌 220,000원~ · 열펌 240,000원~',
        verdict: 'Confirmed 2:00 PM appointment; premium salon feel and best fit now that the plan shifted from Hongdae to Myeongdong.',
      },
      {
        title: '3–4 hour salon window',
        tag: 'Timing plan',
        price: '14:00–17:30/18:00',
        verdict: 'Use this block for your friend meetup, then keep pickup and dinner slightly flexible in case the final styling runs long.',
      },
    ],
    comparison: [
      {
        place: 'Chahong Room Myeongdong',
        area: '명동 / 서울 중구 명동길 13 5층',
        pricing: 'Booked May 18, 2:00 PM · 일반펌 220,000원~ · 열펌 240,000원~',
        thumbnail: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
        youtube: 'https://www.youtube.com/results?search_query=%EC%B0%A8%ED%99%8D%EB%A3%B8+%EB%AA%85%EB%8F%99%EC%A0%90+%ED%8E%8C',
        instagram: 'https://www.instagram.com/explore/search/keyword/?q=%EC%B0%A8%ED%99%8D%EB%A3%B8%20%EB%AA%85%EB%8F%99%EC%A0%90',
        note: 'Confirmed booking. Naver showed strong local validation, daily 10:00–19:00 hours, and visible layer/permed-style tags; block 3–4 hours and avoid rushing dinner.',
      },
      {
        place: 'Friend meetup during salon window',
        area: '명동 / 을지로입구 nearby',
        pricing: '14:15–17:30 flexible block',
        thumbnail: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
        youtube: 'https://www.youtube.com/results?search_query=%EB%AA%85%EB%8F%99+%EC%B9%B4%ED%8E%98+%EC%B6%94%EC%B2%9C',
        instagram: '',
        note: 'Stay close enough to return quickly when the stylist gives an ETA. If the perm runs closer to four hours, slide dinner rather than cutting the styling short.',
      },
      {
        place: 'Dinner for three after pickup',
        area: '명동 / 을지로 / 종로',
        pricing: 'Target 18:30, flexible',
        thumbnail: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80',
        youtube: 'https://www.youtube.com/results?search_query=%EB%AA%85%EB%8F%99+%EC%A0%80%EB%85%81+%EB%A7%9B%EC%A7%91',
        instagram: '',
        note: 'Pick a dinner near the salon unless she finishes early. This keeps the day relaxed after a long hair appointment.',
      },
    ],
  },
  {
    key: 'derm',
    title: 'Dermatology clinic shortlist',
    status: 'consult booked',
    lead: 'Saved from the Discord compare, and ReOne is now actually booked for May 22 at 2:00 PM as the main first consult.',
    source: 'Discord compare + Naver local + official Instagram / YouTube footprint review + live booking update',
    recommendation: 'ReOne is now the confirmed consult anchor for May 22 at 2:00 PM. After that consult, only use a larger-volume clinic for clearly defined practical treatments you already feel good about.',
    comparison: [
      {
        place: '리원피부과의원',
        area: '청담 / 도산대로 327 SGF청담타워',
        pricing: 'Premium consult pricing not clearly public; expect direct inquiry',
        thumbnail: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
        youtube: 'https://www.youtube.com/@reoneskin',
        instagram: 'https://www.instagram.com/reone__dermatology/',
        note: 'Most trust-building social footprint. IG ~5.6K / 296 posts, multiple doctor-led YouTube channels, and public reviews repeatedly mention Sofwave / lifting satisfaction, texture improvement, and a quiet premium feel. Best if you want “real doctor vibe” over pure hype.',
      },
      {
        place: '룬피부과의원 청담',
        area: '청담 / 선릉로 822 5층',
        pricing: 'Premium consult pricing not clearly public; expect direct inquiry',
        thumbnail: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
        youtube: '',
        instagram: 'https://www.instagram.com/lunnclinic_official/',
        note: 'More boutique and quieter than the others. IG ~1.4K / 57 posts. Public read is “specialist-led, tidy, precise, not overly loud.” Less mass-review proof than ReOne / Rest / Laurel, but strongest hidden-gem / non-factory energy.',
      },
      {
        place: '레스트의원',
        area: '청담 / 선릉로158길 12 3-4층',
        pricing: 'Premium consult pricing not clearly public; expect direct inquiry',
        thumbnail: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80',
        youtube: 'https://www.youtube.com/@REST_clinic',
        instagram: 'https://www.instagram.com/rest_clinic_/',
        note: 'Best consult-experience read from public reviews. IG ~2.45K / 113 posts. Repeated comments mention 20-minute consults, doctor-direct explanations, kind staff, hotel-like interior, and premium service. Slightly busier than a tiny boutique, but still reads more bespoke than factory.',
      },
      {
        place: '로렐의원',
        area: '청담 / 선릉로152길 17 7층',
        pricing: 'Premium consult pricing not clearly public; expect direct inquiry',
        thumbnail: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80',
        youtube: 'https://www.youtube.com/results?search_query=%EB%A1%9C%EB%A0%90%EC%9D%98%EC%9B%90+%EC%B2%AD%EB%8B%B4',
        instagram: 'https://www.instagram.com/laurelclinic/',
        note: 'Strongest luxury / viral branding. IG ~10K / 49 posts. Public reviews often say it feels less factory-like because staff focus is attentive and the environment feels elevated, but it is also the most brand-forward and “hot clinic” coded of the four.',
      },
    ],
  },
  {
    key: 'followup-factory',
    title: 'Follow-up clinic + weekend backup after ReOne consult',
    status: 'strategy saved',
    lead: 'Do ReOne first, leave, decompress at a cafe, then only use a higher-volume clinic for simple practical treatments if the diagnosis feels clear enough.',
    source: 'Naver local + clinic pages + public review-platform snippets + 2026 weekend/holiday timing check',
    recommendation: 'Main execution target is Saturday May 23. Best follow-up clinics right now are Toxnfill Gangnam for practical execution and Cheongdam Vands for easier late booking over the weekend.',
    mapCenter: { lat: 37.5198, lng: 127.0415 },
    mapLevel: 6,
    mapTargets: [
      mapTarget('리원피부과의원', 'May 22 consult anchor', { query: '리원피부과의원', coords: { lat: 37.5223, lng: 127.0399 } }),
      mapTarget('톡스앤필의원 강남', 'Most practical standardized follow-up clinic', { query: '톡스앤필의원 강남본점', coords: { lat: 37.4968, lng: 127.0277 } }),
      mapTarget('청담 밴스의원', 'Best weekend / holiday booking backup', { query: '청담 밴스의원', coords: { lat: 37.5266, lng: 127.0385 } }),
      mapTarget('BLS의원 본점', 'Bigger-volume premium-ish backup', { query: 'BLS의원 본점' }),
      mapTarget('리더스피부과의원 청담도산대로점', 'Middle-ground branded backup', { query: '리더스피부과의원 청담도산대로점' }),
    ],
    comparison: [
      {
        place: 'Sat 5/23 — main execution window',
        area: 'Best shot for follow-up treatment',
        pricing: 'Timing priority',
        thumbnail: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80',
        youtube: '',
        instagram: '',
        note: 'Best day to act if ReOne gives a clear diagnosis and a simple standardized plan. This is the day to decide after a cafe debrief, not immediately after the consult chair.',
      },
      {
        place: '톡스앤필의원 강남본점',
        area: '강남역 10번 출구 122m / 강남대로 415',
        pricing: 'Event/pricing pages public + reservation flow available',
        thumbnail: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&w=800&q=80',
        youtube: 'https://www.youtube.com/results?search_query=%ED%86%A1%EC%8A%A4%EC%95%A4%ED%95%84+%EA%B0%95%EB%82%A8%EB%B3%B8%EC%A0%90',
        instagram: 'https://www.gangnamunni.com/hospitals/3702',
        note: 'Best practical follow-up option. Reservation button visible, dedicated reservation page, Modoodoc 178 certified reviews / 4.1, GangnamUnni 992 reviews. Good for botox, skin booster, toning, and other more standardized treatments after the consult.',
      },
      {
        place: '청담 밴스의원',
        area: '압구정로데오역 4번 출구 바로 앞 / 선릉로 822 3층',
        pricing: 'Reservation open; public event-style pricing flow likely',
        thumbnail: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
        youtube: 'https://www.youtube.com/results?search_query=%EC%B2%AD%EB%8B%B4+%EB%B0%B4%EC%8A%A4%EC%9D%98%EC%9B%90',
        instagram: 'https://cheongdam.vandsclinic.co.kr/',
        note: 'Cleaner-feeling high-volume clinic. Reservation visible, weekday 10–8, weekend 10–6, no lunch break, and public search shows ~662 visitor reviews / 3,734 blog reviews. Strong if you want a last-minute slot without going fully bargain-factory.',
      },
      {
        place: 'Sun 5/24 — Buddha’s Birthday holiday backup',
        area: 'Use only if Saturday misses',
        pricing: 'Holiday / Sunday availability may narrow options',
        thumbnail: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
        youtube: '',
        instagram: '',
        note: 'May 24 is confirmed as 부처님 오신 날. Cheongdam Vands is the best live backup from current research because Sunday hours are publicly shown; other clinics may be less predictable.',
      },
      {
        place: 'BLS의원 본점',
        area: '청담권',
        pricing: 'Likely premium-volume mix; direct inquiry still best',
        thumbnail: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
        youtube: 'https://www.youtube.com/results?search_query=BLS%EC%9D%98%EC%9B%90+%EB%B3%B8%EC%A0%90',
        instagram: '',
        note: 'Bigger-volume but still not random/dirty-feeling. Public search showed ~2,290 visitor reviews and 5,443 blog reviews. Better for efficient execution than for delicate first-time aesthetic judgment.',
      },
      {
        place: '리더스피부과 청담도산대로점',
        area: '청담 도산대로권',
        pricing: 'Direct inquiry recommended',
        thumbnail: 'https://images.unsplash.com/photo-1581093458791-9d15482442f6?auto=format&fit=crop&w=800&q=80',
        youtube: 'https://www.youtube.com/results?search_query=%EB%A6%AC%EB%8D%94%EC%8A%A4%ED%94%BC%EB%B6%80%EA%B3%BC+%EC%B2%AD%EB%8B%B4',
        instagram: '',
        note: 'Middle-ground option: chain/system feel but a little less raw-factory than the cheapest volume clinics. Better if you want a safer brand shell without going fully boutique.',
      },
      {
        place: 'Mon 5/25 — weakest fallback',
        area: 'Possible but least reliable',
        pricing: 'Treat as uncertain holiday-tail timing',
        thumbnail: 'https://placehold.co/240x160/f2e8e8/6d4747?text=May+25',
        youtube: '',
        instagram: '',
        note: 'Do not depend on this as the primary plan. Use only if the treatment is clearly simple and one of the bigger clinics confirms a live slot after ReOne.',
      },
    ],
  }
]

const placeGroups = [
  {
    key: 'seongsu-haus-nowhere',
    themeKey: 'seongsu-viral-loop',
    themeTitle: 'May 17 Seongsu viral loop',
    title: 'Haus Nowhere',
    area: 'Seongsu',
    status: 'ready to route',
    lead: 'Gentle Monster anchor stop from the Seongsu viral loop.',
    source: 'Instagram save / Seongsu brand loop',
    importNote: 'Use as the first anchor after the beauty appointment.',
    thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    logistics: {
      start: 'Seongsu arrival after beauty appointment',
      end: 'Walking loop toward beauty/shopping saves',
      note: 'Good first stop in the Seongsu brand loop.',
    },
    entries: [
      { place: 'Haus Nowhere', area: 'Seongsu', vibe: 'Gentle Monster anchor stop', note: 'Good first stop in the Seongsu brand loop.', thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80', naverUrl: 'https://map.naver.com/p/search/%ED%95%98%EC%9A%B0%EC%8A%A4%20%EB%82%98%EC%9A%B0%EC%9B%A8%EC%96%B4%20%EC%84%B1%EC%88%98', kakaoUrl: 'https://map.kakao.com/?q=%ED%95%98%EC%9A%B0%EC%8A%A4%20%EB%82%98%EC%9A%B0%EC%9B%A8%EC%96%B4%20%EC%84%B1%EC%88%98' },
    ],
    mapTargets: [mapTarget('Haus Nowhere Seongsu', 'Gentle Monster anchor stop', { query: '하우스 나우웨어 성수' })],
  },
  {
    key: 'seongsu-olive-young-flagship',
    themeKey: 'seongsu-viral-loop',
    themeTitle: 'May 17 Seongsu viral loop',
    title: 'Olive Young Flagship',
    area: 'Seongsu',
    status: 'ready to route',
    lead: 'Beauty haul stop from the Seongsu saved loop.',
    source: 'Instagram save / Seongsu brand loop',
    importNote: 'Pairs naturally with Tamburins and TIRTIR.',
    thumbnail: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
    logistics: { start: 'Seongsu walking loop', end: 'Nearby beauty brand stops', note: 'Easy mid-loop beauty stop.' },
    entries: [
      { place: 'Olive Young Flagship', area: 'Seongsu', vibe: 'Beauty / practical haul', note: 'Easy mid-loop beauty stop.', thumbnail: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80', naverUrl: 'https://map.naver.com/p/search/%EC%98%AC%EB%A6%AC%EB%B8%8C%EC%98%81N%20%EC%84%B1%EC%88%98', kakaoUrl: 'https://map.kakao.com/?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%EC%98%81N%20%EC%84%B1%EC%88%98' },
    ],
    mapTargets: [mapTarget('Olive Young N Seongsu', 'Flagship beauty stop', { query: '올리브영N 성수' })],
  },
  {
    key: 'seongsu-tamburins',
    themeKey: 'seongsu-viral-loop',
    themeTitle: 'May 17 Seongsu viral loop',
    title: 'Tamburins',
    area: 'Seongsu',
    status: 'ready to route',
    lead: 'Beauty brand stop near the Gentle Monster side.',
    source: 'Instagram save / Seongsu brand loop',
    importNote: 'Keep in the same walking sequence as Olive Young.',
    thumbnail: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    logistics: { start: 'Haus Nowhere side', end: 'Olive Young / TIRTIR side', note: 'Pairs naturally with the Gentle Monster side.' },
    entries: [
      { place: 'Tamburins', area: 'Seongsu', vibe: 'Beauty brand stop', note: 'Pairs naturally with the Gentle Monster side.', thumbnail: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80', naverUrl: 'https://map.naver.com/p/search/%ED%83%AC%EB%B2%84%EB%A6%B0%EC%A6%88%20%EC%84%B1%EC%88%98', kakaoUrl: 'https://map.kakao.com/?q=%ED%83%AC%EB%B2%84%EB%A6%B0%EC%A6%88%20%EC%84%B1%EC%88%98' },
    ],
    mapTargets: [mapTarget('Tamburins Seongsu', 'Beauty brand stop', { query: '탬버린즈 성수' })],
  },
  {
    key: 'seongsu-blue-elephant',
    themeKey: 'seongsu-viral-loop',
    themeTitle: 'May 17 Seongsu viral loop',
    title: 'Blue Elephant',
    area: 'Seongsu',
    status: 'flex',
    lead: 'Eyewear try-on stop for the Seongsu loop.',
    source: 'Instagram save / Seongsu brand loop',
    importNote: 'Good flex stop depending on energy.',
    thumbnail: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=800&q=80',
    logistics: { start: 'Seongsu walking loop', end: 'Dinner side of city', note: 'Keep as flex depending on time and try-on energy.' },
    entries: [
      { place: 'Blue Elephant', area: 'Seongsu', vibe: 'Eyewear stop', note: 'Keep as flex depending on time and try-on energy.', thumbnail: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=800&q=80', naverUrl: 'https://map.naver.com/p/search/%EB%B8%94%EB%A3%A8%EC%97%98%EB%A6%AC%ED%8E%80%ED%8A%B8%20%EC%84%B1%EC%88%98', kakaoUrl: 'https://map.kakao.com/?q=%EB%B8%94%EB%A3%A8%EC%97%98%EB%A6%AC%ED%8E%80%ED%8A%B8%20%EC%84%B1%EC%88%98' },
    ],
    mapTargets: [mapTarget('Blue Elephant Seongsu', 'Eyewear stop', { query: '블루엘리펀트 성수' })],
  },
  {
    key: 'seongsu-musinsa-standard',
    themeKey: 'seongsu-viral-loop',
    themeTitle: 'May 17 Seongsu viral loop',
    title: 'Musinsa Standard',
    area: 'Seongsu',
    status: 'ready to route',
    lead: 'Core clothing / basics shopping stop.',
    source: 'Instagram save / Seongsu brand loop',
    importNote: 'Useful browsing block in the Seongsu route.',
    thumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
    logistics: { start: 'Seongsu shopping route', end: 'Beauty stops / dinner', note: 'Useful basics / browsing block.' },
    entries: [
      { place: 'Musinsa Standard', area: 'Seongsu', vibe: 'Core shopping stop', note: 'Useful basics / browsing block.', thumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80', naverUrl: 'https://map.naver.com/p/search/%EB%AC%B4%EC%8B%A0%EC%82%AC%20%EC%8A%A4%ED%83%A0%EB%8B%A4%EB%93%9C%20%EC%84%B1%EC%88%98', kakaoUrl: 'https://map.kakao.com/?q=%EB%AC%B4%EC%8B%A0%EC%82%AC%20%EC%8A%A4%ED%83%A0%EB%8B%A4%EB%93%9C%20%EC%84%B1%EC%88%98' },
    ],
    mapTargets: [mapTarget('Musinsa Standard Seongsu', 'Clothing/basic shopping stop', { query: '무신사 스탠다드 성수' })],
  },
  {
    key: 'seongsu-tirtir',
    themeKey: 'seongsu-viral-loop',
    themeTitle: 'May 17 Seongsu viral loop',
    title: 'Tir Tir',
    area: 'Seongsu',
    status: 'flex',
    lead: 'Beauty stop from the Seongsu saved loop.',
    source: 'Instagram save / Seongsu brand loop',
    importNote: 'Fold into the same walking sequence as Olive Young.',
    thumbnail: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=800&q=80',
    logistics: { start: 'Seongsu beauty route', end: 'Dinner / next cluster', note: 'Fold into the same walking sequence as Olive Young if possible.' },
    entries: [
      { place: 'Tir Tir', area: 'Seongsu', vibe: 'Beauty stop', note: 'Fold into the same walking sequence as Olive Young if possible.', thumbnail: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=800&q=80', naverUrl: 'https://map.naver.com/p/search/%ED%8B%B0%EB%A5%B4%ED%8B%B0%EB%A5%B4%20%EC%84%B1%EC%88%98', kakaoUrl: 'https://map.kakao.com/?q=%ED%8B%B0%EB%A5%B4%ED%8B%B0%EB%A5%B4%20%EC%84%B1%EC%88%98' },
    ],
    mapTargets: [mapTarget('TIRTIR Seongsu', 'Beauty stop', { query: '티르티르 성수' })],
  },
  {
    key: 'inbox-foundation-match',
    themeKey: 'viral-saves-inbox',
    themeTitle: 'Viral saves inbox',
    title: 'K-beauty foundation match',
    area: 'Seoul / Korea TBD',
    status: 'needs venue ID',
    lead: 'Beauty consult lead from Mandy Serafina reel.',
    source: 'Instagram reel',
    importNote: 'Exact venue still needs the shared caption/link details before final booking.',
    thumbnail: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
    logistics: { start: 'Unsorted saved place', end: 'Assign once exact clinic/studio is known', note: 'Public reel suggests a bookable foundation shade-match / beauty consult; exact venue not readable yet.' },
    entries: [
      { place: 'K-beauty foundation match', area: 'Seoul / Korea TBD', vibe: 'Beauty booking lead', note: 'From Mandy Serafina reel. Exact clinic/studio still needs confirmation from the shared source.', thumbnail: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80', instagramUrl: 'https://www.instagram.com/reel/DUHKa4LEw7E/?igsh=NTc4MTIwNjQ2YQ==', naverUrl: 'https://map.naver.com/p/search/%EC%84%9C%EC%9A%B8%20%EB%B7%B0%ED%8B%B0', kakaoUrl: 'https://map.kakao.com/?q=%EC%84%9C%EC%9A%B8%20%EB%B7%B0%ED%8B%B0' },
    ],
    mapTargets: [mapTarget('Seoul beauty consult', 'Default anchor until exact reel venue is confirmed', { query: '서울 뷰티' })],
  },
  {
    key: 'ig-culinary-class-war-lamant-secret',
    themeKey: 'culinary-class-war-restaurants',
    themeTitle: 'Culinary Class War restaurants',
    title: 'L’Amant Secret',
    area: 'Cheongdam / Seoul',
    status: 'needs reservation check',
    lead: 'Saved from eating_forky Culinary Class War Seoul reel.',
    source: 'Instagram reel DVIryEJgc81 / Catch Table mention',
    importNote: 'High-confidence reel ID; verify live Catch Table availability before assigning a date.',
    thumbnail: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=800&q=80',
    logistics: { start: 'Unscheduled Seoul meal candidate', end: 'Assign after reservation check', note: 'Special-meal candidate from the Culinary Class War reel; likely reservation-sensitive.' },
    entries: [
      { place: 'L’Amant Secret', area: 'Cheongdam / Seoul', vibe: 'fine dining / Culinary Class War', note: 'Chef Son Jongwon restaurant from the reel; high-interest tasting-menu style stop and likely hard to book. Keep as a premium dinner candidate until exact trip-day fit is chosen.', thumbnail: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=800&q=80', instagramUrl: 'https://www.instagram.com/reel/DVIryEJgc81/?igsh=NTc4MTIwNjQ2YQ==', naverUrl: 'https://map.naver.com/p/search/%EB%9D%BC%EB%A7%9D%EC%8B%9C%ED%81%AC%EB%A0%88%20%EC%84%9C%EC%9A%B8', kakaoUrl: 'https://map.kakao.com/?q=%EB%9D%BC%EB%A7%9D%EC%8B%9C%ED%81%AC%EB%A0%88%20%EC%84%9C%EC%9A%B8' },
    ],
    mapTargets: [mapTarget('L’Amant Secret', 'Culinary Class War restaurant from Instagram reel', { query: '라망시크레 서울' })],
  },
  {
    key: 'ig-culinary-class-war-osteria-sam-kim',
    themeKey: 'culinary-class-war-restaurants',
    themeTitle: 'Culinary Class War restaurants',
    title: 'Osteria Sam Kim',
    area: 'Seoul',
    status: 'needs reservation check',
    lead: 'Saved from eating_forky Culinary Class War Seoul reel.',
    source: 'Instagram reel DVIryEJgc81 / Catch Table mention',
    importNote: 'High-confidence reel ID; verify live Catch Table availability before assigning a date.',
    thumbnail: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80',
    logistics: { start: 'Unscheduled Seoul meal candidate', end: 'Assign after reservation check', note: 'Special-meal candidate from the Culinary Class War reel; likely reservation-sensitive.' },
    entries: [
      { place: 'Osteria Sam Kim', area: 'Seoul', vibe: 'Italian / chef restaurant', note: 'Chef Sam Kim restaurant from the reel; useful if she wants a named-chef meal that may feel more approachable than the most formal fine-dining options.', thumbnail: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80', instagramUrl: 'https://www.instagram.com/reel/DVIryEJgc81/?igsh=NTc4MTIwNjQ2YQ==', naverUrl: 'https://map.naver.com/p/search/%EC%98%A4%EC%8A%A4%ED%85%8C%EB%A6%AC%EC%95%84%20%EC%83%98%ED%82%B4%20%EC%84%9C%EC%9A%B8', kakaoUrl: 'https://map.kakao.com/?q=%EC%98%A4%EC%8A%A4%ED%85%8C%EB%A6%AC%EC%95%84%20%EC%83%98%ED%82%B4%20%EC%84%9C%EC%9A%B8' },
    ],
    mapTargets: [mapTarget('Osteria Sam Kim', 'Culinary Class War restaurant from Instagram reel', { query: '오스테리아 샘킴 서울' })],
  },
  {
    key: 'ig-culinary-class-war-choi-dot',
    themeKey: 'culinary-class-war-restaurants',
    themeTitle: 'Culinary Class War restaurants',
    title: 'CHOI Dot',
    area: 'Cheongdam / Seoul',
    status: 'needs reservation check',
    lead: 'Saved from eating_forky Culinary Class War Seoul reel.',
    source: 'Instagram reel DVIryEJgc81 / Catch Table mention',
    importNote: 'High-confidence reel ID; verify live Catch Table availability before assigning a date.',
    thumbnail: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
    logistics: { start: 'Unscheduled Seoul meal candidate', end: 'Assign after reservation check', note: 'Special-meal candidate from the Culinary Class War reel; likely reservation-sensitive.' },
    entries: [
      { place: 'CHOI Dot', area: 'Cheongdam / Seoul', vibe: 'fine dining / Culinary Class War', note: 'Chef Choi Hyun-seok restaurant from the reel; visually premium and reservation-sensitive. Add to the special-meal candidate pool, not a casual walk-in plan.', thumbnail: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80', instagramUrl: 'https://www.instagram.com/reel/DVIryEJgc81/?igsh=NTc4MTIwNjQ2YQ==', naverUrl: 'https://map.naver.com/p/search/%EC%B5%B8%EC%9D%B4%EB%8B%B7%20%EC%84%9C%EC%9A%B8', kakaoUrl: 'https://map.kakao.com/?q=%EC%B5%B8%EC%9D%B4%EB%8B%B7%20%EC%84%9C%EC%9A%B8' },
    ],
    mapTargets: [mapTarget('CHOI Dot', 'Culinary Class War restaurant from Instagram reel', { query: '쵸이닷 서울' })],
  },
  {
    key: 'ig-culinary-class-war-eatanic-garden',
    themeKey: 'culinary-class-war-restaurants',
    themeTitle: 'Culinary Class War restaurants',
    title: 'Eatanic Garden',
    area: 'Gangnam / Seoul',
    status: 'needs reservation check',
    lead: 'Saved from eating_forky Culinary Class War Seoul reel.',
    source: 'Instagram reel DVIryEJgc81 / Catch Table mention',
    importNote: 'High-confidence reel ID; verify live Catch Table availability before assigning a date.',
    thumbnail: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80',
    logistics: { start: 'Unscheduled Seoul meal candidate', end: 'Assign after reservation check', note: 'Special-meal candidate from the Culinary Class War reel; likely reservation-sensitive.' },
    entries: [
      { place: 'Eatanic Garden', area: 'Gangnam / Seoul', vibe: 'fine dining / Culinary Class War', note: 'Chef Son Jongwon restaurant from the reel; commenter specifically asked about Eatanic lunch/dinner, so treat it as one of the strongest special-meal candidates.', thumbnail: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80', instagramUrl: 'https://www.instagram.com/reel/DVIryEJgc81/?igsh=NTc4MTIwNjQ2YQ==', naverUrl: 'https://map.naver.com/p/search/%EC%9D%B4%ED%83%80%EB%8B%89%20%EA%B0%80%EB%93%A0%20%EC%84%9C%EC%9A%B8', kakaoUrl: 'https://map.kakao.com/?q=%EC%9D%B4%ED%83%80%EB%8B%89%20%EA%B0%80%EB%93%A0%20%EC%84%9C%EC%9A%B8' },
    ],
    mapTargets: [mapTarget('Eatanic Garden', 'Culinary Class War restaurant from Instagram reel', { query: '이타닉 가든 서울' })],
  },
  {
    key: 'ig-wellness-cimer-spa-incheon',
    themeKey: 'wellness-spa-saves',
    themeTitle: 'Wellness / spa saves',
    title: 'Cimer Spa',
    area: 'Incheon / Paradise City',
    status: 'needs price + booking check',
    lead: 'Affordable luxury spa save from Jeffrey Harnish’s Incheon reel.',
    source: 'Instagram reel DTWK2I7E8Hf / visible overlay + metadata keywords',
    importNote: 'Reel identifies Cimer Spa in Incheon; final frame did not show price, so verify current pricing, hours, and transport before assigning a trip day.',
    thumbnail: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    logistics: { start: 'Seoul or ICN-side transfer', end: 'Assign after transport check', note: 'Comment thread flags public transportation as inconvenient; best as an airport/Incheon-side spa block rather than a random Seoul detour.' },
    entries: [
      { place: 'Cimer Spa', area: 'Incheon / Paradise City', vibe: 'luxury spa / heated pools / sauna rooms', note: 'Reel shows pools, cabana-style relaxation, sauna/spa rooms, and labels it an affordable luxury spa. Needs current price, booking, luggage, and child/hijabi/ice-bath checks before committing.', thumbnail: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', instagramUrl: 'https://www.instagram.com/reel/DTWK2I7E8Hf/?igsh=NTc4MTIwNjQ2YQ==', naverUrl: 'https://map.naver.com/p/search/%EC%94%A8%EB%A9%94%EB%A5%B4%20%EC%9D%B8%EC%B2%9C%20%ED%8C%8C%EB%9D%BC%EB%8B%A4%EC%9D%B4%EC%8A%A4%EC%8B%9C%ED%8B%B0', kakaoUrl: 'https://map.kakao.com/?q=%EC%94%A8%EB%A9%94%EB%A5%B4%20%EC%9D%B8%EC%B2%9C%20%ED%8C%8C%EB%9D%BC%EB%8B%A4%EC%9D%B4%EC%8A%A4%EC%8B%9C%ED%8B%B0' },
    ],
    mapTargets: [mapTarget('Cimer Spa', 'Incheon spa from Instagram reel', { query: '씨메르 인천 파라다이스시티' })],
  },

  {
    key: 'ig-seongsu-mood-glow',
    themeKey: 'seongsu-mood-spaces',
    themeTitle: 'Seongsu mood spaces',
    title: 'Glow Seongsu',
    area: 'Seongsu / 성수이로16길 32',
    status: 'Instagram save',
    lead: 'Saved from _yh.yhh’s Seongsu atmosphere roundup reel.',
    source: 'Instagram reel DSUHSP_Ee2T / caption list',
    importNote: '11:00–23:00 daily · kids zone',
    thumbnail: 'https://images.unsplash.com/photo-1493857671505-72967e2e2760?auto=format&fit=crop&w=800&q=80',
    logistics: { start: 'Seongsu walking loop', end: 'Assign after choosing route density', note: 'Caption-sourced Seongsu stop; combine only if it fits the existing May 17 walking loop.' },
    entries: [
      { place: 'Glow Seongsu', area: 'Seongsu / 성수이로16길 32', vibe: 'cafe / mood space', note: 'Caption lists it as the first good-atmosphere Seongsu space; use as a flexible cafe/mood stop while walking the Seongsu loop.', thumbnail: 'https://images.unsplash.com/photo-1493857671505-72967e2e2760?auto=format&fit=crop&w=800&q=80', instagramUrl: 'https://www.instagram.com/reel/DSUHSP_Ee2T/?igsh=NTc4MTIwNjQ2YQ==', naverUrl: 'https://map.naver.com/p/search/%EA%B8%80%EB%A1%9C%EC%9A%B0%20%EC%84%B1%EC%88%98', kakaoUrl: 'https://map.kakao.com/?q=%EA%B8%80%EB%A1%9C%EC%9A%B0%20%EC%84%B1%EC%88%98' },
    ],
    mapTargets: [mapTarget('Glow Seongsu', 'Seongsu atmosphere roundup save', { query: '글로우 성수' })],
  },
  {
    key: 'ig-seongsu-mood-dior',
    themeKey: 'seongsu-mood-spaces',
    themeTitle: 'Seongsu mood spaces',
    title: 'Dior Seongsu',
    area: 'Seongsu / 연무장5길 7',
    status: 'Instagram save',
    lead: 'Saved from _yh.yhh’s Seongsu atmosphere roundup reel.',
    source: 'Instagram reel DSUHSP_Ee2T / caption list',
    importNote: '11:00–20:00 daily',
    thumbnail: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80',
    logistics: { start: 'Seongsu walking loop', end: 'Assign after choosing route density', note: 'Caption-sourced Seongsu stop; combine only if it fits the existing May 17 walking loop.' },
    entries: [
      { place: 'Dior Seongsu', area: 'Seongsu / 연무장5길 7', vibe: 'showroom / luxury brand', note: 'High-aesthetic showroom stop from the reel; pairs naturally with Haus Nowhere, Tamburins, and beauty/shopping stops.', thumbnail: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80', instagramUrl: 'https://www.instagram.com/reel/DSUHSP_Ee2T/?igsh=NTc4MTIwNjQ2YQ==', naverUrl: 'https://map.naver.com/p/search/%EB%94%94%EC%98%AC%20%EC%84%B1%EC%88%98', kakaoUrl: 'https://map.kakao.com/?q=%EB%94%94%EC%98%AC%20%EC%84%B1%EC%88%98' },
    ],
    mapTargets: [mapTarget('Dior Seongsu', 'Seongsu atmosphere roundup save', { query: '디올 성수' })],
  },
  {
    key: 'ig-seongsu-mood-dasique',
    themeKey: 'seongsu-mood-spaces',
    themeTitle: 'Seongsu mood spaces',
    title: 'Dasique Seongsu',
    area: 'Seongsu / 연무장5길 6',
    status: 'Instagram save',
    lead: 'Saved from _yh.yhh’s Seongsu atmosphere roundup reel.',
    source: 'Instagram reel DSUHSP_Ee2T / caption list',
    importNote: '11:00–20:30 · weekends until 21:00',
    thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    logistics: { start: 'Seongsu walking loop', end: 'Assign after choosing route density', note: 'Caption-sourced Seongsu stop; combine only if it fits the existing May 17 walking loop.' },
    entries: [
      { place: 'Dasique Seongsu', area: 'Seongsu / 연무장5길 6', vibe: 'beauty showroom', note: 'Beauty-brand stop from the reel; good girlfriend-facing add-on near the current Seongsu cosmetics loop.', thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80', instagramUrl: 'https://www.instagram.com/reel/DSUHSP_Ee2T/?igsh=NTc4MTIwNjQ2YQ==', naverUrl: 'https://map.naver.com/p/search/%EB%8D%B0%EC%9D%B4%EC%A7%80%ED%81%AC%20%EC%84%B1%EC%88%98', kakaoUrl: 'https://map.kakao.com/?q=%EB%8D%B0%EC%9D%B4%EC%A7%80%ED%81%AC%20%EC%84%B1%EC%88%98' },
    ],
    mapTargets: [mapTarget('Dasique Seongsu', 'Seongsu atmosphere roundup save', { query: '데이지크 성수' })],
  },
  {
    key: 'ig-seongsu-mood-sanrio-popup',
    themeKey: 'seongsu-mood-spaces',
    themeTitle: 'Seongsu mood spaces',
    title: 'Sanrio Characters popup',
    area: 'Seongsu / 성수이로7길 28',
    status: 'Instagram save',
    lead: 'Saved from _yh.yhh’s Seongsu atmosphere roundup reel.',
    source: 'Instagram reel DSUHSP_Ee2T / caption list',
    importNote: '2025-11-29 to 2025-12-28 in reel · on-site wait',
    thumbnail: 'https://images.unsplash.com/photo-1563901935883-cb61f5d49be4?auto=format&fit=crop&w=800&q=80',
    logistics: { start: 'Seongsu walking loop', end: 'Assign after choosing route density', note: 'Caption-sourced Seongsu stop; combine only if it fits the existing May 17 walking loop.' },
    entries: [
      { place: 'Sanrio Characters popup', area: 'Seongsu / 성수이로7길 28', vibe: 'popup / character goods', note: 'Reel-listed popup; date-specific and likely not relevant for May unless a new popup replaces it. Keep as low-confidence inspiration, not a committed stop.', thumbnail: 'https://images.unsplash.com/photo-1563901935883-cb61f5d49be4?auto=format&fit=crop&w=800&q=80', instagramUrl: 'https://www.instagram.com/reel/DSUHSP_Ee2T/?igsh=NTc4MTIwNjQ2YQ==', naverUrl: 'https://map.naver.com/p/search/%EC%82%B0%EB%A6%AC%EC%98%A4%20%EC%BA%90%EB%A6%AD%ED%84%B0%EC%A6%88%20%ED%8C%9D%EC%97%85%20%EC%84%B1%EC%88%98', kakaoUrl: 'https://map.kakao.com/?q=%EC%82%B0%EB%A6%AC%EC%98%A4%20%EC%BA%90%EB%A6%AD%ED%84%B0%EC%A6%88%20%ED%8C%9D%EC%97%85%20%EC%84%B1%EC%88%98' },
    ],
    mapTargets: [mapTarget('Sanrio Characters popup', 'Seongsu atmosphere roundup save', { query: '산리오 캐릭터즈 팝업 성수' })],
  },
  {
    key: 'ig-seongsu-mood-yongyong',
    themeKey: 'seongsu-mood-spaces',
    themeTitle: 'Seongsu mood spaces',
    title: 'Yongyong Seonsaeng Maradowon',
    area: 'Seongsu / 성수동2가 277-56',
    status: 'Instagram save',
    lead: 'Saved from _yh.yhh’s Seongsu atmosphere roundup reel.',
    source: 'Instagram reel DSUHSP_Ee2T / caption list',
    importNote: '16:00–23:00 daily',
    thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    logistics: { start: 'Seongsu walking loop', end: 'Assign after choosing route density', note: 'Caption-sourced Seongsu stop; combine only if it fits the existing May 17 walking loop.' },
    entries: [
      { place: 'Yongyong Seonsaeng Maradowon', area: 'Seongsu / 성수동2가 277-56', vibe: 'restaurant / dinner', note: 'Dinner option from the Seongsu mood-space reel; useful if the shopping route needs a nearby meal anchor.', thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', instagramUrl: 'https://www.instagram.com/reel/DSUHSP_Ee2T/?igsh=NTc4MTIwNjQ2YQ==', naverUrl: 'https://map.naver.com/p/search/%EC%9A%A9%EC%9A%A9%EC%84%A0%EC%83%9D%20%EB%A7%88%EB%9D%BC%EB%8F%84%EC%9B%90%20%EC%84%B1%EC%88%98', kakaoUrl: 'https://map.kakao.com/?q=%EC%9A%A9%EC%9A%A9%EC%84%A0%EC%83%9D%20%EB%A7%88%EB%9D%BC%EB%8F%84%EC%9B%90%20%EC%84%B1%EC%88%98' },
    ],
    mapTargets: [mapTarget('Yongyong Seonsaeng Maradowon', 'Seongsu atmosphere roundup save', { query: '용용선생 마라도원 성수' })],
  },
  {
    key: 'ig-seongsu-mood-medicube',
    themeKey: 'seongsu-mood-spaces',
    themeTitle: 'Seongsu mood spaces',
    title: 'Medicube Seongsu',
    area: 'Seongsu / 성수이로7길 40',
    status: 'Instagram save',
    lead: 'Saved from _yh.yhh’s Seongsu atmosphere roundup reel.',
    source: 'Instagram reel DSUHSP_Ee2T / caption list',
    importNote: '11:00–20:00 daily',
    thumbnail: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
    logistics: { start: 'Seongsu walking loop', end: 'Assign after choosing route density', note: 'Caption-sourced Seongsu stop; combine only if it fits the existing May 17 walking loop.' },
    entries: [
      { place: 'Medicube Seongsu', area: 'Seongsu / 성수이로7길 40', vibe: 'beauty tech showroom', note: 'Beauty-device showroom from the reel; good if the day leans K-beauty and product testing rather than only shopping.', thumbnail: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80', instagramUrl: 'https://www.instagram.com/reel/DSUHSP_Ee2T/?igsh=NTc4MTIwNjQ2YQ==', naverUrl: 'https://map.naver.com/p/search/%EB%A9%94%EB%94%94%ED%81%90%EB%B8%8C%20%EC%84%B1%EC%88%98', kakaoUrl: 'https://map.kakao.com/?q=%EB%A9%94%EB%94%94%ED%81%90%EB%B8%8C%20%EC%84%B1%EC%88%98' },
    ],
    mapTargets: [mapTarget('Medicube Seongsu', 'Seongsu atmosphere roundup save', { query: '메디큐브 성수' })],
  },
  {
    key: 'ig-seongsu-mood-dalimmak',
    themeKey: 'seongsu-mood-spaces',
    themeTitle: 'Seongsu mood spaces',
    title: 'Dalimmak',
    area: 'Seongsu / 연무장길 38-2 1F',
    status: 'Instagram save',
    lead: 'Saved from _yh.yhh’s Seongsu atmosphere roundup reel.',
    source: 'Instagram reel DSUHSP_Ee2T / caption list',
    importNote: '09:00–22:00 daily',
    thumbnail: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
    logistics: { start: 'Seongsu walking loop', end: 'Assign after choosing route density', note: 'Caption-sourced Seongsu stop; combine only if it fits the existing May 17 walking loop.' },
    entries: [
      { place: 'Dalimmak', area: 'Seongsu / 연무장길 38-2 1F', vibe: 'cafe / dessert', note: 'Cafe/dessert stop from the reel; useful as a lower-commitment rest stop inside the Seongsu walk.', thumbnail: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80', instagramUrl: 'https://www.instagram.com/reel/DSUHSP_Ee2T/?igsh=NTc4MTIwNjQ2YQ==', naverUrl: 'https://map.naver.com/p/search/%EB%8B%AC%EC%9E%84%EB%A7%89%20%EC%84%B1%EC%88%98', kakaoUrl: 'https://map.kakao.com/?q=%EB%8B%AC%EC%9E%84%EB%A7%89%20%EC%84%B1%EC%88%98' },
    ],
    mapTargets: [mapTarget('Dalimmak', 'Seongsu atmosphere roundup save', { query: '달임막 성수' })],
  },
  {
    key: 'ig-seongsu-mood-hanjeongsun',
    themeKey: 'seongsu-mood-spaces',
    themeTitle: 'Seongsu mood spaces',
    title: 'Hanjeongsun',
    area: 'Seongsu / 연무장길 43-1 1F',
    status: 'Instagram save',
    lead: 'Saved from _yh.yhh’s Seongsu atmosphere roundup reel.',
    source: 'Instagram reel DSUHSP_Ee2T / caption list',
    importNote: '10:30–22:00 daily',
    thumbnail: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80',
    logistics: { start: 'Seongsu walking loop', end: 'Assign after choosing route density', note: 'Caption-sourced Seongsu stop; combine only if it fits the existing May 17 walking loop.' },
    entries: [
      { place: 'Hanjeongsun', area: 'Seongsu / 연무장길 43-1 1F', vibe: 'dessert / cafe', note: 'Reel-listed Seongsu stop near the same walking corridor; keep as optional cafe/dessert backup.', thumbnail: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80', instagramUrl: 'https://www.instagram.com/reel/DSUHSP_Ee2T/?igsh=NTc4MTIwNjQ2YQ==', naverUrl: 'https://map.naver.com/p/search/%ED%95%9C%EC%A0%95%EC%84%A0%20%EC%84%B1%EC%88%98', kakaoUrl: 'https://map.kakao.com/?q=%ED%95%9C%EC%A0%95%EC%84%A0%20%EC%84%B1%EC%88%98' },
    ],
    mapTargets: [mapTarget('Hanjeongsun', 'Seongsu atmosphere roundup save', { query: '한정선 성수' })],
  },

  {
    key: 'ig-korea-glow-up-brow-gyeol',
    themeKey: 'korea-glow-up-beauty',
    themeTitle: 'Korea glow up beauty saves',
    title: 'Brow Gyeol',
    area: 'Seoul / exact area TBD',
    status: 'needs price + appointment check',
    lead: 'Saved from Bianca Montalvo’s Korea glow up reel.',
    source: 'Instagram reel DU5nD4_DrOC / caption tags',
    importNote: 'Caption tagged eyebrow microblading, nails, and skin treatments; verify exact branch/location and pricing before routing.',
    thumbnail: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80',
    logistics: { start: 'Beauty provider candidate', end: 'Assign after appointment fit check', note: 'Beauty-treatment lead from a social reel; do not schedule without pricing, availability, and location verification.' },
    entries: [
      { place: 'Brow Gyeol', area: 'Seoul / exact area TBD', vibe: 'eyebrow microblading', note: 'Eyebrow microblading provider tagged in Bianca Montalvo’s Korea glow up reel. Comments ask about pain and one-vs-two appointments, so verify numbing, touch-up policy, English support, and total price before booking.', thumbnail: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80', instagramUrl: 'https://www.instagram.com/reel/DU5nD4_DrOC/?igsh=NTc4MTIwNjQ2YQ==', instagram: 'https://www.instagram.com/brow_gyeol/', naverUrl: 'https://map.naver.com/p/search/%EB%B8%8C%EB%A1%9C%EC%9A%B0%EA%B2%B0%20%EC%84%9C%EC%9A%B8', kakaoUrl: 'https://map.kakao.com/?q=%EB%B8%8C%EB%A1%9C%EC%9A%B0%EA%B2%B0%20%EC%84%9C%EC%9A%B8' },
    ],
    mapTargets: [mapTarget('Brow Gyeol', 'Korea glow up provider from Instagram reel', { query: '브로우결 서울' })],
  },
  {
    key: 'ig-korea-glow-up-artlab-nail',
    themeKey: 'korea-glow-up-beauty',
    themeTitle: 'Korea glow up beauty saves',
    title: 'Artlab Nail',
    area: 'Seoul / exact area TBD',
    status: 'needs price + appointment check',
    lead: 'Saved from Bianca Montalvo’s Korea glow up reel.',
    source: 'Instagram reel DU5nD4_DrOC / caption tags',
    importNote: 'Caption tagged eyebrow microblading, nails, and skin treatments; verify exact branch/location and pricing before routing.',
    thumbnail: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=800&q=80',
    logistics: { start: 'Beauty provider candidate', end: 'Assign after appointment fit check', note: 'Beauty-treatment lead from a social reel; do not schedule without pricing, availability, and location verification.' },
    entries: [
      { place: 'Artlab Nail', area: 'Seoul / exact area TBD', vibe: 'nails / nail art', note: 'Nail provider tagged in the Korea glow up reel. Keep as an inspiration/backup nail option until area, menu, and appointment availability are verified against the Seongsu nail plan.', thumbnail: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=800&q=80', instagramUrl: 'https://www.instagram.com/reel/DU5nD4_DrOC/?igsh=NTc4MTIwNjQ2YQ==', instagram: 'https://www.instagram.com/artlab_nail/', naverUrl: 'https://map.naver.com/p/search/%EC%95%84%ED%8A%B8%EB%9E%A9%EB%84%A4%EC%9D%BC%20%EC%84%9C%EC%9A%B8', kakaoUrl: 'https://map.kakao.com/?q=%EC%95%84%ED%8A%B8%EB%9E%A9%EB%84%A4%EC%9D%BC%20%EC%84%9C%EC%9A%B8' },
    ],
    mapTargets: [mapTarget('Artlab Nail', 'Korea glow up provider from Instagram reel', { query: '아트랩네일 서울' })],
  },
  {
    key: 'ig-korea-glow-up-reone-global',
    themeKey: 'korea-glow-up-beauty',
    themeTitle: 'Korea glow up beauty saves',
    title: 'ReOne Global',
    area: 'Cheongdam / Seoul',
    status: 'already booked anchor',
    lead: 'Saved from Bianca Montalvo’s Korea glow up reel.',
    source: 'Instagram reel DU5nD4_DrOC / caption tags',
    importNote: 'Caption tagged eyebrow microblading, nails, and skin treatments; verify exact branch/location and pricing before routing.',
    thumbnail: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    logistics: { start: 'Beauty provider candidate', end: 'Assign after appointment fit check', note: 'Beauty-treatment lead from a social reel; do not schedule without pricing, availability, and location verification.' },
    entries: [
      { place: 'ReOne Global', area: 'Cheongdam / Seoul', vibe: 'skin treatments / dermatology', note: 'Skin treatment clinic tagged in the reel. This matches the existing ReOne dermatology anchor already saved/booked for May 22, so keep this card as social-proof context rather than a separate new clinic decision.', thumbnail: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80', instagramUrl: 'https://www.instagram.com/reel/DU5nD4_DrOC/?igsh=NTc4MTIwNjQ2YQ==', instagram: 'https://www.instagram.com/reone_global/', naverUrl: 'https://map.naver.com/p/search/%EB%A6%AC%EC%9B%90%ED%94%BC%EB%B6%80%EA%B3%BC%EC%9D%98%EC%9B%90%20%EC%B2%AD%EB%8B%B4', kakaoUrl: 'https://map.kakao.com/?q=%EB%A6%AC%EC%9B%90%ED%94%BC%EB%B6%80%EA%B3%BC%EC%9D%98%EC%9B%90%20%EC%B2%AD%EB%8B%B4' },
    ],
    mapTargets: [mapTarget('ReOne Global', 'Korea glow up provider from Instagram reel', { query: '리원피부과의원 청담' })],
  },

  {
    key: 'ig-seongsu-bag-stand-oil',
    themeKey: 'seongsu-bag-shopping',
    themeTitle: 'Seongsu bag shopping',
    title: 'Stand Oil',
    area: 'Seongsu / Seoul',
    status: 'tax-refund shopping save',
    lead: 'Saved from Genevive Laurenn’s Korean designer bag shopping reel.',
    source: 'Instagram reel DU54kkljfYC / visible overlay + caption',
    importNote: 'Mushy Bag shown around $120 CAD in Korea vs $200+ CAD abroad',
    thumbnail: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80',
    logistics: { start: 'Seongsu shopping loop', end: 'Assign after deciding shopping density', note: 'Korean designer bag stop; combine with Seongsu brand/showroom route and remember tax refund timing.' },
    entries: [
      { place: 'Stand Oil', area: 'Seongsu / Seoul', vibe: 'Korean designer bag store', note: 'First bag brand visible in the reel. Good fit for a Seongsu shopping loop because the reel frames it as cheaper in Korea with tax refund. Verify exact branch and current stock before routing.', thumbnail: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80', instagramUrl: 'https://www.instagram.com/reel/DU54kkljfYC/?igsh=NTc4MTIwNjQ2YQ==', naverUrl: 'https://map.naver.com/p/search/%EC%8A%A4%ED%83%A0%EB%93%9C%EC%98%A4%EC%9D%BC%20%EC%84%B1%EC%88%98', kakaoUrl: 'https://map.kakao.com/?q=%EC%8A%A4%ED%83%A0%EB%93%9C%EC%98%A4%EC%9D%BC%20%EC%84%B1%EC%88%98' },
    ],
    mapTargets: [mapTarget('Stand Oil', 'Korean designer bag store from Instagram reel', { query: '스탠드오일 성수' })],
  },
  {
    key: 'ig-seongsu-bag-marge-sherwood',
    themeKey: 'seongsu-bag-shopping',
    themeTitle: 'Seongsu bag shopping',
    title: 'Marge Sherwood',
    area: 'Seongsu / Seoul',
    status: 'tax-refund shopping save',
    lead: 'Saved from Genevive Laurenn’s Korean designer bag shopping reel.',
    source: 'Instagram reel DU54kkljfYC / visible overlay + caption',
    importNote: 'Boston Bag shown around $380 CAD in Korea vs $450+ CAD; Shoulder Brocle Mini around $300 CAD vs $450 CAD + tax',
    thumbnail: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    logistics: { start: 'Seongsu shopping loop', end: 'Assign after deciding shopping density', note: 'Korean designer bag stop; combine with Seongsu brand/showroom route and remember tax refund timing.' },
    entries: [
      { place: 'Marge Sherwood', area: 'Seongsu / Seoul', vibe: 'Korean designer bag store', note: 'Main highlighted brand from the reel and hashtag. Storefront signage visible; reel mentions a second floor filled with more bags. Strong shopping candidate if she likes Korean designer bags.', thumbnail: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80', instagramUrl: 'https://www.instagram.com/reel/DU54kkljfYC/?igsh=NTc4MTIwNjQ2YQ==', naverUrl: 'https://map.naver.com/p/search/%EB%A7%88%EC%A7%80%EC%85%94%EC%9A%B0%EB%93%9C%20%EC%84%B1%EC%88%98', kakaoUrl: 'https://map.kakao.com/?q=%EB%A7%88%EC%A7%80%EC%85%94%EC%9A%B0%EB%93%9C%20%EC%84%B1%EC%88%98' },
    ],
    mapTargets: [mapTarget('Marge Sherwood', 'Korean designer bag store from Instagram reel', { query: '마지셔우드 성수' })],
  },
  {
    key: 'ig-seongsu-bag-osoi',
    themeKey: 'seongsu-bag-shopping',
    themeTitle: 'Seongsu bag shopping',
    title: 'OSOI',
    area: 'Seongsu / Seoul',
    status: 'tax-refund shopping save',
    lead: 'Saved from Genevive Laurenn’s Korean designer bag shopping reel.',
    source: 'Instagram reel DU54kkljfYC / visible overlay + caption',
    importNote: 'No exact price visible; reel says go to OSOI if you want to shop more bags',
    thumbnail: 'https://images.unsplash.com/photo-1590739225281-70ed3d5d50fa?auto=format&fit=crop&w=800&q=80',
    logistics: { start: 'Seongsu shopping loop', end: 'Assign after deciding shopping density', note: 'Korean designer bag stop; combine with Seongsu brand/showroom route and remember tax refund timing.' },
    entries: [
      { place: 'OSOI', area: 'Seongsu / Seoul', vibe: 'Korean designer bag store', note: 'Third bag-brand stop visible near the end of the reel. Keep as an optional continuation after Stand Oil / Marge Sherwood if the shopping energy is high.', thumbnail: 'https://images.unsplash.com/photo-1590739225281-70ed3d5d50fa?auto=format&fit=crop&w=800&q=80', instagramUrl: 'https://www.instagram.com/reel/DU54kkljfYC/?igsh=NTc4MTIwNjQ2YQ==', naverUrl: 'https://map.naver.com/p/search/%EC%98%A4%EC%86%8C%EC%9D%B4%20%EC%84%B1%EC%88%98', kakaoUrl: 'https://map.kakao.com/?q=%EC%98%A4%EC%86%8C%EC%9D%B4%20%EC%84%B1%EC%88%98' },
    ],
    mapTargets: [mapTarget('OSOI', 'Korean designer bag store from Instagram reel', { query: '오소이 성수' })],
  },

  {
    key: 'ig-seoul-food-hanmiok',
    themeKey: 'seoul-food-guide-part-2',
    themeTitle: 'Seoul food guide — Part 2',
    title: 'Han Mi Ok / 한미옥',
    area: 'Gangnam',
    status: 'food save',
    lead: 'Saved from mandaviola’s Seoul food guide Part 2 reel.',
    source: 'Instagram reel DVi2DggjLVh / visible overlay',
    importNote: 'famous for gujeolpan · sharing meal',
    thumbnail: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=800&q=80',
    logistics: { start: 'Unscheduled Seoul food candidate', end: 'Assign after area clustering', note: 'Food spot from Seoul food guide reel; creator mentions Naver map links by DM/comment.' },
    entries: [
      { place: 'Han Mi Ok / 한미옥', area: 'Gangnam', vibe: 'Korean platter / gujeolpan', note: 'Famous for gujeolpan, a traditional Korean platter. Reel notes tender/flavorful meat and says it is perfect for sharing with friends.', thumbnail: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=800&q=80', instagramUrl: 'https://www.instagram.com/reel/DVi2DggjLVh/?igsh=NTc4MTIwNjQ2YQ==', naverUrl: 'https://map.naver.com/p/search/%ED%95%9C%EB%AF%B8%EC%98%A5%20%EA%B0%95%EB%82%A8', kakaoUrl: 'https://map.kakao.com/?q=%ED%95%9C%EB%AF%B8%EC%98%A5%20%EA%B0%95%EB%82%A8' },
    ],
    mapTargets: [mapTarget('Han Mi Ok / 한미옥', 'Seoul food guide Part 2 save', { query: '한미옥 강남' })],
  },
  {
    key: 'ig-seoul-food-kyetanzip',
    themeKey: 'seoul-food-guide-part-2',
    themeTitle: 'Seoul food guide — Part 2',
    title: 'Kyetanzip / 계탄집',
    area: 'Jayang-dong',
    status: 'food save',
    lead: 'Saved from mandaviola’s Seoul food guide Part 2 reel.',
    source: 'Instagram reel DVi2DggjLVh / visible overlay',
    importNote: 'open until 3:30am · late-night hangout',
    thumbnail: 'https://images.unsplash.com/photo-1598514983318-2f64f8f4796c?auto=format&fit=crop&w=800&q=80',
    logistics: { start: 'Unscheduled Seoul food candidate', end: 'Assign after area clustering', note: 'Food spot from Seoul food guide reel; creator mentions Naver map links by DM/comment.' },
    entries: [
      { place: 'Kyetanzip / 계탄집', area: 'Jayang-dong', vibe: 'grilled chicken / beer', note: 'Celeb-favorite grilled chicken spot. Reel recommends ordering both salt and spicy marinated chicken plus jumeokbap; good with cold beer and late-night hangout energy.', thumbnail: 'https://images.unsplash.com/photo-1598514983318-2f64f8f4796c?auto=format&fit=crop&w=800&q=80', instagramUrl: 'https://www.instagram.com/reel/DVi2DggjLVh/?igsh=NTc4MTIwNjQ2YQ==', naverUrl: 'https://map.naver.com/p/search/%EA%B3%84%ED%83%84%EC%A7%91%20%EC%9E%90%EC%96%91%EB%8F%99', kakaoUrl: 'https://map.kakao.com/?q=%EA%B3%84%ED%83%84%EC%A7%91%20%EC%9E%90%EC%96%91%EB%8F%99' },
    ],
    mapTargets: [mapTarget('Kyetanzip / 계탄집', 'Seoul food guide Part 2 save', { query: '계탄집 자양동' })],
  },
  {
    key: 'ig-seoul-food-norunsan-tteokbokki',
    themeKey: 'seoul-food-guide-part-2',
    themeTitle: 'Seoul food guide — Part 2',
    title: 'Norunsan Tteokbokki / 노룬산떡볶이',
    area: 'Jayang-dong',
    status: 'food save',
    lead: 'Saved from mandaviola’s Seoul food guide Part 2 reel.',
    source: 'Instagram reel DVi2DggjLVh / visible overlay',
    importNote: 'celeb-approved tteokbokki · expanded from street stall',
    thumbnail: 'https://images.unsplash.com/photo-1635363638580-c2809d049eee?auto=format&fit=crop&w=800&q=80',
    logistics: { start: 'Unscheduled Seoul food candidate', end: 'Assign after area clustering', note: 'Food spot from Seoul food guide reel; creator mentions Naver map links by DM/comment.' },
    entries: [
      { place: 'Norunsan Tteokbokki / 노룬산떡볶이', area: 'Jayang-dong', vibe: 'tteokbokki / casual snack', note: 'Celeb-approved tteokbokki. Reel says it started as a tiny street stall, people queued on the street, and it expanded to a bigger store because it got popular.', thumbnail: 'https://images.unsplash.com/photo-1635363638580-c2809d049eee?auto=format&fit=crop&w=800&q=80', instagramUrl: 'https://www.instagram.com/reel/DVi2DggjLVh/?igsh=NTc4MTIwNjQ2YQ==', naverUrl: 'https://map.naver.com/p/search/%EB%85%B8%EB%A3%AC%EC%82%B0%EB%96%A1%EB%B3%B6%EC%9D%B4%20%EC%9E%90%EC%96%91%EB%8F%99', kakaoUrl: 'https://map.kakao.com/?q=%EB%85%B8%EB%A3%AC%EC%82%B0%EB%96%A1%EB%B3%B6%EC%9D%B4%20%EC%9E%90%EC%96%91%EB%8F%99' },
    ],
    mapTargets: [mapTarget('Norunsan Tteokbokki / 노룬산떡볶이', 'Seoul food guide Part 2 save', { query: '노룬산떡볶이 자양동' })],
  },
  {
    key: 'ig-seoul-food-grandmothers-recipe',
    themeKey: 'seoul-food-guide-part-2',
    themeTitle: 'Seoul food guide — Part 2',
    title: 'Grandmother’s Recipe / 할머니의 레시피',
    area: 'Seongsu',
    status: 'food save',
    lead: 'Saved from mandaviola’s Seoul food guide Part 2 reel.',
    source: 'Instagram reel DVi2DggjLVh / visible overlay',
    importNote: 'order one set · banchan-heavy',
    thumbnail: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?auto=format&fit=crop&w=800&q=80',
    logistics: { start: 'Unscheduled Seoul food candidate', end: 'Assign after area clustering', note: 'Food spot from Seoul food guide reel; creator mentions Naver map links by DM/comment.' },
    entries: [
      { place: 'Grandmother’s Recipe / 할머니의 레시피', area: 'Seongsu', vibe: 'Korean home-style meal', note: 'Authentic Korean home-style meal in Seongsu. Reel says simply order one set, banchan is delicious, and it feels like eating at grandma’s house.', thumbnail: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?auto=format&fit=crop&w=800&q=80', instagramUrl: 'https://www.instagram.com/reel/DVi2DggjLVh/?igsh=NTc4MTIwNjQ2YQ==', naverUrl: 'https://map.naver.com/p/search/%ED%95%A0%EB%A8%B8%EB%8B%88%EC%9D%98%20%EB%A0%88%EC%8B%9C%ED%94%BC%20%EC%84%B1%EC%88%98', kakaoUrl: 'https://map.kakao.com/?q=%ED%95%A0%EB%A8%B8%EB%8B%88%EC%9D%98%20%EB%A0%88%EC%8B%9C%ED%94%BC%20%EC%84%B1%EC%88%98' },
    ],
    mapTargets: [mapTarget('Grandmother’s Recipe / 할머니의 레시피', 'Seoul food guide Part 2 save', { query: '할머니의 레시피 성수' })],
  },
]

const stepOnePlaceThemes = [
  {
    key: 'seongsu-viral-loop',
    title: 'May 17 Seongsu viral loop',
    status: 'Instagram saves',
    lead: 'Broken into individual Seongsu saved places so each one can be Yes / No.',
  },
  {
    key: 'viral-saves-inbox',
    title: 'Viral saves inbox',
    status: 'Reels inbox',
    lead: 'Imported reel leads that still need venue cleanup before routing.',
  },
  {
    key: 'culinary-class-war-restaurants',
    title: 'Culinary Class War restaurants',
    status: 'Instagram reel',
    lead: 'Chef-restaurant saves from eating_forky’s Seoul reel, kept separate until reservations and dates are checked.',
  },
  {
    key: 'wellness-spa-saves',
    title: 'Wellness / spa saves',
    status: 'Instagram reel',
    lead: 'Spa and recovery ideas kept separate until price, booking, and transport fit are checked.',
  },
  {
    key: 'seongsu-mood-spaces',
    title: 'Seongsu mood spaces',
    status: 'Instagram roundup',
    lead: 'Atmospheric Seongsu cafes, showrooms, beauty shops, popup, and dinner ideas from _yh.yhh’s reel.',
  },
  {
    key: 'korea-glow-up-beauty',
    title: 'Korea glow up beauty saves',
    status: 'Instagram reel',
    lead: 'Beauty-treatment providers tagged in Bianca Montalvo’s Korea glow up reel.',
  },
  {
    key: 'seongsu-bag-shopping',
    title: 'Seongsu bag shopping',
    status: 'Instagram reel',
    lead: 'Korean designer bag stores from Genevive Laurenn’s reel; useful for tax-refund shopping in Seongsu.',
  },
  {
    key: 'seoul-food-guide-part-2',
    title: 'Seoul food guide — Part 2',
    status: 'Instagram reel',
    lead: 'Mandaviola food spots saved as individual restaurant cards before date assignment.',
  },
]

const aprilInstagramBatchThemes = [
  ['seongsu-cafe-guide', 'Seongsu cafe guide', 'Instagram batch', 'Seongsu cafe stops recovered by frame sampling from ice_dwhite’s reel.'],
  ['yongsan-food-saves', 'Yongsan food saves', 'Instagram batch', 'Yongsan/Yongridan-gil food saves from Korean reels.'],
  ['seoul-seafood-izakaya', 'Seoul seafood izakaya saves', 'Instagram batch', 'Seafood and sashimi-focused dinner candidates.'],
  ['seoul-dessert-cafes', 'Seoul dessert cafe saves', 'Instagram batch', 'Dessert cafes, bakeries, and sweet halls from the April reel batch.'],
  ['gangnam-bbq-saves', 'Gangnam BBQ saves', 'Instagram batch', 'Gangnam meat / BBQ ideas to compare against other dinner anchors.'],
  ['korea-nail-salon-saves', 'Korea nail salon saves', 'Instagram batch', 'Foreigner-friendly nail salon leads, kept separate from the existing booked/shortlisted nail plan.'],
  ['seoul-food-market-saves', 'Seoul food market saves', 'Instagram batch', 'Traditional-market food saves that need exact-hours and stall checks.'],
  ['seongsu-tea-design', 'Seongsu tea design saves', 'Instagram batch', 'Quiet tea/design experiences for a softer Seongsu stop.'],
  ['limited-food-popups', 'Limited food promos / re-check', 'Needs re-check', 'Date-limited food promos saved only for availability verification.'],
  ['yeonnam-food-saves', 'Yeonnam food saves', 'Instagram batch', 'Yeonnam/Hongdae-area food ideas from reels.'],
]

const batchThumbs = {
  cafe: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
  bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
  food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  seafood: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=800&q=80',
  dessert: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80',
  bbq: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=800&q=80',
  nails: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
  shopping: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
  tea: 'https://images.unsplash.com/photo-1547825407-2d060104b7f8?auto=format&fit=crop&w=800&q=80',
}

const aprilInstagramBatchPlaces = [
  ['ig-seongsu-cafe-etre', 'seongsu-cafe-guide', 'Seongsu cafe guide', 'Être Bake House', 'Seongsu', 'cafe / bakery', 'Reel frame showed Être Bake House at 37-5 Yeonmujang-gil; good pastry/cafe stop for a Seongsu walking loop.', 'Instagram reel DUzUdqHktkF / frame sampling', '37-5 Yeonmujang-gil visible', batchThumbs.bakery, 'https://www.instagram.com/reel/DUzUdqHktkF/?igsh=NTc4MTIwNjQ2YQ==', '에트르 베이크하우스 성수'],
  ['ig-seongsu-cafe-darak', 'seongsu-cafe-guide', 'Seongsu cafe guide', 'Seongsu Darak / 성수다락', 'Seongsu', 'cafe / brunch', 'Frame overlay identified Seongsu Darak on Ttukseom-ro 9-gil, 2F. Save as a cafe/brunch candidate if nearby.', 'Instagram reel DUzUdqHktkF / frame sampling', 'Ttukseom-ro 9-gil 2F visible', batchThumbs.cafe, 'https://www.instagram.com/reel/DUzUdqHktkF/?igsh=NTc4MTIwNjQ2YQ==', '성수다락'],
  ['ig-seongsu-cafe-noci', 'seongsu-cafe-guide', 'Seongsu cafe guide', 'Cafe Noci / 카페 노시', 'Seongsu', 'cafe / dessert', 'Frame showed Cafe Noci / noci signage; exact Korean listing and branch should be verified before routing.', 'Instagram reel DUzUdqHktkF / frame sampling', 'exact address partially blurry · verify listing', batchThumbs.cafe, 'https://www.instagram.com/reel/DUzUdqHktkF/?igsh=NTc4MTIwNjQ2YQ==', 'Cafe Noci 성수'],
  ['ig-seongsu-cafe-standard-bread', 'seongsu-cafe-guide', 'Seongsu cafe guide', 'Standard Bread / 스탠다드브레드', 'Seongsu', 'bakery cafe', 'Frame showed Standard Bread at 37 Seongsui-ro 18-gil; bakery counter / bread-focused stop.', 'Instagram reel DUzUdqHktkF / frame sampling', '37 Seongsui-ro 18-gil visible', batchThumbs.bakery, 'https://www.instagram.com/reel/DUzUdqHktkF/?igsh=NTc4MTIwNjQ2YQ==', '스탠다드브레드 성수'],
  ['ig-yongsan-gorogoro', 'yongsan-food-saves', 'Yongsan food saves', 'Gorogoro / 고로고로', 'Yongsan', 'kaisendon / unagi don', 'Yongsan date-course seafood rice bowl spot. Caption highlights premium gorogoro kaisendon with salmon, tuna belly, sweet shrimp, snow crab, uni, ikura, plus special unagi don and ochazuke finish.', 'Instagram reel DU-WLy7E3QD / caption', 'ad reel · verify reservation/wait', batchThumbs.seafood, 'https://www.instagram.com/reel/DU-WLy7E3QD/?igsh=NTc4MTIwNjQ2YQ==', '고로고로 용산 한강대로11길 27'],
  ['ig-jungnang-okinara', 'seoul-seafood-izakaya', 'Seoul seafood izakaya saves', 'Okinara / 오키나라', 'Jungnang-gu / Junghwa Station', 'seafood izakaya', 'Hidden Jungnang seafood izakaya. Caption says owner buys premium seasonal seafood at Noryangjin dawn auction; highlights the “Geukrak” platter in the 50,000 KRW range and crab soup.', 'Instagram reel DTNX_1bD-QG / caption', 'seasonal seafood · price/menu should be rechecked', batchThumbs.seafood, 'https://www.instagram.com/reel/DTNX_1bD-QG/?igsh=NTc4MTIwNjQ2YQ==', '오키나라 중랑구 중랑역로 69'],
  ['ig-gangnam-mochibang', 'seoul-dessert-cafes', 'Seoul dessert cafe saves', 'Mochibang / 모찌방', 'Gangnam / Seolleung', 'matcha parfait cafe', 'Best Matcha Parfait in Seoul reel. Caption highlights Jeju organic matcha soft serve with pudding, red bean yokan, mochi, matcha tuile, plus matcha latte/pudding/handmade mochi.', 'Instagram reel DVvila8E5Mk / caption', 'hours shown 11:30-19:00 · closed Monday', batchThumbs.dessert, 'https://www.instagram.com/reel/DVvila8E5Mk/?igsh=NTc4MTIwNjQ2YQ==', '모찌방 강남구 삼성로75길 41'],
  ['ig-seoul-mil-toast', 'seoul-dessert-cafes', 'Seoul dessert cafe saves', 'Mil Toast House / 밀토스트집', 'Seoul / branch TBD', 'steamed bread cafe', 'Creator finally tried the famous steamed bread at @miltoasthouse. Save as a cafe/dessert candidate; exact branch should be chosen by route.', 'Instagram reel DVx3ExsE2td / caption', 'verify branch and wait time', batchThumbs.bakery, 'https://www.instagram.com/reel/DVx3ExsE2td/?igsh=NTc4MTIwNjQ2YQ==', '밀토스트집 서울'],
  ['ig-gangnam-sanjang', 'gangnam-bbq-saves', 'Gangnam BBQ saves', 'Sanjang Jangjak-gui / 산장 장작구이', 'Yeoksam / Gangnam', 'wood-fired pork BBQ', 'Yeoksam Station 1-minute wood-fire BBQ spot. Caption highlights mountain-lodge mood, oak firewood + rotating pre-grill, smoky black pork, green onion kimchi, and soju/beer fit.', 'Instagram reel DVV0w7ukw6p / caption', 'ad reel · hours shown Mon-Sat 11-23, break 15-17, Sunday closed', batchThumbs.bbq, 'https://www.instagram.com/reel/DVV0w7ukw6p/?igsh=NTc4MTIwNjQ2YQ==', '산장 장작구이 역삼'],
  ['ig-sweetpark', 'seoul-dessert-cafes', 'Seoul dessert cafe saves', 'Shinsegae Sweet Park / 신세계 스위트파크', 'Gangnam / Express Bus Terminal', 'department store dessert hall', 'B1 of Shinsegae Department Store Gangnam; direct connection to Express Bus Terminal. Useful dessert/shopping cluster; weekday recommended because weekends are crowded.', 'Instagram reel DWK85qdkqxU / caption', 'hours 10:30-20:00/20:30 · department-store holiday closures', batchThumbs.dessert, 'https://www.instagram.com/reel/DWK85qdkqxU/?igsh=NTc4MTIwNjQ2YQ==', '신세계 스위트파크 강남'],
  ['ig-seongsu-cafe-onion', 'seoul-dessert-cafes', 'Seoul dessert cafe saves', 'Cafe Onion Seongsu / 어니언 성수', 'Seongsu', 'cafe / bakery', 'Appears in Seongsu vlog and Catherine dessert ranking. Save as famous atmosphere + bakery stop, but likely crowded.', 'Instagram reels DQo76JYkkCr + DUKCSvmkgrV / frame sampling', 'popular/crowded · verify wait', batchThumbs.bakery, 'https://www.instagram.com/reel/DQo76JYkkCr/?igsh=NTc4MTIwNjQ2YQ==', '어니언 성수'],
  ['ig-seongsu-loe', 'seongsu-mood-spaces', 'Seongsu mood spaces', 'LOE', 'Seongsu', 'fragrance / lifestyle store', 'Seongsu vlog frame showed LOE fragrance/product experience with forest scent notes. Save as optional mood-space stop if nearby.', 'Instagram reel DQo76JYkkCr / frame sampling', 'exact listing/branch needs verification', batchThumbs.shopping, 'https://www.instagram.com/reel/DQo76JYkkCr/?igsh=NTc4MTIwNjQ2YQ==', 'LOE 성수'],
  ['ig-hongdae-gonggan-nails', 'korea-nail-salon-saves', 'Korea nail salon saves', 'Gonggan Nails Hongdae / 공간네일 홍대', 'Hongdae', 'nail salon', 'Nancy’s Korea nail-care reel: she went to Gonggan Nails in Hongdae; notes Korean nail salons have strong cuticle care/monthly designs and often require deposits.', 'Instagram reel DFT8V6JAsGB / caption', 'foreigner-friendly mention · deposit/payment logistics need check', batchThumbs.nails, 'https://www.instagram.com/reel/DFT8V6JAsGB/?igsh=NTc4MTIwNjQ2YQ==', '공간네일 홍대'],
  ['ig-nails-b-dalkom', 'korea-nail-salon-saves', 'Korea nail salon saves', 'B Dalkom / 비달콤', 'Seoul / branch TBD', 'nail salon', 'Listed as a foreigner-friendly honorable mention in Nancy’s Korea nail reel.', 'Instagram reel DFT8V6JAsGB / caption', 'verify exact location, English support, deposit', batchThumbs.nails, 'https://www.instagram.com/reel/DFT8V6JAsGB/?igsh=NTc4MTIwNjQ2YQ==', '비달콤 네일 서울'],
  ['ig-nails-thenewall', 'korea-nail-salon-saves', 'Korea nail salon saves', 'The Newall / 더뉴얼', 'Seoul / branch TBD', 'nail salon', 'Honorable mention; caption says limited English but works with foreigners.', 'Instagram reel DFT8V6JAsGB / caption', 'limited English · verify booking method/deposit', batchThumbs.nails, 'https://www.instagram.com/reel/DFT8V6JAsGB/?igsh=NTc4MTIwNjQ2YQ==', '더뉴얼 네일 서울'],
  ['ig-nails-ounailshop', 'korea-nail-salon-saves', 'Korea nail salon saves', 'Ounailshop / 오유네일샵', 'Seoul / branch TBD', 'nail salon', 'Foreigner-friendly honorable mention from the reel; keep as backup to compare with existing nail plan.', 'Instagram reel DFT8V6JAsGB / caption', 'verify exact branch, menu, reservation', batchThumbs.nails, 'https://www.instagram.com/reel/DFT8V6JAsGB/?igsh=NTc4MTIwNjQ2YQ==', '오유네일샵 서울'],
  ['ig-namdaemun-maknae', 'seoul-food-market-saves', 'Seoul food market saves', 'Maknae Hoejip / 막내회집', 'Namdaemun Market', 'sashimi / market restaurant', 'Korean food reel points to 막내회집 in Namdaemun Market for sashimi. Good traditional-market food candidate.', 'Instagram reel DWG4IbfDk_W / caption', 'verify exact stall/branch and hours', batchThumbs.seafood, 'https://www.instagram.com/reel/DWG4IbfDk_W/?igsh=NTc4MTIwNjQ2YQ==', '막내회집 남대문시장'],
  ['ig-seocho-rafre-fruit', 'seoul-dessert-cafes', 'Seoul dessert cafe saves', 'Rafre Fruit / 라프레플루트', 'Seocho', 'fruit cake / dessert cafe', 'Catherine dessert ranking frame identified Rafre Fruit, Seocho; cake was highlighted as genuinely strong.', 'Instagram reel DUKCSvmkgrV / frame sampling', 'branch/details to verify', batchThumbs.dessert, 'https://www.instagram.com/reel/DUKCSvmkgrV/?igsh=NTc4MTIwNjQ2YQ==', '라프레플루트 서초'],
  ['ig-gangnam-baskin-workshop', 'seoul-dessert-cafes', 'Seoul dessert cafe saves', 'Baskin Robbins Workshop / 배스킨라빈스 워크샵', 'Gangnam', 'ice cream / dessert workshop', 'Catherine dessert ranking final frame identified Baskin Robbins Workshop, Gangnam; visually unusual dessert/ice cream stop.', 'Instagram reel DUKCSvmkgrV / frame sampling', 'check if it is worth prioritizing vs indie cafes', batchThumbs.dessert, 'https://www.instagram.com/reel/DUKCSvmkgrV/?igsh=NTc4MTIwNjQ2YQ==', '배스킨라빈스 워크샵 강남'],
  ['ig-seongsu-teathology', 'seongsu-tea-design', 'Seongsu tea design saves', 'TEA•THOLOGY', 'Seongsu', 'tea tasting / design experience', 'Curated tea experience blending tea, storytelling, design, and small bites; quiet ritual rather than a normal drink stop.', 'Instagram reel DWPfECwjtU- / caption', 'verify reservation/course format and exact spelling/listing', batchThumbs.tea, 'https://www.instagram.com/reel/DWPfECwjtU-/?igsh=NTc4MTIwNjQ2YQ==', 'TEA THOLOGY 성수'],
  ['ig-samduk-potato-chicken', 'limited-food-popups', 'Limited food promos / re-check', 'Samduk Chicken potato chicken / 삼덕통닭 쫀감치', 'Sinchon or Bangi', 'limited fried chicken promo', 'Potato-coated chicken reel. Caption says 1,000 KRW event was only Mar 23-29, 5-6pm at Samduk Chicken Sinchon/Bangi, so save only as a trend/availability re-check.', 'Instagram reel DWLpTO-E2-F / caption', 'event date passed · verify if menu still exists in May', batchThumbs.food, 'https://www.instagram.com/reel/DWLpTO-E2-F/?igsh=NTc4MTIwNjQ2YQ==', '삼덕통닭 쫀감치'],
  ['ig-yeonnam-chwihyang', 'yeonnam-food-saves', 'Yeonnam food saves', 'Yeonnam Chwihyang / 연남취향', 'Yeonnam / Hongdae', 'Korean fusion / pasta', 'Hidden-gem Yeonnam restaurant; reel specifically recommends steak truffle cream pasta. Address shown: Mapo-gu Yeonhui-ro 1-gil 36.', 'Instagram reel DXg7dR7ic-z / caption', 'verify reservation and exact Naver listing', batchThumbs.food, 'https://www.instagram.com/reel/DXg7dR7ic-z/?igsh=NTc4MTIwNjQ2YQ==', '연남취향 연희로1길 36'],
  ['ig-seochon-geumsang-goroke', 'seoul-dessert-cafes', 'Seoul dessert cafe saves', 'Seochon Geumsang Goroke / 서촌 금상고로케', 'Seochon / Gyeongbokgung', 'potato croquette / bakery snack', 'Viral flaky potato croquette stop from hereis_jess. Naver local shows 서촌 금상고로케 at 서울 종로구 자하문로9길 24, strong review volume, and popular menu signals for meat-vegetable, potato, and mozzarella croquettes.', 'Instagram reel DXO4pYzk71U / caption + Naver local', 'creator notes big flaky bread crumbs · Naver shows last order around 19:30 and average spend under 10,000 KRW · verify line/order timing', batchThumbs.bakery, 'https://www.instagram.com/reel/DXO4pYzk71U/?igsh=NTc4MTIwNjQ2YQ==', '서촌 금상고로케 자하문로9길 24'],
  ['ig-ikseon-chwihyang-rose-pasta', 'yongsan-food-saves', 'Yongsan food saves', 'Ikseon Chwihyang / 익선취향', 'Ikseon-dong / Jongno', 'Korean-western pasta / steak', 'Viral pork-belly rose pasta stop from eatswithclaire’s Seoul restaurant rating reel. Caption tags @favorite_ikseon; Naver local identifies 익선취향 with high review volume and menu anchors including 통삼겹 로제파스타, 취향 스테이크, 회오리 오므라이스, and 항정 매콤크림 파스타.', 'Instagram reel DQymX5JEURP / caption + Naver local', 'Instagram profile says walk-in only, no reservation, 12:00–21:00; Naver shows 서울 종로구 수표로28길 17-32 1층, last order around 20:05, and phone 0507-1365-2866 · expect wait risk in Ikseon-dong', batchThumbs.food, 'https://www.instagram.com/reel/DQymX5JEURP/?igsh=NTc4MTIwNjQ2YQ==', '익선취향 수표로28길 17-32'],
  ['ig-gangnam-sinsajeon-honeycomb-makgeolli', 'gangnam-bbq-saves', 'Gangnam BBQ saves', 'Sinsajeon / 신사전', 'Sinsa / Gangnam', 'jeon / honeycomb makgeolli', 'Viral honeycomb makgeolli stop from eatswithclaire. Naver local identifies 신사전 as a Gangnam jeon / bindaetteok restaurant with strong review volume, honeycomb listed as 벌집꿀, and menu anchors including 모듬전, 치즈감자전, 수육과 갓김치, and 신사동막걸리.', 'Instagram reel DS19yCsEQun / caption + Naver local', 'Naver shows 서울 강남구 도산대로11길 18 신사전, phone 0507-1337-9993, open until around 01:00, reservation support, valet/parking, and popular rainy-night makgeolli energy · wax-in-honeycomb caveat from comments', batchThumbs.food, 'https://www.instagram.com/reel/DS19yCsEQun/?igsh=NTc4MTIwNjQ2YQ==', '신사전 도산대로11길 18'],
]

stepOnePlaceThemes.push(...aprilInstagramBatchThemes.map(([key, title, status, lead]) => ({ key, title, status, lead })))
placeGroups.push(...aprilInstagramBatchPlaces.map(([key, themeKey, themeTitle, title, area, vibe, note, source, importNote, thumbnail, instagramUrl, query]) => ({
  key,
  themeKey,
  themeTitle,
  title,
  area,
  status: 'Instagram save',
  lead: 'Imported from Dr. Cho’s April Instagram reel batch.',
  source,
  importNote,
  thumbnail,
  logistics: { start: 'Step 1 saved place', end: 'Assign after Yes / No and area clustering', note: 'Batch Instagram intake; confirm current hours, booking, and route fit before Step 2.' },
  entries: [
    { place: title, area, vibe, note, thumbnail, instagramUrl, naverUrl: `https://map.naver.com/p/search/${encodeURIComponent(query)}`, kakaoUrl: `https://map.kakao.com/?q=${encodeURIComponent(query)}` },
  ],
  mapTargets: [mapTarget(title, `${vibe} from Instagram reel batch`, { query })],
})))


const spend = [
  { item: 'Flights', detail: 'China Airlines long-haul roundtrip for both', amount: '$960' },
  { item: 'Jeju flight', detail: 'Jeju Air 7C115 / 7C114 for both', amount: '$200' },
  { item: 'Rental car', detail: 'Kona 2nd gen EV · 5/19 13:00 → 5/21 10:00', amount: '$35' },
  { item: 'Activity', detail: 'Imported activity / beach cost', amount: '$160' },
]

const todoRules = {
  'headspa': { label: 'Book arrival-day headspa', dueDate: '2026-05-10', priority: 1 },
  'nail-brow': { label: 'Finish nail / eyebrow shortlist', dueDate: '2026-05-11', priority: 2 },
  'hair-perm': { label: 'Chahong Myeongdong perm booked — keep 3–4 hr pickup/dinner buffer', dueDate: '2026-05-18', priority: 3 },
  'derm': { label: 'ReOne consult booked — decide on follow-up treatment clinic', dueDate: '2026-05-22', priority: 4 },
}

const dayPlannerTemplates = {
  'may-17': [
    { id: 'nail', time: '11:00', title: 'Nail appointment', note: 'Fixed anchor', type: 'confirmed', targetNames: [] },
    { id: 'haus', time: '12:30', title: 'Haus Nowhere', note: 'Candidate → confirm', type: 'candidate', targetNames: ['Haus Nowhere Seongsu'] },
    { id: 'olive-musinsa', time: '14:00', title: 'Olive Young + Musinsa', note: 'Confirmed cluster', type: 'confirmed', targetNames: ['Tamburins Seongsu', 'Olive Young N Seongsu', 'Musinsa Standard Seongsu'] },
    { id: 'blue', time: '16:00', title: 'Blue Elephant', note: 'Maybe / flex', type: 'candidate', targetNames: ['Blue Elephant Seongsu'] },
    { id: 'move-jamsil', time: '17:15–18:00', title: 'Move toward Jamsil / Lotte World Mall', note: 'Confirmed transfer buffer', type: 'confirmed', targetNames: ['동화고옥 롯데월드몰점'] },
    { id: 'donghwa-dinner', time: '18:30', title: 'Donghwa Gook parent dinner target', note: 'Likely reservation target', type: 'confirmed', targetNames: ['동화고옥 롯데월드몰점'] },
  ],
  'may-18': [
    { id: 'embassy-buffer', time: '08:15–08:25', title: 'Arrive for embassy buffer', note: 'Fixed anchor', type: 'confirmed', targetNames: ['US Embassy Seoul'] },
    { id: 'embassy-interview', time: '08:45', title: 'Embassy interview (you)', note: 'Fixed anchor', type: 'confirmed', targetNames: ['US Embassy Seoul'] },
    { id: 'girlfriend-wait', time: 'During interview', title: 'Girlfriend waits nearby', note: 'Flexible wait point', type: 'candidate', targetNames: ['Starbucks Ima Building'] },
    { id: 'lunch-regroup', time: 'After interview', title: 'Lunch regroup', note: 'Confirmed meal block', type: 'confirmed', targetNames: [] },
    { id: 'move-chahong', time: '13:15–13:45', title: 'Move to Chahong Room Myeongdong', note: 'Confirmed transfer', type: 'confirmed', targetNames: ['Chahong Room Myeongdong'] },
    { id: 'chahong-perm', time: '14:00–17:30/18:00', title: 'Chahong Room Myeongdong perm (girlfriend)', note: 'Booked 2:00 PM appointment', type: 'confirmed', targetNames: ['Chahong Room Myeongdong'] },
    { id: 'friend-meetup', time: '14:15–17:30', title: 'Meet your friend while she is at Chahong', note: 'Confirmed parallel block', type: 'confirmed', targetNames: ['Euljiro 1-ga'] },
    { id: 'pickup', time: '17:30–18:00', title: 'Pick up girlfriend at Chahong', note: 'Confirmed pickup buffer', type: 'confirmed', targetNames: ['Chahong Room Myeongdong'] },
    { id: 'dinner-three', time: '18:30', title: 'Dinner for three', note: 'Confirmed dinner plan', type: 'confirmed', targetNames: ['Myeongdong', 'Euljiro 1-ga'] },
  ],
}

function normalizeToken(value) {
  return value.toLowerCase().replace(/[^a-z0-9가-힣]+/g, ' ').trim()
}

function mapTargetMatchesStop(target, stop) {
  const haystack = [stop.title, stop.detail, stop.neighborhood].map(normalizeToken).join(' ')
  const targetTokens = [target.name, target.query, ...(mapTargetAliases[target.name] || [])]
    .map((value) => normalizeToken(value || ''))
    .filter(Boolean)

  return targetTokens.some((token) => {
    const firstToken = token.split(' ')[0]
    return haystack.includes(token) || (firstToken && haystack.includes(firstToken))
  })
}

function buildPlannerItems(day) {
  const template = dayPlannerTemplates[day.key]

  if (template) return template

  return day.stops.map((stop, index) => ({
    id: `${day.key}-${index}`,
    time: stop.time,
    title: stop.title,
    note: stop.type === 'anchor' || stop.type === 'hotel' ? 'Fixed anchor' : stop.type === 'transit' ? 'Transit / keep flexible' : 'Candidate → confirm',
    status: stop.status || day.status || (stop.type === 'anchor' || stop.type === 'hotel' ? 'confirmed anchor' : 'TBD'),
    type: stop.type === 'anchor' || stop.type === 'hotel' || stop.type === 'meal' || stop.type === 'beauty' ? 'confirmed' : 'candidate',
    targetNames: day.mapTargets
      .filter((target) => mapTargetMatchesStop(target, stop))
      .map((target) => target.name),
  }))
}

function buildAssignedPlaceItems(dayKey, assignments, groups = placeGroups) {
  return groups
    .filter((group) => assignments[group.key] === dayKey)
    .map((group) => ({
      id: `assigned-${group.key}`,
      time: 'Flex',
      title: group.title,
      note: `Assigned from Schedule · ${group.area}`,
      status: group.status || 'TBD',
      type: 'candidate',
      targetNames: group.mapTargets.map((target) => target.name),
    }))
}

function scheduleKeyForResearchOption(boardKey, place) {
  return `research-${boardKey}-${normalizeToken(place).replace(/[^a-z0-9]+/g, '-')}`
}

function itemTitleKeyForPlaceGroup(groupKey) {
  return `place::${groupKey}`
}

function itemTitleKeyForResearchOption(boardKey, place) {
  return `research::${boardKey}::${place}`
}

function itemTitleKeyForStepOneOption(option) {
  if (option.sourceType === 'places') return itemTitleKeyForPlaceGroup(option.groupKey)
  return itemTitleKeyForResearchOption(option.sourceThemeKey, option.place)
}

function displayTitleForItem(customItemTitles, itemKey, fallback) {
  const customTitle = customItemTitles[itemKey]
  return customTitle && customTitle.trim() ? customTitle.trim() : fallback
}

function buildSelectedResearchScheduleGroups(votes, customItemTitles = {}) {
  return researchBoards.flatMap((board) => (
    board.comparison
      .filter((option) => votes[`${board.key}::${option.place}`] === 'yes')
      .map((option) => {
        const matchingTarget = board.mapTargets?.find((target) => target.name === option.place)
        const itemTitleKey = itemTitleKeyForResearchOption(board.key, option.place)
        return {
          key: scheduleKeyForResearchOption(board.key, option.place),
          title: displayTitleForItem(customItemTitles, itemTitleKey, option.place),
          originalTitle: option.place,
          area: option.area,
          status: board.status,
          themeKey: board.key,
          themeTitle: board.title,
          thumbnail: option.thumbnail,
          entries: [{ ...option, vibe: option.pricing || board.status }],
          mapTargets: matchingTarget ? [matchingTarget] : [mapTarget(option.place, board.title, { query: option.place })],
        }
      })
  ))
}

const stepOneThemeCategories = [
  {
    key: 'beauty',
    label: 'Beauty',
    title: 'Beauty',
    status: 'Hair · nails · skin · spa',
    lead: 'All beauty, glow-up, clinic, nail, hair, and recovery options in one place.',
  },
  {
    key: 'food-cafe',
    label: 'Food & cafe',
    title: 'Food & cafe',
    status: 'Restaurants · cafes · dessert',
    lead: 'Restaurants, cafes, bakeries, desserts, markets, BBQ, izakaya, and tea stops together.',
  },
  {
    key: 'others',
    label: 'Others',
    title: 'Others',
    status: 'Shopping · places · flex',
    lead: 'Shopping, popups, mood spaces, viral saves, and anything not mainly beauty or food.',
  },
]

function categorizeStepOneItem(item) {
  const text = [
    item.key,
    item.themeKey,
    item.themeTitle,
    item.sourceThemeKey,
    item.sourceThemeTitle,
    item.originalTitle,
    item.title,
    item.place,
    item.area,
    item.vibe,
    item.pricing,
    item.status,
    item.lead,
    item.note,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (/(seongsu-viral-loop|seongsu-mood-spaces|seongsu-bag-shopping)/.test(text)) return 'others'
  if (/(nail|네일|hair|헤어|derm|피부|clinic|의원|beauty|뷰티|brow|foundation|follow-up|reone|wellness|spa|스파|headspa|cimer|recovery)/.test(text)) return 'beauty'
  if (/(food|restaurant|cafe|café|dessert|bbq|izakaya|culinary|seafood|market|yeonnam|yongsan|gangnam bbq|popups?|tea|brunch|bakery|toast|matcha|parfait|chicken|kaisendon|unagi|pasta|sashimi|cake|ice cream)/.test(text)) return 'food-cafe'
  return 'others'
}

function dedupeTargets(targets) {
  const seen = new Set()
  return targets.filter((target) => {
    if (!target || seen.has(target.name)) return false
    seen.add(target.name)
    return true
  })
}

function reorderPlannerItems(items, draggedId, targetId) {
  const currentIndex = items.findIndex((item) => item.id === draggedId)
  const targetIndex = items.findIndex((item) => item.id === targetId)

  if (currentIndex === -1 || targetIndex === -1 || currentIndex === targetIndex) return items

  const nextItems = [...items]
  const [draggedItem] = nextItems.splice(currentIndex, 1)
  nextItems.splice(targetIndex, 0, draggedItem)
  return nextItems
}

function extractDraggedPlaceGroupKey(event) {
  return event.dataTransfer.getData('text/place-group') || event.dataTransfer.getData('text/plain')
}

function statusClass(value) {
  const lower = value.toLowerCase()
  if (lower.includes('booked') || lower.includes('confirmed')) return 'chip chip-dark'
  if (lower.includes('important')) return 'chip chip-rose'
  if (lower.includes('decision')) return 'chip chip-rose'
  if (lower.includes('research') || lower.includes('pending') || lower.includes('confirm')) return 'chip chip-gold'
  if (lower.includes('travel') || lower.includes('set') || lower.includes('anchor')) return 'chip chip-sage'
  return 'chip chip-mist'
}

function statusChipLabel(value = '') {
  const lower = value.toLowerCase()
  if (lower.includes('booked') || lower.includes('confirmed') || lower.includes('set') || lower.includes('anchor')) return 'Confirmed ✅'
  if (lower.includes('pending') || lower.includes('research') || lower.includes('confirm') || lower.includes('shortlist')) return 'Pending ⏳'
  return 'TBD 🔲'
}

function dateKeyForToday(today = new Date()) {
  const month = today.toLocaleString('en-US', { month: 'short' }).toLowerCase()
  return `${month}-${today.getDate()}`
}

function itineraryDayRelation(day, today = new Date()) {
  const dayNumber = Number(day.key.split('-')[1])
  const dayDate = new Date(2026, 4, dayNumber)
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (dayDate.toDateString() === current.toDateString()) return 'today'
  if (dayDate < current) return 'past'
  return 'future'
}

function optionSourceUrl(option) {
  return option.instagramUrl || option.instagram || option.youtube || option.naverUrl || option.kakaoUrl || ''
}

function optionSourceLabel(option) {
  if (option.instagramUrl || option.instagram) return 'IG source ↗'
  if (option.youtube) return 'YouTube ↗'
  if (option.naverUrl) return 'Naver ↗'
  if (option.kakaoUrl) return 'Kakao ↗'
  return 'Source ↗'
}

function slotForStop(stop) {
  const time = stop.time.toLowerCase()
  if (time.includes('morning') || time.includes('before') || /\b0?[6-9]:|\b10:|\b11:/.test(time)) return 'morning'
  if (time.includes('afternoon') || /\b12:|\b13:|\b14:|\b15:|\b16:/.test(time)) return 'afternoon'
  if (time.includes('evening') || time.includes('late') || /\b17:|\b18:|\b19:|\b20:|\b21:/.test(time)) return 'evening'
  return 'afternoon'
}

function daySlotSummary(day) {
  const slots = [
    { key: 'morning', label: 'Morning' },
    { key: 'afternoon', label: 'Afternoon' },
    { key: 'evening', label: 'Evening' },
  ]

  return slots.map((slot) => {
    const stops = day.stops.filter((stop) => slotForStop(stop) === slot.key)
    if (!stops.length) return { ...slot, state: 'Open', title: 'empty' }
    const fixed = stops.find((stop) => ['anchor', 'hotel', 'beauty', 'meal'].includes(stop.type))
    return {
      ...slot,
      state: fixed ? 'Set' : 'Flex',
      title: '',
    }
  })
}

function stopTypeLabel(type) {
  if (type === 'anchor') return 'hard anchor'
  if (type === 'beauty') return 'beauty'
  if (type === 'meal') return 'meal'
  if (type === 'transit') return 'transit'
  if (type === 'hotel') return 'hotel'
  if (type === 'shopping') return 'shopping'
  return type
}

function parseTripDate(value) {
  return new Date(`${value}T00:00:00-07:00`)
}

function asDayStart(date) {
  const clone = new Date(date)
  clone.setHours(0, 0, 0, 0)
  return clone
}

function diffDaysFromToday(targetDate, today) {
  return Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

let kakaoMapsPromise

function loadKakaoMapsSdk() {
  if (!KAKAO_JS_KEY) return Promise.reject(new Error('Missing Kakao JavaScript key'))
  if (window.kakao?.maps) return Promise.resolve(window.kakao)
  if (kakaoMapsPromise) return kakaoMapsPromise

  kakaoMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-kakao-maps="true"]')

    if (existingScript) {
      existingScript.addEventListener('load', () => window.kakao.maps.load(() => resolve(window.kakao)))
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Kakao Maps SDK')))
      return
    }

    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false&libraries=services`
    script.async = true
    script.dataset.kakaoMaps = 'true'
    script.onload = () => window.kakao.maps.load(() => resolve(window.kakao))
    script.onerror = () => reject(new Error('Failed to load Kakao Maps SDK'))
    document.head.appendChild(script)
  })

  return kakaoMapsPromise
}

function App() {
  const [activeTab, setActiveTab] = useState('map')
  const [selectedDayKey, setSelectedDayKey] = useState('may-17')
  const [selectedHomeMapTargetName, setSelectedHomeMapTargetName] = useState('Haus Nowhere Seongsu')
  const [selectedPlaceKey, setSelectedPlaceKey] = useState('viral-saves-inbox')
  const [selectedBookingKey, setSelectedBookingKey] = useState('beauty')
  const [editingThemeKey, setEditingThemeKey] = useState('')
  const [editingItemKey, setEditingItemKey] = useState('')
  const [assignedPlaceDays, setAssignedPlaceDays] = useState(() => {
    const stored = window.localStorage.getItem('korea-trip-place-days')

    if (!stored) return {}

    try {
      return JSON.parse(stored)
    } catch {
      return {}
    }
  })
  const [selectedPlaceGroups, setSelectedPlaceGroups] = useState(() => {
    const stored = window.localStorage.getItem('korea-trip-selected-place-groups')

    if (!stored) return {}

    try {
      return JSON.parse(stored)
    } catch {
      return {}
    }
  })
  const [customThemeTitles, setCustomThemeTitles] = useState(() => {
    const stored = window.localStorage.getItem('korea-trip-theme-titles')

    if (!stored) return {}

    try {
      return JSON.parse(stored)
    } catch {
      return {}
    }
  })
  const [customItemTitles, setCustomItemTitles] = useState(() => {
    const stored = window.localStorage.getItem('korea-trip-item-titles')

    if (!stored) return {}

    try {
      return JSON.parse(stored)
    } catch {
      return {}
    }
  })
  const [theme, setTheme] = useState(() => {
    const stored = window.localStorage.getItem('korea-trip-theme')
    return stored === 'dark' ? 'dark' : 'light'
  })
  const [bookingVotes, setBookingVotes] = useState(() => {
    const stored = window.localStorage.getItem('korea-trip-booking-votes')

    if (!stored) return {}

    try {
      return JSON.parse(stored)
    } catch {
      return {}
    }
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [plannerFilter, setPlannerFilter] = useState('all')
  const [plannerOverrides, setPlannerOverrides] = useState(() => {
    const stored = window.localStorage.getItem('korea-trip-planner-overrides')

    if (!stored) return {}

    try {
      return JSON.parse(stored)
    } catch {
      return {}
    }
  })
  const [plannerOrder, setPlannerOrder] = useState(() => {
    const stored = window.localStorage.getItem('korea-trip-planner-order')

    if (!stored) return {}

    try {
      return JSON.parse(stored)
    } catch {
      return {}
    }
  })
  const [mapStatus, setMapStatus] = useState(KAKAO_JS_KEY ? 'idle' : 'missing-key')
  const [resolvedMapTargets, setResolvedMapTargets] = useState([])
  const [mapNotice, setMapNotice] = useState('')
  const [sharedStoreReady, setSharedStoreReady] = useState(false)
  const [tripStateStore] = useState(() => createTripStateStore({
    env: import.meta.env,
    storage: window.localStorage,
    createClient: createSupabaseClient,
  }))
  const mapCanvasRef = useRef(null)
  const swipeStartRef = useRef({})
  const bookingSwipeRef = useRef({})
  const [bookingSwipeDrag, setBookingSwipeDrag] = useState({ key: '', deltaX: 0 })
  const applyingSharedStateRef = useRef(false)

  function toggleBookingVote(boardKey, place, vote) {
    const optionKey = `${boardKey}::${place}`

    setBookingVotes((current) => {
      if (current[optionKey] === vote) {
        const next = { ...current }
        delete next[optionKey]
        return next
      }

      return {
        ...current,
        [optionKey]: vote,
      }
    })
  }

  function setPlaceGroupSelected(groupKey, isSelected) {
    setSelectedPlaceGroups((current) => ({
      ...current,
      [groupKey]: isSelected,
    }))

    if (!isSelected) {
      assignPlaceGroupToDay(groupKey, '')
    }
  }

  function updateThemeTitle(themeKey, title) {
    setCustomThemeTitles((current) => ({
      ...current,
      [themeKey]: title,
    }))
  }

  function updateItemTitle(itemKey, title) {
    setCustomItemTitles((current) => {
      const next = { ...current }
      if (!title.trim()) {
        delete next[itemKey]
        return next
      }
      next[itemKey] = title
      return next
    })
  }

  function placeGroupWithCustomTitle(group) {
    const itemTitleKey = itemTitleKeyForPlaceGroup(group.key)
    return {
      ...group,
      originalTitle: group.originalTitle || group.title,
      title: displayTitleForItem(customItemTitles, itemTitleKey, group.title),
    }
  }

  function updatePlannerItem(dayKey, itemId, nextType) {
    setPlannerOverrides((current) => ({
      ...current,
      [dayKey]: {
        ...(current[dayKey] ?? {}),
        [itemId]: nextType,
      },
    }))
  }

  function assignPlaceGroupToDay(groupKey, dayKey) {
    setAssignedPlaceDays((current) => {
      if (!dayKey) {
        const next = { ...current }
        delete next[groupKey]
        return next
      }

      return {
        ...current,
        [groupKey]: dayKey,
      }
    })
  }

  function handleScheduleDragStart(groupKey, event) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/place-group', groupKey)
    event.dataTransfer.setData('text/plain', groupKey)
  }

  function handleScheduleDrop(dayKey, event) {
    event.preventDefault()
    const groupKey = extractDraggedPlaceGroupKey(event)
    if (!groupKey) return
    assignPlaceGroupToDay(groupKey, dayKey)
  }

  function reorderPlannerDay(dayKey, draggedId, targetId) {
    const baseItems = buildPlannerItems(itineraryDays.find((day) => day.key === dayKey) ?? itineraryDays[0])
    const orderedIds = plannerOrder[dayKey] ?? baseItems.map((item) => item.id)
    const orderedItems = orderedIds
      .map((id) => baseItems.find((item) => item.id === id))
      .filter(Boolean)

    const nextItems = reorderPlannerItems(orderedItems, draggedId, targetId)

    setPlannerOrder((current) => ({
      ...current,
      [dayKey]: nextItems.map((item) => item.id),
    }))
  }

  function handlePlannerSwipeStart(itemId, clientX) {
    swipeStartRef.current[itemId] = clientX
  }

  function handlePlannerSwipeEnd(dayKey, item, clientX) {
    const startX = swipeStartRef.current[item.id]
    delete swipeStartRef.current[item.id]

    if (typeof startX !== 'number') return

    const deltaX = clientX - startX
    if (deltaX > 70) {
      updatePlannerItem(dayKey, item.id, 'confirmed')
      return
    }

    if (deltaX < -70) {
      updatePlannerItem(dayKey, item.id, 'candidate')
    }
  }

  const selectedDay = useMemo(
    () => itineraryDays.find((day) => day.key === selectedDayKey) ?? itineraryDays[0],
    [selectedDayKey],
  )
  const todayDayKey = useMemo(() => dateKeyForToday(new Date()), [])
  const todayItineraryDay = useMemo(
    () => itineraryDays.find((day) => day.key === todayDayKey),
    [todayDayKey],
  )

  useEffect(() => {
    if (activeTab !== 'itinerary' || !todayItineraryDay) return
    setSelectedDayKey(todayItineraryDay.key)
    window.requestAnimationFrame(() => {
      document.getElementById(`day-${todayItineraryDay.key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [activeTab, todayItineraryDay])

  const selectedDayPlanner = useMemo(() => {
    const selectedResearchScheduleGroups = buildSelectedResearchScheduleGroups(bookingVotes, customItemTitles)
    const scheduleGroups = [
      ...placeGroups.filter((group) => selectedPlaceGroups[group.key]).map(placeGroupWithCustomTitle),
      ...selectedResearchScheduleGroups,
    ]
    const selectedAssignedPlaceDays = Object.fromEntries(
      Object.entries(assignedPlaceDays).filter(([groupKey]) => scheduleGroups.some((group) => group.key === groupKey)),
    )
    const baseItems = [
      ...buildPlannerItems(selectedDay),
      ...buildAssignedPlaceItems(selectedDay.key, selectedAssignedPlaceDays, scheduleGroups),
    ]
    const orderIds = plannerOrder[selectedDay.key] ?? baseItems.map((item) => item.id)
    const orderedBaseItems = orderIds
      .map((id) => baseItems.find((item) => item.id === id))
      .filter(Boolean)
    const remainingItems = baseItems.filter((item) => !orderIds.includes(item.id))
    const overrideMap = plannerOverrides[selectedDay.key] ?? {}

    return [...orderedBaseItems, ...remainingItems].map((item) => ({
      ...item,
      type: overrideMap[item.id] ?? item.type,
    }))
  }, [assignedPlaceDays, bookingVotes, customItemTitles, plannerOrder, plannerOverrides, selectedDay, selectedPlaceGroups])

  const confirmedRouteTargets = useMemo(() => {
    return dedupeTargets(
      selectedDayPlanner.flatMap((item) => {
        if (item.type !== 'confirmed') return []
        return item.targetNames.map((targetName) => selectedDay.mapTargets.find((target) => target.name === targetName))
      }),
    )
  }, [selectedDay, selectedDayPlanner])

  const candidateTargets = useMemo(() => {
    const confirmedNames = new Set(confirmedRouteTargets.map((target) => target.name))
    return selectedDay.mapTargets.filter((target) => !confirmedNames.has(target.name))
  }, [confirmedRouteTargets, selectedDay])

  const visiblePlannerItems = useMemo(() => {
    if (plannerFilter === 'all') return selectedDayPlanner
    return selectedDayPlanner.filter((item) => plannerFilter === 'confirmed' ? item.type === 'confirmed' : item.type === 'candidate')
  }, [plannerFilter, selectedDayPlanner])

  const nextDecisionDay = useMemo(() => itineraryDays.find((day) => day.key === 'may-17') ?? itineraryDays[0], [])

  const selectedPlaceGroup = useMemo(
    () => placeGroups.find((group) => group.key === selectedPlaceKey) ?? placeGroups[0],
    [selectedPlaceKey],
  )

  const selectedPlaceAssignedDayKey = assignedPlaceDays[selectedPlaceGroup.key] ?? ''

  const selectedBookingBoard = useMemo(
    () => researchBoards.find((board) => board.key === selectedBookingKey) ?? researchBoards[0],
    [selectedBookingKey],
  )

  const itineraryCalendarDays = useMemo(() => {
    return itineraryDays.map((day) => {
      const dateObj = parseTripDate(`2026-${day.key.replace('may-', '05-')}`)
      return {
        ...day,
        weekday: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
        slots: daySlotSummary(day),
        openSlotCount: daySlotSummary(day).filter((slot) => slot.state === 'Open' || slot.state === 'Flex').length,
      }
    })
  }, [])

  const stepOnePlaceGroups = useMemo(
    () => placeGroups.map((group) => ({
      ...group,
      selectedForSchedule: Boolean(selectedPlaceGroups[group.key]),
    })),
    [selectedPlaceGroups],
  )

  const stepOneThemeBoards = useMemo(() => {
    const categorizedOptions = stepOneThemeCategories.reduce((acc, category) => ({
      ...acc,
      [category.key]: [],
    }), {})

    researchBoards.forEach((board) => {
      board.comparison.forEach((option) => {
        const enrichedOption = {
          ...option,
          sourceType: 'research',
          sourceThemeKey: board.key,
          sourceThemeTitle: board.title,
          sourceStatus: board.status,
          place: option.place,
          pricing: option.pricing || board.status,
          thumbnail: option.thumbnail,
        }
        categorizedOptions[categorizeStepOneItem(enrichedOption)].push(enrichedOption)
      })
    })

    stepOnePlaceThemes.forEach((theme) => {
      const groups = stepOnePlaceGroups.filter((group) => group.themeKey === theme.key)
      groups.forEach((group) => {
        group.entries.forEach((entry) => {
          const enrichedOption = {
            ...entry,
            sourceType: 'places',
            sourceThemeKey: theme.key,
            sourceThemeTitle: theme.title,
            groupKey: group.key,
            place: group.title,
            area: entry.area || group.area,
            pricing: group.status,
            status: group.status,
            note: entry.note || group.lead,
            thumbnail: entry.thumbnail || group.thumbnail,
          }
          categorizedOptions[categorizeStepOneItem(enrichedOption)].push(enrichedOption)
        })
      })
    })

    return stepOneThemeCategories.map((category) => {
      const comparison = categorizedOptions[category.key]
      return {
        ...category,
        originalTitle: category.title,
        title: customThemeTitles[category.key] || category.title,
        type: 'collection',
        comparison,
        groups: [],
        previewImages: comparison.map((option) => option.thumbnail).filter(Boolean),
      }
    })
  }, [customThemeTitles, stepOnePlaceGroups])

  const stepOneGroupedThemeBoards = useMemo(
    () => [{ key: 'simple', label: 'Themes', themes: stepOneThemeBoards.filter((theme) => theme.comparison.length) }],
    [stepOneThemeBoards],
  )

  const selectedSchedulePlaceGroups = useMemo(
    () => [
      ...placeGroups.filter((group) => selectedPlaceGroups[group.key]).map(placeGroupWithCustomTitle),
      ...buildSelectedResearchScheduleGroups(bookingVotes, customItemTitles),
    ],
    [bookingVotes, customItemTitles, selectedPlaceGroups],
  )

  const unscheduledPlaceGroups = useMemo(
    () => selectedSchedulePlaceGroups.filter((group) => !assignedPlaceDays[group.key]),
    [assignedPlaceDays, selectedSchedulePlaceGroups],
  )

  const dayBucketGroups = useMemo(
    () => itineraryCalendarDays.map((day) => ({
      ...day,
      groups: selectedSchedulePlaceGroups.filter((group) => assignedPlaceDays[group.key] === day.key),
    })),
    [assignedPlaceDays, itineraryCalendarDays, selectedSchedulePlaceGroups],
  )

  const loggedSpend = useMemo(
    () => spend.reduce((sum, row) => sum + Number(row.amount.replace(/[$,]/g, '')), 0),
    [],
  )

  const countdownDays = useMemo(() => {
    const today = new Date()
    const tripStart = parseTripDate('2026-05-15')
    return Math.max(0, Math.ceil((tripStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
  }, [])

  const smartTodos = useMemo(() => {
    const today = asDayStart(new Date())

    return researchBoards
      .filter((board) => {
        const lower = board.status.toLowerCase()
        return !(lower.includes('confirmed') || lower.includes('booked') || lower.includes('done'))
      })
      .map((board) => {
        const rule = todoRules[board.key] ?? {
          label: board.title,
          dueDate: '2026-05-14',
          priority: 99,
        }
        const due = parseTripDate(rule.dueDate)
        const diffDays = diffDaysFromToday(due, today)
        const urgency = diffDays < 0 ? 'overdue' : diffDays <= 2 ? 'soon' : 'upcoming'
        const meta = diffDays < 0 ? `${Math.abs(diffDays)}d late` : diffDays === 0 ? 'today' : `due in ${diffDays}d`
        return {
          key: board.key,
          label: rule.label,
          urgency,
          meta,
          diffDays,
          priority: rule.priority,
        }
      })
      .sort((a, b) => a.diffDays - b.diffDays || a.priority - b.priority)
      .slice(0, 4)
  }, [])

  const smartSchedule = useMemo(() => {
    const today = asDayStart(new Date())

    const derived = itineraryDays
      .map((day) => {
        const dateObj = parseTripDate(`2026-${day.key.replace('may-', '05-')}`)
        const diffDays = diffDaysFromToday(dateObj, today)
        const hasHardAnchor = day.stops.some((stop) => ['anchor', 'hotel'].includes(stop.type))
        const highlight = day.stops.find((stop) => ['anchor', 'hotel', 'beauty', 'meal'].includes(stop.type))
        return {
          key: day.key,
          dateObj,
          diffDays,
          shortDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          meta: diffDays === 0 ? 'today' : diffDays === 1 ? 'tomorrow' : diffDays > 1 ? `in ${diffDays}d` : `${Math.abs(diffDays)}d ago`,
          label: highlight ? `${day.label} · ${highlight.title}` : day.label,
          weight: hasHardAnchor ? 0 : day.status.toLowerCase().includes('open') ? 2 : 1,
        }
      })
      .filter((item) => item.diffDays >= 0)
      .sort((a, b) => a.diffDays - b.diffDays || a.weight - b.weight)

    return derived.slice(0, 3)
  }, [])

  const pendingBookings = useMemo(
    () => researchBoards.filter((board) => {
      const lower = board.status.toLowerCase()
      return !(lower.includes('confirmed') || lower.includes('booked') || lower.includes('done'))
    }).length,
    [],
  )

  const homeMapTargets = useMemo(() => {
    const confirmedNames = new Set(confirmedRouteTargets.map((target) => target.name))
    return selectedDay.mapTargets.map((target, index) => ({
      ...target,
      dayKey: selectedDay.key,
      dayDate: selectedDay.date,
      dayLabel: selectedDay.label,
      mapColor: mapDayColors[selectedDay.key] ?? mapDayColors.undecided,
      koreanName: koreanPlaceNames[target.name] || target.query || target.name,
      position: mapMarkerPositions[target.name] || { left: `${28 + (index % 4) * 15}%`, top: `${28 + Math.floor(index / 4) * 18}%` },
      markerType: confirmedNames.has(target.name) ? 'confirmed' : 'candidate',
    }))
  }, [confirmedRouteTargets, selectedDay])

  const selectedHomeMapTarget = useMemo(
    () => homeMapTargets.find((target) => target.name === selectedHomeMapTargetName) ?? homeMapTargets[0],
    [homeMapTargets, selectedHomeMapTargetName],
  )

  useEffect(() => {
    if (!homeMapTargets.length) return
    if (!homeMapTargets.some((target) => target.name === selectedHomeMapTargetName)) {
      setSelectedHomeMapTargetName(homeMapTargets[0].name)
    }
  }, [homeMapTargets, selectedHomeMapTargetName])

  function copyHomeMapKoreanName() {
    if (!selectedHomeMapTarget) return
    window.navigator.clipboard?.writeText(selectedHomeMapTarget.koreanName)
  }

  const mapSource = activeTab === 'map' || activeTab === 'home'
    ? selectedDay
    : activeTab === 'itinerary'
      ? selectedDay
      : activeTab === 'bookings' && selectedBookingBoard?.mapTargets
          ? selectedBookingBoard
          : null

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []

    const dayResults = itineraryDays.flatMap((day) => {
      const inDay = [day.date, day.label, day.area, day.focus, day.quietNote].join(' ').toLowerCase().includes(q)
      const stopMatch = day.stops.find((stop) => [stop.title, stop.detail, stop.neighborhood].join(' ').toLowerCase().includes(q))
      const placeMatch = day.mapTargets.find((target) => [target.name, target.reason].join(' ').toLowerCase().includes(q))

      if (!inDay && !stopMatch && !placeMatch) return []

      return [{
        key: day.key,
        type: 'Itinerary',
        title: `${day.date} · ${day.label}`,
        detail: stopMatch?.title || placeMatch?.name || day.focus,
        action: () => {
          setSelectedDayKey(day.key)
          setActiveTab('itinerary')
        },
      }]
    })

    const bookingResults = researchBoards.flatMap((board) => {
      const matchedOption = board.comparison.find((option) => [option.place, option.area, option.pricing, option.note].join(' ').toLowerCase().includes(q))
      const matchedBoard = [board.title, board.lead, board.recommendation].join(' ').toLowerCase().includes(q)

      if (!matchedBoard && !matchedOption) return []

      const categoryKey = categorizeStepOneItem({
        ...board,
        ...(matchedOption || {}),
        sourceThemeKey: board.key,
        sourceThemeTitle: board.title,
      })

      return [{
        key: board.key,
        type: 'Research',
        title: board.title,
        detail: matchedOption?.place || board.recommendation,
        action: () => {
          setSelectedBookingKey(categoryKey)
          setActiveTab('bookings')
        },
      }]
    })

    const placeResults = placeGroups.flatMap((group) => {
      const matchedEntry = group.entries.find((entry) => [entry.place, entry.area, entry.vibe, entry.note].join(' ').toLowerCase().includes(q))
      const matchedGroup = [group.title, group.lead, group.importNote, group.source].join(' ').toLowerCase().includes(q)

      if (!matchedEntry && !matchedGroup) return []

      return [{
        key: group.key,
        type: 'Places',
        title: group.title,
        detail: matchedEntry?.place || group.importNote,
        action: () => {
          setSelectedPlaceKey(group.key)
          setActiveTab('places')
        },
      }]
    })

    return [...dayResults, ...bookingResults, ...placeResults].slice(0, 8)
  }, [searchQuery])

  useEffect(() => {
    let cancelled = false

    function applySharedState(snapshot) {
      applyingSharedStateRef.current = true
      setAssignedPlaceDays(snapshot.assignedPlaceDays)
      setSelectedPlaceGroups(snapshot.selectedPlaceGroups)
      setCustomThemeTitles(snapshot.customThemeTitles)
      setCustomItemTitles(snapshot.customItemTitles)
      setTheme(snapshot.theme === 'dark' ? 'dark' : 'light')
      setBookingVotes(snapshot.bookingVotes)
      setPlannerOverrides(snapshot.plannerOverrides)
      setPlannerOrder(snapshot.plannerOrder)
      window.setTimeout(() => {
        applyingSharedStateRef.current = false
      }, 0)
    }

    async function hydrateSharedState() {
      const snapshot = await tripStateStore.load()
      if (cancelled) return
      applySharedState(snapshot)
      setSharedStoreReady(true)
    }

    hydrateSharedState()
    const unsubscribe = tripStateStore.subscribe((snapshot) => {
      if (cancelled) return
      applySharedState(snapshot)
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [tripStateStore])

  useEffect(() => {
    if (!sharedStoreReady || !tripStateStore.syncEnabled || applyingSharedStateRef.current) return

    tripStateStore.save({
      assignedPlaceDays,
      selectedPlaceGroups,
      customThemeTitles,
      customItemTitles,
      theme,
      bookingVotes,
      plannerOverrides,
      plannerOrder,
    })
  }, [
    assignedPlaceDays,
    bookingVotes,
    customItemTitles,
    customThemeTitles,
    plannerOrder,
    plannerOverrides,
    selectedPlaceGroups,
    sharedStoreReady,
    theme,
    tripStateStore,
  ])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('korea-trip-theme', theme)
  }, [theme])

  useEffect(() => {
    window.localStorage.setItem('korea-trip-booking-votes', JSON.stringify(bookingVotes))
  }, [bookingVotes])

  useEffect(() => {
    window.localStorage.setItem('korea-trip-place-days', JSON.stringify(assignedPlaceDays))
  }, [assignedPlaceDays])

  useEffect(() => {
    window.localStorage.setItem('korea-trip-selected-place-groups', JSON.stringify(selectedPlaceGroups))
  }, [selectedPlaceGroups])

  useEffect(() => {
    window.localStorage.setItem('korea-trip-theme-titles', JSON.stringify(customThemeTitles))
  }, [customThemeTitles])

  useEffect(() => {
    window.localStorage.setItem('korea-trip-item-titles', JSON.stringify(customItemTitles))
  }, [customItemTitles])

  useEffect(() => {
    window.localStorage.setItem('korea-trip-planner-overrides', JSON.stringify(plannerOverrides))
  }, [plannerOverrides])

  useEffect(() => {
    window.localStorage.setItem('korea-trip-planner-order', JSON.stringify(plannerOrder))
  }, [plannerOrder])

  useEffect(() => {
    if (!mapSource) return

    let cancelled = false
    const overlayItems = []

    async function renderKakaoMap() {
      if (!KAKAO_JS_KEY) {
        setMapStatus('missing-key')
        setMapNotice('Missing Kakao JavaScript key.')
        setResolvedMapTargets([])
        return
      }

      if (!mapCanvasRef.current) return

      setMapStatus('loading')
      setMapNotice('Loading Kakao map…')
      setResolvedMapTargets([])

      try {
        const kakao = await loadKakaoMapsSdk()
        if (cancelled || !mapCanvasRef.current) return

        const center = new kakao.maps.LatLng(mapSource.mapCenter.lat, mapSource.mapCenter.lng)
        const map = new kakao.maps.Map(mapCanvasRef.current, {
          center,
          level: mapSource.mapLevel,
        })

        const placesService = new kakao.maps.services.Places()
        const bounds = new kakao.maps.LatLngBounds()

        const resolved = await Promise.all(
          mapSource.mapTargets.map(
            (target) => new Promise((resolve) => {
              if (target.coords) {
                resolve({ ...target, lat: target.coords.lat, lng: target.coords.lng, displayName: target.name, found: true })
                return
              }

              placesService.keywordSearch(
                target.query,
                (results, status) => {
                  if (status === kakao.maps.services.Status.OK && results[0]) {
                    resolve({
                      ...target,
                      lat: Number(results[0].y),
                      lng: Number(results[0].x),
                      displayName: results[0].place_name,
                      address: results[0].road_address_name || results[0].address_name || '',
                      found: true,
                    })
                    return
                  }

                  resolve({ ...target, found: false })
                },
                { size: 1 },
              )
            }),
          ),
        )

        if (cancelled) return
        setResolvedMapTargets(resolved)

        const foundTargets = resolved.filter((target) => target.found)
        if (!foundTargets.length) {
          map.setCenter(center)
          setMapStatus('no-results')
          setMapNotice('The Kakao map loaded, but none of the places resolved yet for this view.')
          return
        }

        const confirmedNames = new Set(confirmedRouteTargets.map((target) => target.name))
        const routeOrder = confirmedRouteTargets.map((target) => target.name)

        foundTargets.forEach((target) => {
          const position = new kakao.maps.LatLng(target.lat, target.lng)
          bounds.extend(position)

          const marker = new kakao.maps.Marker({ position, map, title: target.displayName, opacity: 0 })
          overlayItems.push({ setMap: marker.setMap.bind(marker) })

          const badge = document.createElement('button')
          const routeIndex = routeOrder.indexOf(target.name)
          const isConfirmed = confirmedNames.has(target.name)
          badge.className = `map-flag-badge ${isConfirmed ? 'is-confirmed' : 'is-candidate'}`
          badge.type = 'button'
          badge.textContent = isConfirmed ? String(routeIndex + 1) : '⚑'
          badge.setAttribute('aria-label', `${isConfirmed ? 'Confirmed' : 'Candidate'} ${target.displayName}`)

          badge.addEventListener('click', () => {
            window.open(target.kakaoUrl, '_blank', 'noopener,noreferrer')
          })

          const overlay = new kakao.maps.CustomOverlay({ position, content: badge, yAnchor: 1.25 })
          overlay.setMap(map)
          overlayItems.push({ setMap: overlay.setMap.bind(overlay) })
        })

        if (activeTab === 'itinerary' && confirmedRouteTargets.length > 1) {
          const pathPoints = confirmedRouteTargets
            .map((target) => foundTargets.find((resolvedTarget) => resolvedTarget.name === target.name))
            .filter(Boolean)
            .map((target) => new kakao.maps.LatLng(target.lat, target.lng))

          if (pathPoints.length > 1) {
            const routeLine = new kakao.maps.Polyline({
              path: pathPoints,
              strokeWeight: 5,
              strokeColor: '#ff7b54',
              strokeOpacity: 0.9,
              strokeStyle: 'solid',
            })
            routeLine.setMap(map)
            overlayItems.push({ setMap: routeLine.setMap.bind(routeLine) })
          }
        }

        if (foundTargets.length === 1) {
          map.setCenter(new kakao.maps.LatLng(foundTargets[0].lat, foundTargets[0].lng))
          map.setLevel(Math.max(4, mapSource.mapLevel - 1))
        } else {
          map.setBounds(bounds, 60, 60, 60, 60)
        }

        setMapStatus('ready')
        const mapContextLabel = activeTab === 'map' || activeTab === 'home' || activeTab === 'itinerary'
          ? mapSource.date
          : activeTab === 'places'
            ? mapSource.title
            : mapSource.title
        setMapNotice(`${foundTargets.length} place${foundTargets.length > 1 ? 's' : ''} mapped for ${mapContextLabel}. Tap a marker to open Kakao Map.`)
      } catch (error) {
        if (cancelled) return
        setMapStatus('error')
        setMapNotice('Kakao map did not load. In Kakao Developers, make sure OPEN_MAP_AND_LOCAL is enabled for this app and add koreatrip.vercel.app to the platform/domain allowlist.')
        setResolvedMapTargets([])
        console.error(error)
      }
    }

    renderKakaoMap()

    return () => {
      cancelled = true
      overlayItems.forEach((item) => item.setMap(null))
    }
  }, [activeTab, confirmedRouteTargets, mapSource, selectedDayPlanner])

  return (
    <div className="app-shell">
      <div className="planner-frame">
        <aside className="sidebar-shell glass-card">
          <div className="sidebar-top-row">
            <div className="sidebar-top">
              <h1>Korea Trip May 15-26</h1>
            </div>
            <button
              className="theme-toggle"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              {theme === 'light' ? '◐' : '☼'}
            </button>
          </div>

          <nav className="sidebar-nav desktop-only">
            {tabs.map((tab) => {
              const tabLabel = tabMeta[tab].label
              return (
              <button key={tab} aria-label={tabLabel} className={activeTab === tab ? 'sidebar-btn active' : 'sidebar-btn'} onClick={() => setActiveTab(tab)}>
                <span>{tabLabel}</span>
                <small>{tabMeta[tab].helper}</small>
              </button>
            )})}
          </nav>

          <nav className="legacy-workspace-shortcuts sr-only" aria-label="Legacy planning shortcuts">
            {Object.entries(legacyTabMeta).map(([tab, meta]) => (
              <button key={tab} type="button" aria-label={meta.label} onClick={() => setActiveTab(tab)}>
                {meta.label}
              </button>
            ))}
          </nav>

          <div className="sidebar-foot desktop-only">
            <div className="metric-pill">
              <span>Trip range</span>
              <strong>May 15–26</strong>
            </div>
            <div className="metric-pill">
              <span>Pending bookings</span>
              <strong>{pendingBookings}</strong>
            </div>
          </div>
        </aside>

        <main className="content-shell">
          {(activeTab === 'map' || activeTab === 'home') && (
            <section className="content-screen map-first-home-screen" style={{ '--active-day-color': mapDayColors[selectedDay.key] ?? mapDayColors.undecided }}>
              <div className="home-map-surface" aria-label="Map-first Korea trip home">
                <div ref={mapCanvasRef} className="map-canvas home-kakao-map-canvas" />
                <div className="home-map-fallback" aria-hidden="true">
                  <div className="home-map-river" />
                  <div className="home-map-road road-a" />
                  <div className="home-map-road road-b" />
                  <div className="home-map-road road-c" />
                </div>
                <header className="home-map-topbar">
                  <div className="home-trip-pill glass-card">
                    <span>{tripCountdownLabel()}</span>
                    <h2>SJ Korea Map</h2>
                    <p>{selectedDay.date} · {selectedDay.label}</p>
                  </div>
                  <div className="home-map-search-pill glass-card">⌕</div>
                </header>

                <div className="home-map-legend glass-card">
                  <span><i style={{ background: mapDayColors[selectedDay.key] }} />{selectedDay.date}</span>
                  <span><i className="legend-confirmed" />confirmed route</span>
                  <span><i className="legend-muted" />candidate pins</span>
                </div>

                <aside className="map-route-summary-card glass-card" aria-label="Selected day route summary">
                  <span className="search-type">Selected day</span>
                  <strong>{selectedDay.date} · {selectedDay.area}</strong>
                  <div className="map-route-stat-row">
                    <span>{confirmedRouteTargets.length} confirmed stops</span>
                    <span>{candidateTargets.length} candidate pins</span>
                  </div>
                  <p>Real Kakao route pending API key / Phase C2. Current pins use confirmed vs candidate semantics only.</p>
                </aside>

                {homeMapTargets.map((target, index) => (
                  <button
                    key={`${selectedDay.key}-${target.name}`}
                    className={`home-map-marker ${target.markerType === 'confirmed' ? 'confirmed' : 'candidate'} ${target.name === selectedHomeMapTarget?.name ? 'selected' : ''}`}
                    style={{ left: target.position.left, top: target.position.top, '--marker-color': target.mapColor }}
                    aria-label={`Map marker ${target.name}`}
                    onClick={() => setSelectedHomeMapTargetName(target.name)}
                  >
                    {target.markerType === 'confirmed' ? index + 1 : '·'}
                  </button>
                ))}
                <button className="home-map-marker confirmed is-faded" style={{ left: '78%', top: '25%', '--marker-color': mapDayColors['may-20'] }} aria-label="Map marker May 20 Gangnam">20</button>
                <button className="home-map-marker candidate is-faded" style={{ left: '22%', top: '63%', '--marker-color': mapDayColors['may-16'] }} aria-label="Map marker May 16 Arrival">16</button>

                {selectedHomeMapTarget ? (
                  <aside className="home-place-drawer glass-card" aria-label="Place detail drawer">
                    <div className="drawer-handle" />
                    <div className="home-place-drawer-main">
                      <div className="home-place-thumb">⌖</div>
                      <div>
                        <span className="search-type">{selectedHomeMapTarget.markerType === 'confirmed' ? 'confirmed stop' : 'candidate stop'}</span>
                        <h3>{selectedHomeMapTarget.name}</h3>
                        <p>{selectedHomeMapTarget.koreanName} · {selectedHomeMapTarget.reason}</p>
                      </div>
                    </div>
                    <div className="home-place-actions">
                      <button aria-label={`Assign ${selectedHomeMapTarget.name} to ${selectedDay.date}`} onClick={() => setActiveTab('places')}>Assign {selectedDay.date}</button>
                      <a href={selectedHomeMapTarget.kakaoUrl} target="_blank" rel="noreferrer" aria-label={`Open ${selectedHomeMapTarget.name} in Kakao Maps`}>Open Kakao</a>
                      <button aria-label={`Copy Korean name for ${selectedHomeMapTarget.name}`} onClick={copyHomeMapKoreanName}>Copy Korean</button>
                    </div>
                  </aside>
                ) : null}
              </div>

              <div className="map-first-date-strip" aria-label="Map date selector">
                {itineraryCalendarDays.map((day) => (
                  <button
                    key={`home-${day.key}`}
                    aria-label={`${day.date} ${day.label}`}
                    className={`${selectedDay.key === day.key ? 'home-date-pill active' : 'home-date-pill'} ${selectedDay.key !== day.key ? 'is-faded' : ''}`}
                    style={{ '--day-color': mapDayColors[day.key] ?? mapDayColors.undecided }}
                    onClick={() => setSelectedDayKey(day.key)}
                  >
                    <strong>{day.date.replace('May ', '')}</strong>
                    <span>{day.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'calendar' && (
            <section className="content-screen v2-placeholder-screen calendar-screen">
              <header className="page-header wide-header stacked-mobile glass-card">
                <div>
                  <span className="search-type">Day view</span>
                  <h2 className="page-title">Calendar</h2>
                  <p>Google-Calendar-style schedule shell for bookings, appointments, meals, and transit.</p>
                </div>
                <span className="chip chip-gold">Phase B shell</span>
              </header>
              <div className="glass-card calendar-shell-card">
                <button className="date-dropdown-pill" type="button">{selectedDay.date} · mini calendar</button>
                <div className="calendar-hour-grid" aria-label="Calendar day timeline">
                  {selectedDayPlanner.slice(0, 5).map((item) => (
                    <article key={`calendar-${item.id}`} className="calendar-event-card">
                      <time>{item.time}</time>
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.note}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'inspiration' && (
            <section className="content-screen v2-placeholder-screen inspiration-screen">
              <header className="page-header wide-header stacked-mobile glass-card">
                <div>
                  <span className="search-type">Pinterest grid</span>
                  <h2 className="page-title">Inspiration</h2>
                  <p>Manual screenshot upload first; cards will link Reels/blog saves back to places.</p>
                </div>
                <span className="chip chip-sage">Phase B shell</span>
              </header>
              <div className="inspiration-masonry-preview">
                {stepOneThemeBoards.slice(0, 6).map((board) => (
                  <article key={`inspo-${board.key}`} className="glass-card inspiration-card-preview">
                    {board.previewImages[0] ? <img src={board.previewImages[0]} alt="" /> : null}
                    <h3>{board.title}</h3>
                    <p>{board.comparison.length} saved ideas</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'receipts' && (
            <section className="content-screen v2-placeholder-screen receipts-screen">
              <header className="page-header wide-header stacked-mobile glass-card">
                <div>
                  <span className="search-type">Upload + extract</span>
                  <h2 className="page-title">Receipts</h2>
                  <p>Booking confirmations and receipts will be grouped, extracted, and linked to events/places.</p>
                </div>
                <span className="chip chip-rose">Phase B shell</span>
              </header>
              <div className="spend-layout">
                <div className="glass-card spend-table">
                  {spend.map((row) => (
                    <article className="spend-row" key={`receipt-${row.item}`}>
                      <div>
                        <h3>{row.item}</h3>
                        <p>{row.detail}</p>
                      </div>
                      <strong className="amount">{row.amount}</strong>
                    </article>
                  ))}
                </div>
                <div className="summary-card glass-card warm-card">
                  <span>Total logged</span>
                  <strong>${loggedSpend.toLocaleString()}</strong>
                  <p>Current hidden spend data promoted into the V2 receipts shell.</p>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'itinerary' && (
            <section
              id={`day-${selectedDay.key}`}
              className={`content-screen map-planner-screen itinerary-day-${itineraryDayRelation(selectedDay)}`}
            >
              <header className="page-header wide-header stacked-mobile itinerary-header-card glass-card">
                <div>
                  <span className="search-type">Final day plan</span>
                  <h2 className="page-title">{selectedDay.date} · {selectedDay.area}</h2>
                </div>
                <span className="chip chip-gold">step 3</span>
              </header>

              <div className="day-picker-row calendar-day-grid compact-calendar-sticky">
                {itineraryCalendarDays.map((day) => (
                  <button
                    key={day.key}
                    aria-label={day.date}
                    className={`${selectedDay.key === day.key ? 'day-chip compact-date-chip active' : 'day-chip compact-date-chip'} ${day.key === todayDayKey ? 'today' : ''} ${itineraryDayRelation(day)}`.trim()}
                    onClick={() => setSelectedDayKey(day.key)}
                  >
                    <span className="day-chip-weekday">{day.weekday}</span>
                    <strong>{day.date.replace('May ', '')}</strong>
                  </button>
                ))}
              </div>

              <div className="planner-overview-strip">
                <div className="summary-mini itinerary-summary-pill">
                  <span>Route check</span>
                  <strong>{confirmedRouteTargets.length} stops</strong>
                </div>
                <div className="summary-mini itinerary-summary-pill">
                  <span>Candidate pool</span>
                  <strong>{candidateTargets.length} left</strong>
                </div>
                <div className="summary-mini itinerary-summary-pill">
                  <span>Day status</span>
                  <strong>{selectedDay.status}</strong>
                </div>
              </div>

              <div className="planner-filter-row">
                {plannerFilters.map((filter) => (
                  <button
                    key={filter}
                    className={plannerFilter === filter ? 'planner-filter-chip active' : 'planner-filter-chip'}
                    onClick={() => setPlannerFilter(filter)}
                  >
                    {filter === 'all' ? 'All' : filter === 'candidates' ? 'Candidates' : 'Confirmed'}
                  </button>
                ))}
              </div>

              <section className="glass-card map-planner-card">
                <div className="map-half-card">
                  <div className="map-planner-meta">
                    <div>
                      <span className="search-type">Route check</span>
                      <h3>{selectedDay.label}</h3>
                    </div>
                    <p>{confirmedRouteTargets.length} confirmed route stops · {candidateTargets.length} candidate pins</p>
                  </div>
                  <div ref={mapCanvasRef} className="map-canvas planner-map-canvas" />
                  <div className="planner-map-legend">
                    <span><i className="legend-flag legend-flag-candidate" />White = candidate</span>
                    <span><i className="legend-flag legend-flag-confirmed" />Color = confirmed route</span>
                  </div>
                  <p className="map-footnote">{mapNotice}</p>
                </div>

                <div className="planner-sheet">
                  <div className="section-header stacked-mobile trimmed-timeline-head">
                    <div>
                      <span className="search-type">Route order</span>
                      <h3>Timeline</h3>
                    </div>
                    <span className={statusClass(selectedDay.status)}>{selectedDay.status}</span>
                  </div>

                  <div className="planner-timeline">
                    {visiblePlannerItems.map((item) => (
                      <article
                        className={`planner-row ${item.type === 'confirmed' ? 'planner-row-confirmed' : 'planner-row-candidate'}`}
                        key={selectedDay.key + item.id}
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = 'move'
                          event.dataTransfer.setData('text/plain', item.id)
                        }}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault()
                          const draggedId = event.dataTransfer.getData('text/plain')
                          reorderPlannerDay(selectedDay.key, draggedId, item.id)
                        }}
                        onTouchStart={(event) => handlePlannerSwipeStart(item.id, event.changedTouches[0].clientX)}
                        onTouchEnd={(event) => handlePlannerSwipeEnd(selectedDay.key, item, event.changedTouches[0].clientX)}
                      >
                        <div className="planner-time">
                          <span>{item.time}</span>
                        </div>
                        <div className="planner-axis" />
                        {item.type === 'candidate' ? (
                          <>
                            <div className="planner-card planner-card-candidate">
                              <span className="planner-state-label">No</span>
                              <span className={statusClass(item.status || 'TBD')}>{statusChipLabel(item.status)}</span>
                              <h4>{item.title}</h4>
                              <p>{item.note}</p>
                            </div>
                            <button
                              className="planner-confirm-btn"
                              aria-label={`Confirm ${item.title}`}
                              onClick={() => updatePlannerItem(selectedDay.key, item.id, 'confirmed')}
                            >
                              Yes
                            </button>
                          </>
                        ) : null}
                        {item.type === 'confirmed' ? (
                          <>
                            <div className="planner-card planner-card-confirmed">
                              <span className="planner-state-label">Yes</span>
                              <span className={statusClass(item.status || 'confirmed')}>{statusChipLabel(item.status || 'confirmed')}</span>
                              <h4>{item.title}</h4>
                              <p>{item.note}</p>
                              {item.targetNames.length ? <small>{item.targetNames.length} mapped stop{item.targetNames.length > 1 ? 's' : ''}</small> : null}
                            </div>
                            <button
                              className="planner-remove-btn"
                              aria-label={`Remove ${item.title} from itinerary`}
                              onClick={() => updatePlannerItem(selectedDay.key, item.id, 'candidate')}
                            >
                              No
                            </button>
                          </>
                        ) : null}
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            </section>
          )}

          {activeTab === 'places' && (
            <section className="content-screen places-screen compact-schedule-screen">
              <h2 className="sr-only">Step 2: Select Date</h2>
              <header className="page-header wide-header stacked-mobile compact-page-header one-sight-date-header">
                <div>
                  <span className="search-type">empty windows</span>
                  <h2 className="page-title">Trip slots at a glance</h2>
                </div>
                <span className="chip chip-gold">drag cards</span>
              </header>

              <div
                className="step-two-sticky-unscheduled"
                aria-label="Sticky unscheduled items"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleScheduleDrop('', event)}
              >
                <div className="sticky-rail-title">
                  <span>Items</span>
                  <strong>{unscheduledPlaceGroups.length}</strong>
                </div>
                <div className="step-two-unscheduled-rail">
                  {unscheduledPlaceGroups.length ? (
                    unscheduledPlaceGroups.map((group) => (
                      <article
                        key={`sticky-${group.key}`}
                        className="sticky-unscheduled-chip"
                        aria-label={`Drag ${group.title}`}
                        draggable
                        onDragStart={(event) => handleScheduleDragStart(group.key, event)}
                      >
                        <span>{group.title}</span>
                        <small>{group.area}</small>
                      </article>
                    ))
                  ) : (
                    <div className="sticky-unscheduled-empty">All assigned</div>
                  )}
                </div>
              </div>

              <section className="schedule-sorter-layout compact-schedule-layout compact-schedule-layout-single">
                <div className="glass-card schedule-buckets-panel">
                  <div className="compact-section-title">
                    <h3>Day buckets</h3>
                    <span>{dayBucketGroups.filter((day) => day.groups.length).length} active</span>
                  </div>

                  <div className="schedule-day-buckets compact-day-buckets">
                    {dayBucketGroups.map((day) => (
                      <section
                        key={day.key}
                        className="schedule-day-bucket compact-day-bucket"
                        aria-label={`Drop places into ${day.date}`}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => handleScheduleDrop(day.key, event)}
                      >
                        <div className="schedule-day-header compact-day-header">
                          <button
                            className="compact-day-open-btn"
                            onClick={() => {
                              setSelectedDayKey(day.key)
                              setActiveTab('itinerary')
                            }}
                          >
                            <span>{day.weekday}</span>
                            <strong>{day.date}</strong>
                          </button>
                          <small>{day.openSlotCount} open/flex</small>
                        </div>

                        <div className="schedule-day-items">
                          <div className="day-slot-strip" aria-label={`${day.date} empty time slots`}>
                            {day.slots.map((slot) => (
                              <div className={`day-slot-pill day-slot-${slot.state.toLowerCase()}`} key={`${day.key}-${slot.key}`}>
                                <span>{slot.label}</span>
                                <strong>{slot.state}</strong>
                                {slot.title ? <small>{slot.title}</small> : null}
                              </div>
                            ))}
                          </div>
                          {day.groups.length ? (
                            day.groups.map((group) => (
                              <article
                                key={group.key}
                                className="schedule-day-card compact-schedule-card"
                                aria-label={`Drag ${group.title}`}
                                draggable
                                onDragStart={(event) => handleScheduleDragStart(group.key, event)}
                              >
                                <strong>{group.title}</strong>
                                <small>{group.area}</small>
                              </article>
                            ))
                          ) : (
                            <div className="empty-state compact-empty-state">Drop</div>
                          )}
                        </div>
                      </section>
                    ))}
                  </div>
                </div>
              </section>
            </section>
          )}

          {activeTab === 'derm' && (
            <section className="content-screen derm-screen">
              <header className="page-header wide-header stacked-mobile derm-page-header glass-card">
                <div>
                  <span className="search-type">피부과 consult prep</span>
                  <h2 className="page-title">Korean derm procedure guide</h2>
                  <p>실제 한국 피부과 상담에서 물어볼 만한 early 30s procedure shortlist — how it works, pricing, pain, and downtime.</p>
                </div>
                <span className="chip chip-gold">early 30s</span>
              </header>

              <div className="derm-summary-grid">
                <article className="glass-card derm-summary-card">
                  <span>Strategy</span>
                  <strong>Diagnose first, package second</strong>
                  <p>Ask whether each issue is pigment, vascular redness, fat, laxity, or a benign lesion before buying bundled lasers.</p>
                </article>
                <article className="glass-card derm-summary-card">
                  <span>Trip timing</span>
                  <strong>Do scabby treatments early</strong>
                  <p>Mole removal and under-eye lesion laser should happen away from photos/events; toning and LDM are easier maintenance options.</p>
                </article>
                <article className="glass-card derm-summary-card">
                  <span>Safety</span>
                  <strong>Suspicious moles need dermoscopy</strong>
                  <p>Do not laser changing, asymmetric, or irregular dark lesions without derm evaluation and possible biopsy.</p>
                </article>
              </div>

              <div className="derm-procedure-grid" aria-label="Derm procedure comparison cards">
                {dermProcedures.map((procedure) => (
                  <article className="glass-card derm-procedure-card" key={procedure.goal}>
                    <div className="derm-card-head">
                      <div>
                        <span className="search-type">{procedure.korean}</span>
                        <h3>{procedure.goal}</h3>
                      </div>
                    </div>
                    <div
                      className={`derm-visual derm-visual-${procedure.visual.tone}`}
                      role="img"
                      aria-label={`Visual guide for ${procedure.goal}`}
                    >
                      <div className="derm-face-map" aria-hidden="true">
                        <span className="face-outline" />
                        <span className="face-marker marker-one" />
                        <span className="face-marker marker-two" />
                        <span className="face-marker marker-three" />
                        <span className="treatment-beam beam-one" />
                        <span className="treatment-beam beam-two" />
                      </div>
                      <div className="derm-visual-copy">
                        <span>{procedure.visual.tag}</span>
                        <strong>{procedure.visual.headline}</strong>
                        <div className="derm-visual-points">
                          {procedure.visual.points.map((point) => <small key={`${procedure.goal}-${point}`}>{point}</small>)}
                        </div>
                      </div>
                    </div>
                    <p className="derm-best-for">{procedure.bestFor}</p>
                    <div className="derm-option-strip">
                      <span>Recommended options</span>
                      <strong>{procedure.options}</strong>
                    </div>
                    <dl className="derm-compare-list">
                      <div>
                        <dt>How it works</dt>
                        <dd>{procedure.howItWorks}</dd>
                      </div>
                      <div>
                        <dt>Pricing</dt>
                        <dd>{procedure.pricing}</dd>
                      </div>
                      <div>
                        <dt>Pain</dt>
                        <dd>{procedure.pain}</dd>
                      </div>
                      <div>
                        <dt>Downtime</dt>
                        <dd>{procedure.downtime}</dd>
                      </div>
                    </dl>
                    <div className="derm-ask-box">
                      <span>Ask in Korean</span>
                      <p>{procedure.ask}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'bookings' && (
            <section className="content-screen compare-screen-v3">
              <h2 className="sr-only">Step 1: Choose Places</h2>
              <header className="page-header wide-header stacked-mobile compare-page-header glass-card one-sight-options-header">
                <div>
                  <span className="search-type">tiny cards</span>
                  <h2 className="page-title">Options at a glance</h2>
                </div>
                <span className="chip chip-gold">source first</span>
              </header>

              <div className="step-one-sticky-theme-rail" aria-label="Sticky place theme icons">
                {stepOneGroupedThemeBoards.map((category) => (
                  <section
                    key={category.key}
                    className={`step-one-theme-cluster step-one-theme-cluster-${category.key}`}
                    role="group"
                    aria-label={`${category.label} themes`}
                  >
                    <span className="theme-cluster-label">{category.label}</span>
                    <div className="theme-cluster-row">
                      {category.themes.map((theme) => {
                        const isOpen = selectedBookingKey === theme.key

                        return (
                          <button
                            key={`sticky-${theme.key}`}
                            type="button"
                            className={`step-one-icon-chip ${isOpen ? 'active' : ''}`}
                            aria-label={`Open ${theme.title} theme`}
                            onClick={() => setSelectedBookingKey(theme.key)}
                          >
                            <img src={theme.previewImages[0]} alt="" loading="lazy" />
                            <span>{theme.title}</span>
                          </button>
                        )
                      })}
                    </div>
                  </section>
                ))}
              </div>

              <div className="step-one-theme-list" aria-label="Choose place themes">
                {stepOneThemeBoards.filter((theme) => selectedBookingKey === theme.key).map((theme) => {
                  const isOpen = selectedBookingKey === theme.key

                  return (
                    <article
                      className={`glass-card compare-board-card step-one-theme-card ${isOpen ? 'active' : ''}`}
                      data-testid={`step-one-theme-${theme.key}`}
                      key={theme.key}
                    >
                      {isOpen ? (
                        <div className="step-one-inline-panel">
                          <div className="compare-focus-header step-one-inline-header">
                            <div>
                              {editingThemeKey === theme.key ? (
                                <input
                                  className="theme-title-input"
                                  aria-label={`Theme title for ${theme.originalTitle}`}
                                  value={theme.title}
                                  autoFocus
                                  onBlur={() => setEditingThemeKey('')}
                                  onChange={(event) => updateThemeTitle(theme.key, event.target.value)}
                                  onKeyDown={(event) => {
                                    if (event.key === 'Enter') setEditingThemeKey('')
                                  }}
                                />
                              ) : (
                                <button
                                  type="button"
                                  className="editable-theme-title"
                                  aria-label={`Edit theme title ${theme.title}`}
                                  onClick={() => setEditingThemeKey(theme.key)}
                                >
                                  {theme.title}
                                </button>
                              )}
                              <p>{theme.lead || theme.recommendation}</p>
                            </div>
                          </div>

                          <div className="one-sight-options-grid" aria-label={`${theme.title} one sight options`}>
                            {theme.comparison.map((option) => {
                              const activeVote = option.sourceType === 'places'
                                ? selectedPlaceGroups[option.groupKey] ? 'yes' : 'no'
                                : bookingVotes[`${option.sourceThemeKey}::${option.place}`] || 'no'
                              const itemTitleKey = itemTitleKeyForStepOneOption(option)
                              const displayItemTitle = displayTitleForItem(customItemTitles, itemTitleKey, option.place)
                              const swipeDelta = bookingSwipeDrag.key === itemTitleKey ? bookingSwipeDrag.deltaX : 0
                              const voteStatusLabel = activeVote === 'yes' ? 'Pending ⏳' : activeVote === 'no' ? 'TBD 🔲' : 'TBD 🔲'
                              const sourceUrl = optionSourceUrl(option)
                              const setOptionVote = (value) => {
                                if (option.sourceType === 'places') {
                                  setPlaceGroupSelected(option.groupKey, value === 'yes')
                                  return
                                }
                                toggleBookingVote(option.sourceThemeKey, option.place, value)
                                if (value !== 'yes') {
                                  assignPlaceGroupToDay(scheduleKeyForResearchOption(option.sourceThemeKey, option.place), '')
                                }
                              }

                              return (
                                <article
                                  className={`one-sight-option-card swipe-vote-card ${activeVote === 'yes' ? 'selected' : ''} ${swipeDelta > 20 ? 'swiping-right' : swipeDelta < -20 ? 'swiping-left' : ''}`}
                                  key={`${theme.key}-${itemTitleKey}`}
                                  data-testid={`swipe-card-${option.place}`}
                                  style={swipeDelta ? { transform: `translateX(${Math.max(-70, Math.min(70, swipeDelta))}px) rotate(${Math.max(-5, Math.min(5, swipeDelta / 18))}deg)` } : undefined}
                                  onTouchStart={(event) => {
                                    bookingSwipeRef.current[itemTitleKey] = event.changedTouches[0].clientX
                                  }}
                                  onTouchMove={(event) => {
                                    const startX = bookingSwipeRef.current[itemTitleKey]
                                    if (typeof startX !== 'number') return
                                    setBookingSwipeDrag({ key: itemTitleKey, deltaX: event.changedTouches[0].clientX - startX })
                                  }}
                                  onTouchEnd={(event) => {
                                    const startX = bookingSwipeRef.current[itemTitleKey]
                                    delete bookingSwipeRef.current[itemTitleKey]
                                    setBookingSwipeDrag({ key: '', deltaX: 0 })
                                    if (typeof startX !== 'number') return
                                    const deltaX = event.changedTouches[0].clientX - startX
                                    if (deltaX > 80) setOptionVote('yes')
                                    if (deltaX < -80) setOptionVote('no')
                                  }}
                                >
                                  <div className="source-thumb" aria-hidden="true">
                                    <img src={option.thumbnail} alt="" loading="lazy" />
                                  </div>
                                  <div className="one-sight-option-main">
                                    <div className="option-line-top">
                                      <span className={statusClass(voteStatusLabel)}>{voteStatusLabel}</span>
                                      <span className="source-pill">Source</span>
                                      {sourceUrl ? <a className="source-link" href={sourceUrl} target="_blank" rel="noreferrer" aria-label={`Open Instagram source for ${displayItemTitle}`}>{optionSourceLabel(option)}</a> : null}
                                    </div>
                                    {editingItemKey === itemTitleKey ? (
                                      <input
                                        className="item-title-input"
                                        aria-label={`Item name for ${option.place}`}
                                        value={displayItemTitle}
                                        autoFocus
                                        onChange={(event) => updateItemTitle(itemTitleKey, event.target.value)}
                                        onBlur={() => setEditingItemKey('')}
                                        onKeyDown={(event) => {
                                          if (event.key === 'Enter') event.currentTarget.blur()
                                          if (event.key === 'Escape') setEditingItemKey('')
                                        }}
                                      />
                                    ) : (
                                      <button
                                        type="button"
                                        className="editable-item-title compact-option-title"
                                        aria-label={`Edit item name ${displayItemTitle}`}
                                        onClick={() => setEditingItemKey(itemTitleKey)}
                                      >
                                        {displayItemTitle}
                                      </button>
                                    )}
                                    <div className="one-sight-meta">
                                      <span>{option.area}</span>
                                      <span>{option.pricing || option.vibe}</span>
                                    </div>
                                    <p className="one-sight-note">{option.note}</p>
                                  </div>
                                  <div className="step-one-choice-row inline-choice-row compact-choice-row">
                                    <button
                                      type="button"
                                      aria-label={`Yes to ${displayItemTitle}`}
                                      className={activeVote === 'yes' ? 'active' : ''}
                                      onClick={() => setOptionVote('yes')}
                                    >
                                      Yes
                                    </button>
                                    <button
                                      type="button"
                                      aria-label={`No to ${displayItemTitle}`}
                                      className={activeVote !== 'yes' ? 'active' : ''}
                                      onClick={() => setOptionVote('no')}
                                    >
                                      No
                                    </button>
                                  </div>
                                </article>
                              )
                            })}
                          </div>
                        </div>
                      ) : null}
                    </article>
                  )
                })}
              </div>
            </section>
          )}

          {activeTab === 'spend' && (
            <section className="content-screen">
              <header className="page-header wide-header stacked-mobile">
                <div>
                  <h2 className="page-title">Spend</h2>
                  <p>Still simple for now, but easier to scan on desktop and mobile.</p>
                </div>
                <span className="chip chip-sage">simple mode</span>
              </header>

              <div className="spend-layout">
                <div className="glass-card spend-table">
                  {spend.map((row) => (
                    <article className="spend-row" key={row.item}>
                      <div>
                        <h3>{row.item}</h3>
                        <p>{row.detail}</p>
                      </div>
                      <strong className="amount">{row.amount}</strong>
                    </article>
                  ))}
                </div>

                <div className="spend-side-grid">
                  <div className="summary-card glass-card warm-card">
                    <span>Total logged</span>
                    <strong>${loggedSpend.toLocaleString()}</strong>
                    <p>Flights, Jeju flight, rental car, and one activity.</p>
                  </div>
                  <div className="summary-card glass-card cool-card">
                    <span>Still flexible</span>
                    <strong>TBD</strong>
                    <p>Beauty, food, transport gaps, shopping, and splurges.</p>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      <BottomNav tabs={tabs} tabMeta={tabMeta} activeTab={activeTab} onSelect={setActiveTab} />
    </div>
  )
}

export { reorderPlannerItems, tripCountdownLabel }
export default App
