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

  test('home shows a trip countdown banner before the search hero', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-09T12:00:00'))

    const { container } = render(<App />)

    expect(screen.getByText(/7 days until Korea 🇰🇷/i)).toBeInTheDocument()
    expect(tripCountdownLabel(new Date('2026-05-16T12:00:00'))).toBe('Day 1 of Korea trip 🇰🇷')
    expect(tripCountdownLabel(new Date('2026-05-28T12:00:00'))).toBe('Back home — great trip! 🏠')
    expect(container.querySelector('.search-home-screen')?.firstElementChild).toHaveClass('trip-countdown-card')
  })

  test('bottom navigation is fixed with short Home Choose Derm Date Itinerary labels and switches tabs', () => {
    const { container } = render(<App />)
    const bottomNav = container.querySelector('.mobile-bottom-nav')

    expect(bottomNav).toBeInTheDocument()
    expect(within(bottomNav).getByText('Home')).toBeInTheDocument()
    expect(within(bottomNav).getByText('Choose')).toBeInTheDocument()
    expect(within(bottomNav).getByText('Derm')).toBeInTheDocument()
    expect(within(bottomNav).getByText('Date')).toBeInTheDocument()
    expect(within(bottomNav).getByText('Itinerary')).toBeInTheDocument()

    fireEvent.click(within(bottomNav).getByRole('button', { name: /step 1: choose places/i }))
    expect(screen.getByRole('heading', { name: /^step 1: choose places$/i })).toBeInTheDocument()
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

  test('renders the redesigned home screen with cleaned chrome and soft search', () => {
    const { container } = render(<App />)

    expect(screen.getByRole('heading', { name: /search the trip/i })).toBeInTheDocument()
    expect(screen.getByText(/seoul & jeju beauty trip in may/i)).toBeInTheDocument()
    expect(screen.getByText(/city of k-beauty & culture/i)).toBeInTheDocument()
    expect(screen.getByText(/island of nature & healing/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/search seongsu, jamsil, reone, headspa, jeju/i)).toBeInTheDocument()
    expect(screen.queryByText(/sj \+ th • korea • may 15–26/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/suggested flow/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/compare → schedule → itinerary/i)).not.toBeInTheDocument()
    expect(container.querySelector('.hero-search-card.search-card')).not.toBeInTheDocument()
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

    expect(screen.getByText(/4 confirmed route stops/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /confirm haus nowhere/i }))
    expect(screen.getByText(/5 confirmed route stops/i)).toBeInTheDocument()
  })

  test('confirmed items can be moved back out of the itinerary', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 3: itinerary$/i })[0])

    expect(screen.getByText(/4 confirmed route stops/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /remove olive young \+ musinsa from itinerary/i }))
    expect(screen.getByText(/1 confirmed route stops/i)).toBeInTheDocument()
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
