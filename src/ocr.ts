import { createWorker, type Worker } from 'tesseract.js'

// A single shared worker is reused across recognitions. Language data and the
// wasm core are fetched on first use (German + English), so the first OCR call
// is the slowest; subsequent ones are fast.
let workerPromise: Promise<Worker> | null = null

// The worker's logger is global, so route progress to whichever recognition
// is currently running.
let activeProgress: ((p: number) => void) | null = null

function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = createWorker('deu+eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') activeProgress?.(m.progress)
      },
    })
  }
  return workerPromise
}

export interface OcrResult {
  /** Cleaned recognized text (empty when nothing usable was found). */
  text: string
  /** Overall Tesseract confidence, 0..100. */
  confidence: number
  /** Whether the result looks like real, usable text (not gibberish). */
  usable: boolean
}

const LETTERS = /[A-Za-zÀ-ÖØ-öø-ÿ]/g

/**
 * Heuristic to reject low-quality OCR: gibberish (lots of single characters and
 * symbols, no real words) or low recognition confidence.
 */
function isUsable(text: string, confidence: number): boolean {
  const t = text.trim()
  if (t.length < 3 || confidence < 55) return false

  const compact = t.replace(/\s+/g, '')
  const letters = (t.match(LETTERS) ?? []).length
  if (letters < 4) return false
  // Mostly letters, not a symbol/number soup.
  if (letters / compact.length < 0.5) return false

  // At least one "real" word: length >= 3 and predominantly letters.
  const realWords = t.split(/\s+/).filter((w) => {
    const wl = (w.match(LETTERS) ?? []).length
    return w.length >= 3 && wl / w.length >= 0.7
  })
  return realWords.length >= 1
}

/**
 * Runs OCR on an image (data URL), reports progress (0..1) and assesses the
 * result quality.
 */
export async function recognizeImage(image: string, onProgress?: (p: number) => void): Promise<OcrResult> {
  const worker = await getWorker()
  activeProgress = onProgress ?? null
  try {
    const { data } = await worker.recognize(image)
    const text = data.text.replace(/\n{3,}/g, '\n\n').trim()
    const confidence = Math.round(data.confidence ?? 0)
    return { text, confidence, usable: isUsable(text, confidence) }
  } finally {
    activeProgress = null
  }
}
