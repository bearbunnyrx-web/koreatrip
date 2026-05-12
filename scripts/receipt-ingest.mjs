#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import {
  RECEIPT_PIPELINE_CONFIG,
  buildGemmaReceiptPrompt,
  normalizeReceiptExtraction,
} from '../src/lib/receiptPipeline.js'

const args = process.argv.slice(2)
const getArg = (name, fallback = '') => {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] || fallback : fallback
}
const hasArg = (name) => args.includes(name)

const filePath = getArg('--file')
const messageText = getArg('--message-text')
const discordMessageUrl = getArg('--discord-message-url')
const outPath = resolve(getArg('--out', 'public/receipts-inbox.json'))
const dryRun = hasArg('--dry-run')
const skipDrive = hasArg('--skip-drive')

function run(command, commandArgs, options = {}) {
  return spawnSync(command, commandArgs, { encoding: 'utf8', ...options })
}

function pickOllamaModel() {
  const result = run('ollama', ['list'])
  if (result.status !== 0) return { model: RECEIPT_PIPELINE_CONFIG.ollamaPreferredModel, available: false, output: result.stderr || result.stdout }
  const lines = result.stdout.split('\n')
  const gemma = lines.find((line) => line.startsWith(RECEIPT_PIPELINE_CONFIG.ollamaPreferredModel))
    || lines.find((line) => line.toLowerCase().startsWith('gemma4'))
    || lines.find((line) => line.toLowerCase().startsWith('gemma'))
  return { model: gemma ? gemma.trim().split(/\s+/)[0] : RECEIPT_PIPELINE_CONFIG.ollamaPreferredModel, available: Boolean(gemma), output: result.stdout }
}

function extractLocalText(path) {
  if (!path || !existsSync(path)) return ''
  const lower = path.toLowerCase()
  if (/\.(txt|json|csv|md)$/i.test(lower)) return readFileSync(path, 'utf8').slice(0, 12000)
  if (/\.pdf$/i.test(lower)) {
    const pdftotext = run('pdftotext', [path, '-'])
    if (pdftotext.status === 0) return pdftotext.stdout.slice(0, 12000)
  }
  return ''
}

function parseJson(text) {
  const direct = text.trim()
  try { return JSON.parse(direct) } catch {}
  const match = direct.match(/\{[\s\S]*\}/)
  if (!match) return {}
  try { return JSON.parse(match[0]) } catch { return {} }
}

function uploadToDrive(path) {
  if (skipDrive || !path) return { skipped: true }
  const home = process.env.HERMES_HOME || `${process.env.HOME}/.hermes`
  const bridge = `${home}/skills/productivity/google-workspace/scripts/gws_bridge.py`
  const py = process.env.HERMES_PYTHON || 'python3'
  const result = run(py, [bridge, 'drive', '+upload', path, '--parent', RECEIPT_PIPELINE_CONFIG.driveFolderId])
  if (result.status !== 0) return { error: result.stderr || result.stdout }
  return parseJson(result.stdout)
}

function extractWithGemma(model, path) {
  const fileName = path ? basename(path) : 'discord attachment'
  const localText = extractLocalText(path)
  const prompt = `${buildGemmaReceiptPrompt({ fileName, messageText })}\n\nOCR/text content if available:\n${localText || '(No local text extracted. Infer only from filename and Discord context.)'}`
  if (dryRun) return { vendor: fileName, category: 'other', notes: 'Dry run — Gemma not called', confidence: 0 }
  const result = run('ollama', ['run', model, prompt], { timeout: 120000 })
  if (result.status !== 0) return { vendor: fileName, category: 'other', notes: `Gemma extraction failed: ${result.stderr || result.stdout}`, confidence: 0 }
  return parseJson(result.stdout)
}

function loadExisting(path) {
  if (!existsSync(path)) return []
  try {
    const value = JSON.parse(readFileSync(path, 'utf8'))
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

if (!dryRun && (!filePath || !existsSync(filePath))) {
  console.error('Usage: node scripts/receipt-ingest.mjs --file /path/to/receipt --message-text "Discord text" [--discord-message-url URL] [--skip-drive] [--dry-run]')
  process.exit(2)
}

const modelInfo = pickOllamaModel()
const absoluteFile = filePath ? resolve(filePath) : ''
const driveUpload = dryRun ? { dryRun: true, targetFolder: RECEIPT_PIPELINE_CONFIG.driveFolderId } : uploadToDrive(absoluteFile)
const extraction = extractWithGemma(modelInfo.model, absoluteFile)
const driveFileId = driveUpload.id || driveUpload.fileId || ''
const driveUrl = driveUpload.webViewLink || (driveFileId ? `https://drive.google.com/file/d/${driveFileId}/view` : '')
const record = normalizeReceiptExtraction(extraction, {
  id: `discord-${Date.now()}`,
  fileName: absoluteFile ? basename(absoluteFile) : 'dry-run-receipt',
  driveFileId,
  driveUrl,
  discordMessageUrl,
  source: 'discord-drive-gemma',
  status: 'review',
})
const driveStatus = driveUpload.error
  ? 'needs-google-reauth'
  : driveUpload.skipped
    ? 'skipped'
    : dryRun
      ? 'dry-run'
      : 'uploaded'
record.ingest = {
  discordThreadId: RECEIPT_PIPELINE_CONFIG.discordThreadId,
  driveFolderId: RECEIPT_PIPELINE_CONFIG.driveFolderId,
  ollamaModel: modelInfo.model,
  driveUploadStatus: driveStatus,
  driveUploadError: driveUpload.error || '',
}

const existing = loadExisting(outPath)
writeFileSync(outPath, `${JSON.stringify([record, ...existing], null, 2)}\n`)
console.log(JSON.stringify({ ok: true, record, outPath }, null, 2))
