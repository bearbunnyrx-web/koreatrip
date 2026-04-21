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
    label: 'Embassy-important split day',
    area: 'Seoul',
    status: 'important day',
    focus: 'This is an important split day: you need the embassy anchor, while your girlfriend handles her hair perm separately in parallel.',
    logistics: {
      start: 'Embassy appointment zone',
      end: 'Flexible Seoul regroup',
      note: 'The day matters more than a normal admin day because the embassy piece is yours specifically, while her main parallel anchor is the hair perm.',
    },
    mapCenter: { lat: 37.5665, lng: 126.978 },
    stops: [
      { time: '08:30', title: 'Embassy appointment (you)', detail: 'This is your non-negotiable personal anchor, so the whole morning should protect it.', neighborhood: 'Embassy area', type: 'anchor' },
      { time: '09:30–12:30', title: 'Hair perm window (girlfriend)', detail: 'While you are at the embassy, she can use this as her separate parallel anchor.', neighborhood: 'Soonsiki / salon area', type: 'beauty' },
      { time: '13:00', title: 'Late lunch regroup', detail: 'Regroup after the separate morning blocks before deciding how much else to do.', neighborhood: 'Nearby Seoul neighborhood', type: 'meal' },
      { time: 'Afternoon', title: 'Open Seoul block', detail: 'Use this only after the embassy and perm timing both finish cleanly.', neighborhood: 'Seoul', type: 'shopping' },
    ],
    mapTargets: [
      mapTarget('Soonsiki Hair', 'Girlfriend hair-perm anchor', { query: '순시키 헤어' }),
      mapTarget('US Embassy Seoul', 'Your important embassy task', { query: '주한미국대사관' }),
    ],
  }),
  itineraryDay({
    key: 'may-19',
    date: 'May 19',
    label: 'Jeju start day',
    area: 'Gimpo → Jeju',
    status: 'travel anchor',
    focus: 'This is the real Jeju start, even though the family-facing version of the plan keeps a broader May 19–24 “Jeju stretch” vibe.',
    logistics: {
      start: 'Gimpo Airport',
      end: 'Jeju rental-car pickup',
      note: 'Jeju Air 7C115 departs GMP at 11:35 AM on Tue May 19. After landing, you need the airport shuttle to 특별한렌트카 before picking up the Kona EV at 1:00 PM.',
    },
    mapCenter: { lat: 33.4996, lng: 126.5312 },
    stops: [
      { time: 'Morning', title: 'Head to Gimpo', detail: 'Treat this as the real travel morning into the Jeju segment.', neighborhood: 'Seoul → GMP', type: 'transit' },
      { time: '11:35', title: 'Jeju Air 7C115 departs Gimpo', detail: 'This is the actual start of the Jeju flight segment for both of you. Checked bag: 15 kg.', neighborhood: 'GMP → CJU', type: 'anchor' },
      { time: 'After landing', title: 'Shuttle to 특별한렌트카', detail: 'Take the rental shuttle from Jeju Airport to the car pickup office at 제주특별자치도 제주시 공항로1길 38.', neighborhood: 'Jeju Airport → rental shuttle', type: 'transit' },
      { time: '13:00', title: 'Pick up Kona 2nd gen EV', detail: 'Rental window begins here and runs until May 21 at 10:00 AM.', neighborhood: '특별한렌트카', type: 'anchor' },
      { time: 'Evening', title: 'Simple Jeju first night', detail: 'Let the day stay easy after the transfer and car pickup.', neighborhood: 'Jeju', type: 'meal' },
    ],
    mapTargets: [
      mapTarget('Gimpo International Airport', 'Jeju departure airport', { query: '김포국제공항', coords: { lat: 37.5583, lng: 126.7906 } }),
      mapTarget('Jeju International Airport', 'Jeju arrival anchor', { coords: { lat: 33.5104, lng: 126.4914 } }),
      mapTarget('특별한렌트카', 'Rental-car pickup office', { query: '제주특별자치도 제주시 공항로1길 38', coords: { lat: 33.5049, lng: 126.4926 } }),
    ],
  }),
  itineraryDay({
    key: 'may-20',
    date: 'May 20',
    label: 'Jeju full day',
    area: 'Jeju',
    status: 'travel logistics',
    focus: 'This is the only true full Jeju day in the middle of the trip, so it should feel distinct from the Seoul/Jamsil stretch that follows.',
    logistics: {
      start: 'Kona EV active rental window',
      end: 'Jeju evening',
      note: 'Kona 2nd gen EV is actively with you through this whole day; keep the island plan built around the car and charging realism.',
    },
    mapCenter: { lat: 33.4996, lng: 126.5312 },
    stops: [
      { time: 'Morning', title: 'Jeju drive-out', detail: 'Use the rental car while the island segment is actually active.', neighborhood: 'Jeju', type: 'transit' },
      { time: 'Midday', title: 'Main Jeju block', detail: 'Good day for the most island-specific plan you care about.', neighborhood: 'Jeju', type: 'anchor' },
      { time: 'Afternoon', title: 'Flexible island segment', detail: 'Keep enough margin for driving and weather.', neighborhood: 'Jeju', type: 'shopping' },
      { time: 'Evening', title: 'Final full Jeju night', detail: 'This is effectively the last fully Jeju-shaped evening before Seoul returns.', neighborhood: 'Jeju', type: 'meal' },
    ],
    mapTargets: [
      mapTarget('Jeju International Airport', 'Transfer reference point', { coords: { lat: 33.5104, lng: 126.4914 } }),
      mapTarget('Jeju car rental', 'Active transport anchor', { query: '제주공항 렌터카' }),
    ],
  }),
  itineraryDay({
    key: 'may-21',
    date: 'May 21',
    label: 'Jeju → Seoul + Sofitel + dinner',
    area: 'Jeju → Jamsil',
    status: 'confirmed anchors',
    focus: 'This is the actual handoff day from the real Jeju segment into the Jamsil hotel stay, even if the outside-family story keeps the broader 19–24 block sounding like Jeju.',
    logistics: {
      start: 'Jeju',
      end: 'Jamsil / 본연 dinner',
      note: 'Jeju Air 7C114 departs CJU at 11:20 AM with checked bag 15 kg. Rental-car return needs to be completed by 10:00 AM before heading back through the airport flow.',
    },
    mapCenter: { lat: 37.5067, lng: 127.1022 },
    stops: [
      { time: 'By 10:00', title: 'Return Kona EV', detail: 'Rental ends at 10:00 AM, so return the car before airport transfer.', neighborhood: '특별한렌트카 / Jeju', type: 'transit' },
      { time: '11:20', title: 'Jeju Air 7C114 departs Jeju', detail: 'This is the real island-to-Seoul handoff flight for both of you. Checked bag: 15 kg.', neighborhood: 'CJU → GMP', type: 'anchor' },
      { time: 'After landing', title: 'Move luggage + reset', detail: 'Do not overfill this middle window.', neighborhood: 'Transit to Jamsil', type: 'transit' },
      { time: '16:00', title: 'Sofitel check-in', detail: 'This begins the actual Jamsil hotel stretch from May 21–24.', neighborhood: 'Jamsil', type: 'hotel' },
      { time: '19:00', title: '본연 dinner reservation', detail: 'Booked through Catch Table. Wine order required. 240,000 KRW course for 2 people.', neighborhood: 'Seoul', type: 'meal' },
    ],
    mapTargets: [
      mapTarget('Jeju International Airport', 'Jeju departure airport', { coords: { lat: 33.5104, lng: 126.4914 } }),
      mapTarget('Sofitel Ambassador Seoul', 'Confirmed hotel anchor'),
      mapTarget('본연 서울', 'Catch Table reservation anchor', { query: '본연 서울' }),
      mapTarget('Jamsil', 'Neighborhood anchor', { query: '잠실', coords: { lat: 37.5133, lng: 127.1002 } }),
    ],
  }),
  itineraryDay({
    key: 'may-22',
    date: 'May 22',
    label: 'Jamsil hotel day',
    area: 'Jamsil / southeast Seoul',
    status: 'open planning day',
    focus: 'This is part of the real Jamsil hotel stretch, not the actual Jeju segment anymore.',
    logistics: {
      start: 'Sofitel / Jamsil',
      end: 'Seoul evening',
      note: 'Useful to remember quietly: family may still think of these dates as part of the broader Jeju-away stretch, but the actual base is Jamsil now.',
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
    label: 'Open Seoul hotel day',
    area: 'Seoul',
    status: 'open planning day',
    focus: 'This is a flexible Seoul/Jamsil-base day even if the broader family-facing framing still sounds like you are away in Jeju this whole block.',
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
    focus: 'This still sits inside the quiet family-facing “away” window, but the real location logic is Seoul/Jamsil rather than Jeju.',
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
  { item: 'Flights', detail: 'China Airlines long-haul roundtrip for both', amount: '$960' },
  { item: 'Jeju flight', detail: 'Jeju Air 7C115 / 7C114 for both', amount: '$200' },
  { item: 'Rental car', detail: 'Kona 2nd gen EV · 5/19 13:00 → 5/21 10:00', amount: '$35' },
  { item: 'Activity', detail: 'Imported activity / beach cost', amount: '$160' },
]

const todoRules = {
  'headspa': { label: 'Book arrival-day headspa', dueDate: '2026-05-10', priority: 1 },
  'nail-brow': { label: 'Finish nail / eyebrow shortlist', dueDate: '2026-05-11', priority: 2 },
  'hair-perm': { label: 'Confirm hair perm time', dueDate: '2026-05-12', priority: 3 },
  'derm': { label: 'Narrow dermatology clinic options', dueDate: '2026-05-13', priority: 4 },
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

  const itineraryCalendarDays = useMemo(() => {
    return itineraryDays.map((day) => {
      const dateObj = parseTripDate(`2026-${day.key.replace('may-', '05-')}`)
      return {
        ...day,
        weekday: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
      }
    })
  }, [])

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
      const matchedOption = board.comparison.find((option) => [option.place, option.area, option.pricing, option.note].join(' ').toLowerCase().includes(q))
      const matchedBoard = [board.title, board.lead, board.recommendation].join(' ').toLowerCase().includes(q)

      if (!matchedBoard && !matchedOption) return []

      return [{
        key: board.key,
        type: 'Research',
        title: board.title,
        detail: matchedOption?.place || board.recommendation,
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
              <h1>Korea Trip May 15-26</h1>
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
                <span>Almost Korea time</span>
                <strong>D-{countdownDays}</strong>
                <p>The trip is close enough to feel real now.</p>
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

              <div className="home-brief-grid">
                <section className="glass-card mini-list-card">
                  <div className="section-header">
                    <h3>TODO</h3>
                  </div>
                  <div className="mini-list">
                    {smartTodos.map((item) => (
                      <div className="mini-list-row" key={item.key}>
                        <span className={`mini-dot mini-dot-${item.urgency}`} />
                        <div>
                          <p>{item.label}</p>
                          <small>{item.meta}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="glass-card mini-list-card">
                  <div className="section-header">
                    <h3>Next schedule</h3>
                  </div>
                  <div className="mini-list">
                    {smartSchedule.map((entry) => (
                      <div className="mini-list-row schedule-row" key={entry.key}>
                        <div>
                          <strong>{entry.shortDate}</strong>
                          <small>{entry.meta}</small>
                        </div>
                        <p>{entry.label}</p>
                      </div>
                    ))}
                  </div>
                </section>
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

              <div className="day-picker-row calendar-day-grid">
                {itineraryCalendarDays.map((day) => (
                  <button key={day.key} className={selectedDay.key === day.key ? 'day-chip active' : 'day-chip'} onClick={() => setSelectedDayKey(day.key)}>
                    <span className="day-chip-weekday">{day.weekday}</span>
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
