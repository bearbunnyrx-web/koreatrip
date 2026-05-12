function parsePoint(point) {
  const lat = Number(point?.lat)
  const lng = Number(point?.lng)

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  return { lat, lng, name: point.name || '' }
}

function pointToKakao(point) {
  return `${point.lng},${point.lat}`
}

function extractPolyline(route) {
  const points = []

  route?.sections?.forEach((section) => {
    section?.roads?.forEach((road) => {
      const vertexes = Array.isArray(road.vertexes) ? road.vertexes : []
      for (let index = 0; index < vertexes.length - 1; index += 2) {
        points.push({ lng: Number(vertexes[index]), lat: Number(vertexes[index + 1]) })
      }
    })
  })

  return points.filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng))
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    response.status(405).json({ status: 'method-not-allowed', message: 'Use POST for Kakao routing.' })
    return
  }

  if (!process.env.KAKAO_REST_API_KEY) {
    response.status(503).json({ status: 'missing-key', message: 'Missing KAKAO_REST_API_KEY on the server.' })
    return
  }

  const origin = parsePoint(request.body?.origin)
  const destination = parsePoint(request.body?.destination)
  const waypoints = Array.isArray(request.body?.waypoints)
    ? request.body.waypoints.map(parsePoint).filter(Boolean)
    : []

  if (!origin || !destination) {
    response.status(400).json({ status: 'bad-request', message: 'Origin and destination with lat/lng are required.' })
    return
  }

  const params = new URLSearchParams({
    origin: pointToKakao(origin),
    destination: pointToKakao(destination),
    priority: 'RECOMMEND',
    alternatives: 'false',
    road_details: 'false',
  })

  if (waypoints.length) {
    params.set('waypoints', waypoints.map(pointToKakao).join('|'))
  }

  try {
    const kakaoResponse = await fetch(`https://apis-navi.kakaomobility.com/v1/directions?${params.toString()}`, {
      headers: {
        Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`,
      },
    })

    const data = await kakaoResponse.json().catch(() => ({}))

    if (!kakaoResponse.ok) {
      response.status(kakaoResponse.status).json({
        status: 'kakao-error',
        message: data.msg || data.message || 'Kakao Mobility routing failed.',
        detail: data,
      })
      return
    }

    const route = data.routes?.[0]
    const polyline = extractPolyline(route)

    if (!route || !polyline.length) {
      response.status(502).json({ status: 'no-route', message: 'Kakao returned no usable route polyline.' })
      return
    }

    response.status(200).json({
      status: 'ready',
      distanceMeters: route.summary?.distance || 0,
      durationSeconds: route.summary?.duration || 0,
      polyline,
    })
  } catch (error) {
    response.status(502).json({
      status: 'unavailable',
      message: error instanceof Error ? error.message : 'Kakao routing service unavailable.',
    })
  }
}
