import { createWorker, type Worker } from 'tesseract.js'

// A single shared worker is reused across recognitions. Language data and the
// wasm core are fetched on first use (German + English), so the initial OCR
// call is the slowest; subsequent ones are fast.
let workerPromise: Promise<Worker> | null = null

function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = createWorker('deu+eng')
  }
  return workerPromise
}

/** Runs OCR on an image (data URL or URL) and returns the recognized text. */
export async function recognizeText(image: string): Promise<string> {
  const worker = await getWorker()
  const { data } = await worker.recognize(image)
  return data.text.replace(/\n{3,}/g, '\n\n').trim()
}
