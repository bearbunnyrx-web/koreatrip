import './App.css'
import { useEffect, useMemo, useRef, useState } from 'react'

const tabs = ['home', 'itinerary', 'bookings', 'spend']
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
    ...config,
  }
}

const itineraryDays = [
  itineraryDay({
    key: 'may-15',
    date: 'May 15',
    label: 'Flight out',
    area: 'Travel day',
    status: 'travel anchor',
    focus: 'Keep this day simple: airport, flight, and sleep. Nothing else should compete with it.',
    logistics: {
      start: 'LAX',
      end: 'Overnight flight to Korea',
      note: 'This is mostly a hard travel day, so the main job is buffer, food, and avoiding unnecessary stress before departure.',
    },
    mapCenter: { lat: 33.9416, lng: -118.4085 },
    stops: [
      { time: 'AM', title: 'Final pack + document check', detail: 'Passport, cards, chargers, eSIM plan, and medication all checked once before leaving.', neighborhood: 'Home', type: 'anchor' },
      { time: '3–4 hrs before flight', title: 'Head to LAX', detail: 'Treat this as a buffer block, not as tightly scheduled time.', neighborhood: 'Los Angeles', type: 'transit' },
      { time: 'Flight block', title: 'Depart for Korea', detail: 'Once this starts, the only goal is getting there rested enough for arrival day.', neighborhood: 'LAX → ICN', type: 'anchor' },
    ],
    mapTargets: [
      mapTarget('LAX Airport', 'Departure anchor', { query: 'Los Angeles International Airport', coords: { lat: 33.9416, lng: -118.4085 } }),
      mapTarget('Incheon International Airport', 'Arrival anchor in Korea', { coords: { lat: 37.4602, lng: 126.4407 } }),
    ],
  }),
  itineraryDay({
    key: 'may-16',
    date: 'May 16',
    label: 'Arrival day',
    area: 'Godeok / east Seoul',
    status: 'needs headspa booking',
    focus: 'Keep this day gentle and local after landing.',
    logistics: {
      start: 'ICN Airport',
      end: 'Dinner near family / easy night',
      note: 'Parents likely pick you up, lunch at home first, then late-afternoon outing makes the most sense.',
    },
    mapCenter: { lat: 37.5557, lng: 127.1542 },
    stops: [
      { time: '11:30', title: 'Land at ICN', detail: 'Immigration, bags, and regroup without rushing.', neighborhood: 'Incheon Airport', type: 'anchor' },
      { time: '12:30–13:30', title: 'Meet parents + drive out', detail: 'Let your parents take the lead and avoid stacking commitments too close to landing.', neighborhood: 'Airport pickup', type: 'transit' },
      { time: '14:00', title: 'Lunch at parents’ house', detail: 'Use this as the true recovery block before going back out.', neighborhood: '고덕역 home base', type: 'meal' },
      { time: '16:30 or 17:30', title: 'Headspa window', detail: 'Late-afternoon slot feels safer than trying to force an early appointment after the airport.', neighborhood: '고덕 / nearby east Seoul', type: 'beauty' },
      { time: '19:00', title: 'Easy dinner / family time', detail: 'Stay local, keep the first night soft, and don’t overschedule.', neighborhood: '고덕 / family area', type: 'meal' },
    ],
    mapTargets: [
      mapTarget('Parents’ house / 고덕역 area', 'Home base after landing', { query: '고덕역', coords: { lat: 37.5557, lng: 127.1542 } }),
      mapTarget('숱하다헤드스파', 'Flexible late-afternoon headspa candidate'),
      mapTarget('단비 헤드스파앤컬러', 'Cozier backup if timing works'),
    ],
  }),
  itineraryDay({
    key: 'may-17',
    date: 'May 17',
    label: 'Seongsu beauty + shopping',
    area: 'Seongsu',
    status: 'mostly set',
    focus: 'Keep the whole day clustered so you are not zig-zagging across Seoul.',
    logistics: {
      start: '고덕 / east Seoul',
      end: 'Dinner back in Seoul',
      note: 'This is the kind of day where a live map helps most because everything should be grouped by walking blocks, not districts.',
    },
    mapCenter: { lat: 37.5446, lng: 127.0557 },
    stops: [
      { time: '10:00', title: 'Leave home base', detail: 'Give yourselves a soft start so the day still feels like vacation.', neighborhood: '고덕 → Seongsu', type: 'transit' },
      { time: '11:00', title: 'Nail / eyebrow appointment', detail: 'Anchor the day with the fixed beauty booking first.', neighborhood: 'Seongsu', type: 'beauty' },
      { time: '13:00', title: 'Lunch', detail: 'Keep lunch nearby so you do not break the neighborhood flow.', neighborhood: 'Seongsu', type: 'meal' },
      { time: '14:00–17:00', title: 'Shopping block', detail: 'Gentle Monster, Tamburins, Olive Young, and anything else worth bundling in one walking loop.', neighborhood: 'Seongsu', type: 'shopping' },
      { time: '18:30', title: 'Dinner', detail: 'Either stay in Seongsu or move once with purpose.', neighborhood: 'Seoul', type: 'meal' },
    ],
    mapTargets: [
      mapTarget('Seongsu anchor area', 'Main shopping + beauty cluster', { query: '성수동', coords: { lat: 37.5446, lng: 127.0557 } }),
      mapTarget('Gentle Monster Seongsu', 'Potential anchor stop'),
      mapTarget('Tamburins Seongsu', 'Likely same walking cluster'),
      mapTarget('Olive Young Seongsu', 'Useful practical stop'),
    ],
  }),
  itineraryDay({
    key: 'may-18',
    date: 'May 18',
    label: 'Embassy + hair perm',
    area: 'Seoul',
    status: 'to confirm',
    focus: 'This day should stay structured around fixed appointments and not become a random errand spiral.',
    logistics: {
      start: 'Morning appointment zone',
      end: 'Flexible afternoon in Seoul',
      note: 'Once the exact perm time is confirmed, the lunch and afternoon window become much easier to place realistically.',
    },
    mapCenter: { lat: 37.5665, lng: 126.978 },
    stops: [
      { time: '08:30', title: 'Embassy task', detail: 'Treat this as the non-negotiable first anchor.', neighborhood: 'Embassy area', type: 'anchor' },
      { time: '09:30–12:30', title: 'Hair perm window', detail: 'Build the rest of the day around the real salon timing once confirmed.', neighborhood: 'Soonsiki / salon area', type: 'beauty' },
      { time: '13:00', title: 'Late lunch', detail: 'Do not overbook right after hair; leave a recovery block.', neighborhood: 'Nearby Seoul neighborhood', type: 'meal' },
      { time: 'Afternoon', title: 'Open Seoul block', detail: 'Use this only after fixed appointments are locked in.', neighborhood: 'Seoul', type: 'shopping' },
    ],
    mapTargets: [
      mapTarget('Soonsiki Hair', 'Hair appointment anchor', { query: '순시키 헤어' }),
      mapTarget('US Embassy Seoul', 'Morning fixed task', { query: '주한미국대사관' }),
    ],
  }),
  itineraryDay({
    key: 'may-19',
    date: 'May 19',
    label: 'Open Seoul day',
    area: 'Seoul',
    status: 'open planning day',
    focus: 'This is still mostly open, so the app should show the full date even when the details are not locked yet.',
    logistics: {
      start: 'TBD',
      end: 'TBD',
      note: 'Use this day for whichever neighborhood cluster becomes the best fit after beauty and reservation timing are finalized.',
    },
    mapCenter: { lat: 37.5665, lng: 126.978 },
    stops: [
      { time: 'Morning', title: 'Neighborhood choice', detail: 'Pick one area, not three scattered areas.', neighborhood: 'TBD', type: 'anchor' },
      { time: 'Lunch', title: 'Book around the chosen area', detail: 'This should follow the neighborhood choice, not fight it.', neighborhood: 'TBD', type: 'meal' },
      { time: 'Afternoon', title: 'Flexible date block', detail: 'Use for shopping, cafe time, or a reservation that fits the neighborhood.', neighborhood: 'TBD', type: 'shopping' },
      { time: 'Evening', title: 'Dinner anchor if needed', detail: 'Can stay flexible unless a must-have reservation appears.', neighborhood: 'Seoul', type: 'meal' },
    ],
    mapTargets: [
      mapTarget('Seoul City Hall', 'Neutral central Seoul fallback', { query: '서울시청', coords: { lat: 37.5663, lng: 126.9779 } }),
      mapTarget('Seongsu', 'Option if you want another east-side cluster', { query: '성수동' }),
      mapTarget('Jamsil', 'Option if you want a southeast cluster', { query: '잠실' }),
    ],
  }),
  itineraryDay({
    key: 'may-20',
    date: 'May 20',
    label: 'Jeju transfer day',
    area: 'Travel / Jeju',
    status: 'travel logistics',
    focus: 'Transfer days need more buffer than ambition.',
    logistics: {
      start: 'Seoul',
      end: 'Jeju',
      note: 'This should be treated as a travel-and-settle day first, with only low-friction extras afterwards.',
    },
    mapCenter: { lat: 33.4996, lng: 126.5312 },
    stops: [
      { time: 'Morning', title: 'Airport transfer', detail: 'Pad more buffer than a normal city day.', neighborhood: 'Seoul → airport', type: 'transit' },
      { time: 'Flight block', title: 'Fly to Jeju', detail: 'Make this the main anchor of the day.', neighborhood: 'GMP/CJU', type: 'anchor' },
      { time: 'After landing', title: 'Rental car + check-in flow', detail: 'Do not squeeze a hard reservation too close to arrival.', neighborhood: 'Jeju', type: 'transit' },
      { time: 'Evening', title: 'Simple first-night plan', detail: 'Keep the first Jeju night easy unless you already have a must-do booking.', neighborhood: 'Jeju', type: 'meal' },
    ],
    mapTargets: [
      mapTarget('Jeju International Airport', 'Flight anchor', { coords: { lat: 33.5104, lng: 126.4914 } }),
      mapTarget('Jeju car rental', 'Likely first stop after landing', { query: '제주공항 렌터카' }),
    ],
  }),
  itineraryDay({
    key: 'may-21',
    date: 'May 21',
    label: 'Jeju → Seoul + Sofitel + dinner',
    area: 'Jamsil',
    status: 'confirmed anchors',
    focus: 'This day already has real anchors, so the job is making the transfers feel smooth.',
    logistics: {
      start: 'Jeju',
      end: 'Jamsil / 본연 dinner',
      note: 'Flights and hotel are the fixed skeleton. Luggage flow and dinner pacing matter more than adding new stops.',
    },
    mapCenter: { lat: 37.5067, lng: 127.1022 },
    stops: [
      { time: '11:30', title: 'Fly Jeju → Seoul', detail: 'Keep the whole day loose around the airport block.', neighborhood: 'Jeju / Gimpo', type: 'anchor' },
      { time: '14:30', title: 'Move luggage + reset', detail: 'Do not overfill this middle window.', neighborhood: 'Transit to Jamsil', type: 'transit' },
      { time: '16:00', title: 'Sofitel check-in', detail: 'This is the second-half Seoul anchor.', neighborhood: 'Jamsil', type: 'hotel' },
      { time: '19:00', title: '본연 dinner reservation', detail: 'Already confirmed — this is your real evening anchor.', neighborhood: 'Seoul', type: 'meal' },
    ],
    mapTargets: [
      mapTarget('Sofitel Ambassador Seoul', 'Confirmed hotel anchor'),
      mapTarget('본연 서울', 'Confirmed dinner reservation', { query: '본연 서울' }),
      mapTarget('Jamsil', 'Neighborhood anchor', { query: '잠실', coords: { lat: 37.5133, lng: 127.1002 } }),
    ],
  }),
  itineraryDay({
    key: 'may-22',
    date: 'May 22',
    label: 'Jamsil-based Seoul day',
    area: 'Jamsil / southeast Seoul',
    status: 'open planning day',
    focus: 'Now that the hotel is fixed, this day should be optimized by area around the Jamsil base.',
    logistics: {
      start: 'Sofitel / Jamsil',
      end: 'Seoul evening',
      note: 'A Jamsil-based day works best if you keep the first half near the hotel rather than bouncing across Seoul immediately.',
    },
    mapCenter: { lat: 37.5133, lng: 127.1002 },
    stops: [
      { time: 'Morning', title: 'Easy hotel-area start', detail: 'Good morning for nearby cafe, shopping, or a reserved experience.', neighborhood: 'Jamsil', type: 'hotel' },
      { time: 'Lunch', title: 'Anchor one neighborhood lunch', detail: 'Use lunch to reinforce the day’s area, not scatter it.', neighborhood: 'Jamsil / Songpa', type: 'meal' },
      { time: 'Afternoon', title: 'One main Seoul block', detail: 'Choose one major direction for the afternoon.', neighborhood: 'Seoul', type: 'shopping' },
      { time: 'Evening', title: 'Dinner or walk', detail: 'Can stay near Jamsil if you want a low-friction evening.', neighborhood: 'Jamsil', type: 'meal' },
    ],
    mapTargets: [
      mapTarget('Sofitel Ambassador Seoul', 'Hotel base'),
      mapTarget('Lotte World Mall', 'Easy nearby anchor'),
      mapTarget('Seokchon Lake', 'Walkable nearby option'),
    ],
  }),
  itineraryDay({
    key: 'may-23',
    date: 'May 23',
    label: 'Open Seoul day',
    area: 'Seoul',
    status: 'open planning day',
    focus: 'This is another flexible date, so showing it in the app prevents the middle of the trip from disappearing from view.',
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
    label: 'Flexible Seoul day',
    area: 'Seoul',
    status: 'open planning day',
    focus: 'Keep the whole date visible even if the exact hotel or neighborhood flow changes later.',
    logistics: {
      start: 'Current Seoul base',
      end: 'Seoul evening',
      note: 'If any lodging transition or reservation shift happens around here, this day should absorb the complexity rather than pretending it is already fixed.',
    },
    mapCenter: { lat: 37.5665, lng: 126.978 },
    stops: [
      { time: 'Morning', title: 'Hotel / luggage decision', detail: 'Make sure any check-out or movement is visible in the schedule if applicable.', neighborhood: 'Seoul', type: 'hotel' },
      { time: 'Lunch', title: 'Keep lunch nearby', detail: 'This day gets messy fast if transit and food are not aligned.', neighborhood: 'TBD', type: 'meal' },
      { time: 'Afternoon', title: 'Open block', detail: 'Good candidate for one reservation plus one nearby backup option.', neighborhood: 'Seoul', type: 'shopping' },
      { time: 'Evening', title: 'Dinner', detail: 'Stay flexible unless this becomes a must-book dinner day.', neighborhood: 'Seoul', type: 'meal' },
    ],
    mapTargets: [
      mapTarget('Myeongdong', 'Possible central shopping cluster', { query: '명동' }),
      mapTarget('Jamsil', 'Fallback around the hotel base', { query: '잠실' }),
      mapTarget('Hannam-dong', 'Possible dining/date area', { query: '한남동' }),
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
    area: 'Departure day',
    status: 'travel anchor',
    focus: 'Departure day should be visibly protected from last-minute plan creep.',
    logistics: {
      start: 'Seoul',
      end: 'Airport / flight home',
      note: 'Protect packing, checkout, airport transfer, and buffer. Anything optional should be clearly optional.',
    },
    mapCenter: { lat: 37.4602, lng: 126.4407 },
    stops: [
      { time: 'Morning', title: 'Final pack + hotel checkout', detail: 'Do the boring parts early so the airport block stays calm.', neighborhood: 'Seoul', type: 'hotel' },
      { time: 'Airport buffer', title: 'Transfer to ICN', detail: 'Treat this as a serious anchor, not flexible time.', neighborhood: 'Seoul → ICN', type: 'transit' },
      { time: 'Flight block', title: 'Depart Korea', detail: 'The trip closes here, so leave margin rather than squeezing in one last errand.', neighborhood: 'ICN', type: 'anchor' },
    ],
    mapTargets: [
      mapTarget('Incheon International Airport', 'Departure anchor', { coords: { lat: 37.4602, lng: 126.4407 } }),
      mapTarget('Airport Railroad Seoul Station', 'Fallback transfer anchor', { query: '서울역 공항철도' }),
    ],
  }),
]

const researchBoards = [
  {
    key: 'nail-brow',
    title: 'Nail / eyebrow in Seongsu',
    status: 'research active',
    lead: 'Default collapsed until the Discord comparison becomes decisive.',
    source: 'Discord research board → travel / korea-trip / bookings',
    recommendation: 'Waiting for your real shortlist from Discord so this can become a real compare table instead of placeholders.',
    comparison: [
      {
        place: 'Shop candidate A',
        area: 'Seongsu',
        pricing: 'TBD',
        thumbnail: 'https://placehold.co/240x160/e8edf7/253247?text=Seongsu+Beauty+A',
        youtube: 'https://www.youtube.com/results?search_query=Seongsu+nail+eyebrow+shop',
        instagram: '',
        note: 'Placeholder row until you feed in the actual shop names from Discord.',
      },
      {
        place: 'Shop candidate B',
        area: 'Seongsu',
        pricing: 'TBD',
        thumbnail: 'https://placehold.co/240x160/f6e8ef/4a2b3c?text=Seongsu+Beauty+B',
        youtube: 'https://www.youtube.com/results?search_query=Seongsu+nail+brow+review',
        instagram: '',
        note: 'Use this row for the main backup once you narrow the shortlist.',
      },
    ],
  },
  {
    key: 'headspa',
    title: 'Arrival-day headspa near 고덕',
    status: 'decision pending',
    lead: 'This one already has real place data, so it can work like a true compare board now.',
    source: 'Naver place details + arrival-day logistics',
    recommendation: '숱하다헤드스파 still looks like the cleaner default because the hours and timing are friendlier after landing.',
    comparison: [
      {
        place: '숱하다헤드스파',
        area: '강동구 고덕동 · 고덕역권',
        pricing: '미니스파(35분) 50,000 KRW · AI 두피진단 0 KRW',
        thumbnail: 'https://search.pstatic.net/sunny?src=https%3A%2F%2Flh3.googleusercontent.com%2Fsitesv%2FAA5AbUAL1PRqBDei8IhAxtLBYdRZ_q6T-edzfNF5PCglbZNJF6RMgWyeiH8JqwWqLZXiS4tnc6RRgU_JDbvlKmz_RTAw524osd_bp_3eWtAuyVh9S0n01UXGLWeqjDtITk6KLmJ51C7oK9O0bZP4UI1kLEjI6l6x-rk3uLGrWbPVzAcl2EgVcoNW7Uf4hUGS4W_YfIgPpmfpEi6izXcL3CtxpjxtjpVraWigz5DM%3Dw1280&type=fff208_208_ar',
        youtube: 'https://www.youtube.com/results?search_query=%EC%88%B1%ED%95%98%EB%8B%A4%ED%97%A4%EB%93%9C%EC%8A%A4%ED%8C%8C',
        instagram: '',
        note: 'Open until 22:00, which gives you much more margin on arrival day.',
      },
      {
        place: '단비 헤드스파앤컬러',
        area: '강동구 · 고덕 인접',
        pricing: '첫방문 힐링스파(70분) 60,000 KRW',
        thumbnail: 'https://placehold.co/240x160/e7efe7/244032?text=Danbi+Headspa',
        youtube: 'https://www.youtube.com/results?search_query=%EB%8B%A8%EB%B9%84+%ED%97%A4%EB%93%9C%EC%8A%A4%ED%8C%8C%EC%95%A4%EC%BB%AC%EB%9F%AC',
        instagram: '',
        note: 'Cozier-feeling backup, but the tighter hours make it less forgiving.',
      },
    ],
  },
  {
    key: 'hair-perm',
    title: 'Hair perm day structure',
    status: 'to confirm',
    lead: 'This compare board is more about day-shape than about a finalized salon list.',
    source: 'Discord comparison + itinerary timing',
    recommendation: 'Once the exact appointment time is fixed, one row should win and the other should probably disappear.',
    comparison: [
      {
        place: 'Morning-heavy version',
        area: 'Embassy area → salon area',
        pricing: 'TBD',
        thumbnail: 'https://placehold.co/240x160/e9ecf7/2d3750?text=Morning+Version',
        youtube: 'https://www.youtube.com/results?search_query=%EC%88%9C%EC%8B%9C%ED%82%A4+%ED%97%A4%EC%96%B4',
        instagram: '',
        note: 'Better if embassy and salon can be handled in one clean push.',
      },
      {
        place: 'Late-morning version',
        area: 'Salon-first buffer',
        pricing: 'TBD',
        thumbnail: 'https://placehold.co/240x160/f2e9de/5a4032?text=Late+Morning',
        youtube: 'https://www.youtube.com/results?search_query=Soonsiki+hair+seoul',
        instagram: '',
        note: 'Safer if the morning feels too compressed with transport.',
      },
    ],
  },
  {
    key: 'derm',
    title: 'Dermatology clinic shortlist',
    status: 'research active',
    lead: 'This is ready for a proper table once you drop the actual clinic names from Discord.',
    source: 'Discord research board → future compare view',
    recommendation: 'Waiting for real clinic shortlist.',
    comparison: [
      {
        place: 'Clinic option 1',
        area: 'TBD',
        pricing: 'TBD',
        thumbnail: 'https://placehold.co/240x160/e9f2ee/234236?text=Derm+Option+1',
        youtube: 'https://www.youtube.com/results?search_query=Seoul+dermatology+clinic+review',
        instagram: '',
        note: 'Replace with actual clinic details once research is narrowed.',
      },
      {
        place: 'Clinic option 2',
        area: 'TBD',
        pricing: 'TBD',
        thumbnail: 'https://placehold.co/240x160/f3e8e8/5e3535?text=Derm+Option+2',
        youtube: 'https://www.youtube.com/results?search_query=Korea+dermatology+clinic+review',
        instagram: '',
        note: 'Backup row for second clinic candidate.',
      },
    ],
  },
]

const spend = [
  { item: 'Flights', detail: 'Long-haul + international legs', amount: '$960' },
  { item: 'Jeju flight', detail: 'Seoul → Jeju', amount: '$200' },
  { item: 'Rental car', detail: 'Jeju', amount: '$35' },
  { item: 'Activity', detail: 'Imported activity / beach cost', amount: '$160' },
]

function statusClass(value) {
  const lower = value.toLowerCase()
  if (lower.includes('booked') || lower.includes('confirmed')) return 'chip chip-dark'
  if (lower.includes('decision')) return 'chip chip-rose'
  if (lower.includes('research') || lower.includes('pending') || lower.includes('confirm')) return 'chip chip-gold'
  if (lower.includes('travel') || lower.includes('set') || lower.includes('anchor')) return 'chip chip-sage'
  return 'chip chip-mist'
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
  const [activeTab, setActiveTab] = useState('home')
  const [selectedDayKey, setSelectedDayKey] = useState('may-16')
  const [theme, setTheme] = useState(() => {
    const stored = window.localStorage.getItem('korea-trip-theme')
    return stored === 'dark' ? 'dark' : 'light'
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [mapStatus, setMapStatus] = useState(KAKAO_JS_KEY ? 'idle' : 'missing-key')
  const [resolvedMapTargets, setResolvedMapTargets] = useState([])
  const [mapNotice, setMapNotice] = useState('')
  const mapCanvasRef = useRef(null)

  const selectedDay = useMemo(
    () => itineraryDays.find((day) => day.key === selectedDayKey) ?? itineraryDays[0],
    [selectedDayKey],
  )

  const loggedSpend = useMemo(
    () => spend.reduce((sum, row) => sum + Number(row.amount.replace(/[$,]/g, '')), 0),
    [],
  )

  const countdownDays = useMemo(() => {
    const today = new Date()
    const tripStart = new Date('2026-05-15T00:00:00-07:00')
    return Math.max(0, Math.ceil((tripStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
  }, [])

  const pendingBookings = useMemo(
    () => researchBoards.filter((board) => !board.status.toLowerCase().includes('confirmed')).length,
    [],
  )

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []

    const dayResults = itineraryDays.flatMap((day) => {
      const inDay = [day.date, day.label, day.area, day.focus].join(' ').toLowerCase().includes(q)
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
      const matchedOption = board.options.find((option) => [option.name, option.takeaway].join(' ').toLowerCase().includes(q))
      const matchedBoard = [board.title, board.lead, board.recommendation].join(' ').toLowerCase().includes(q)

      if (!matchedBoard && !matchedOption) return []

      return [{
        key: board.key,
        type: 'Research',
        title: board.title,
        detail: matchedOption?.name || board.recommendation,
        action: () => setActiveTab('bookings'),
      }]
    })

    return [...dayResults, ...bookingResults].slice(0, 8)
  }, [searchQuery])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('korea-trip-theme', theme)
  }, [theme])

  useEffect(() => {
    if (activeTab !== 'itinerary') return

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

        const center = new kakao.maps.LatLng(selectedDay.mapCenter.lat, selectedDay.mapCenter.lng)
        const map = new kakao.maps.Map(mapCanvasRef.current, {
          center,
          level: selectedDay.mapLevel,
        })

        const placesService = new kakao.maps.services.Places()
        const bounds = new kakao.maps.LatLngBounds()

        const resolved = await Promise.all(
          selectedDay.mapTargets.map(
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
          setMapNotice('The Kakao map loaded, but none of the places resolved yet for this day.')
          return
        }

        foundTargets.forEach((target, index) => {
          const position = new kakao.maps.LatLng(target.lat, target.lng)
          bounds.extend(position)

          const marker = new kakao.maps.Marker({ position, map, title: target.displayName })
          overlayItems.push({ setMap: marker.setMap.bind(marker) })

          const badge = document.createElement('div')
          badge.className = 'map-marker-badge'
          badge.textContent = String(index + 1)

          const overlay = new kakao.maps.CustomOverlay({ position, content: badge, yAnchor: 1.8 })
          overlay.setMap(map)
          overlayItems.push({ setMap: overlay.setMap.bind(overlay) })

          kakao.maps.event.addListener(marker, 'click', () => {
            window.open(target.kakaoUrl, '_blank', 'noopener,noreferrer')
          })
        })

        if (foundTargets.length === 1) {
          map.setCenter(new kakao.maps.LatLng(foundTargets[0].lat, foundTargets[0].lng))
          map.setLevel(Math.max(4, selectedDay.mapLevel - 1))
        } else {
          map.setBounds(bounds, 60, 60, 60, 60)
        }

        setMapStatus('ready')
        setMapNotice(`${foundTargets.length} place${foundTargets.length > 1 ? 's' : ''} mapped for ${selectedDay.date}. Tap a marker to open Kakao Map.`)
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
  }, [activeTab, selectedDay])

  return (
    <div className="app-shell">
      <div className="planner-frame">
        <aside className="sidebar-shell glass-card">
          <div className="sidebar-top-row">
            <div className="sidebar-top">
              <div className="eyebrow">SJ + TH • Korea • May 15–26</div>
              <h1>Korea Trip Together</h1>
              <p>Shared trip app for both of you — excitement on top, real logistics underneath.</p>
            </div>
            <button className="theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              {theme === 'light' ? '☾ Dark' : '☀ Light'}
            </button>
          </div>

          <nav className="sidebar-nav desktop-only">
            {tabs.map((tab) => (
              <button key={tab} className={activeTab === tab ? 'sidebar-btn active' : 'sidebar-btn'} onClick={() => setActiveTab(tab)}>
                <span>{tab === 'home' ? 'Home' : tab === 'itinerary' ? 'Itinerary' : tab === 'bookings' ? 'Bookings' : 'Spend'}</span>
                <small>
                  {tab === 'home'
                    ? 'landing + search'
                    : tab === 'itinerary'
                      ? 'hour-by-hour flow'
                      : tab === 'bookings'
                        ? 'research boards'
                        : 'simple totals'}
                </small>
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
          {activeTab === 'home' && (
            <section className="content-screen home-screen clean-home-screen">
              <div className="countdown-card glass-card">
                <span>Countdown</span>
                <strong>D-{countdownDays}</strong>
              </div>

              <div className="search-card glass-card clean-search-card">
                <input
                  className="trip-search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search Seongsu, headspa, Sofitel, Jeju, embassy, brow..."
                />
                {searchQuery.trim() ? (
                  <div className="search-results">
                    {searchResults.length ? (
                      searchResults.map((result) => (
                        <button key={result.key + result.type} className="search-result" onClick={result.action}>
                          <span className="search-type">{result.type}</span>
                          <strong>{result.title}</strong>
                          <p>{result.detail}</p>
                        </button>
                      ))
                    ) : (
                      <div className="empty-state">No matches yet — try a date, neighborhood, booking type, or specific place.</div>
                    )}
                  </div>
                ) : null}
              </div>
            </section>
          )}

          {activeTab === 'itinerary' && (
            <section className="content-screen itinerary-screen">
              <header className="page-header wide-header stacked-mobile">
                <div>
                  <h2 className="page-title">Hourly itinerary</h2>
                  <p>All trip dates are visible, the selected day stays detailed, and Kakao map keeps logistics intuitive.</p>
                </div>
                <span className="chip chip-gold">phase 2 map mode</span>
              </header>

              <div className="itinerary-summary-row two-up">
                <div className="summary-mini glass-card">
                  <span>Visible trip range</span>
                  <strong>May 15–26</strong>
                </div>
                <div className="summary-mini glass-card">
                  <span>Selected day</span>
                  <strong>{selectedDay.date}</strong>
                </div>
              </div>

              <div className="day-picker-row">
                {itineraryDays.map((day) => (
                  <button key={day.key} className={selectedDay.key === day.key ? 'day-chip active' : 'day-chip'} onClick={() => setSelectedDayKey(day.key)}>
                    <strong>{day.date}</strong>
                    <span>{day.label}</span>
                  </button>
                ))}
              </div>

              <div className="itinerary-layout">
                <section className="glass-card timeline-panel">
                  <div className="section-header stacked-mobile">
                    <div>
                      <h3>{selectedDay.date} · {selectedDay.label}</h3>
                      <p>{selectedDay.focus}</p>
                    </div>
                    <span className={statusClass(selectedDay.status)}>{selectedDay.status}</span>
                  </div>

                  <div className="hour-timeline">
                    {selectedDay.stops.map((stop) => (
                      <article className="hour-row" key={selectedDay.key + stop.time + stop.title}>
                        <div className="hour-time">{stop.time}</div>
                        <div className="hour-dot" />
                        <div className="hour-card">
                          <div className="hour-header stacked-mobile">
                            <h4>{stop.title}</h4>
                            <span className="chip chip-soft">{stopTypeLabel(stop.type)}</span>
                          </div>
                          <p>{stop.detail}</p>
                          <small>{stop.neighborhood}</small>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="side-panels">
                  <div className="glass-card logistics-card">
                    <div className="section-header stacked-mobile">
                      <h3>Logistics</h3>
                      <span>{selectedDay.area}</span>
                    </div>
                    <div className="logistics-grid">
                      <div>
                        <label>Start</label>
                        <strong>{selectedDay.logistics.start}</strong>
                      </div>
                      <div>
                        <label>End</label>
                        <strong>{selectedDay.logistics.end}</strong>
                      </div>
                    </div>
                    <p className="logistics-note">{selectedDay.logistics.note}</p>
                  </div>

                  <div className="glass-card logistics-card map-card">
                    <div className="section-header stacked-mobile">
                      <h3>Live Kakao map</h3>
                      <span>{mapStatus === 'ready' ? 'interactive' : 'loading / fallback'}</span>
                    </div>
                    <div ref={mapCanvasRef} className="map-canvas" />
                    <p className="map-footnote">{mapNotice}</p>
                    <div className="resolved-list">
                      {(resolvedMapTargets.length ? resolvedMapTargets : selectedDay.mapTargets).map((target, index) => (
                        <article className="resolved-item" key={target.name}>
                          <div className="resolved-index">{index + 1}</div>
                          <div>
                            <strong>{target.displayName || target.name}</strong>
                            <p>{target.reason}</p>
                            {target.address && <small>{target.address}</small>}
                            {'found' in target && !target.found && <small>Could not auto-resolve this place yet on Kakao.</small>}
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card logistics-card">
                    <div className="section-header stacked-mobile">
                      <h3>Map links</h3>
                      <span>open in native map sites</span>
                    </div>
                    <div className="map-list">
                      {selectedDay.mapTargets.map((target) => (
                        <article className="map-item" key={target.name}>
                          <div>
                            <strong>{target.name}</strong>
                            <p>{target.reason}</p>
                          </div>
                          <div className="map-links">
                            <a href={target.naverUrl} target="_blank" rel="noreferrer">Naver</a>
                            <a href={target.kakaoUrl} target="_blank" rel="noreferrer">Kakao</a>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </section>
          )}

          {activeTab === 'bookings' && (
            <section className="content-screen">
              <header className="page-header wide-header stacked-mobile">
                <div>
                  <h2 className="page-title">Bookings research board</h2>
                  <p>Each item stays collapsed by default, then opens into a comparison view with thumbnail, area, pricing, and external links.</p>
                </div>
                <span className="chip chip-gold">research-first</span>
              </header>

              <div className="research-accordion-list">
                {researchBoards.map((board) => (
                  <details className="glass-card research-accordion" key={board.key}>
                    <summary className="research-summary">
                      <div>
                        <h3>{board.title}</h3>
                        <p>{board.recommendation}</p>
                      </div>
                      <span className={statusClass(board.status)}>{board.status}</span>
                    </summary>

                    <div className="research-accordion-body">
                      <div className="research-meta">{board.source}</div>
                      <p className="research-lead">{board.lead}</p>

                      <div className="research-recommendation">
                        <span>Current recommendation</span>
                        <strong>{board.recommendation}</strong>
                      </div>

                      <div className="comparison-table-wrap">
                        <table className="comparison-table">
                          <thead>
                            <tr>
                              <th>Preview</th>
                              <th>Place</th>
                              <th>Location</th>
                              <th>Pricing</th>
                              <th>Links</th>
                              <th>Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {board.comparison.map((option) => (
                              <tr key={board.key + option.place}>
                                <td>
                                  <img className="comparison-thumb" src={option.thumbnail} alt={option.place} />
                                </td>
                                <td>{option.place}</td>
                                <td>{option.area}</td>
                                <td>{option.pricing}</td>
                                <td>
                                  <div className="comparison-links">
                                    {option.instagram ? <a href={option.instagram} target="_blank" rel="noreferrer">Instagram</a> : null}
                                    {option.youtube ? <a href={option.youtube} target="_blank" rel="noreferrer">YouTube</a> : null}
                                  </div>
                                </td>
                                <td>{option.note}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
              <div className="support-note wide-note">For headspa, I filled in real location/pricing data. For the other themes, the compare tables are ready but still need your actual Discord shortlist to replace the placeholders.</div>
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

      <nav className="mobile-bottom-nav">
        {tabs.map((tab) => (
          <button key={tab} className={activeTab === tab ? 'mobile-tab active' : 'mobile-tab'} onClick={() => setActiveTab(tab)}>
            <span>{tab === 'home' ? '⌂' : tab === 'itinerary' ? '◫' : tab === 'bookings' ? '☰' : '₩'}</span>
            <small>{tab === 'home' ? 'Home' : tab === 'itinerary' ? 'Plan' : tab === 'bookings' ? 'Book' : 'Spend'}</small>
          </button>
        ))}
      </nav>
    </div>
  )
}

export default App
