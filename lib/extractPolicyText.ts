import mammoth from 'mammoth'
import { extractText, getDocumentProxy } from 'unpdf'

export type ExtractResult = { text: string } | { error: string }

const MAX_FILE_BYTES = 4 * 1024 * 1024 // 4 MB (aligned with API/Vercel limit)

export async function extractPolicyText(
  buffer: Buffer,
  mimeType: string,
): Promise<ExtractResult> {
  if (buffer.length > MAX_FILE_BYTES) {
    return { error: 'Policy file is too large. Maximum size is 10 MB.' }
  }

  const normalized = mimeType.toLowerCase().trim()

  if (
    normalized === 'application/pdf' ||
    normalized === 'application/octet-stream'
  ) {
    return extractFromPdf(buffer)
  }

  if (
    normalized === 'application/msword' ||
    normalized ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return extractFromDoc(buffer)
  }

  return { error: `Unsupported file type: ${mimeType}. Use .pdf or .doc/.docx.` }
}

async function extractFromPdf(buffer: Buffer): Promise<ExtractResult> {
  try {
    const pdf = await getDocumentProxy(new Uint8Array(buffer))
    const { text } = await extractText(pdf, { mergePages: true })
    const trimmed = (text ?? '').trim()
    if (!trimmed) return { error: 'No text could be extracted from the PDF.' }
    return { text: trimmed }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { error: `PDF extraction failed: ${message}` }
  }
}

async function extractFromDoc(buffer: Buffer): Promise<ExtractResult> {
  try {
    const result = await mammoth.extractRawText({ buffer })
    const text = (result?.value ?? '').trim()
    if (!text) return { error: 'No text could be extracted from the document.' }
    return { text }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { error: `Document extraction failed: ${message}` }
  }
}
