export const RECEIPT_PIPELINE_CONFIG = {
  discordThreadId: '1503591512573874176',
  driveFolderId: '1LpqlmrVIZW8aWQdyqqrkAMlqdFilaMbG',
  ollamaPreferredModel: 'gemma4:latest',
  localStorageKey: 'korea-trip-receipts',
}

export const RECEIPT_CATEGORIES = ['All', 'Hotels', 'Food', 'Beauty', 'Transit', 'Activities', 'Other']

const CATEGORY_MAP = {
  hotel: 'Hotels',
  hotels: 'Hotels',
  lodging: 'Hotels',
  restaurant: 'Food',
  food: 'Food',
  meal: 'Food',
  cafe: 'Food',
  beauty: 'Beauty',
  clinic: 'Beauty',
  derm: 'Beauty',
  dermatology: 'Beauty',
  transit: 'Transit',
  flight: 'Transit',
  train: 'Transit',
  taxi: 'Transit',
  car: 'Transit',
  activity: 'Activities',
  activities: 'Activities',
  ticket: 'Activities',
}

export function receiptDriveUrl(fileId = '') {
  if (fileId) return `https://drive.google.com/file/d/${fileId}/view`
  return `https://drive.google.com/drive/u/0/folders/${RECEIPT_PIPELINE_CONFIG.driveFolderId}`
}

export function normalizeReceiptCategory(value = '') {
  const key = String(value).trim().toLowerCase()
  return CATEGORY_MAP[key] || (RECEIPT_CATEGORIES.includes(value) ? value : 'Other')
}

export function amountToMinor(amount = 0, currency = 'USD') {
  const numeric = Number(String(amount).replace(/[^0-9.-]/g, '')) || 0
  const zeroDecimal = ['KRW', 'JPY'].includes(String(currency).toUpperCase())
  return Math.round(numeric * (zeroDecimal ? 1 : 100))
}

export function formatReceiptAmount(amountMinor = 0, currency = 'USD') {
  const code = String(currency || 'USD').toUpperCase()
  const zeroDecimal = ['KRW', 'JPY'].includes(code)
  const value = zeroDecimal ? amountMinor : amountMinor / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code,
    maximumFractionDigits: zeroDecimal ? 0 : 2,
  }).format(value)
}

export function buildGemmaReceiptPrompt({ fileName = 'receipt file', messageText = '' } = {}) {
  return `You are extracting a Korea trip receipt or booking confirmation for Dr. Cho and Dr. Ho. Return only JSON with these keys: vendor, date, amount, currency, category, confirmationNumber, placeGuess, eventGuess, notes, confidence. Use null when unknown. category must be one of hotel, food, beauty, transit, activity, other. File name: ${fileName}. Discord message context: ${messageText}.`
}

export function normalizeReceiptExtraction(extraction = {}, source = {}) {
  const currency = String(extraction.currency || source.currency || 'USD').toUpperCase()
  const amountMinor = amountToMinor(extraction.amount ?? source.amount ?? 0, currency)
  const driveFileId = source.driveFileId || extraction.driveFileId || ''
  const vendor = extraction.vendor || source.vendor || source.fileName || 'Receipt pending review'

  return {
    id: source.id || `receipt-${Date.now()}`,
    vendor,
    date: extraction.date || source.date || '',
    amountMinor,
    currency,
    category: normalizeReceiptCategory(extraction.category || source.category),
    confirmationNumber: extraction.confirmationNumber || extraction.confirmation_no || source.confirmationNumber || '',
    placeGuess: extraction.placeGuess || extraction.place || source.placeGuess || '',
    eventGuess: extraction.eventGuess || source.eventGuess || '',
    notes: extraction.notes || source.notes || '',
    fileName: source.fileName || extraction.fileName || '',
    driveFileId,
    driveUrl: source.driveUrl || extraction.driveUrl || receiptDriveUrl(driveFileId),
    discordMessageUrl: source.discordMessageUrl || '',
    source: source.source || 'discord-gemma',
    status: source.status || 'review',
    createdAt: source.createdAt || new Date().toISOString(),
  }
}

export function legacySpendToReceipts(spendRows = []) {
  return spendRows.map((row) => normalizeReceiptExtraction({
    vendor: row.item,
    amount: row.amount,
    currency: 'USD',
    category: row.item.toLowerCase().includes('flight') || row.item.toLowerCase().includes('car') ? 'transit' : 'activity',
    notes: row.detail,
  }, {
    id: `legacy-${row.item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    source: 'legacy-spend',
    status: 'logged',
  }))
}
