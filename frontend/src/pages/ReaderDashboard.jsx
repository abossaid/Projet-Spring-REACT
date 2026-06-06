import { useEffect, useState } from 'react'
import client from '../api/client.js'
import { downloadPdf } from '../utils/pdf.js'
import PdfViewerModal from '../components/PdfViewerModal.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function ReaderDashboard() {
  const { user } = useAuth()
  const [ebooks, setEbooks] = useState([])
  const [categories, setCategories] = useState([])
  const [categoryFilter, setCategoryFilter] = useState('')
  const [recommended, setRecommended] = useState([])
  const [viewing, setViewing] = useState(null)
  const [error, setError] = useState('')

  const loadEbooks = async (categoryId) => {
    try {
      if (categoryId) {
        const { data } = await client.get(`/ebooks/recommended/${categoryId}`)
        setEbooks(data)
      } else {
        const { data } = await client.get('/ebooks')
        setEbooks(data)
      }
    } catch {
      setError('Failed to load ebooks')
    }
  }

  const loadRecommended = async (categoryId) => {
    if (!categoryId) {
      setRecommended([])
      return
    }
    const { data } = await client.get(`/ebooks/recommended/${categoryId}`)
    setRecommended(data)
  }

  useEffect(() => {
    client.get('/categories').then((res) => setCategories(res.data)).catch(() => {})
    loadEbooks('')
  }, [])

  const onFilterChange = (e) => {
    const value = e.target.value
    setCategoryFilter(value)
    loadEbooks(value)
    loadRecommended(value)
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Welcome, {user.username} 👋</h2>
        <div style={{ minWidth: 240 }}>
          <select className="form-select" value={categoryFilter} onChange={onFilterChange}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {categoryFilter && recommended.length > 0 && (
        <div className="alert alert-info">
          <strong>Recommended in this category:</strong>{' '}
          {recommended.map((e) => e.title).join(', ')}
        </div>
      )}

      <div className="row g-3">
        {ebooks.length === 0 && (
          <p className="text-muted">No ebooks available yet.</p>
        )}
        {ebooks.map((ebook) => (
          <div className="col-md-4" key={ebook.id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{ebook.title}</h5>
                <h6 className="card-subtitle mb-2 text-muted">{ebook.author}</h6>
                {ebook.categoryName && (
                  <span className="badge bg-secondary align-self-start mb-2">{ebook.categoryName}</span>
                )}
                <p className="card-text small flex-grow-1">{ebook.description}</p>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-primary"
                    disabled={!ebook.hasFile}
                    onClick={() => setViewing(ebook)}
                  >
                    Read
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    disabled={!ebook.hasFile}
                    onClick={() => downloadPdf(ebook.id, ebook.originalFileName)}
                  >
                    Download
                  </button>
                  {!ebook.hasFile && <span className="text-muted small align-self-center">No PDF</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {viewing && <PdfViewerModal ebook={viewing} onClose={() => setViewing(null)} />}
    </div>
  )
}
