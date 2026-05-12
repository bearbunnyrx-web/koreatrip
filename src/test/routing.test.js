import { afterEach, describe, expect, test, vi } from 'vitest'
import { buildRouteRequestPayload, fetchKakaoRouteForTargets } from '../lib/routing'

describe('routing helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('builds an ordered Kakao route payload from confirmed targets with coordinates', () => {
    const payload = buildRouteRequestPayload('may-17', [
      { name: 'A', lat: 37.1, lng: 127.1 },
      { name: 'B', lat: 37.2, lng: 127.2 },
      { name: 'C', lat: 37.3, lng: 127.3 },
    ])

    expect(payload).toEqual({
      dayKey: 'may-17',
      origin: { name: 'A', lat: 37.1, lng: 127.1 },
      destination: { name: 'C', lat: 37.3, lng: 127.3 },
      waypoints: [{ name: 'B', lat: 37.2, lng: 127.2 }],
    })
  })

  test('does not build a route payload without at least two coordinate targets', () => {
    expect(buildRouteRequestPayload('may-17', [{ name: 'A', lat: 37.1, lng: 127.1 }])).toBeNull()
    expect(buildRouteRequestPayload('may-17', [
      { name: 'A', lat: 37.1, lng: 127.1 },
      { name: 'B', found: false },
    ])).toBeNull()
  })

  test('fetches and normalizes a Kakao route from the app API', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'ready',
        distanceMeters: 1234,
        durationSeconds: 567,
        polyline: [
          { lat: 37.1, lng: 127.1 },
          { lat: 37.2, lng: 127.2 },
        ],
      }),
    })

    const result = await fetchKakaoRouteForTargets('may-17', [
      { name: 'A', lat: 37.1, lng: 127.1 },
      { name: 'B', lat: 37.2, lng: 127.2 },
    ], fetchMock)

    expect(fetchMock).toHaveBeenCalledWith('/api/kakao-route', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }))
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).origin.name).toBe('A')
    expect(result).toMatchObject({
      status: 'ready',
      distanceMeters: 1234,
      durationSeconds: 567,
    })
    expect(result.polyline).toHaveLength(2)
  })
})
