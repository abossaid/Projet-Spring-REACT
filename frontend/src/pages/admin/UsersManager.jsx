import { useEffect, useState } from 'react'
import client from '../../api/client.js'

const EMPTY = { username: '', email: '', password: '', role: 'READER' }

export default function UsersManager() {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  const load = () => client.get('/users').then((res) => setUsers(res.data))

  useEffect(() => {
    load().catch(() => setError('Failed to load users'))
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
        const payload = { email: form.email, role: form.role }
        if (form.password) payload.password = form.password
        await client.put(`/users/${editingId}`, payload)
      } else {
        await client.post('/users', form)
      }
      resetForm()
      await load()
    } catch (err) {
      const data = err.response?.data
      setError(data?.message || (data?.errors && Object.values(data.errors).join(', ')) || 'Save failed')
    }
  }

  const edit = (user) => {
    setEditingId(user.id)
    setForm({ username: user.username, email: user.email, password: '', role: user.role })
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this user?')) return
    try {
      await client.delete(`/users/${id}`)
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
            <h5>{editingId ? `Edit user #${editingId}` : 'Add user'}</h5>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={submit}>
              <div className="mb-2">
                <label className="form-label">Username</label>
                <input
                  className="form-control"
                  value={form.username}
                  onChange={update('username')}
                  disabled={!!editingId}
                  required
                />
              </div>
              <div className="mb-2">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" value={form.email} onChange={update('email')} required />
              </div>
              <div className="mb-2">
                <label className="form-label">
                  Password {editingId && <span className="text-muted small">(blank = unchanged)</span>}
                </label>
                <input
                  type="password"
                  className="form-control"
                  value={form.password}
                  onChange={update('password')}
                  required={!editingId}
                />
              </div>
              <div className="mb-2">
                <label className="form-label">Role</label>
                <select className="form-select" value={form.role} onChange={update('role')}>
                  <option value="READER">READER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
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
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge ${u.role === 'ADMIN' ? 'bg-danger' : 'bg-info'}`}>{u.role}</span>
                </td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => edit(u)}>
                    Edit
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => remove(u.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
