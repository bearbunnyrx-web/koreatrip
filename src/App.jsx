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

const bookings = [
  {
    title: 'Sofitel Ambassador Seoul',
    meta: 'May 21–24 • Jamsil',
    note: 'Confirmed hotel anchor for the second half of the Seoul stay.',
    state: 'booked',
  },
  {
    title: '본연',
    meta: 'May 21 • 7:00 PM • Seoul',
    note: 'Fine dining dinner reservation confirmed.',
    state: 'confirmed',
  },
  {
    title: 'Arrival-day headspa',
    meta: 'Late afternoon near 고덕역',
    note: 'Goodmona is full, so compare 숱하다 vs 단비 and book the more realistic slot.',
    state: 'needs decision',
  },
  {
    title: 'Nail / eyebrow',
    meta: 'Seongsu beauty block',
    note: 'Lock the appointment time first, then build lunch and shopping around it.',
    state: 'researching',
  },
  {
    title: 'Hair perm',
    meta: 'Soonsiki',
    note: 'Confirm exact time and buffer around embassy / transit.',
    state: 'to confirm',
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
  if (lower.includes('research')) return 'chip chip-gold'
  if (lower.includes('set') || lower.includes('anchor') || lower.includes('logistics')) return 'chip chip-sage'
  if (lower.includes('open')) return 'chip chip-mist'
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
  if (!KAKAO_JS_KEY) {
    return Promise.reject(new Error('Missing Kakao JavaScript key'))
  }

  if (window.kakao?.maps) {
    return Promise.resolve(window.kakao)
  }

  if (kakaoMapsPromise) {
    return kakaoMapsPromise
  }

  kakaoMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-kakao-maps="true"]')

    if (existingScript) {
      existingScript.addEventListener('load', () => {
        window.kakao.maps.load(() => resolve(window.kakao))
      })
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Kakao Maps SDK')))
      return
    }

    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false&libraries=services`
    script.async = true
    script.dataset.kakaoMaps = 'true'
    script.onload = () => {
      window.kakao.maps.load(() => resolve(window.kakao))
    }
    script.onerror = () => reject(new Error('Failed to load Kakao Maps SDK'))
    document.head.appendChild(script)
  })

  return kakaoMapsPromise
}

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [selectedDayKey, setSelectedDayKey] = useState(itineraryDays[1].key)
  const [mapStatus, setMapStatus] = useState(KAKAO_JS_KEY ? 'idle' : 'missing-key')
  const [resolvedMapTargets, setResolvedMapTargets] = useState([])
  const [mapNotice, setMapNotice] = useState('')
  const mapCanvasRef = useRef(null)

  const selectedDay = useMemo(
    () => itineraryDays.find((day) => day.key === selectedDayKey) ?? itineraryDays[0],
    [selectedDayKey],
  )

  const loggedSpend = useMemo(() => {
    return spend.reduce((sum, row) => sum + Number(row.amount.replace(/[$,]/g, '')), 0)
  }, [])

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
            (target) =>
              new Promise((resolve) => {
                if (target.coords) {
                  resolve({
                    ...target,
                    lat: target.coords.lat,
                    lng: target.coords.lng,
                    displayName: target.name,
                    found: true,
                  })
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

                    resolve({
                      ...target,
                      found: false,
                    })
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

          const marker = new kakao.maps.Marker({
            position,
            map,
            title: target.displayName,
          })

          overlayItems.push({ setMap: marker.setMap.bind(marker) })

          const badge = document.createElement('div')
          badge.className = 'map-marker-badge'
          badge.textContent = String(index + 1)

          const overlay = new kakao.maps.CustomOverlay({
            position,
            content: badge,
            yAnchor: 1.8,
          })
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
        setMapNotice('Kakao map did not load. If the key is valid, the remaining common cause is Kakao domain allowlist setup.')
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
          <div className="sidebar-top">
            <div className="eyebrow">SJ + TH • Korea • May 15–26</div>
            <h1>Korea Trip Together</h1>
            <p>
              Desktop-friendly now: each section is designed to fit in one wider view,
              while still staying easy on iPhone.
            </p>
          </div>

          <nav className="sidebar-nav">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? 'sidebar-btn active' : 'sidebar-btn'}
                onClick={() => setActiveTab(tab)}
              >
                <span>{tab === 'home' ? 'Home' : tab === 'itinerary' ? 'Itinerary' : tab === 'bookings' ? 'Bookings' : 'Spend'}</span>
                <small>
                  {tab === 'home'
                    ? 'trip overview'
                    : tab === 'itinerary'
                      ? 'hour-by-hour flow'
                      : tab === 'bookings'
                        ? 'decision list'
                        : 'simple totals'}
                </small>
              </button>
            ))}
          </nav>

          <div className="sidebar-foot">
            <div className="metric-pill">
              <span>Trip days shown</span>
              <strong>{itineraryDays.length}</strong>
            </div>
            <div className="metric-pill">
              <span>Open items</span>
              <strong>3</strong>
            </div>
          </div>
        </aside>

        <main className="content-shell">
          {activeTab === 'home' && (
            <section className="content-screen home-screen">
              <div className="hero-card glass-card">
                <div className="section-kicker">Trip command center</div>
                <div className="hero-grid-wide">
                  <div>
                    <h2>See the whole trip without living in mobile-scroll mode.</h2>
                    <p>
                      This version is meant to work better on desktop first: wider panels,
                      less stacking, and cleaner anchors for actual logistics.
                    </p>
                  </div>
                  <div className="metrics-grid desktop-metrics">
                    <div className="metric-card">
                      <span>Confirmed anchors</span>
                      <strong>2</strong>
                    </div>
                    <div className="metric-card">
                      <span>Need booking</span>
                      <strong>Headspa</strong>
                    </div>
                    <div className="metric-card">
                      <span>Logged spend</span>
                      <strong>${loggedSpend.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overview-grid">
                <section className="glass-card panel-card">
                  <div className="section-header">
                    <h3>Most urgent next</h3>
                    <span>one-month-out mode</span>
                  </div>
                  <div className="stack-list">
                    <article className="stack-item">
                      <strong>Arrival-day headspa</strong>
                      <p>Book a realistic late-afternoon slot near 고덕 so landing day stays gentle.</p>
                    </article>
                    <article className="stack-item">
                      <strong>Nail / eyebrow time</strong>
                      <p>Once this is fixed, the Seongsu day becomes easy to structure.</p>
                    </article>
                    <article className="stack-item">
                      <strong>Hour-by-hour route checks</strong>
                      <p>Use the itinerary tab to pressure-test if a day is actually smooth.</p>
                    </article>
                  </div>
                </section>

                <section className="glass-card panel-card">
                  <div className="section-header">
                    <h3>Current anchors</h3>
                    <span>already real</span>
                  </div>
                  <div className="anchor-grid">
                    <div className="anchor-card soft-cream">
                      <strong>May 21</strong>
                      <p>Sofitel check-in</p>
                      <span>Jamsil hotel base begins</span>
                    </div>
                    <div className="anchor-card soft-blue">
                      <strong>May 21 • 19:00</strong>
                      <p>본연 dinner</p>
                      <span>Confirmed reservation</span>
                    </div>
                    <div className="anchor-card soft-sage">
                      <strong>May 16</strong>
                      <p>Arrival + family lunch</p>
                      <span>Headspa should fit late afternoon</span>
                    </div>
                  </div>
                </section>
              </div>
            </section>
          )}

          {activeTab === 'itinerary' && (
            <section className="content-screen itinerary-screen">
              <header className="page-header wide-header">
                <div>
                  <h2 className="page-title">Hourly itinerary</h2>
                  <p>All trip dates are now visible, including open days, and each selected day can render on a live Kakao map.</p>
                </div>
                <span className="chip chip-gold">phase 2 map mode</span>
              </header>

              <div className="itinerary-summary-row">
                <div className="summary-mini glass-card">
                  <span>Visible trip range</span>
                  <strong>May 15–26</strong>
                </div>
                <div className="summary-mini glass-card">
                  <span>Days loaded</span>
                  <strong>{itineraryDays.length}</strong>
                </div>
                <div className="summary-mini glass-card">
                  <span>Selected day</span>
                  <strong>{selectedDay.date}</strong>
                </div>
              </div>

              <div className="day-picker-row">
                {itineraryDays.map((day) => (
                  <button
                    key={day.key}
                    className={selectedDay.key === day.key ? 'day-chip active' : 'day-chip'}
                    onClick={() => setSelectedDayKey(day.key)}
                  >
                    <strong>{day.date}</strong>
                    <span>{day.label}</span>
                  </button>
                ))}
              </div>

              <div className="itinerary-layout">
                <section className="glass-card timeline-panel">
                  <div className="section-header">
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
                          <div className="hour-header">
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
                    <div className="section-header">
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
                    <div className="section-header">
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
                    <div className="section-header">
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
              <header className="page-header wide-header">
                <div>
                  <h2 className="page-title">Bookings</h2>
                  <p>Only the items that still matter or anchor the trip.</p>
                </div>
                <span className="chip chip-rose">3 open</span>
              </header>

              <div className="booking-grid-wide">
                {bookings.map((item) => (
                  <article className="glass-card booking-card-wide" key={item.title}>
                    <div className="row-header">
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.meta}</p>
                      </div>
                      <span className={statusClass(item.state)}>{item.state}</span>
                    </div>
                    <div className="note-text">{item.note}</div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'spend' && (
            <section className="content-screen">
              <header className="page-header wide-header">
                <div>
                  <h2 className="page-title">Spend</h2>
                  <p>Still simple for now, but easier to scan on desktop.</p>
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
    </div>
  )
}

export default App
