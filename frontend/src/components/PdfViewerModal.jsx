import { useEffect, useState } from 'react'
import { fetchPdfObjectUrl } from '../utils/pdf.js'

/**
 * Shows a PDF inline in a Bootstrap modal using an <iframe>. The PDF is
 * fetched with the JWT and rendered from an object URL.
 */
export default function PdfViewerModal({ ebook, onClose }) {
  const [url, setUrl] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let objectUrl
    let cancelled = false
    fetchPdfObjectUrl(ebook.id)
      .then((u) => {
        if (cancelled) {
          URL.revokeObjectURL(u)
          return
        }
        objectUrl = u
        setUrl(u)
      })
      .catch(() => setError('Could not load the PDF. Has a file been uploaded?'))
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [ebook.id])

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content" style={{ height: '90vh' }}>
          <div className="modal-header">
            <h5 className="modal-title">
              {ebook.title} <span className="text-muted small">by {ebook.author}</span>
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body p-0">
            {error && <div className="alert alert-warning m-3">{error}</div>}
            {!error && !url && <div className="p-4 text-center">Loading PDF…</div>}
            {url && (
              <iframe title={ebook.title} src={url} width="100%" height="100%" style={{ border: 'none' }} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
