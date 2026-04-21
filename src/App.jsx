import './App.css'
import { useMemo, useState } from 'react'

const tabs = ['home', 'itinerary', 'bookings', 'spend']

const itineraryDays = [
  {
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
    stops: [
      {
        time: '11:30',
        title: 'Land at ICN',
        detail: 'Immigration, bags, and regroup without rushing.',
        neighborhood: 'Incheon Airport',
        type: 'anchor',
      },
      {
        time: '12:30–13:30',
        title: 'Meet parents + drive out',
        detail: 'Let your parents take the lead and avoid stacking commitments too close to landing.',
        neighborhood: 'Airport pickup',
        type: 'transit',
      },
      {
        time: '14:00',
        title: 'Lunch at parents’ house',
        detail: 'Use this as the true recovery block before going back out.',
        neighborhood: '고덕역 home base',
        type: 'meal',
      },
      {
        time: '16:30 or 17:30',
        title: 'Headspa window',
        detail: 'Late-afternoon slot feels safer than trying to force an early appointment after the airport.',
        neighborhood: '고덕 / nearby east Seoul',
        type: 'beauty',
      },
      {
        time: '19:00',
        title: 'Easy dinner / family time',
        detail: 'Stay local, keep the first night soft, and don’t overschedule.',
        neighborhood: '고덕 / family area',
        type: 'meal',
      },
    ],
    mapTargets: [
      {
        name: 'Parents’ house / 고덕역 area',
        reason: 'Home base after landing',
        naverUrl: 'https://map.naver.com/p/search/%EA%B3%A0%EB%8D%95%EC%97%AD',
        kakaoUrl: 'https://map.kakao.com/?q=%EA%B3%A0%EB%8D%95%EC%97%AD',
      },
      {
        name: '숱하다헤드스파',
        reason: 'Flexible late-afternoon headspa candidate',
        naverUrl: 'https://map.naver.com/p/search/%EC%88%B1%ED%95%98%EB%8B%A4%ED%97%A4%EB%93%9C%EC%8A%A4%ED%8C%8C',
        kakaoUrl: 'https://map.kakao.com/?q=%EC%88%B1%ED%95%98%EB%8B%A4%20%ED%97%A4%EB%93%9C%EC%8A%A4%ED%8C%8C',
      },
      {
        name: '단비 헤드스파앤컬러',
        reason: 'Cozier backup if timing works',
        naverUrl: 'https://map.naver.com/p/search/%EB%8B%A8%EB%B9%84%20%ED%97%A4%EB%93%9C%EC%8A%A4%ED%8C%8C%EC%95%A4%EC%BB%AC%EB%9F%AC',
        kakaoUrl: 'https://map.kakao.com/?q=%EB%8B%A8%EB%B9%84%20%ED%97%A4%EB%93%9C%EC%8A%A4%ED%8C%8C%EC%95%A4%EC%BB%AC%EB%9F%AC',
      },
    ],
  },
  {
    key: 'may-17',
    date: 'May 17',
    label: 'Seongsu beauty + shopping',
    area: 'Seongsu',
    status: 'mostly set',
    focus: 'Keep the whole day clustered so you are not zig-zagging across Seoul.',
    logistics: {
      start: '고덕 / east Seoul',
      end: 'Dinner back in Seoul',
      note: 'This is the kind of day where a live map will help the most because everything should be clustered by walking blocks, not districts.',
    },
    stops: [
      {
        time: '10:00',
        title: 'Leave home base',
        detail: 'Give yourselves a soft start so the day still feels like vacation.',
        neighborhood: '고덕 → Seongsu',
        type: 'transit',
      },
      {
        time: '11:00',
        title: 'Nail / eyebrow appointment',
        detail: 'Anchor the day with the fixed beauty booking first.',
        neighborhood: 'Seongsu',
        type: 'beauty',
      },
      {
        time: '13:00',
        title: 'Lunch',
        detail: 'Keep lunch nearby so you do not break the neighborhood flow.',
        neighborhood: 'Seongsu',
        type: 'meal',
      },
      {
        time: '14:00–17:00',
        title: 'Shopping block',
        detail: 'Gentle Monster, Tamburins, Olive Young, and anything else worth bundling in one walking loop.',
        neighborhood: 'Seongsu',
        type: 'shopping',
      },
      {
        time: '18:30',
        title: 'Dinner',
        detail: 'Either stay in Seongsu or move once with purpose.',
        neighborhood: 'Seoul',
        type: 'meal',
      },
    ],
    mapTargets: [
      {
        name: 'Seongsu anchor area',
        reason: 'Main shopping + beauty cluster',
        naverUrl: 'https://map.naver.com/p/search/%EC%84%B1%EC%88%98%EB%8F%99',
        kakaoUrl: 'https://map.kakao.com/?q=%EC%84%B1%EC%88%98%EB%8F%99',
      },
      {
        name: 'Gentle Monster Seongsu',
        reason: 'Potential anchor stop',
        naverUrl: 'https://map.naver.com/p/search/%EC%A0%A0%ED%8B%80%EB%AA%AC%EC%8A%A4%ED%84%B0%20%EC%84%B1%EC%88%98',
        kakaoUrl: 'https://map.kakao.com/?q=%EC%A0%A0%ED%8B%80%EB%AA%AC%EC%8A%A4%ED%84%B0%20%EC%84%B1%EC%88%98',
      },
    ],
  },
  {
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
    stops: [
      {
        time: '11:30',
        title: 'Fly Jeju → Seoul',
        detail: 'Keep the whole day loose around the airport block.',
        neighborhood: 'Jeju / Gimpo',
        type: 'anchor',
      },
      {
        time: '14:30',
        title: 'Move luggage + reset',
        detail: 'Do not overfill this middle window.',
        neighborhood: 'Transit to Jamsil',
        type: 'transit',
      },
      {
        time: '16:00',
        title: 'Sofitel check-in',
        detail: 'This is the second-half Seoul anchor.',
        neighborhood: 'Jamsil',
        type: 'hotel',
      },
      {
        time: '19:00',
        title: '본연 dinner reservation',
        detail: 'Already confirmed — this is your real evening anchor.',
        neighborhood: 'Seoul',
        type: 'meal',
      },
    ],
    mapTargets: [
      {
        name: 'Sofitel Ambassador Seoul',
        reason: 'Confirmed hotel anchor',
        naverUrl: 'https://map.naver.com/p/search/%EC%86%8C%ED%94%BC%ED%85%94%20%EC%95%B0%EB%B0%B0%EC%84%9C%EB%8D%94%20%EC%84%9C%EC%9A%B8',
        kakaoUrl: 'https://map.kakao.com/?q=%EC%86%8C%ED%94%BC%ED%85%94%20%EC%95%B0%EB%B0%B0%EC%84%9C%EB%8D%94%20%EC%84%9C%EC%9A%B8',
      },
      {
        name: '본연',
        reason: 'Confirmed dinner reservation',
        naverUrl: 'https://map.naver.com/p/search/%EB%B3%B8%EC%97%B0%20%EC%84%9C%EC%9A%B8',
        kakaoUrl: 'https://map.kakao.com/?q=%EB%B3%B8%EC%97%B0%20%EC%84%9C%EC%9A%B8',
      },
    ],
  },
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
  if (lower.includes('set') || lower.includes('anchor')) return 'chip chip-sage'
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

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [selectedDayKey, setSelectedDayKey] = useState(itineraryDays[0].key)

  const selectedDay = useMemo(
    () => itineraryDays.find((day) => day.key === selectedDayKey) ?? itineraryDays[0],
    [selectedDayKey],
  )

  const loggedSpend = useMemo(() => {
    return spend.reduce((sum, row) => sum + Number(row.amount.replace(/[$,]/g, '')), 0)
  }, [])

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
              <span>Countdown</span>
              <strong>29d</strong>
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
                  <p>Choose a day, then see the actual rhythm by time instead of only by date.</p>
                </div>
                <span className="chip chip-gold">desktop planning mode</span>
              </header>

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

                  <div className="glass-card logistics-card">
                    <div className="section-header">
                      <h3>Map-ready places</h3>
                      <span>tap out to compare</span>
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
                    <p className="map-footnote">
                      Interactive Naver/Kakao maps are possible, but for a true embedded map we’ll need a developer app key
                      and allowed-domain setup on the live deployment.
                    </p>
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
