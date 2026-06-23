import '@testing-library/jest-dom'

// pdfjs-dist tries to use DOMMatrix at module load time, which doesn't exist in jsdom.
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: vi.fn(() => ({
    promise: Promise.resolve({ numPages: 0, getPage: vi.fn() }),
  })),
  version: '6.0.0',
}))

// The ?url import for the worker just needs to return a string.
vi.mock('pdfjs-dist/build/pdf.worker.min.mjs?url', () => ({ default: '/pdf.worker.min.mjs' }))
