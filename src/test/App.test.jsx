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
    expect(screen.getByRole('button', { name: /open itinerary/i })).toBeInTheDocument()
    expect(screen.getByText(/compare → schedule → itinerary/i)).toBeInTheDocument()
  })

  test('theme toggle uses quiet text labels instead of bright emoji icons', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument()
  })

  test('renders the itinerary planner with polished final-plan cues', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^itinerary$/i })[0])

    expect(screen.getByText(/final day plan/i)).toBeInTheDocument()
    expect(screen.getAllByText(/route check/i).length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: /timeline \+ toggle list/i })).toBeInTheDocument()
    expect(screen.getByText(/itinerary is where dated items become a real yes \/ no plan/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /confirm haus nowhere/i })).toBeInTheDocument()
  })

  test('confirming a candidate updates the itinerary summary', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^itinerary$/i })[0])

    expect(screen.getByText(/3 confirmed route stops/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /confirm haus nowhere/i }))
    expect(screen.getByText(/4 confirmed route stops/i)).toBeInTheDocument()
  })

  test('confirmed items can be moved back out of the itinerary', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^itinerary$/i })[0])

    expect(screen.getByText(/3 confirmed route stops/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /remove olive young \+ musinsa from itinerary/i }))
    expect(screen.getByText(/0 confirmed route stops/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /confirm olive young \+ musinsa/i })).toBeInTheDocument()
  })

  test('compare shows image cards immediately without opening accordions', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^compare$/i })[0])

    expect(screen.getByRole('heading', { name: /^compare$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /hongdae hair.?perm/i })).toBeInTheDocument()
    expect(screen.getByText(/current pick/i)).toBeInTheDocument()
    expect(screen.getByAltText(/SOONSIKI Hair Hongdae preview/i)).toBeInTheDocument()
    expect(screen.queryByText(/photo cards with the practical reason/i)).not.toBeInTheDocument()
  })

  test('schedule shows a compact assignment board without explanatory paragraphs', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^schedule$/i })[0])

    expect(screen.getByRole('heading', { name: /^schedule$/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /unscheduled/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /day buckets/i })).toBeInTheDocument()
    expect(screen.getByText(/may 17 seongsu viral loop/i)).toBeInTheDocument()
    expect(screen.queryByText(/anything from compare/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/drop a place group/i)).not.toBeInTheDocument()
  })

  test('schedule drag and drop assigns a place to a day and surfaces it in itinerary', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: /^schedule$/i })[0])

    const draggedCard = screen.getByLabelText(/drag may 17 seongsu viral loop/i)
    const may16Bucket = screen.getByLabelText(/drop places into may 16/i)
    const dataTransfer = buildDataTransfer()

    fireEvent.dragStart(draggedCard, { dataTransfer })
    fireEvent.dragOver(may16Bucket, { dataTransfer })
    fireEvent.drop(may16Bucket, { dataTransfer })

    expect(within(may16Bucket).getByText(/may 17 seongsu viral loop/i)).toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('button', { name: /^itinerary$/i })[0])
    fireEvent.click(screen.getByRole('button', { name: /may 16/i }))
    expect(screen.getByText(/may 17 seongsu viral loop/i)).toBeInTheDocument()
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
