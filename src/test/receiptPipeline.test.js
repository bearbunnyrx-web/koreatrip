import { describe, expect, test } from 'vitest'
import {
  RECEIPT_PIPELINE_CONFIG,
  amountToMinor,
  buildGemmaReceiptPrompt,
  formatReceiptAmount,
  normalizeReceiptExtraction,
  receiptDriveUrl,
} from '../lib/receiptPipeline'

describe('receipt ingestion pipeline config', () => {
  test('pins the Discord receipts thread and BearBunny Drive folder for Phase F2', () => {
    expect(RECEIPT_PIPELINE_CONFIG.discordThreadId).toBe('1504970426118311968')
    expect(RECEIPT_PIPELINE_CONFIG.driveFolderId).toBe('1LpqlmrVIZW8aWQdyqqrkAMlqdFilaMbG')
    expect(RECEIPT_PIPELINE_CONFIG.ollamaPreferredModel).toBe('gemma4:latest')
    expect(receiptDriveUrl()).toContain(RECEIPT_PIPELINE_CONFIG.driveFolderId)
  })

  test('builds a strict JSON prompt for local Gemma receipt extraction', () => {
    const prompt = buildGemmaReceiptPrompt({ fileName: 'lotte-world.pdf', messageText: 'booking for May 22' })

    expect(prompt).toContain('Return only JSON')
    expect(prompt).toContain('vendor')
    expect(prompt).toContain('confirmationNumber')
    expect(prompt).toContain('lotte-world.pdf')
    expect(prompt).toContain('booking for May 22')
  })

  test('normalizes Gemma output into editable app receipt records', () => {
    const normalized = normalizeReceiptExtraction({
      vendor: 'Sofitel Ambassador Seoul',
      date: '2026-05-22',
      amount: '220000',
      currency: 'KRW',
      category: 'hotel',
      confirmationNumber: 'ABC123',
      placeGuess: 'Sofitel Ambassador Seoul',
    }, {
      id: 'discord-1',
      fileName: 'sofitel.png',
      driveFileId: 'drive123',
      discordMessageUrl: 'https://discord.com/channels/x/y/z',
    })

    expect(normalized.vendor).toBe('Sofitel Ambassador Seoul')
    expect(normalized.amountMinor).toBe(220000)
    expect(normalized.category).toBe('Hotels')
    expect(normalized.confirmationNumber).toBe('ABC123')
    expect(normalized.status).toBe('review')
    expect(normalized.driveUrl).toContain('drive123')
  })

  test('formats Taiwan airport receipt amounts as zero-decimal TWD', () => {
    expect(amountToMinor('830', 'TWD')).toBe(830)
    expect(formatReceiptAmount(830, 'TWD')).toMatch(/830/)
    expect(formatReceiptAmount(830, 'TWD')).not.toContain('.00')
  })
})
