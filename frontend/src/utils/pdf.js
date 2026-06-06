import client from '../api/client.js'

/**
 * Fetches a PDF (authenticated) and returns an object URL. The caller is
 * responsible for revoking the URL when done.
 */
export async function fetchPdfObjectUrl(id) {
  const res = await client.get(`/ebooks/${id}/view`, { responseType: 'blob' })
  return URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
}

/** Downloads the PDF as a file via an authenticated request. */
export async function downloadPdf(id, filename) {
  const res = await client.get(`/ebooks/${id}/download`, { responseType: 'blob' })
  const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `ebook-${id}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
