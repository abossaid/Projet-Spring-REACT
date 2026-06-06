import { useEffect, useState } from 'react'
import client from '../../api/client.js'

const EMPTY = { name: '', description: '' }

export default function CategoriesManager() {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  const load = () => client.get('/categories').then((res) => setCategories(res.data))

  useEffect(() => {
    load().catch(() => setError('Failed to load categories'))
  }, [])

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const resetForm = () => {
    setForm(EMPTY)
    setEditingId(null)
    setError('')
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editingId) {
        await client.put(`/categories/${editingId}`, form)
      } else {
        await client.post('/categories', form)
      }
      resetForm()
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed')
    }
  }

  const edit = (category) => {
    setEditingId(category.id)
    setForm({ name: category.name, description: category.description || '' })
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this category?')) return
    try {
      await client.delete(`/categories/${id}`)
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed')
    }
  }

  return (
    <div className="row">
      <div className="col-md-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <h5>{editingId ? 'Edit category' : 'Add category'}</h5>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={submit}>
              <div className="mb-2">
                <label className="form-label">Name</label>
                <input className="form-control" value={form.name} onChange={update('name')} required />
              </div>
              <div className="mb-2">
                <label className="form-label">Description</label>
                <textarea className="form-control" value={form.description} onChange={update('description')} />
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
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.description}</td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => edit(c)}>
                    Edit
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => remove(c.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan="4" className="text-muted text-center">No categories yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
