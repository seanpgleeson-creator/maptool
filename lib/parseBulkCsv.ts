/**
 * Parse a CSV file with header row. Expects columns for UPC and MAP price.
 * Column names are matched case-insensitively: upc, map, map price, map_price.
 */

export type BulkRow = { upc: string; mapPrice: number }

export function parseBulkCsv(csvText: string): { rows: BulkRow[]; error?: string } {
  const lines = csvText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  if (lines.length < 2) {
    return { rows: [], error: 'CSV must have a header row and at least one data row.' }
  }

  const headerLine = lines[0]
  const headers = splitCsvLine(headerLine).map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ''))
  const upcIdx = headers.findIndex(
    (h) => h === 'upc' || h === 'upc code' || h === 'gtin',
  )
  const mapIdx = headers.findIndex(
    (h) =>
      h === 'map' ||
      h === 'map price' ||
      h === 'map_price' ||
      h === 'map price ($)' ||
      h === 'price',
  )

  if (upcIdx === -1) {
    return { rows: [], error: 'CSV must have a UPC column (header: upc, upc code, or gtin).' }
  }
  if (mapIdx === -1) {
    return {
      rows: [],
      error:
        'CSV must have a MAP price column (header: map, map price, map_price, or price).',
    }
  }

  const rows: BulkRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const parts = splitCsvLine(lines[i])
    const upc = (parts[upcIdx] ?? '').trim().replace(/^"|"$/g, '')
    const mapRaw = (parts[mapIdx] ?? '').trim().replace(/^"|"$/g, '').replace(/,/g, '')
    const mapPrice = Number(mapRaw)
    if (!upc) continue // skip empty rows
    if (!Number.isFinite(mapPrice) || mapPrice <= 0) {
      return {
        rows: [],
        error: `Row ${i + 1}: MAP price must be a positive number. Got: ${parts[mapIdx] ?? ''}`,
      }
    }
    rows.push({ upc, mapPrice })
  }

  if (rows.length === 0) {
    return { rows: [], error: 'No valid data rows found after the header.' }
  }

  return { rows }
}

/** Split a CSV line by commas, respecting double-quoted fields. */
function splitCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      inQuotes = !inQuotes
    } else if ((c === ',' && !inQuotes) || (c === '\n' && !inQuotes)) {
      result.push(current)
      current = ''
    } else {
      current += c
    }
  }
  result.push(current)
  return result
}
