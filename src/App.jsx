import './App.css'
import { useMemo, useState } from 'react'

const tabs = ['home', 'itinerary', 'bookings', 'spend']

const itinerary = [
  {
    date: 'May 15',
    area: 'Travel',
    title: 'Ontario → Taipei',
    summary: 'Uber to ONT, long-haul flight, layover, then onward to Korea.',
    tags: ['22:30 Uber', 'Flight booked'],
    status: 'booked',
  },
  {
    date: 'May 16',
    area: 'Seoul',
    title: 'Arrival + easy first day',
    summary: 'ICN arrival, lunch at home, headspa, dinner with family.',
    tags: ['11:30 ICN', '4:00 Headspa', 'Dinner'],
    status: '2 decisions',
  },
  {
    date: 'May 17',
    area: 'Seongsu',
    title: 'Nails + shopping day',
    summary: 'TH nail/eyebrow, lunch, Gentle Monster, Olive Young, Tamburins.',
    tags: ['11:00 Nail', '1:00 Lunch', 'Shopping'],
    status: 'mostly set',
  },
  {
    date: 'May 18',
    area: 'Seoul',
    title: 'Embassy + hair perm',
    summary: 'SJ embassy, TH hair perm at Soonsiki, lunch, flexible afternoon.',
    tags: ['8:30 Embassy', '9:00 Hair', 'Lunch'],
    status: 'to confirm',
  },
  {
    date: 'May 19',
    area: 'Jeju',
    title: 'Jeju move day',
    summary: 'Airport, Jeju flight, rental car, lunch, beach, sunset, seafood dinner.',
    tags: ['11:30 Flight', 'Rental car', 'Landing Jeju'],
    status: 'booked',
  },
  {
    date: 'May 21',
    area: 'Jamsil',
    title: 'Sofitel stay begins',
    summary: 'Back from Jeju to Seoul, luggage transfer, Sofitel Ambassador Seoul check-in, then dinner at 본연 at 7:00 PM.',
    tags: ['11:30 Flight', '7:00 본연', 'Sofitel booked'],
    status: 'confirmed',
  },
  {
    date: 'May 22',
    area: 'Gangnam',
    title: 'Skin treatment day',
    summary: 'Re-one clinic at 11:00, meals flexible, Seoul base anchored by Sofitel.',
    tags: ['11:00 Re-one', 'Lunch', 'Dinner'],
    status: 'beauty day',
  },
  {
    date: 'May 26',
    area: 'Return',
    title: 'Seoul → Taipei → Ontario',
    summary: 'Airport, layover, return flight home.',
    tags: ['11:00 airport', 'Layover', 'Return booked'],
    status: 'booked',
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
    state: 'booked',
  },
  {
    title: 'Headspa',
    meta: 'Gangnam vs Jamsil',
    note: 'Pick the best option and save booking link/contact.',
    state: 'need decision',
  },
  {
    title: 'Nail / eyebrow',
    meta: '5x5 Nail vs Gonggan • Seongsu',
    note: 'Cleaner shared decision card instead of hunting through notes.',
    state: 'researching',
  },
  {
    title: 'Hair perm',
    meta: 'Soonsiki',
    note: 'Confirm exact time and final location details.',
    state: 'to confirm',
  },
]

const spend = [
  { item: 'Flights', detail: 'Outbound / long-haul', amount: '$960' },
  { item: 'Jeju flight', detail: 'Seoul → Jeju', amount: '$200' },
  { item: 'Rental car', detail: 'Jeju', amount: '$35' },
  { item: 'Activity', detail: 'Imported beach / activity cost', amount: '$160' },
]

function statusClass(value) {
  const lower = value.toLowerCase()
  if (lower.includes('booked') || lower.includes('confirmed')) return 'chip chip-dark'
  if (lower.includes('decision')) return 'chip chip-rose'
  if (lower.includes('research')) return 'chip chip-gold'
  if (lower.includes('beauty') || lower.includes('set')) return 'chip chip-sage'
  return 'chip chip-mist'
}

function App() {
  const [activeTab, setActiveTab] = useState('home')

  const loggedSpend = useMemo(() => {
    return spend.reduce((sum, row) => sum + Number(row.amount.replace(/[$,]/g, '')), 0)
  }, [])

  return (
    <div className="app-shell">
      <div className="phone-frame">
        <div className="status-bar">
          <span>9:41</span>
          <span>SJ + TH ✦ Korea</span>
        </div>

        <main className="screen-body">
          {activeTab === 'home' && (
            <section className="screen active-screen">
              <div className="hero-card glass-card">
                <div className="eyebrow">Minimal travel planner • with a little Apple-journal warmth</div>
                <h1>Korea Trip Together</h1>
                <p>
                  A shared trip app for just the two of you — cleaner than Sheets,
                  easy on iPhone, and built to reduce planning overhead.
                </p>

                <div className="metrics-grid">
                  <div className="metric-card">
                    <span>Countdown</span>
                    <strong>32d</strong>
                  </div>
                  <div className="metric-card">
                    <span>Open bookings</span>
                    <strong>3</strong>
                  </div>
                  <div className="metric-card">
                    <span>Logged spend</span>
                    <strong>${loggedSpend.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="hotel-highlight">
                  <strong>Sofitel Ambassador Seoul booked</strong>
                  <span>May 21 Thu → May 24 Sun • Jamsil</span>
                  <p>This becomes the fixed Seoul anchor for the second half of the trip.</p>
                </div>
              </div>

              <section className="section-block">
                <header className="section-header">
                  <h2>What matters next</h2>
                  <span>fast shared planning</span>
                </header>
                <div className="glass-card list-card">
                  {itinerary.slice(1, 4).map((day) => (
                    <article className="timeline-row" key={day.date + day.title}>
                      <div className="date-tile">
                        <strong>{day.date}</strong>
                        <small>{day.area}</small>
                      </div>
                      <div className="timeline-content">
                        <div className="row-header">
                          <div>
                            <h3>{day.title}</h3>
                            <p>{day.summary}</p>
                          </div>
                          <span className={statusClass(day.status)}>{day.status}</span>
                        </div>
                        <div className="chip-row">
                          {day.tags.map((tag) => (
                            <span className="chip chip-soft" key={tag}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="section-block compact-gap">
                <header className="section-header">
                  <h2>Simple spending</h2>
                  <span>no split math for now</span>
                </header>
                <div className="spend-cards">
                  <div className="summary-card glass-card warm-card">
                    <span>Total logged</span>
                    <strong>${loggedSpend.toLocaleString()}</strong>
                    <p>Flights, Jeju flight, rental, one activity.</p>
                  </div>
                  <div className="summary-card glass-card cool-card">
                    <span>Flexible spend</span>
                    <strong>TBD</strong>
                    <p>Beauty, meals, shopping, extras.</p>
                  </div>
                </div>
              </section>
            </section>
          )}

          {activeTab === 'itinerary' && (
            <section className="screen active-screen">
              <header className="page-header">
                <div>
                  <h1 className="page-title">Itinerary</h1>
                  <p>May 15–26 • cleaned for iPhone viewing</p>
                </div>
                <span className="chip chip-gold">Trip flow</span>
              </header>

              <div className="glass-card list-card">
                {itinerary.map((day) => (
                  <article className="timeline-row" key={day.date + day.title}>
                    <div className="date-tile">
                      <strong>{day.date}</strong>
                      <small>{day.area}</small>
                    </div>
                    <div className="timeline-content">
                      <div className="row-header">
                        <div>
                          <h3>{day.title}</h3>
                          <p>{day.summary}</p>
                        </div>
                        <span className={statusClass(day.status)}>{day.status}</span>
                      </div>
                      <div className="chip-row">
                        {day.tags.map((tag) => (
                          <span className="chip chip-soft" key={tag}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'bookings' && (
            <section className="screen active-screen">
              <header className="page-header">
                <div>
                  <h1 className="page-title">Bookings</h1>
                  <p>Only what still needs attention or acts as a trip anchor</p>
                </div>
                <span className="chip chip-rose">3 open</span>
              </header>

              <div className="glass-card list-card bookings-list">
                {bookings.map((item) => (
                  <article className="booking-row" key={item.title}>
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
            <section className="screen active-screen">
              <header className="page-header">
                <div>
                  <h1 className="page-title">Spend</h1>
                  <p>Simple totals now, richer tracking later if needed</p>
                </div>
                <span className="chip chip-sage">simple mode</span>
              </header>

              <div className="glass-card list-card bookings-list">
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

              <div className="memory-grid">
                <div className="memory-card memory-card-a">
                  <strong>Save photos by day</strong>
                  <span>So recap/content is easy after the trip.</span>
                </div>
                <div className="memory-card memory-card-b">
                  <strong>Add one-line memories</strong>
                  <span>Meals, funny moments, places worth remembering.</span>
                </div>
              </div>
            </section>
          )}
        </main>

        <nav className="bottom-nav">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'home' ? 'Home' : tab === 'itinerary' ? 'Itinerary' : tab === 'bookings' ? 'Bookings' : 'Spend'}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default App
