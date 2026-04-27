export const TRIP_STATE_STORAGE_KEYS = [
  { stateKey: 'assignedPlaceDays', storageKey: 'korea-trip-place-days', type: 'json', defaultValue: {} },
  { stateKey: 'selectedPlaceGroups', storageKey: 'korea-trip-selected-place-groups', type: 'json', defaultValue: {} },
  { stateKey: 'customThemeTitles', storageKey: 'korea-trip-theme-titles', type: 'json', defaultValue: {} },
  { stateKey: 'customItemTitles', storageKey: 'korea-trip-item-titles', type: 'json', defaultValue: {} },
  { stateKey: 'theme', storageKey: 'korea-trip-theme', type: 'string', defaultValue: 'light' },
  { stateKey: 'bookingVotes', storageKey: 'korea-trip-booking-votes', type: 'json', defaultValue: {} },
  { stateKey: 'plannerOverrides', storageKey: 'korea-trip-planner-overrides', type: 'json', defaultValue: {} },
  { stateKey: 'plannerOrder', storageKey: 'korea-trip-planner-order', type: 'json', defaultValue: {} },
  { stateKey: 'reservations', storageKey: 'korea-trip-reservations', type: 'json', defaultValue: {} },
]

function cloneDefault(value) {
  if (Array.isArray(value)) return [...value]
  if (value && typeof value === 'object') return { ...value }
  return value
}

function safeParseJson(raw, fallback) {
  if (!raw) return cloneDefault(fallback)

  try {
    const parsed = JSON.parse(raw)
    return parsed ?? cloneDefault(fallback)
  } catch {
    return cloneDefault(fallback)
  }
}

export function normalizeTripState(snapshot = {}) {
  return Object.fromEntries(
    TRIP_STATE_STORAGE_KEYS.map(({ stateKey, defaultValue }) => [
      stateKey,
      snapshot[stateKey] ?? cloneDefault(defaultValue),
    ]),
  )
}

export function readLocalTripState(storage = window.localStorage) {
  return Object.fromEntries(
    TRIP_STATE_STORAGE_KEYS.map(({ stateKey, storageKey, type, defaultValue }) => {
      const raw = storage.getItem(storageKey)
      const value = type === 'string'
        ? raw || cloneDefault(defaultValue)
        : safeParseJson(raw, defaultValue)

      return [stateKey, value]
    }),
  )
}

export function writeLocalTripState(storage = window.localStorage, snapshot = {}) {
  const normalized = normalizeTripState({
    ...readLocalTripState(storage),
    ...snapshot,
  })

  TRIP_STATE_STORAGE_KEYS.forEach(({ stateKey, storageKey, type }) => {
    const value = normalized[stateKey]
    storage.setItem(storageKey, type === 'string' ? String(value) : JSON.stringify(value))
  })

  return normalized
}

export function createTripStateStore({
  env = {},
  storage = window.localStorage,
  createClient,
  tripId = env.VITE_TRIP_ID || 'korea-2026',
  tableName = 'trip_states',
} = {}) {
  const supabaseUrl = env.VITE_SUPABASE_URL
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY
  const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey && createClient)

  if (!hasSupabaseConfig) {
    return {
      mode: 'local',
      isShared: false,
      syncEnabled: false,
      tripId,
      load: async () => readLocalTripState(storage),
      save: async (snapshot) => writeLocalTripState(storage, snapshot),
      subscribe: () => () => {},
    }
  }

  const client = createClient(supabaseUrl, supabaseAnonKey)

  return {
    mode: 'supabase',
    isShared: true,
    syncEnabled: true,
    tripId,
    client,
    load: async () => {
      const { data, error } = await client
        .from(tableName)
        .select('state')
        .eq('trip_id', tripId)
        .maybeSingle()

      if (error) {
        return readLocalTripState(storage)
      }

      if (!data?.state) {
        return readLocalTripState(storage)
      }

      const normalized = writeLocalTripState(storage, data.state)
      return normalized
    },
    save: async (snapshot) => {
      const normalized = writeLocalTripState(storage, snapshot)
      const { error } = await client
        .from(tableName)
        .upsert({
          trip_id: tripId,
          state: normalized,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'trip_id' })

      if (error) {
        return { ok: false, error, state: normalized }
      }

      return { ok: true, state: normalized }
    },
    subscribe: (onStateChange) => {
      if (!client.channel) return () => {}

      const channel = client
        .channel(`trip-state-${tripId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: tableName,
            filter: `trip_id=eq.${tripId}`,
          },
          (payload) => {
            const state = payload.new?.state
            if (!state) return
            onStateChange(writeLocalTripState(storage, state))
          },
        )
        .subscribe()

      return () => {
        if (client.removeChannel) client.removeChannel(channel)
      }
    },
  }
}
