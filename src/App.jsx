import './App.css'
import { useEffect, useMemo, useRef, useState } from 'react'

const tabs = ['home', 'bookings', 'places', 'itinerary']
const bookingVoteOptions = [
  { value: 'love', label: '💗 Love', savedLabel: 'Love' },
  { value: 'maybe', label: '🤔 Maybe', savedLabel: 'Maybe' },
  { value: 'pass', label: '✖ Pass', savedLabel: 'Pass' },
]
const plannerFilters = ['all', 'candidates', 'confirmed']
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
    label: 'Arrival day',
    area: 'ICN → family lunch → Jamsil',
    status: 'needs headspa booking',
    focus: 'Landing day still needs to stay gentle, but the likely beauty direction now points toward Jamsil rather than a quick local 고덕 option.',
    logistics: {
      start: 'ICN Airport',
      end: 'Jamsil-area headspa + easy evening',
      note: 'CI 160 lands at ICN 11:30 AM. Family lunch still happens first, then the day can drift toward Jamsil for EcoJardin if energy and timing cooperate.',
    },
    mapCenter: { lat: 37.5133, lng: 127.1022 },
    stops: [
      { time: '11:30', title: 'CI 160 lands at ICN', detail: 'Taipei to Seoul arrival; immigration, bags, and regroup without rushing.', neighborhood: 'Incheon Airport', type: 'anchor' },
      { time: '12:30–13:30', title: 'Meet parents + drive out', detail: 'Let your parents take the lead and avoid stacking commitments too tightly right after landing.', neighborhood: 'Airport pickup', type: 'transit' },
      { time: '14:00', title: 'Lunch at parents’ house', detail: 'Keep this as the true reset block before deciding how ambitious the afternoon should be.', neighborhood: '고덕역 home base', type: 'meal' },
      { time: 'Late afternoon', title: 'EcoJardin window in Jamsil', detail: 'If you both still want the premium scalp-spa route, this becomes the likely headspa direction instead of staying hyper-local.', neighborhood: 'Jamsil / Lotte World Tower area', type: 'beauty' },
      { time: 'Evening', title: 'Easy dinner / decompress', detail: 'Stay flexible depending on how the airport + family + headspa stack actually feels.', neighborhood: 'Seoul', type: 'meal' },
    ],
    mapTargets: [
      mapTarget('Parents’ house / 고덕역 area', 'Lunch and reset anchor', { query: '고덕역', coords: { lat: 37.5557, lng: 127.1542 } }),
      mapTarget('에코자르뎅 잠실롯데타워점', 'Likely premium headspa target', { query: '에코자르뎅 잠실롯데타워점', coords: { lat: 37.5125, lng: 127.1029 } }),
      mapTarget('Jamsil', 'Area anchor if the day pulls southeast', { query: '잠실', coords: { lat: 37.5133, lng: 127.1002 } }),
    ],
  }),
  itineraryDay({
    key: 'may-17',
    date: 'May 17',
    label: 'Seongsu beauty + shopping',
    area: 'Seongsu',
    status: 'mostly set',
    focus: 'Keep the whole day clustered in Seongsu so the viral shopping list feels walkable instead of spread across Seoul.',
    logistics: {
      start: '고덕 / east Seoul',
      end: 'Dinner back in Seoul',
      note: 'This day now has a real Seongsu brand cluster: Haus Nowhere, Olive Young Flagship, Tamburins, Blue Elephant, Musinsa Standard, and Tir Tir should be handled as one neighborhood loop.',
    },
    mapCenter: { lat: 37.5446, lng: 127.0557 },
    stops: [
      { time: '10:00', title: 'Leave home base', detail: 'Give yourselves a soft start so the day still feels like vacation.', neighborhood: '고덕 → Seongsu', type: 'transit' },
      { time: '11:00', title: 'Nail appointment', detail: 'Book the Sunday Seongsu nail shortlist first, then let the whole brand loop happen after.', neighborhood: 'Seongsu', type: 'beauty' },
      { time: '12:30', title: 'Haus Nowhere + Tamburins', detail: 'Start the brand loop with the Gentle Monster / Tamburins side of Seongsu while energy is highest.', neighborhood: 'Seongsu', type: 'shopping' },
      { time: '14:00', title: 'Olive Young + Musinsa Standard + Tir Tir', detail: 'Use the middle of the day for the beauty/shopping core and keep it walkable.', neighborhood: 'Seongsu', type: 'shopping' },
      { time: '16:00', title: 'Blue Elephant stop', detail: 'Leave a little flex here in case one of the viral places takes longer than expected.', neighborhood: 'Seongsu', type: 'shopping' },
      { time: '18:30', title: 'Dinner', detail: 'Either stay in Seongsu or move once with purpose.', neighborhood: 'Seoul', type: 'meal' },
    ],
    mapTargets: [
      mapTarget('Haus Nowhere Seongsu', 'Gentle Monster anchor stop', { query: '하우스 나우웨어 성수' }),
      mapTarget('Tamburins Seongsu', 'Beauty brand stop', { query: '탬버린즈 성수' }),
      mapTarget('Olive Young N Seongsu', 'Flagship beauty stop', { query: '올리브영N 성수' }),
      mapTarget('Musinsa Standard Seongsu', 'Clothing/basic shopping stop', { query: '무신사 스탠다드 성수' }),
      mapTarget('TIRTIR Seongsu', 'Beauty stop', { query: '티르티르 성수' }),
      mapTarget('Blue Elephant Seongsu', 'Eyewear stop', { query: '블루엘리펀트 성수' }),
    ],
  }),
  itineraryDay({
    key: 'may-18',
    date: 'May 18',
    label: 'Embassy + lunch + Hongdae perm',
    area: 'Gwanghwamun → Jongno → Hongdae',
    status: 'important day',
    focus: 'Protect the embassy interview first, then turn the day into one clean lunch-and-Hongdae flow instead of forcing the perm into the uncertain morning.',
    logistics: {
      start: 'U.S. Embassy Seoul',
      end: 'Hongdae / Hapjeong salon block',
      note: 'Best shape now is embassy first, then lunch in the Jongno/Gwanghwamun area, then move to Hongdae for an afternoon perm that can run 3–4 hours without stress.',
    },
    mapCenter: { lat: 37.5665, lng: 126.978 },
    stops: [
      { time: '08:15–08:25', title: 'Arrive for embassy buffer', detail: 'Get there early enough to protect the visa interview without adding a huge outside wait.', neighborhood: 'U.S. Embassy Seoul', type: 'anchor' },
      { time: '08:45', title: 'Embassy interview (you)', detail: 'This is the non-negotiable morning anchor.', neighborhood: 'Gwanghwamun', type: 'anchor' },
      { time: 'During interview', title: 'Girlfriend waits nearby', detail: 'Use a nearby cafe / waiting spot rather than trying to force the salon into the uncertain interview window.', neighborhood: 'Embassy area', type: 'beauty' },
      { time: 'After interview', title: 'Lunch regroup', detail: 'Eat first, then head west once the morning uncertainty is over.', neighborhood: 'Jongno / Gwanghwamun', type: 'meal' },
      { time: '13:00–14:00', title: 'Move to Hongdae / Hapjeong', detail: 'Use this as the transfer block before the afternoon salon appointment.', neighborhood: 'Jongno → Hongdae', type: 'transit' },
      { time: '14:00–18:00', title: 'Afternoon hair perm (girlfriend)', detail: 'Current salon stack is SOONSIKI first, then Park Seung Chol Hongdae, AMTON, or Aechae Hapjeong depending on preference and availability.', neighborhood: 'Hongdae / Hapjeong', type: 'beauty' },
    ],
    mapTargets: [
      mapTarget('US Embassy Seoul', 'Your important embassy task', { query: '주한미국대사관' }),
      mapTarget('Starbucks Ima Building', 'Easy wait point near the embassy', { query: '스타벅스 이마빌딩점' }),
      mapTarget('SOONSIKI Hair Hongdae', 'Preferred afternoon perm option', { query: '순시키헤어 홍대점' }),
      mapTarget('Park Seung Chol Hair Studio Hongdae', 'Mainstream Hongdae backup', { query: '박승철헤어스튜디오 홍대점' }),
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
    label: 'Last Jamsil-base day',
    area: 'Seoul',
    status: 'open planning day',
    focus: 'This still sits inside the quiet May 19–24 away-stretch framing, but the real location logic is Seoul/Jamsil rather than Jeju.',
    quietNote: 'Last day inside the broader away-stretch framing before the trip becomes visibly Seoul-only again.',
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
        thumbnail: 'https://placehold.co/240x160/f4ebe4/5f4636?text=Danni+Nail',
        youtube: '',
        instagram: '',
        note: 'Best safe pick for 5/17. Sunday hours were expanded and verified on Naver, reservation is live, and it is easy to anchor first before the rest of the Seongsu loop. English support is not explicitly stated, so send a short English 가능? note when booking.',
      },
      {
        place: '여리빈네일 성수점',
        area: '성수 / 왕십리로4길 23-1 3층 2호',
        pricing: '젤기본 35,000원~ · 매일 11:00–21:00 · 방문자 리뷰 2,663',
        thumbnail: 'https://placehold.co/240x160/e8edf7/253247?text=Yeoribin',
        youtube: '',
        instagram: '',
        note: 'Strongest review-volume option among the Sunday-open shortlist and both reservation + inquiry are surfaced on Naver. Best if she wants the safest mainstream pick with lots of proof, even if it feels a little less low-key than 단니네일.',
      },
      {
        place: '오호네일 성수',
        area: '성수 / 둘레9나길 7 1층',
        pricing: '손젤 40,000원 · 일 10:00–22:00 · 방문자 리뷰 222',
        thumbnail: 'https://placehold.co/240x160/f2e9de/5a4032?text=OHHO+Nail',
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
    title: 'Hongdae hair-perm shortlist',
    status: 'shortlist saved',
    lead: 'This is now a real girlfriend-facing shortlist rather than a placeholder timing board. The best current flow is embassy first, lunch second, then an early-afternoon Hongdae / Hapjeong perm block.',
    source: 'Discord shortlist + Naver local review / pricing scan + live itinerary update',
    recommendation: 'SOONSIKI Hongdae stays the emotional first choice. Park Seung Chol is the safest mainstream backup, AMTON is the premium validation backup, and Aechae Hapjeong is the best style/price balance.',
    mapCenter: { lat: 37.5552, lng: 126.9236 },
    mapLevel: 5,
    mapTargets: [
      mapTarget('SOONSIKI Hair Hongdae', 'Preferred branded Hongdae salon', { query: '순시키헤어 홍대점' }),
      mapTarget('Park Seung Chol Hair Studio Hongdae', 'Mainstream Hongdae backup', { query: '박승철헤어스튜디오 홍대점' }),
      mapTarget('AMTON Main Branch', 'Premium backup with heavy review volume', { query: '에이엠톤 본점' }),
      mapTarget('Aechae Hapjeong', 'Style / price balance backup', { query: '애채 합정' }),
    ],
    spotlights: [
      {
        title: 'SOONSIKI Hongdae',
        tag: 'Most desired',
        price: '180,000–210,000 KRW',
        verdict: 'Best if she wants the branded Hongdae look and is okay paying the premium.',
      },
      {
        title: 'Park Seung Chol Hongdae',
        tag: 'Safest backup',
        price: 'perm from ~63,000 KRW class / fringe perm listed lower',
        verdict: 'Strong review validation and the easiest mainstream backup if SOONSIKI feels too expensive.',
      },
      {
        title: 'AMTON Main Branch',
        tag: 'Premium validated',
        price: '150,000 KRW',
        verdict: 'Good if she wants a premium salon feel without going all the way to SOONSIKI pricing.',
      },
      {
        title: 'Aechae Hapjeong',
        tag: 'Best balance',
        price: '100,000 KRW',
        verdict: 'Best style / price compromise in the current shortlist.',
      },
    ],
    comparison: [
      {
        place: 'SOONSIKI Hair Hongdae',
        area: '홍대 / 양화로 164 8층',
        pricing: '콜드펌 180,000원 · 디지털/세팅펌 210,000원',
        thumbnail: 'https://placehold.co/240x160/f3e9ee/6f4361?text=SOONSIKI+Hongdae',
        youtube: 'https://www.youtube.com/results?search_query=%EC%88%9C%EC%8B%9C%ED%82%A4%ED%97%A4%EC%96%B4+%ED%99%8D%EB%8C%80%EC%A0%90',
        instagram: 'https://www.instagram.com/soonsiki.official/',
        note: 'Most branded / trend-forward option. Strong Korean local review signal too, not just foreigner traffic. Best if she wants the full Hongdae salon experience.',
      },
      {
        place: 'Park Seung Chol Hair Studio Hongdae',
        area: '홍대 / 어울마당로 135 3층',
        pricing: '앞머리펌 25,000원 · 앞머리열펌 30,000원 · earlier search also showed overall 펌 63,000원~',
        thumbnail: 'https://placehold.co/240x160/e8edf7/274060?text=Park+Seung+Chol',
        youtube: 'https://www.youtube.com/results?search_query=%EB%B0%95%EC%8A%B9%EC%B2%A0%ED%97%A4%EC%96%B4%EC%8A%A4%ED%8A%9C%EB%94%94%EC%98%A4+%ED%99%8D%EB%8C%80%EC%A0%90',
        instagram: '',
        note: 'Safest mainstream backup. Review volume is huge and women’s perm tags are strong. Best value-looking option of the group.',
      },
      {
        place: 'AMTON Main Branch',
        area: '홍대 / 잔다리로3안길 40',
        pricing: '펌 150,000원',
        thumbnail: 'https://placehold.co/240x160/ebe6f4/55477a?text=AMTON',
        youtube: 'https://www.youtube.com/results?search_query=%EC%97%90%EC%9D%B4%EC%97%A0%ED%86%A4+%EB%B3%B8%EC%A0%90',
        instagram: 'https://www.instagram.com/am.ton_bnm/',
        note: 'High-volume premium backup with the strongest review count among the alternatives. Good when safety / validation matters more than saving money.',
      },
      {
        place: 'Aechae Hapjeong',
        area: '합정 / 양화로7안길 12 1층',
        pricing: '일반펌 100,000원',
        thumbnail: 'https://placehold.co/240x160/e7f0ea/40604a?text=Aechae+Hapjeong',
        youtube: 'https://www.youtube.com/results?search_query=%EC%95%A0%EC%B1%84+%ED%95%A9%EC%A0%95',
        instagram: 'https://www.instagram.com/aechae.hwany',
        note: 'Best style / price compromise. Strong C컬 and 빌드펌 tags make it a very reasonable backup if SOONSIKI feels too expensive.',
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
        thumbnail: 'https://placehold.co/240x160/e9f2ee/234236?text=ReOne',
        youtube: 'https://www.youtube.com/@reoneskin',
        instagram: 'https://www.instagram.com/reone__dermatology/',
        note: 'Most trust-building social footprint. IG ~5.6K / 296 posts, multiple doctor-led YouTube channels, and public reviews repeatedly mention Sofwave / lifting satisfaction, texture improvement, and a quiet premium feel. Best if you want “real doctor vibe” over pure hype.',
      },
      {
        place: '룬피부과의원 청담',
        area: '청담 / 선릉로 822 5층',
        pricing: 'Premium consult pricing not clearly public; expect direct inquiry',
        thumbnail: 'https://placehold.co/240x160/e8edf7/253247?text=LUNN',
        youtube: '',
        instagram: 'https://www.instagram.com/lunnclinic_official/',
        note: 'More boutique and quieter than the others. IG ~1.4K / 57 posts. Public read is “specialist-led, tidy, precise, not overly loud.” Less mass-review proof than ReOne / Rest / Laurel, but strongest hidden-gem / non-factory energy.',
      },
      {
        place: '레스트의원',
        area: '청담 / 선릉로158길 12 3-4층',
        pricing: 'Premium consult pricing not clearly public; expect direct inquiry',
        thumbnail: 'https://placehold.co/240x160/f3efe6/5a4032?text=REST',
        youtube: 'https://www.youtube.com/@REST_clinic',
        instagram: 'https://www.instagram.com/rest_clinic_/',
        note: 'Best consult-experience read from public reviews. IG ~2.45K / 113 posts. Repeated comments mention 20-minute consults, doctor-direct explanations, kind staff, hotel-like interior, and premium service. Slightly busier than a tiny boutique, but still reads more bespoke than factory.',
      },
      {
        place: '로렐의원',
        area: '청담 / 선릉로152길 17 7층',
        pricing: 'Premium consult pricing not clearly public; expect direct inquiry',
        thumbnail: 'https://placehold.co/240x160/f3e8e8/5e3535?text=Laurel',
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
        thumbnail: 'https://placehold.co/240x160/e7f3ea/2f5b3f?text=May+23',
        youtube: '',
        instagram: '',
        note: 'Best day to act if ReOne gives a clear diagnosis and a simple standardized plan. This is the day to decide after a cafe debrief, not immediately after the consult chair.',
      },
      {
        place: '톡스앤필의원 강남본점',
        area: '강남역 10번 출구 122m / 강남대로 415',
        pricing: 'Event/pricing pages public + reservation flow available',
        thumbnail: 'https://placehold.co/240x160/e9eef7/274060?text=Toxnfill',
        youtube: 'https://www.youtube.com/results?search_query=%ED%86%A1%EC%8A%A4%EC%95%A4%ED%95%84+%EA%B0%95%EB%82%A8%EB%B3%B8%EC%A0%90',
        instagram: 'https://www.gangnamunni.com/hospitals/3702',
        note: 'Best practical follow-up option. Reservation button visible, dedicated reservation page, Modoodoc 178 certified reviews / 4.1, GangnamUnni 992 reviews. Good for botox, skin booster, toning, and other more standardized treatments after the consult.',
      },
      {
        place: '청담 밴스의원',
        area: '압구정로데오역 4번 출구 바로 앞 / 선릉로 822 3층',
        pricing: 'Reservation open; public event-style pricing flow likely',
        thumbnail: 'https://placehold.co/240x160/f2ece3/6a5337?text=Vands',
        youtube: 'https://www.youtube.com/results?search_query=%EC%B2%AD%EB%8B%B4+%EB%B0%B4%EC%8A%A4%EC%9D%98%EC%9B%90',
        instagram: 'https://cheongdam.vandsclinic.co.kr/',
        note: 'Cleaner-feeling high-volume clinic. Reservation visible, weekday 10–8, weekend 10–6, no lunch break, and public search shows ~662 visitor reviews / 3,734 blog reviews. Strong if you want a last-minute slot without going fully bargain-factory.',
      },
      {
        place: 'Sun 5/24 — Buddha’s Birthday holiday backup',
        area: 'Use only if Saturday misses',
        pricing: 'Holiday / Sunday availability may narrow options',
        thumbnail: 'https://placehold.co/240x160/f3eee6/6b5640?text=May+24',
        youtube: '',
        instagram: '',
        note: 'May 24 is confirmed as 부처님 오신 날. Cheongdam Vands is the best live backup from current research because Sunday hours are publicly shown; other clinics may be less predictable.',
      },
      {
        place: 'BLS의원 본점',
        area: '청담권',
        pricing: 'Likely premium-volume mix; direct inquiry still best',
        thumbnail: 'https://placehold.co/240x160/efe8f4/5a4068?text=BLS',
        youtube: 'https://www.youtube.com/results?search_query=BLS%EC%9D%98%EC%9B%90+%EB%B3%B8%EC%A0%90',
        instagram: '',
        note: 'Bigger-volume but still not random/dirty-feeling. Public search showed ~2,290 visitor reviews and 5,443 blog reviews. Better for efficient execution than for delicate first-time aesthetic judgment.',
      },
      {
        place: '리더스피부과 청담도산대로점',
        area: '청담 도산대로권',
        pricing: 'Direct inquiry recommended',
        thumbnail: 'https://placehold.co/240x160/e6edf0/36505b?text=Leaders',
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
    key: 'seongsu-viral-loop',
    title: 'May 17 Seongsu viral loop',
    area: 'Seongsu',
    status: 'ready to route',
    lead: 'Core Seongsu saves for the May 17 beauty + shopping day.',
    logistics: {
      start: 'Seongsu arrival after beauty appointment',
      end: 'Dinner from the same side of the city',
      note: 'This cluster is best handled as one walking loop. The main goal is to keep the viral/brand stops dense so you are not bouncing across Seoul.',
    },
    source: 'Shared saved list / Instagram-inspired brand stops',
    importNote: 'Best first real Places board because it already belongs to a fixed itinerary day.',
    mapCenter: { lat: 37.5446, lng: 127.0557 },
    mapLevel: 5,
    entries: [
      { place: 'Haus Nowhere', area: 'Seongsu', vibe: 'Gentle Monster anchor stop', note: 'Good first stop in the Seongsu brand loop.', naverUrl: 'https://map.naver.com/p/search/%ED%95%98%EC%9A%B0%EC%8A%A4%20%EB%82%98%EC%9A%B0%EC%9B%A8%EC%96%B4%20%EC%84%B1%EC%88%98', kakaoUrl: 'https://map.kakao.com/?q=%ED%95%98%EC%9A%B0%EC%8A%A4%20%EB%82%98%EC%9A%B0%EC%9B%A8%EC%96%B4%20%EC%84%B1%EC%88%98' },
      { place: 'Olive Young Flagship', area: 'Seongsu', vibe: 'Beauty / practical haul', note: 'Easy mid-loop beauty stop.', naverUrl: 'https://map.naver.com/p/search/%EC%98%AC%EB%A6%AC%EB%B8%8C%EC%98%81N%20%EC%84%B1%EC%88%98', kakaoUrl: 'https://map.kakao.com/?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%EC%98%81N%20%EC%84%B1%EC%88%98' },
      { place: 'Tamburins', area: 'Seongsu', vibe: 'Beauty brand stop', note: 'Pairs naturally with the Gentle Monster side.', naverUrl: 'https://map.naver.com/p/search/%ED%83%AC%EB%B2%84%EB%A6%B0%EC%A6%88%20%EC%84%B1%EC%88%98', kakaoUrl: 'https://map.kakao.com/?q=%ED%83%AC%EB%B2%84%EB%A6%B0%EC%A6%88%20%EC%84%B1%EC%88%98' },
      { place: 'Blue Elephant', area: 'Seongsu', vibe: 'Eyewear stop', note: 'Keep as flex depending on time and try-on energy.', naverUrl: 'https://map.naver.com/p/search/%EB%B8%94%EB%A3%A8%EC%97%98%EB%A6%AC%ED%8E%80%ED%8A%B8%20%EC%84%B1%EC%88%98', kakaoUrl: 'https://map.kakao.com/?q=%EB%B8%94%EB%A3%A8%EC%97%98%EB%A6%AC%ED%8E%80%ED%8A%B8%20%EC%84%B1%EC%88%98' },
      { place: 'Musinsa Standard', area: 'Seongsu', vibe: 'Core shopping stop', note: 'Useful basics / browsing block.', naverUrl: 'https://map.naver.com/p/search/%EB%AC%B4%EC%8B%A0%EC%82%AC%20%EC%8A%A4%ED%83%A0%EB%8B%A4%EB%93%9C%20%EC%84%B1%EC%88%98', kakaoUrl: 'https://map.kakao.com/?q=%EB%AC%B4%EC%8B%A0%EC%82%AC%20%EC%8A%A4%ED%83%A0%EB%8B%A4%EB%93%9C%20%EC%84%B1%EC%88%98' },
      { place: 'Tir Tir', area: 'Seongsu', vibe: 'Beauty stop', note: 'Fold into the same walking sequence as Olive Young if possible.', naverUrl: 'https://map.naver.com/p/search/%ED%8B%B0%EB%A5%B4%ED%8B%B0%EB%A5%B4%20%EC%84%B1%EC%88%98', kakaoUrl: 'https://map.kakao.com/?q=%ED%8B%B0%EB%A5%B4%ED%8B%B0%EB%A5%B4%20%EC%84%B1%EC%88%98' },
    ],
    mapTargets: [
      mapTarget('Haus Nowhere Seongsu', 'Gentle Monster anchor stop', { query: '하우스 나우웨어 성수' }),
      mapTarget('Tamburins Seongsu', 'Beauty brand stop', { query: '탬버린즈 성수' }),
      mapTarget('Olive Young N Seongsu', 'Flagship beauty stop', { query: '올리브영N 성수' }),
      mapTarget('Musinsa Standard Seongsu', 'Clothing/basic shopping stop', { query: '무신사 스탠다드 성수' }),
      mapTarget('TIRTIR Seongsu', 'Beauty stop', { query: '티르티르 성수' }),
      mapTarget('Blue Elephant Seongsu', 'Eyewear stop', { query: '블루엘리펀트 성수' }),
    ],
  },
  {
    key: 'viral-saves-inbox',
    title: 'Viral saves inbox',
    area: 'Seoul / Jeju',
    status: 'ready for import',
    lead: 'A holding board for places pulled from Instagram posts and reels before they are assigned to a day.',
    logistics: {
      start: 'Unsorted saved places',
      end: 'Sorted by neighborhood / day',
      note: 'Use this as the intake layer first, then move places into a real cluster once enough saves collect in one neighborhood.',
    },
    source: 'Instagram posts / reels / manual paste',
    importNote: 'Next step: I can turn pasted reel links, captions, or copied lists into place cards here and keep them map-linked.',
    mapCenter: { lat: 37.5665, lng: 126.978 },
    mapLevel: 8,
    entries: [
      { place: 'Paste reels or captions here later', area: 'Any neighborhood', vibe: 'Import queue', note: 'Jin can parse saved place names out of lists, captions, or links and drop them into this tab.', naverUrl: 'https://map.naver.com/p/search/%EC%84%9C%EC%9A%B8', kakaoUrl: 'https://map.kakao.com/?q=%EC%84%9C%EC%9A%B8' },
      { place: 'K-beauty foundation match (exact venue TBD)', area: 'Seoul / Korea TBD', vibe: 'Beauty booking lead', note: 'From Mandy Serafina reel. Public caption suggests a Korea bookable foundation shade-match / beauty consult, but the exact clinic or studio name is not readable yet from the public reel page.', instagramUrl: 'https://www.instagram.com/reel/DUHKa4LEw7E/?igsh=NTc4MTIwNjQ2YQ==', naverUrl: 'https://map.naver.com/p/search/%EC%84%9C%EC%9A%B8%20%EB%B7%B0%ED%8B%B0', kakaoUrl: 'https://map.kakao.com/?q=%EC%84%9C%EC%9A%B8%20%EB%B7%B0%ED%8B%B0' },
      { place: 'Then regroup by area', area: 'Seongsu / Jamsil / Jeju / etc.', vibe: 'Logistics pass', note: 'Once a cluster is obvious, it can become its own board with a dedicated map.', naverUrl: 'https://map.naver.com/p/search/%EC%A0%9C%EC%A3%BC', kakaoUrl: 'https://map.kakao.com/?q=%EC%A0%9C%EC%A3%BC' },
    ],
    mapTargets: [
      mapTarget('Seoul', 'Default city anchor for unsorted Seoul saves', { query: '서울', coords: { lat: 37.5665, lng: 126.978 } }),
      mapTarget('Jeju', 'Default island anchor for unsorted Jeju saves', { query: '제주', coords: { lat: 33.4996, lng: 126.5312 } }),
    ],
  },
]

const spend = [
  { item: 'Flights', detail: 'China Airlines long-haul roundtrip for both', amount: '$960' },
  { item: 'Jeju flight', detail: 'Jeju Air 7C115 / 7C114 for both', amount: '$200' },
  { item: 'Rental car', detail: 'Kona 2nd gen EV · 5/19 13:00 → 5/21 10:00', amount: '$35' },
  { item: 'Activity', detail: 'Imported activity / beach cost', amount: '$160' },
]

const todoRules = {
  'headspa': { label: 'Book arrival-day headspa', dueDate: '2026-05-10', priority: 1 },
  'nail-brow': { label: 'Finish nail / eyebrow shortlist', dueDate: '2026-05-11', priority: 2 },
  'hair-perm': { label: 'Pick Hongdae salon + confirm afternoon perm', dueDate: '2026-05-12', priority: 3 },
  'derm': { label: 'ReOne consult booked — decide on follow-up treatment clinic', dueDate: '2026-05-22', priority: 4 },
}

const dayPlannerTemplates = {
  'may-17': [
    { id: 'nail', time: '11:00', title: 'Nail appointment', note: 'Fixed anchor', type: 'confirmed', targetNames: [] },
    { id: 'haus', time: '12:30', title: 'Haus Nowhere', note: 'Candidate → confirm', type: 'candidate', targetNames: ['Haus Nowhere Seongsu'] },
    { id: 'olive-musinsa', time: '14:00', title: 'Olive Young + Musinsa', note: 'Confirmed cluster', type: 'confirmed', targetNames: ['Tamburins Seongsu', 'Olive Young N Seongsu', 'Musinsa Standard Seongsu'] },
    { id: 'blue', time: '16:00', title: 'Blue Elephant', note: 'Maybe / flex', type: 'candidate', targetNames: ['Blue Elephant Seongsu'] },
    { id: 'dinner', time: '18:30', title: 'Dinner', note: 'Confirmed end anchor', type: 'confirmed', targetNames: [] },
  ],
}

function normalizeToken(value) {
  return value.toLowerCase().replace(/[^a-z0-9가-힣]+/g, ' ').trim()
}

function buildPlannerItems(day) {
  const template = dayPlannerTemplates[day.key]

  if (template) return template

  return day.stops.map((stop, index) => ({
    id: `${day.key}-${index}`,
    time: stop.time,
    title: stop.title,
    note: stop.type === 'anchor' || stop.type === 'hotel' ? 'Fixed anchor' : stop.type === 'transit' ? 'Transit / keep flexible' : 'Candidate → confirm',
    type: stop.type === 'anchor' || stop.type === 'hotel' || stop.type === 'meal' ? 'confirmed' : 'candidate',
    targetNames: day.mapTargets
      .filter((target) => normalizeToken(stop.title).includes(normalizeToken(target.name).split(' ')[0]))
      .map((target) => target.name),
  }))
}

function buildAssignedPlaceItems(dayKey, assignments) {
  return placeGroups
    .filter((group) => assignments[group.key] === dayKey)
    .map((group) => ({
      id: `assigned-${group.key}`,
      time: 'Flex',
      title: group.title,
      note: `Assigned from Schedule · ${group.area}`,
      type: 'candidate',
      targetNames: group.mapTargets.map((target) => target.name),
    }))
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
  const [activeTab, setActiveTab] = useState('home')
  const [selectedDayKey, setSelectedDayKey] = useState('may-17')
  const [selectedPlaceKey, setSelectedPlaceKey] = useState('viral-saves-inbox')
  const [selectedBookingKey, setSelectedBookingKey] = useState('hair-perm')
  const [assignedPlaceDays, setAssignedPlaceDays] = useState(() => {
    const stored = window.localStorage.getItem('korea-trip-place-days')

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
  const mapCanvasRef = useRef(null)
  const swipeStartRef = useRef({})

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

  const selectedDayPlanner = useMemo(() => {
    const baseItems = [
      ...buildPlannerItems(selectedDay),
      ...buildAssignedPlaceItems(selectedDay.key, assignedPlaceDays),
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
  }, [assignedPlaceDays, plannerOrder, plannerOverrides, selectedDay])

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
      }
    })
  }, [])

  const unscheduledPlaceGroups = useMemo(
    () => placeGroups.filter((group) => !assignedPlaceDays[group.key]),
    [assignedPlaceDays],
  )

  const dayBucketGroups = useMemo(
    () => itineraryCalendarDays.map((day) => ({
      ...day,
      groups: placeGroups.filter((group) => assignedPlaceDays[group.key] === day.key),
    })),
    [assignedPlaceDays, itineraryCalendarDays],
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

  const mapSource = activeTab === 'itinerary'
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

      return [{
        key: board.key,
        type: 'Research',
        title: board.title,
        detail: matchedOption?.place || board.recommendation,
        action: () => {
          setSelectedBookingKey(board.key)
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
        const mapContextLabel = activeTab === 'itinerary'
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
              <div className="eyebrow">SJ + TH • Korea • May 15–26</div>
              <h1>Korea Trip May 15-26</h1>
            </div>
            <button
              className="theme-toggle"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              {theme === 'light' ? 'Dark mode' : 'Light mode'}
            </button>
          </div>

          <nav className="sidebar-nav desktop-only">
            {tabs.map((tab) => {
              const tabLabel = tab === 'home' ? 'Home' : tab === 'bookings' ? 'Compare' : tab === 'places' ? 'Schedule' : 'Itinerary'
              return (
              <button key={tab} aria-label={tabLabel} className={activeTab === tab ? 'sidebar-btn active' : 'sidebar-btn'} onClick={() => setActiveTab(tab)}>
                <span>{tabLabel}</span>
                <small>
                  {tab === 'home'
                    ? 'search + trip overview'
                    : tab === 'bookings'
                      ? 'pick the best option'
                      : tab === 'places'
                        ? 'assign a day'
                        : 'yes / no + flow'}
                </small>
              </button>
            )})}
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
            <section className="content-screen search-home-screen">
              <div className="search-hero-card glass-card">
                <div className="search-hero-overlay">
                  <div className="search-hero-copy-block">
                    <span className="search-hero-kicker">Korea Trip</span>
                    <p className="search-hero-tagline">Seoul & Jeju beauty trip in May</p>
                    <h2 className="search-hero-title">Search the trip</h2>
                    <p className="search-hero-copy">Build the trip from Compare, sort it in Schedule, and turn it into a beautiful final Itinerary.</p>
                  </div>

                  <div className="search-card hero-search-card">
                    <input
                      className="trip-search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search Seongsu, Jamsil, ReOne, headspa, Jeju..."
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

                  <div className="search-home-chip-row">
                    <button className="hero-pill" onClick={() => setActiveTab('bookings')}>Compare</button>
                    <button className="hero-pill" onClick={() => setActiveTab('places')}>Schedule</button>
                    <button className="hero-pill" onClick={() => setActiveTab('itinerary')}>Itinerary</button>
                  </div>
                </div>
              </div>

              <div className="home-destination-grid">
                <article className="glass-card destination-mood-card destination-seoul-card">
                  <div className="destination-mood-overlay">
                    <span className="destination-label">Seoul</span>
                    <strong>City of K-Beauty & Culture</strong>
                    <p>Beauty appointments, shopping loops, cafes, and polished city energy.</p>
                  </div>
                </article>

                <article className="glass-card destination-mood-card destination-jeju-card">
                  <div className="destination-mood-overlay">
                    <span className="destination-label">Jeju</span>
                    <strong>Island of Nature & Healing</strong>
                    <p>Coastal resets, scenic drives, flower fields, and softer open-air pacing.</p>
                  </div>
                </article>
              </div>

              <div className="home-brief-grid search-home-grid">
                <section className="glass-card decision-card home-flow-card">
                  <div className="section-header stacked-mobile">
                    <div>
                      <span className="search-type">Suggested flow</span>
                      <h3>Compare → Schedule → Itinerary</h3>
                      <p>{candidateTargets.length} candidate stops are waiting in Itinerary once a day is assigned.</p>
                    </div>
                    <button
                      className="primary-action-btn"
                      onClick={() => {
                        setSelectedDayKey(nextDecisionDay.key)
                        setPlannerFilter('confirmed')
                        setActiveTab('itinerary')
                      }}
                    >
                      Open Itinerary
                    </button>
                  </div>
                </section>

                <section className="glass-card mini-list-card warm-card">
                  <div className="section-header">
                    <h3>Compare first</h3>
                  </div>
                  <p className="support-copy">Choose the best contender inside one theme before you start placing things into dates.</p>
                </section>

                <section className="glass-card mini-list-card cool-card">
                  <div className="section-header">
                    <h3>Schedule second</h3>
                  </div>
                  <p className="support-copy">Drag unscheduled ideas into a day bucket once the neighborhood and day feel right.</p>
                </section>

                <section className="glass-card mini-list-card blush-card">
                  <div className="section-header">
                    <h3>Itinerary last</h3>
                  </div>
                  <p className="support-copy">Shape the final day flow with yes / no decisions, timing, and map-aware route order.</p>
                </section>
              </div>
            </section>
          )}

          {activeTab === 'itinerary' && (
            <section className="content-screen map-planner-screen">
              <header className="page-header wide-header stacked-mobile itinerary-header-card glass-card">
                <div>
                  <span className="search-type">Final day plan</span>
                  <h2 className="page-title">{selectedDay.date} · {selectedDay.area}</h2>
                  <p>Itinerary is where dated items become a real yes / no plan with map order.</p>
                </div>
                <span className="chip chip-gold">itinerary planner</span>
              </header>

              <div className="day-picker-row calendar-day-grid">
                {itineraryCalendarDays.map((day) => (
                  <button key={day.key} className={selectedDay.key === day.key ? 'day-chip active' : 'day-chip'} onClick={() => setSelectedDayKey(day.key)}>
                    <span className="day-chip-weekday">{day.weekday}</span>
                    <strong>{day.date}</strong>
                    <span>{day.label}</span>
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
                  <div className="section-header stacked-mobile">
                    <div>
                      <h3>Timeline + toggle list</h3>
                      <p>Swipe right for Yes, swipe left for No, or drag rows up and down to change the time order. The map auto-syncs immediately.</p>
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
                          <small>Drag to reorder</small>
                        </div>
                        <div className="planner-axis" />
                        {item.type === 'candidate' ? (
                          <>
                            <div className="planner-card planner-card-candidate">
                              <span className="planner-state-label">No</span>
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
            <section className="content-screen places-screen">
              <header className="page-header wide-header stacked-mobile">
                <div>
                  <h2 className="page-title">Schedule sorter</h2>
                  <p>Keep this tab simple: drag unscheduled items into a day bucket. That is the whole job.</p>
                </div>
                <span className="chip chip-gold">drag to assign</span>
              </header>

              <section className="schedule-sorter-layout">
                <div
                  className="glass-card schedule-inbox-panel"
                  aria-label="Drop places back into unscheduled list"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleScheduleDrop('', event)}
                >
                  <div className="section-header stacked-mobile">
                    <div>
                      <h3>Unscheduled list</h3>
                      <p>Anything from Compare or viral saves can live here until a date feels obvious.</p>
                    </div>
                    <span className="chip chip-soft">{unscheduledPlaceGroups.length} waiting</span>
                  </div>

                  <div className="schedule-group-list">
                    {unscheduledPlaceGroups.length ? (
                      unscheduledPlaceGroups.map((group) => (
                        <article
                          key={group.key}
                          className="schedule-group-card"
                          aria-label={`Drag ${group.title}`}
                          draggable
                          onDragStart={(event) => handleScheduleDragStart(group.key, event)}
                        >
                          <div className="schedule-group-handle" aria-hidden="true">⋮⋮</div>
                          <div>
                            <strong>{group.title}</strong>
                            <p>{group.lead}</p>
                            <small>{group.area} · {group.entries.length} saved item{group.entries.length > 1 ? 's' : ''}</small>
                          </div>
                        </article>
                      ))
                    ) : (
                      <div className="empty-state">Everything has a day right now. Drag an item back here anytime if you want to unschedule it.</div>
                    )}
                  </div>
                </div>

                <div className="glass-card schedule-buckets-panel">
                  <div className="section-header stacked-mobile">
                    <div>
                      <h3>Day buckets</h3>
                      <p>Drop a place group into the day you want. It will then appear in Itinerary for that date.</p>
                    </div>
                    <span className="chip chip-soft">simple assignment board</span>
                  </div>

                  <div className="schedule-day-buckets">
                    {dayBucketGroups.map((day) => (
                      <section
                        key={day.key}
                        className="schedule-day-bucket"
                        aria-label={`Drop places into ${day.date}`}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => handleScheduleDrop(day.key, event)}
                      >
                        <div className="schedule-day-header">
                          <div>
                            <span>{day.weekday}</span>
                            <h4>{day.date}</h4>
                          </div>
                          <button
                            className="bucket-open-btn"
                            onClick={() => {
                              setSelectedDayKey(day.key)
                              setActiveTab('itinerary')
                            }}
                          >
                            Open Itinerary
                          </button>
                        </div>

                        <div className="schedule-day-items">
                          {day.groups.length ? (
                            day.groups.map((group) => (
                              <article
                                key={group.key}
                                className="schedule-day-card"
                                aria-label={`Drag ${group.title}`}
                                draggable
                                onDragStart={(event) => handleScheduleDragStart(group.key, event)}
                              >
                                <strong>{group.title}</strong>
                                <p>{group.area}</p>
                              </article>
                            ))
                          ) : (
                            <div className="empty-state compact-empty-state">Drop here to assign this day.</div>
                          )}
                        </div>
                      </section>
                    ))}
                  </div>
                </div>
              </section>
            </section>
          )}

          {activeTab === 'bookings' && (
            <section className="content-screen">
              <header className="page-header wide-header stacked-mobile">
                <div>
                  <h2 className="page-title">Compare options</h2>
                  <p>Use this tab only when one theme still has multiple contenders and you need to decide which option wins.</p>
                </div>
                <span className="chip chip-gold">compare by theme</span>
              </header>

              <div className="research-accordion-list">
                {researchBoards.map((board) => (
                  <details className="glass-card research-accordion" key={board.key} onToggle={(event) => {
                    if (event.currentTarget.open) {
                      setSelectedBookingKey(board.key)
                    }
                  }}>
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

                      <div className="research-recommendation compare-winner-card">
                        <span>Current winner</span>
                        <strong>{board.recommendation}</strong>
                      </div>

                      {board.spotlights?.length ? (
                        <div className="option-list booking-shortlist-grid compare-spotlight-grid">
                          {board.spotlights.map((spotlight) => (
                            <article className="option-card shortlist-card compare-spotlight-card" key={board.key + spotlight.title}>
                              <span className="chip chip-soft">{spotlight.tag}</span>
                              <strong>{spotlight.title}</strong>
                              <p>{spotlight.verdict}</p>
                              <small>{spotlight.price}</small>
                            </article>
                          ))}
                        </div>
                      ) : null}

                      <div className="compare-contenders-block">
                        <div className="section-header stacked-mobile compare-contenders-header">
                          <div>
                            <h3>All contenders</h3>
                            <p>Scan the full shortlist as cards first, then vote directly on the option you want to keep alive.</p>
                          </div>
                        </div>

                        <div className="comparison-card-grid">
                          {board.comparison.map((option) => {
                            const voteKey = `${board.key}::${option.place}`
                            const activeVote = bookingVotes[voteKey]
                            const activeVoteLabel = bookingVoteOptions.find((item) => item.value === activeVote)?.savedLabel

                            return (
                              <article className="comparison-option-card" key={board.key + option.place}>
                                <img className="comparison-thumb comparison-card-thumb" src={option.thumbnail} alt={option.place} />
                                <div className="comparison-option-main">
                                  <div className="comparison-option-header">
                                    <div>
                                      <strong>{option.place}</strong>
                                      <p>{option.area}</p>
                                    </div>
                                    <span className="chip chip-soft comparison-price-chip">{option.pricing}</span>
                                  </div>

                                  <p className="comparison-option-note">{option.note}</p>

                                  <div className="comparison-option-footer">
                                    <div className="comparison-links comparison-links-row">
                                      {option.instagram ? <a href={option.instagram} target="_blank" rel="noreferrer">Instagram</a> : null}
                                      {option.youtube ? <a href={option.youtube} target="_blank" rel="noreferrer">YouTube</a> : null}
                                    </div>

                                    <div className="vote-stack comparison-vote-stack">
                                      <div className="vote-chip-row">
                                        {bookingVoteOptions.map((vote) => {
                                          const isActive = activeVote === vote.value

                                          return (
                                            <button
                                              key={vote.value}
                                              type="button"
                                              className={`vote-chip${isActive ? ' active' : ''}`}
                                              onClick={() => toggleBookingVote(board.key, option.place, vote.value)}
                                            >
                                              {vote.label}
                                            </button>
                                          )
                                        })}
                                      </div>
                                      <small>{activeVoteLabel ? `Saved on this device: ${activeVoteLabel}` : 'Tap to mark a favorite.'}</small>
                                    </div>
                                  </div>
                                </div>
                              </article>
                            )
                          })}
                        </div>
                      </div>

                      {board.mapTargets && selectedBookingBoard.key === board.key ? (
                        <div className="research-map-stack">
                          <div className="glass-card logistics-card map-card">
                            <div className="section-header stacked-mobile">
                              <h3>Kakao map</h3>
                              <span>{mapStatus === 'ready' ? 'interactive' : 'loading / fallback'}</span>
                            </div>
                            <div ref={mapCanvasRef} className="map-canvas" />
                            <p className="map-footnote">{mapNotice}</p>
                            <div className="resolved-list">
                              {(resolvedMapTargets.length ? resolvedMapTargets : board.mapTargets).map((target, index) => (
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
                              {board.mapTargets.map((target) => (
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
                        </div>
                      ) : null}
                    </div>
                  </details>
                ))}
              </div>
              <div className="support-note wide-note">The hair-perm board is now a real Hongdae shortlist with pricing, map links, and tap-to-vote chips saved per device. Nail / eyebrow, headspa, and dermatology also have live comparison boards.</div>
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
        {tabs.map((tab) => {
          const tabLabel = tab === 'home' ? 'Home' : tab === 'bookings' ? 'Compare' : tab === 'places' ? 'Schedule' : 'Itinerary'
          return (
          <button key={tab} aria-label={tabLabel} className={activeTab === tab ? 'mobile-tab active' : 'mobile-tab'} onClick={() => setActiveTab(tab)}>
            <span>{tab === 'home' ? 'H' : tab === 'bookings' ? 'C' : tab === 'places' ? 'S' : 'I'}</span>
            <small>{tabLabel}</small>
          </button>
        )})}
      </nav>
    </div>
  )
}

export { reorderPlannerItems }
export default App
