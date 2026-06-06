import { useState } from 'react'
import CategoriesManager from './admin/CategoriesManager.jsx'
import UsersManager from './admin/UsersManager.jsx'
import EbooksManager from './admin/EbooksManager.jsx'

const TABS = [
  { key: 'ebooks', label: 'Ebooks' },
  { key: 'categories', label: 'Categories' },
  { key: 'users', label: 'Users' },
]

export default function AdminDashboard() {
  const [tab, setTab] = useState('ebooks')

  return (
    <div>
      <h2 className="mb-3">Admin Dashboard</h2>
      <ul className="nav nav-tabs mb-3">
        {TABS.map((t) => (
          <li className="nav-item" key={t.key}>
            <button
              className={`nav-link ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          </li>
        ))}
      </ul>

      {tab === 'ebooks' && <EbooksManager />}
      {tab === 'categories' && <CategoriesManager />}
      {tab === 'users' && <UsersManager />}
    </div>
  )
}
