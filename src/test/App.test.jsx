import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, test } from 'vitest'
import App, { reorderPlannerItems } from '../App'

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

  test('renders the redesigned home screen with visual trip entry cards', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /search the trip/i })).toBeInTheDocument()
    expect(screen.getByText(/seoul & jeju beauty trip in may/i)).toBeInTheDocument()
    expect(screen.getByText(/city of k-beauty & culture/i)).toBeInTheDocument()
    expect(screen.getByText(/island of nature & healing/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/search seongsu, jamsil, reone, headspa, jeju/i)).toBeInTheDocument()
    expect(screen.queryByText(/suggested flow/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/compare → schedule → itinerary/i)).not.toBeInTheDocument()
  })

  test('theme toggle uses quiet text labels instead of bright emoji icons', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument()
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

    expect(screen.getByText(/3 confirmed route stops/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /confirm haus nowhere/i }))
    expect(screen.getByText(/4 confirmed route stops/i)).toBeInTheDocument()
  })

  test('confirmed items can be moved back out of the itinerary', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 3: itinerary$/i })[0])

    expect(screen.getByText(/3 confirmed route stops/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /remove olive young \+ musinsa from itinerary/i }))
    expect(screen.getByText(/0 confirmed route stops/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /confirm olive young \+ musinsa/i })).toBeInTheDocument()
  })

  test('step 1 opens each theme box with inline yes no place controls', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 1: choose places$/i })[0])

    expect(screen.getByRole('heading', { name: /^step 1: choose places$/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /select places/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /love/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /maybe/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /pass/i })).not.toBeInTheDocument()

    const nailTheme = screen.getByTestId('step-one-theme-nail-brow')
    fireEvent.click(within(nailTheme).getByRole('button', { name: /may 17 seongsu nail shortlist/i }))

    expect(within(nailTheme).getAllByText(/단니네일/i).length).toBeGreaterThan(0)
    expect(within(nailTheme).getByRole('button', { name: /yes to 단니네일/i })).toBeInTheDocument()
    expect(within(nailTheme).getByRole('button', { name: /no to 단니네일/i })).toBeInTheDocument()
  })

  test('step 1 moves individual instagram saved places into step 2', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 1: choose places$/i })[0])

    const seongsuTheme = screen.getByTestId('step-one-theme-seongsu-viral-loop')
    fireEvent.click(within(seongsuTheme).getByRole('button', { name: /may 17 seongsu viral loop/i }))

    expect(within(seongsuTheme).getByText(/haus nowhere/i)).toBeInTheDocument()
    expect(within(seongsuTheme).getByText(/olive young flagship/i)).toBeInTheDocument()

    fireEvent.click(within(seongsuTheme).getByRole('button', { name: /yes to haus nowhere/i }))
    fireEvent.click(screen.getAllByRole('button', { name: /^step 2: select date$/i })[0])

    expect(screen.getByRole('heading', { name: /^step 2: select date$/i })).toBeInTheDocument()
    expect(screen.getByText(/haus nowhere/i)).toBeInTheDocument()
    expect(screen.queryByText(/^may 17 seongsu viral loop$/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/viral saves inbox/i)).not.toBeInTheDocument()
  })

  test('viral saves inbox shows imported reel places instead of a placeholder queue', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 1: choose places$/i })[0])

    const inboxTheme = screen.getByTestId('step-one-theme-viral-saves-inbox')
    fireEvent.click(within(inboxTheme).getByRole('button', { name: /viral saves inbox/i }))

    expect(within(inboxTheme).getByText(/k-beauty foundation match/i)).toBeInTheDocument()
    expect(within(inboxTheme).getByRole('button', { name: /yes to k-beauty foundation match/i })).toBeInTheDocument()
    expect(within(inboxTheme).queryByText(/paste reels or captions here later/i)).not.toBeInTheDocument()
    expect(within(inboxTheme).queryByText(/then regroup by area/i)).not.toBeInTheDocument()
  })

  test('culinary class war reel imports individual restaurants into step 1', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 1: choose places$/i })[0])

    const culinaryTheme = screen.getByTestId('step-one-theme-culinary-class-war-restaurants')
    fireEvent.click(within(culinaryTheme).getByRole('button', { name: /culinary class war restaurants/i }))

    expect(within(culinaryTheme).getByText(/l’amant secret/i)).toBeInTheDocument()
    expect(within(culinaryTheme).getByText(/osteria sam kim/i)).toBeInTheDocument()
    expect(within(culinaryTheme).getByText(/choi dot/i)).toBeInTheDocument()
    expect(within(culinaryTheme).getByText(/eatanic garden/i)).toBeInTheDocument()
    expect(within(culinaryTheme).getByRole('button', { name: /yes to eatanic garden/i })).toBeInTheDocument()
  })

  test('step 1 yes selections feed step 2 scheduling', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 1: choose places$/i })[0])

    const seongsuTheme = screen.getByTestId('step-one-theme-seongsu-viral-loop')
    fireEvent.click(within(seongsuTheme).getByRole('button', { name: /may 17 seongsu viral loop/i }))
    fireEvent.click(within(seongsuTheme).getByRole('button', { name: /yes to haus nowhere/i }))
    fireEvent.click(screen.getAllByRole('button', { name: /^step 2: select date$/i })[0])

    expect(screen.getByText(/haus nowhere/i)).toBeInTheDocument()
    expect(screen.queryByText(/viral saves inbox/i)).not.toBeInTheDocument()
  })

  test('schedule shows a compact assignment board without explanatory paragraphs', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 2: select date$/i })[0])

    expect(screen.getByRole('heading', { name: /^step 2: select date$/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /unscheduled/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /day buckets/i })).toBeInTheDocument()
    expect(screen.queryByText(/haus nowhere/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/anything from compare/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/drop a place group/i)).not.toBeInTheDocument()
  })

  test('schedule drag and drop assigns a place to a day and surfaces it in itinerary', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^step 1: choose places$/i })[0])
    const seongsuTheme = screen.getByTestId('step-one-theme-seongsu-viral-loop')
    fireEvent.click(within(seongsuTheme).getByRole('button', { name: /may 17 seongsu viral loop/i }))
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
