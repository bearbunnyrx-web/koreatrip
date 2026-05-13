import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import App, { reorderPlannerItems, tripCountdownLabel } from '../App'

function buildDataTransfer() {
  const store = {}
  return {
    effectAllowed: 'move',
    setData: (type, value) => {
      store[type] = value
    },
    getData: (type) => store[type],
  }
}

describe('Korea trip app v2 concept', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('home uses a clean map with sticky trip date header', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-09T12:00:00'))

    const { container } = render(<App />)

    expect(screen.queryByText(/7 days until Korea 🇰🇷/i)).not.toBeInTheDocument()
    expect(screen.getByLabelText(/Map date selector/i)).toBeInTheDocument()
    expect(tripCountdownLabel(new Date('2026-05-16T12:00:00'))).toBe('Day 1 of Korea trip 🇰🇷')
    expect(tripCountdownLabel(new Date('2026-05-28T12:00:00'))).toBe('Back home — great trip! 🏠')
    expect(container.querySelector('.map-first-home-screen')?.firstElementChild).toHaveClass('trip-sticky-date-header')
  })

  test('bottom navigation is fixed with V2 Map Calendar Inspiration Receipts labels and switches tabs', () => {
    const { container } = render(<App />)
    const bottomNav = container.querySelector('.mobile-bottom-nav')

    expect(bottomNav).toBeInTheDocument()
    expect(within(bottomNav).getByText('Map')).toBeInTheDocument()
    expect(within(bottomNav).getByText('Calendar')).toBeInTheDocument()
    expect(within(bottomNav).getByText('Inspiration')).toBeInTheDocument()
    expect(within(bottomNav).getByText('Receipts')).toBeInTheDocument()
    expect(within(bottomNav).queryByText('Choose')).not.toBeInTheDocument()
    expect(within(bottomNav).queryByText('Derm')).not.toBeInTheDocument()
    expect(within(bottomNav).queryByText('Date')).not.toBeInTheDocument()
    expect(within(bottomNav).queryByText('Itinerary')).not.toBeInTheDocument()

    fireEvent.click(within(bottomNav).getByRole('button', { name: /calendar/i }))
    expect(screen.getByRole('heading', { name: /calendar/i })).toBeInTheDocument()
  })

  test('calendar uses the sticky trip date header and day content only', () => {
    const { container } = render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^calendar$/i })[0])

    expect(screen.getByRole('heading', { name: /calendar/i })).toBeInTheDocument()
    expect(container.querySelector('.calendar-screen')?.firstElementChild).toHaveClass('trip-sticky-date-header')
    expect(screen.getByLabelText(/calendar date selector/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /day view/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /week view/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /month view/i })).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/mini month calendar/i)).not.toBeInTheDocument()
    expect(screen.getByLabelText(/calendar day timeline/i)).toBeInTheDocument()

    fireEvent.click(within(screen.getByLabelText(/calendar date selector/i)).getByRole('button', { name: /may 22 jamsil hotel day/i }))
    expect(within(screen.getByLabelText(/calendar date selector/i)).getByRole('button', { name: /may 22 jamsil hotel day/i })).toHaveClass('active')
    expect(screen.getByText(/reone dermatology consult/i)).toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('button', { name: /^map$/i })[0])
    expect(within(screen.getByLabelText(/map date selector/i)).getByRole('button', { name: /may 22 jamsil hotel day/i })).toHaveClass('active')
  })

  test('inspiration uses the shared sticky trip date header and prioritizes inline-playable reels', () => {
    const { container } = render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^inspiration$/i })[0])

    expect(screen.getByRole('heading', { name: /inspiration/i })).toBeInTheDocument()
    expect(container.querySelector('.inspiration-screen')?.firstElementChild).toHaveClass('trip-sticky-date-header')
    expect(screen.getByLabelText(/inspiration date selector/i)).toBeInTheDocument()
    expect(screen.getAllByText(/inline-first reels/i).length).toBeGreaterThan(0)
    expect(container.querySelector('.instagram-embed-grid')).toBeInTheDocument()
    expect(container.querySelectorAll('.instagram-embed-frame').length).toBeGreaterThan(3)
    expect(container.querySelector('.instagram-embed-card')).toHaveAttribute('data-playback', 'inline-priority')
    const embedSrcs = Array.from(container.querySelectorAll('.instagram-embed-frame')).map((frame) => frame.getAttribute('src'))
    expect(embedSrcs.some((src) => src?.includes('DXO4pYzk71U'))).toBe(true)
    expect(embedSrcs.some((src) => src?.includes('DQymX5JEURP'))).toBe(true)
    expect(embedSrcs.some((src) => src?.includes('DS19yCsEQun'))).toBe(true)
    expect(embedSrcs.some((src) => src?.includes('DXRZp_zj4rd'))).toBe(true)
    expect(embedSrcs.some((src) => src?.includes('DXtyngdj2f3'))).toBe(true)
    expect(embedSrcs.some((src) => src?.includes('DXg7dR7ic-z'))).toBe(true)
    expect(embedSrcs.some((src) => src?.includes('DUHKa4LEw7E'))).toBe(true)
    expect(embedSrcs.some((src) => src?.includes('DW3qhI3xh5c'))).toBe(true)
    expect(embedSrcs.some((src) => src?.includes('DWG4IbfDk_W'))).toBe(true)
    expect(screen.queryByText(/add a save/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/shortlist/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /filter food/i })).not.toBeInTheDocument()
  })

  test('receipts are a simple receipt-styled list fed from Discord with the shared sticky date header', () => {
    window.localStorage.setItem('korea-trip-receipts', JSON.stringify([{ id: 'manual-dashboard-test', vendor: 'Dashboard Receipt', date: '2026-05-21', amountMinor: 120000, currency: 'KRW', category: 'Food', status: 'review', placeGuess: 'Bonyeon', notes: 'Dashboard test receipt.' }]))
    const { container } = render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^receipts$/i })[0])
    fireEvent.click(within(screen.getByLabelText(/receipts date selector/i)).getByRole('button', { name: /may 21/i }))

    expect(screen.getByRole('heading', { name: /receipts/i })).toBeInTheDocument()
    expect(container.querySelector('.receipts-screen')?.firstElementChild).toHaveClass('trip-sticky-date-header')
    expect(screen.getByLabelText(/receipts date selector/i)).toBeInTheDocument()
    expect(screen.getByText(/trip balance dashboard/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/receipts dashboard/i)).toBeInTheDocument()
    expect(screen.queryByText(/1503846727273283787/i)).not.toBeInTheDocument()
    expect(screen.getByText(/full receipt overview/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/all tracked receipt totals/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Dashboard Receipt/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/₩120,000/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/overview total/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/dr\. cho paid/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/dr\. ho paid/i)).toBeInTheDocument()
    expect(screen.queryByText(/spend mix/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/receipt category mix overview/i)).not.toBeInTheDocument()
    expect(container.querySelector('.simple-receipt-list')).toBeInTheDocument()
    expect(container.querySelector('.receipt-date-group')).toBeInTheDocument()
    expect(container.querySelector('.receipt-paper-card')).toBeInTheDocument()
    expect(screen.queryByText(/no receipts for this date yet/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/local ollama gemma4/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /filter receipt category hotels/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /add receipt for review/i })).not.toBeInTheDocument()
  })

  test('phase G links receipts to map places and the selected calendar day', async () => {
    window.localStorage.setItem('korea-trip-receipts', JSON.stringify([{ id: 'manual-reone-test', vendor: 'ReOne Dermatology Receipt', date: '2026-05-22', amountMinor: 220000, currency: 'KRW', category: 'Beauty', status: 'review', placeGuess: '리원피부과의원', notes: 'Stored from Discord receipt test.' }]))
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^receipts$/i })[0])
    fireEvent.click(within(screen.getByLabelText(/receipts date selector/i)).getByRole('button', { name: /may 22/i }))
    fireEvent.click(screen.getByRole('button', { name: /view reone dermatology receipt on map/i }))

    expect(screen.getByRole('heading', { name: /리원피부과의원/i })).toBeInTheDocument()
    expect(screen.getByText(/related receipts/i)).toBeInTheDocument()
    expect(screen.getByText(/reone dermatology receipt/i)).toBeInTheDocument()
    expect(within(screen.getByLabelText(/map date selector/i)).getByRole('button', { name: /may 22 jamsil hotel day/i })).toHaveClass('active')

    fireEvent.click(screen.getByRole('button', { name: /open calendar for reone dermatology receipt/i }))
    expect(screen.getByRole('heading', { name: /calendar/i })).toBeInTheDocument()
    expect(within(screen.getByLabelText(/calendar date selector/i)).getByRole('button', { name: /may 22 jamsil hotel day/i })).toHaveClass('active')
  })

  test('phase G keeps inspiration as embed-only grid without map drawer inspiration panel', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^inspiration$/i })[0])

    expect(screen.getByText(/instagram grid/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /view .* on map/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/related inspiration/i)).not.toBeInTheDocument()
  })

  test('derm tab compares Korean 피부과 procedures for early 30s', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /derm procedures/i })[0])

    expect(screen.getByRole('heading', { name: /korean derm procedure guide/i })).toBeInTheDocument()
    expect(screen.getAllByText(/early 30s/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/small nodules underneath the eyes/i)).toBeInTheDocument()
    expect(screen.getAllByText(/비립종 제거|한관종/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/unbalanced facial color/i)).toBeInTheDocument()
    expect(screen.getAllByText(/pico toning|피코토닝/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/double chin/i)).toBeInTheDocument()
    expect(screen.getAllByText(/inmode|인모드/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/mole removal/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/co2 laser|CO2 레이저/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/general skin tone/i)).toBeInTheDocument()
    expect(screen.getAllByText(/pricing/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/pain/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/downtime/i).length).toBeGreaterThan(0)
  })

  test('derm tab shows a descriptive image panel for every procedure', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /derm procedures/i })[0])

    expect(screen.getAllByRole('img', { name: /visual guide for/i })).toHaveLength(5)
    expect(screen.getByRole('img', { name: /visual guide for small nodules underneath the eyes/i })).toBeInTheDocument()
    expect(screen.getByText(/lesion ID first/i)).toBeInTheDocument()
    expect(screen.getByText(/pigment vs redness/i)).toBeInTheDocument()
    expect(screen.getByText(/fat vs laxity/i)).toBeInTheDocument()
    expect(screen.getByText(/dermoscopy first/i)).toBeInTheDocument()
    expect(screen.getByText(/tone \+ texture plan/i)).toBeInTheDocument()
  })

  test('step 1 opens as a dense one-sight options board with source-first cards', () => {
    const { container } = render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 1: choose places$/i })[0])

    expect(screen.getByRole('heading', { name: /options at a glance/i })).toBeInTheDocument()
    expect(screen.getByText(/tiny cards/i)).toBeInTheDocument()
    expect(container.querySelector('.one-sight-options-grid')).toBeInTheDocument()
    expect(container.querySelector('.comparison-image-wrap')).not.toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /open instagram source/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/source/i).length).toBeGreaterThan(0)
  })

  test('step 2 shows a one-sight trip slots board with open time windows', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 2: select date$/i })[0])

    expect(screen.getByRole('heading', { name: /trip slots at a glance/i })).toBeInTheDocument()
    expect(screen.getByText(/empty windows/i)).toBeInTheDocument()
    expect(screen.getAllByText(/morning/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/afternoon/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/evening/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/open|flex|set/i).length).toBeGreaterThan(5)
  })

  test('step 1 cards can be swiped right for yes and show status chips', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 1: choose places$/i })[0])
    fireEvent.click(screen.getByRole('button', { name: /open beauty theme/i }))

    const beautyTheme = screen.getByTestId('step-one-theme-beauty')
    const card = within(beautyTheme).getByTestId('swipe-card-Chahong Room Myeongdong')
    expect(within(card).getAllByText(/tbd|pending|confirmed/i).length).toBeGreaterThan(0)

    fireEvent.touchStart(card, { changedTouches: [{ clientX: 10 }], touches: [{ clientX: 10 }] })
    fireEvent.touchEnd(card, { changedTouches: [{ clientX: 140 }] })

    expect(window.localStorage.getItem('korea-trip-booking-votes')).toContain('Chahong Room Myeongdong')
    expect(window.localStorage.getItem('korea-trip-booking-votes')).toContain('yes')
  })

  test('itinerary marks today, renders stop status chips, and persists drag reorder', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-17T12:00:00'))
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 3: itinerary$/i })[0])

    expect(screen.getByRole('button', { name: /may 17/i })).toHaveClass('today')
    expect(screen.getAllByText(/confirmed ✅|pending ⏳|tbd 🔲/i).length).toBeGreaterThan(0)

    const dinner = screen.getByText('Donghwa Gook parent dinner target').closest('article')
    const oliveYoung = screen.getByText('Olive Young + Musinsa').closest('article')
    const dataTransfer = buildDataTransfer()
    fireEvent.dragStart(dinner, { dataTransfer })
    fireEvent.dragOver(oliveYoung, { dataTransfer })
    fireEvent.drop(oliveYoung, { dataTransfer })

    expect(window.localStorage.getItem('korea-trip-planner-order')).toContain('dinner')
  })

  test('home is a map-first view with date strip, route markers, and marker drawer actions', () => {
    const { container } = render(<App />)

    expect(screen.getByLabelText(/Map sticky date header/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/map date selector/i)).toBeInTheDocument()
    expect(screen.queryByText(/5 days until korea/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /sj korea/i })).not.toBeInTheDocument()
    expect(container.querySelector('.map-status-chip')).not.toBeInTheDocument()
    expect(container.querySelector('.home-map-fallback')).not.toBeInTheDocument()
    expect(container.querySelector('.home-map-river')).not.toBeInTheDocument()
    expect(container.querySelector('.home-map-route-layer')).not.toBeInTheDocument()
    expect(container.querySelector('.home-map-marker')).not.toBeInTheDocument()

    expect(screen.getByRole('heading', { name: /haus nowhere seongsu/i })).toBeInTheDocument()
    expect(screen.getByText(/scheduled stops for/i)).toBeInTheDocument()
    expect(screen.getByText((content) => /1\s*\.\s*Nail appointment/i.test(content))).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /assign .* may 17/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /open tamburins seongsu in kakao maps/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /copy korean name for tamburins seongsu/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/open in kakao maps from your phone if needed/i)).not.toBeInTheDocument()
  })

  test('map phase C1 shows clean route semantics and updates with selected date', () => {
    const { container } = render(<App />)

    expect(container.querySelector('.map-status-chip')).not.toBeInTheDocument()
    expect(container.querySelector('.map-route-summary-card')).not.toBeInTheDocument()
    expect(container.querySelector('.home-map-legend')).not.toBeInTheDocument()
    expect(container.querySelector('.home-map-route-layer')).not.toBeInTheDocument()
    expect(container.querySelector('.home-map-marker')).not.toBeInTheDocument()

    fireEvent.click(within(screen.getByLabelText(/map date selector/i)).getByRole('button', { name: /may 22 jamsil hotel day/i }))

    expect(within(screen.getByLabelText(/map date selector/i)).getByRole('button', { name: /may 22 jamsil hotel day/i })).toHaveClass('active')
    expect(screen.getByRole('heading', { name: /리원피부과의원|sofitel ambassador seoul/i })).toBeInTheDocument()
  })

  test('map tab includes the accepted inspiration-first food recommendations by date', () => {
    render(<App />)
    const dateSelector = screen.getByLabelText(/map date selector/i)

    fireEvent.click(within(dateSelector).getByRole('button', { name: /may 16/i }))
    expect(screen.getByText(/local 고덕 arrival lunch/i)).toBeInTheDocument()

    fireEvent.click(within(dateSelector).getByRole('button', { name: /may 17/i }))
    expect(screen.getByText(/grandmother’s recipe lunch/i)).toBeInTheDocument()
    expect(screen.getByText(/donghwa gook parent dinner target/i)).toBeInTheDocument()

    fireEvent.click(within(dateSelector).getByRole('button', { name: /may 18/i }))
    expect(screen.getByText(/ikseon chwihyang lunch/i)).toBeInTheDocument()
    expect(screen.getByText(/maknae hoejip dinner/i)).toBeInTheDocument()

    fireEvent.click(within(dateSelector).getByRole('button', { name: /may 19/i }))
    expect(screen.getByText(/late lunch on the east side/i)).toBeInTheDocument()
    expect(screen.getByText(/seongsan east-side seafood dinner/i)).toBeInTheDocument()

    fireEvent.click(within(dateSelector).getByRole('button', { name: /may 20/i }))
    expect(screen.getByText(/bar sul sang lunch window/i)).toBeInTheDocument()
    expect(screen.getByText(/hundo aewol black pork dinner/i)).toBeInTheDocument()

    fireEvent.click(within(dateSelector).getByRole('button', { name: /may 21/i }))
    expect(screen.getByText(/light jamsil \/ sofitel lunch/i)).toBeInTheDocument()
    expect(screen.getByText(/본연 dinner reservation/i)).toBeInTheDocument()

    fireEvent.click(within(dateSelector).getByRole('button', { name: /may 22/i }))
    expect(screen.getByText(/mil toast house light lunch/i)).toBeInTheDocument()
    expect(screen.getByText(/mongchon dakgalbi dinner/i)).toBeInTheDocument()

    fireEvent.click(within(dateSelector).getByRole('button', { name: /may 23/i }))
    expect(screen.getByText(/wumok hanwoo omakase lunch/i)).toBeInTheDocument()
    expect(screen.queryByText(/may 23 dinner recommendation/i)).not.toBeInTheDocument()

    fireEvent.click(within(dateSelector).getByRole('button', { name: /may 24/i }))
    expect(screen.getByText(/norunsan tteokbokki light lunch/i)).toBeInTheDocument()
    expect(screen.getByText(/스시도쿠 엔 고덕 family dinner/i)).toBeInTheDocument()

    fireEvent.click(within(dateSelector).getByRole('button', { name: /may 25/i }))
    expect(screen.getByText(/gorogoro kaisendon lunch/i)).toBeInTheDocument()
    expect(screen.getByText(/sinsajeon final-night dinner/i)).toBeInTheDocument()
  })

  test('theme toggle uses a simple icon instead of text labels', () => {
    render(<App />)

    const themeButton = screen.getByRole('button', { name: /switch to dark mode/i })
    expect(themeButton).toBeInTheDocument()
    expect(themeButton).not.toHaveTextContent(/dark mode|light mode/i)
  })

  test('renders the itinerary planner with polished final-plan cues', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 3: itinerary$/i })[0])

    expect(screen.getByText(/final day plan/i)).toBeInTheDocument()
    expect(screen.getAllByText(/route check/i).length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: /^timeline$/i })).toBeInTheDocument()
    expect(screen.queryByText(/itinerary is where dated items become a real yes \/ no plan/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /confirm haus nowhere/i })).toBeInTheDocument()
  })

  test('confirming a candidate updates the itinerary summary', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 3: itinerary$/i })[0])

    expect(screen.getByText(/5 confirmed route stops/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /confirm haus nowhere/i }))
    expect(screen.getByText(/6 confirmed route stops/i)).toBeInTheDocument()
  })

  test('confirmed items can be moved back out of the itinerary', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 3: itinerary$/i })[0])

    expect(screen.getByText(/5 confirmed route stops/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /remove olive young \+ musinsa from itinerary/i }))
    expect(screen.getByText(/2 confirmed route stops/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /confirm olive young \+ musinsa/i })).toBeInTheDocument()
  })

  test('step 1 opens each theme box with inline yes no place controls', () => {
    const { container } = render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 1: choose places$/i })[0])

    expect(screen.getByRole('heading', { name: /^step 1: choose places$/i })).toBeInTheDocument()
    expect(container.querySelector('.step-one-sticky-theme-rail')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /select places/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /love/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /maybe/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /pass/i })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /open beauty theme/i }))
    const beautyTheme = screen.getByTestId('step-one-theme-beauty')

    expect(within(beautyTheme).getAllByText(/gonggan nails hongdae/i).length).toBeGreaterThan(0)
    expect(within(beautyTheme).getByRole('button', { name: /yes to gonggan nails hongdae/i })).toBeInTheDocument()
    expect(within(beautyTheme).getByRole('button', { name: /no to gonggan nails hongdae/i })).toBeInTheDocument()
  })

  test('step 1 is simplified into Beauty, Food & cafe, and Others theme cards', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 1: choose places$/i })[0])

    const themeRail = screen.getByLabelText(/sticky place theme icons/i)
    expect(within(themeRail).getByRole('button', { name: /open beauty theme/i })).toBeInTheDocument()
    expect(within(themeRail).getByRole('button', { name: /open food & cafe theme/i })).toBeInTheDocument()
    expect(within(themeRail).getByRole('button', { name: /open others theme/i })).toBeInTheDocument()
    expect(within(themeRail).queryByRole('button', { name: /open may 17 seongsu viral loop theme/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('group', { name: /seongsu themes/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('group', { name: /wellness themes/i })).not.toBeInTheDocument()

    fireEvent.click(within(themeRail).getByRole('button', { name: /open beauty theme/i }))
    const beautyTheme = screen.getByTestId('step-one-theme-beauty')
    expect(within(beautyTheme).getByRole('button', { name: /yes to gonggan nails hongdae/i })).toBeInTheDocument()
    expect(within(beautyTheme).getByRole('button', { name: /yes to brow gyeol/i })).toBeInTheDocument()
    expect(within(beautyTheme).getByRole('button', { name: /yes to 에코자르뎅 잠실롯데타워점/i })).toBeInTheDocument()

    fireEvent.click(within(themeRail).getByRole('button', { name: /open food & cafe theme/i }))
    const foodTheme = screen.getByTestId('step-one-theme-food-cafe')
    expect(within(foodTheme).getByRole('button', { name: /yes to eatanic garden/i })).toBeInTheDocument()
    expect(within(foodTheme).getByRole('button', { name: /yes to cafe onion seongsu/i })).toBeInTheDocument()

    fireEvent.click(within(themeRail).getByRole('button', { name: /open others theme/i }))
    const othersTheme = screen.getByTestId('step-one-theme-others')
    expect(within(othersTheme).getByRole('button', { name: /yes to haus nowhere/i })).toBeInTheDocument()
    expect(within(othersTheme).getByRole('button', { name: /yes to stand oil/i })).toBeInTheDocument()
    expect(within(othersTheme).getByRole('button', { name: /yes to yongwangsan skywalk/i })).toBeInTheDocument()
  })

  test('step 1 theme names can be adjusted by clicking the subtle title', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 1: choose places$/i })[0])
    fireEvent.click(screen.getByRole('button', { name: /open others theme/i }))

    expect(screen.queryByText(/ready to book/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/choose inside this box/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/theme name/i)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /edit theme title others/i }))
    const nameInput = screen.getByLabelText(/theme title for others/i)
    fireEvent.change(nameInput, { target: { value: 'Flex picks' } })

    expect(screen.getByRole('button', { name: /open flex picks theme/i })).toBeInTheDocument()
    expect(window.localStorage.getItem('korea-trip-theme-titles')).toContain('Flex picks')
  })

  test('step 1 moves individual instagram saved places into step 2', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 1: choose places$/i })[0])

    fireEvent.click(screen.getByRole('button', { name: /open others theme/i }))
    const seongsuTheme = screen.getByTestId('step-one-theme-others')

    expect(within(seongsuTheme).getByRole('button', { name: /yes to haus nowhere/i })).toBeInTheDocument()
    expect(within(seongsuTheme).getByRole('button', { name: /yes to olive young flagship/i })).toBeInTheDocument()

    fireEvent.click(within(seongsuTheme).getByRole('button', { name: /yes to haus nowhere/i }))
    fireEvent.click(screen.getAllByRole('button', { name: /^step 2: select date$/i })[0])

    expect(screen.getByRole('heading', { name: /^step 2: select date$/i })).toBeInTheDocument()
    expect(screen.getAllByText(/haus nowhere/i).length).toBeGreaterThan(0)
    expect(screen.queryByText(/viral saves inbox/i)).not.toBeInTheDocument()
  })

  test('viral saves inbox shows imported reel places instead of a placeholder queue', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 1: choose places$/i })[0])

    fireEvent.click(screen.getByRole('button', { name: /open beauty theme/i }))
    const inboxTheme = screen.getByTestId('step-one-theme-beauty')

    expect(within(inboxTheme).getByText(/k-beauty foundation match/i)).toBeInTheDocument()
    expect(within(inboxTheme).getByRole('button', { name: /yes to k-beauty foundation match/i })).toBeInTheDocument()
    expect(within(inboxTheme).queryByText(/paste reels or captions here later/i)).not.toBeInTheDocument()
    expect(within(inboxTheme).queryByText(/then regroup by area/i)).not.toBeInTheDocument()
  })

  test('culinary class war reel imports individual restaurants into step 1', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 1: choose places$/i })[0])

    fireEvent.click(screen.getByRole('button', { name: /open food & cafe theme/i }))
    const culinaryTheme = screen.getByTestId('step-one-theme-food-cafe')

    expect(within(culinaryTheme).getByText(/l’amant secret/i)).toBeInTheDocument()
    expect(within(culinaryTheme).getByText(/osteria sam kim/i)).toBeInTheDocument()
    expect(within(culinaryTheme).getByText(/choi dot/i)).toBeInTheDocument()
    expect(within(culinaryTheme).getByText(/eatanic garden/i)).toBeInTheDocument()
    expect(within(culinaryTheme).getByRole('button', { name: /yes to eatanic garden/i })).toBeInTheDocument()
  })

  test('wellness spa reel imports Cimer Spa into step 1', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 1: choose places$/i })[0])

    fireEvent.click(screen.getByRole('button', { name: /open beauty theme/i }))
    const wellnessTheme = screen.getByTestId('step-one-theme-beauty')

    expect(within(wellnessTheme).getByText(/cimer spa/i)).toBeInTheDocument()
    expect(within(wellnessTheme).getByText(/incheon \/ paradise city/i)).toBeInTheDocument()
    expect(within(wellnessTheme).getByRole('button', { name: /yes to cimer spa/i })).toBeInTheDocument()
  })

  test('Seongsu atmosphere reel imports individual spaces into step 1', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 1: choose places$/i })[0])

    fireEvent.click(screen.getByRole('button', { name: /open others theme/i }))
    const seongsuMoodTheme = screen.getByTestId('step-one-theme-others')

    expect(within(seongsuMoodTheme).getByText(/glow seongsu/i)).toBeInTheDocument()
    expect(within(seongsuMoodTheme).getByText(/dior seongsu/i)).toBeInTheDocument()
    expect(within(seongsuMoodTheme).getByText(/dasique seongsu/i)).toBeInTheDocument()
    expect(within(seongsuMoodTheme).getByText(/yongyong seonsaeng maradowon/i)).toBeInTheDocument()
    expect(within(seongsuMoodTheme).getByRole('button', { name: /yes to glow seongsu/i })).toBeInTheDocument()
  })

  test('Korea glow up reel imports beauty providers into step 1', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 1: choose places$/i })[0])

    fireEvent.click(screen.getByRole('button', { name: /open beauty theme/i }))
    const glowUpTheme = screen.getByTestId('step-one-theme-beauty')

    expect(within(glowUpTheme).getByText(/brow gyeol/i)).toBeInTheDocument()
    expect(within(glowUpTheme).getByText(/artlab nail/i)).toBeInTheDocument()
    expect(within(glowUpTheme).getByText(/reone global/i)).toBeInTheDocument()
    expect(within(glowUpTheme).getByRole('button', { name: /yes to brow gyeol/i })).toBeInTheDocument()
  })

  test('Seongsu bag shopping reel imports Korean designer bag stores into step 1', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 1: choose places$/i })[0])

    fireEvent.click(screen.getByRole('button', { name: /open others theme/i }))
    const bagTheme = screen.getByTestId('step-one-theme-others')

    expect(within(bagTheme).getAllByText(/stand oil/i).length).toBeGreaterThan(0)
    expect(within(bagTheme).getAllByText(/marge sherwood/i).length).toBeGreaterThan(0)
    expect(within(bagTheme).getByText(/osoi/i)).toBeInTheDocument()
    expect(within(bagTheme).getByRole('button', { name: /yes to marge sherwood/i })).toBeInTheDocument()
  })

  test('Seoul food guide Part 2 reel imports individual restaurants into step 1', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 1: choose places$/i })[0])

    fireEvent.click(screen.getByRole('button', { name: /open food & cafe theme/i }))
    const foodTheme = screen.getByTestId('step-one-theme-food-cafe')

    expect(within(foodTheme).getByText(/han mi ok/i)).toBeInTheDocument()
    expect(within(foodTheme).getByText(/kyetanzip/i)).toBeInTheDocument()
    expect(within(foodTheme).getByText(/norunsan tteokbokki/i)).toBeInTheDocument()
    expect(within(foodTheme).getByText(/grandmother’s recipe/i)).toBeInTheDocument()
    expect(within(foodTheme).getByRole('button', { name: /yes to kyetanzip/i })).toBeInTheDocument()
  })

  test('April Instagram batch imports the latest reel places into Step 1', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 1: choose places$/i })[0])

    fireEvent.click(screen.getByRole('button', { name: /open food & cafe theme/i }))
    const cafeTheme = screen.getByTestId('step-one-theme-food-cafe')
    expect(within(cafeTheme).getAllByText(/être bake house/i).length).toBeGreaterThan(0)
    expect(within(cafeTheme).getAllByText(/standard bread/i).length).toBeGreaterThan(0)
    expect(within(cafeTheme).getByRole('button', { name: /yes to standard bread/i })).toBeInTheDocument()
    expect(within(cafeTheme).getAllByText(/ikseon chwihyang/i).length).toBeGreaterThan(0)
    expect(within(cafeTheme).getByRole('button', { name: /yes to ikseon chwihyang/i })).toBeInTheDocument()
    expect(within(cafeTheme).getAllByText(/sinsajeon/i).length).toBeGreaterThan(0)
    expect(within(cafeTheme).getByRole('button', { name: /yes to sinsajeon/i })).toBeInTheDocument()
    expect(within(cafeTheme).getAllByText(/mongchon dakgalbi/i).length).toBeGreaterThan(0)
    expect(within(cafeTheme).getByRole('button', { name: /yes to mongchon dakgalbi/i })).toBeInTheDocument()
    expect(within(cafeTheme).getAllByText(/wumok/i).length).toBeGreaterThan(0)
    expect(within(cafeTheme).getByRole('button', { name: /yes to wumok/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /open food & cafe theme/i }))
    const dessertTheme = screen.getByTestId('step-one-theme-food-cafe')
    expect(within(dessertTheme).getAllByText(/mochibang/i).length).toBeGreaterThan(0)
    expect(within(dessertTheme).getAllByText(/mil toast house/i).length).toBeGreaterThan(0)
    expect(within(dessertTheme).getAllByText(/rafre fruit/i).length).toBeGreaterThan(0)
    expect(within(dessertTheme).getAllByText(/seochon geumsang goroke/i).length).toBeGreaterThan(0)
    expect(within(dessertTheme).getByRole('button', { name: /yes to seochon geumsang goroke/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /open beauty theme/i }))
    const nailSavesTheme = screen.getByTestId('step-one-theme-beauty')
    expect(within(nailSavesTheme).getByText(/gonggan nails hongdae/i)).toBeInTheDocument()
    expect(within(nailSavesTheme).getByText(/the newall/i)).toBeInTheDocument()
  })

  test('step 1 place yes selections feed step 2 scheduling', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 1: choose places$/i })[0])

    fireEvent.click(screen.getByRole('button', { name: /open others theme/i }))
    const seongsuTheme = screen.getByTestId('step-one-theme-others')
    fireEvent.click(within(seongsuTheme).getByRole('button', { name: /yes to haus nowhere/i }))
    fireEvent.click(screen.getAllByRole('button', { name: /^step 2: select date$/i })[0])

    expect(screen.getAllByText(/haus nowhere/i).length).toBeGreaterThan(0)
    expect(screen.queryByText(/viral saves inbox/i)).not.toBeInTheDocument()
  })

  test('step 1 research board yes selections feed step 2 unscheduled items', () => {
    window.localStorage.setItem('korea-trip-booking-votes', JSON.stringify({ 'hair-perm::Chahong Room Myeongdong': 'yes' }))
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 2: select date$/i })[0])

    expect(screen.getByRole('heading', { name: /^step 2: select date$/i })).toBeInTheDocument()
    expect(screen.getAllByText(/chahong room myeongdong/i).length).toBeGreaterThan(0)
    expect(screen.getByLabelText(/drag chahong room myeongdong/i)).toBeInTheDocument()
  })

  test('step 1 place item names can be edited and sync into step 2 items', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 1: choose places$/i })[0])
    fireEvent.click(screen.getByRole('button', { name: /open others theme/i }))
    const othersTheme = screen.getByTestId('step-one-theme-others')

    fireEvent.click(within(othersTheme).getByRole('button', { name: /edit item name haus nowhere/i }))
    const nameInput = within(othersTheme).getByLabelText(/item name for haus nowhere/i)
    fireEvent.change(nameInput, { target: { value: 'Haus Nowhere — Seongsu flagship' } })
    fireEvent.blur(nameInput)
    fireEvent.click(within(othersTheme).getByRole('button', { name: /yes to haus nowhere — seongsu flagship/i }))

    fireEvent.click(screen.getAllByRole('button', { name: /^step 2: select date$/i })[0])

    expect(screen.getAllByText(/haus nowhere — seongsu flagship/i).length).toBeGreaterThan(0)
    expect(screen.getByLabelText(/drag haus nowhere — seongsu flagship/i)).toBeInTheDocument()
    expect(window.localStorage.getItem('korea-trip-item-titles')).toContain('Haus Nowhere — Seongsu flagship')
  })

  test('step 1 research item names can be edited and sync into step 2 items', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 1: choose places$/i })[0])
    fireEvent.click(screen.getByRole('button', { name: /open beauty theme/i }))
    const beautyTheme = screen.getByTestId('step-one-theme-beauty')

    fireEvent.click(within(beautyTheme).getByRole('button', { name: /edit item name chahong room myeongdong/i }))
    const nameInput = within(beautyTheme).getByLabelText(/item name for chahong room myeongdong/i)
    fireEvent.change(nameInput, { target: { value: 'Chahong Myeongdong — booked perm' } })
    fireEvent.blur(nameInput)
    fireEvent.click(within(beautyTheme).getByRole('button', { name: /yes to chahong myeongdong — booked perm/i }))

    fireEvent.click(screen.getAllByRole('button', { name: /^step 2: select date$/i })[0])

    expect(screen.getAllByText(/chahong myeongdong — booked perm/i).length).toBeGreaterThan(0)
    expect(screen.getByLabelText(/drag chahong myeongdong — booked perm/i)).toBeInTheDocument()
    expect(window.localStorage.getItem('korea-trip-item-titles')).toContain('Chahong Myeongdong — booked perm')
  })

  test('schedule shows one sticky Items rail and no duplicate unscheduled box', () => {
    const { container } = render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 2: select date$/i })[0])

    expect(screen.getByRole('heading', { name: /^step 2: select date$/i })).toBeInTheDocument()
    expect(screen.getByText(/^items$/i)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /unscheduled/i })).not.toBeInTheDocument()
    expect(container.querySelector('.step-two-sticky-unscheduled')).toBeInTheDocument()
    expect(container.querySelector('.schedule-inbox-panel')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /day buckets/i })).toBeInTheDocument()
    expect(screen.queryByText(/haus nowhere/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/anything from compare/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/drop a place group/i)).not.toBeInTheDocument()
  })

  test('schedule drag and drop assigns a place to a day and surfaces it in itinerary', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 1: choose places$/i })[0])
    fireEvent.click(screen.getByRole('button', { name: /open others theme/i }))
    const seongsuTheme = screen.getByTestId('step-one-theme-others')
    fireEvent.click(within(seongsuTheme).getByRole('button', { name: /yes to haus nowhere/i }))
    fireEvent.click(screen.getAllByRole('button', { name: /^step 2: select date$/i })[0])

    const draggedCard = screen.getByLabelText(/drag haus nowhere/i)
    const may16Bucket = screen.getByLabelText(/drop places into may 16/i)
    const dataTransfer = buildDataTransfer()

    fireEvent.dragStart(draggedCard, { dataTransfer })
    fireEvent.dragOver(may16Bucket, { dataTransfer })
    fireEvent.drop(may16Bucket, { dataTransfer })

    expect(within(may16Bucket).getByText(/haus nowhere/i)).toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('button', { name: /^step 3: itinerary$/i })[0])
    fireEvent.click(screen.getByRole('button', { name: /may 16/i }))
    expect(screen.getByText(/haus nowhere/i)).toBeInTheDocument()
  })

  test('reorderPlannerItems moves dragged item into a new time slot order', () => {
    const items = [
      { id: 'nail', title: 'Nail appointment' },
      { id: 'haus', title: 'Haus Nowhere' },
      { id: 'dinner', title: 'Dinner' },
    ]

    expect(reorderPlannerItems(items, 'dinner', 'nail').map((item) => item.id)).toEqual(['dinner', 'nail', 'haus'])
  })
})
