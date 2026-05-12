function coordinateTarget(target) {
  const lat = Number(target?.lat ?? target?.coords?.lat)
  const lng = Number(target?.lng ?? target?.coords?.lng)

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  return {
    name: target.name,
    lat,
    lng,
  }
}

function buildRouteRequestPayload(dayKey, orderedTargets) {
  const coordinateTargets = orderedTargets.map(coordinateTarget).filter(Boolean)

  if (coordinateTargets.length < 2) return null

  return {
    dayKey,
    origin: coordinateTargets[0],
    destination: coordinateTargets[coordinateTargets.length - 1],
    waypoints: coordinateTargets.slice(1, -1),
  }
}

async function fetchKakaoRouteForTargets(dayKey, orderedTargets, fetcher = fetch) {
  const payload = buildRouteRequestPayload(dayKey, orderedTargets)

  if (!payload) {
    return {
      status: 'insufficient-coordinates',
      message: 'Need at least two confirmed stops with coordinates to request a real route.',
      polyline: [],
    }
  }

  try {
    const response = await fetcher('/api/kakao-route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return {
        status: data.status || 'error',
        message: data.message || 'Kakao route API request failed.',
        polyline: [],
      }
    }

    return {
      status: data.status || 'ready',
      message: data.message || '',
      distanceMeters: data.distanceMeters || 0,
      durationSeconds: data.durationSeconds || 0,
      polyline: Array.isArray(data.polyline) ? data.polyline : [],
    }
  } catch (error) {
    return {
      status: 'unavailable',
      message: error instanceof Error ? error.message : 'Route service unavailable.',
      polyline: [],
    }
  }
}

function formatRouteDistance(distanceMeters = 0) {
  if (!distanceMeters) return ''
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)} m`
  return `${(distanceMeters / 1000).toFixed(1)} km`
}

function formatRouteDuration(durationSeconds = 0) {
  if (!durationSeconds) return ''
  const minutes = Math.max(1, Math.round(durationSeconds / 60))
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return remainder ? `${hours} hr ${remainder} min` : `${hours} hr`
}

export {
  buildRouteRequestPayload,
  fetchKakaoRouteForTargets,
  formatRouteDistance,
  formatRouteDuration,
}
