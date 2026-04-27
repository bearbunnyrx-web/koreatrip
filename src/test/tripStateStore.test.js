import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
  TRIP_STATE_STORAGE_KEYS,
  createTripStateStore,
  readLocalTripState,
  writeLocalTripState,
} from '../lib/tripStateStore'

describe('trip state store', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  test('collects the existing Korea trip localStorage state into one shared-state snapshot', () => {
    window.localStorage.setItem('korea-trip-booking-votes', JSON.stringify({ 'hair-perm::SOONSIKI Hair Hongdae': 'yes' }))
    window.localStorage.setItem('korea-trip-item-titles', JSON.stringify({ 'research::hair-perm::SOONSIKI Hair Hongdae': 'SOONSIKI consult' }))
    window.localStorage.setItem('korea-trip-place-days', JSON.stringify({ 'research-hair-perm-soonsiki-hair-hongdae': 'may-18' }))
    window.localStorage.setItem('korea-trip-theme', 'dark')

    const snapshot = readLocalTripState(window.localStorage)

    expect(snapshot).toMatchObject({
      bookingVotes: { 'hair-perm::SOONSIKI Hair Hongdae': 'yes' },
      customItemTitles: { 'research::hair-perm::SOONSIKI Hair Hongdae': 'SOONSIKI consult' },
      assignedPlaceDays: { 'research-hair-perm-soonsiki-hair-hongdae': 'may-18' },
      theme: 'dark',
    })
    expect(Object.keys(snapshot)).toEqual(TRIP_STATE_STORAGE_KEYS.map((entry) => entry.stateKey))
  })

  test('keeps localStorage as the safe fallback when Supabase env vars are missing', () => {
    const store = createTripStateStore({
      env: {},
      storage: window.localStorage,
    })

    expect(store.mode).toBe('local')
    expect(store.isShared).toBe(false)
    expect(store.syncEnabled).toBe(false)

    store.save({ bookingVotes: { 'hair-perm::SOONSIKI Hair Hongdae': 'yes' } })

    expect(window.localStorage.getItem('korea-trip-booking-votes')).toContain('SOONSIKI')
  })

  test('creates a Supabase-backed store only when both URL and anon key are configured', () => {
    const createClient = vi.fn(() => ({
      from: vi.fn(),
      channel: vi.fn(),
    }))

    const store = createTripStateStore({
      env: {
        VITE_SUPABASE_URL: 'https://example.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'anon-key',
      },
      storage: window.localStorage,
      createClient,
      tripId: 'korea-2026',
    })

    expect(createClient).toHaveBeenCalledWith('https://example.supabase.co', 'anon-key')
    expect(store.mode).toBe('supabase')
    expect(store.isShared).toBe(true)
    expect(store.tripId).toBe('korea-2026')
  })

  test('writes a shared-state snapshot back to the legacy localStorage keys for offline fallback', () => {
    writeLocalTripState(window.localStorage, {
      theme: 'dark',
      selectedPlaceGroups: { 'haus-nowhere': true },
      assignedPlaceDays: { 'haus-nowhere': 'may-17' },
      bookingVotes: { 'hair-perm::SOONSIKI Hair Hongdae': 'yes' },
      plannerOverrides: { 'may-17': { 'haus-nowhere': 'confirmed' } },
    })

    expect(window.localStorage.getItem('korea-trip-theme')).toBe('dark')
    expect(window.localStorage.getItem('korea-trip-selected-place-groups')).toContain('haus-nowhere')
    expect(window.localStorage.getItem('korea-trip-place-days')).toContain('may-17')
    expect(window.localStorage.getItem('korea-trip-booking-votes')).toContain('yes')
    expect(window.localStorage.getItem('korea-trip-planner-overrides')).toContain('confirmed')
  })
})
