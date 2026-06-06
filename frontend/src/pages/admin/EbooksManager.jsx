import { useEffect, useRef, useState } from 'react'
import client from '../../api/client.js'
import { downloadPdf } from '../../utils/pdf.js'
import PdfViewerModal from '../../components/PdfViewerModal.jsx'

const EMPTY = { title: '', author: '', description: '', categoryId: '' }

export default function EbooksManager() {
  const [ebooks, setEbooks] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [file, setFile] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [viewing, setViewing] = useState(null)
  const fileInput = useRef(null)

  const loadEbooks = () => client.get('/ebooks').then((res) => setEbooks(res.data))
  const loadCategories = () => client.get('/categories').then((res) => setCategories(res.data))

  useEffect(() => {
    Promise.all([loadEbooks(), loadCategories()]).catch(() => setError('Failed to load data'))
  }, [])

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const resetForm = () => {
    setForm(EMPTY)
    setFile(null)
    setEditingId(null)
    setError('')
    if (fileInput.current) fileInput.current.value = ''
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const data = new FormData()
    data.append('title', form.title)
    data.append('author', form.author)
    data.append('description', form.description || '')
    if (form.categoryId) data.append('categoryId', form.categoryId)
    if (file) data.append('file', file)

    try {
      if (editingId) {
        await client.put(`/ebooks/${editingId}`, data)
      } else {
        await client.post('/ebooks', data)
      }
      resetForm()
      await loadEbooks()
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed')
    }
  }

  const edit = (ebook) => {
    setEditingId(ebook.id)
    setForm({
      title: ebook.title,
      author: ebook.author,
      description: ebook.description || '',
      categoryId: ebook.categoryId || '',
    })
    setFile(null)
    if (fileInput.current) fileInput.current.value = ''
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this ebook?')) return
    try {
      await client.delete(`/ebooks/${id}`)
      await loadEbooks()
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed')
    }
  }

  return (
    <div className="row">
      <div className="col-md-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <h5>{editingId ? `Edit ebook #${editingId}` : 'Add ebook'}</h5>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={submit}>
              <div className="mb-2">
                <label className="form-label">Title</label>
                <input className="form-control" value={form.title} onChange={update('title')} required />
              </div>
              <div className="mb-2">
                <label className="form-label">Author</label>
                <input className="form-control" value={form.author} onChange={update('author')} required />
              </div>
              <div className="mb-2">
                <label className="form-label">Description</label>
                <textarea className="form-control" value={form.description} onChange={update('description')} />
              </div>
              <div className="mb-2">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.categoryId} onChange={update('categoryId')}>
                  <option value="">— none —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-2">
                <label className="form-label">
                  PDF file {editingId && <span className="text-muted small">(optional: replaces existing)</span>}
                </label>
                <input
                  ref={fileInput}
                  type="file"
                  accept="application/pdf"
                  className="form-control"
                  onChange={(e) => setFile(e.target.files[0] || null)}
                />
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary btn-sm">{editingId ? 'Update' : 'Create'}</button>
                {editingId && (
                  <button type="button" className="btn btn-secondary btn-sm" onClick={resetForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="col-md-8">
        <table className="table table-striped table-hover align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>PDF</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ebooks.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.title}</td>
                <td>{b.author}</td>
                <td>{b.categoryName || <span className="text-muted">—</span>}</td>
                <td>
                  {b.hasFile ? (
                    <span className="badge bg-success">Yes</span>
                  ) : (
                    <span className="badge bg-secondary">No</span>
                  )}
                </td>
                <td className="text-end text-nowrap">
                  <button
                    className="btn btn-sm btn-outline-success me-1"
                    disabled={!b.hasFile}
                    onClick={() => setViewing(b)}
                  >
                    View
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary me-1"
                    disabled={!b.hasFile}
                    onClick={() => downloadPdf(b.id, b.originalFileName)}
                  >
                    Download
                  </button>
                  <button className="btn btn-sm btn-outline-primary me-1" onClick={() => edit(b)}>
                    Edit
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => remove(b.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {ebooks.length === 0 && (
              <tr>
                <td colSpan="6" className="text-muted text-center">No ebooks yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {viewing && <PdfViewerModal ebook={viewing} onClose={() => setViewing(null)} />}
    </div>
  )
}
