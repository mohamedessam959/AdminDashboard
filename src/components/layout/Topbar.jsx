import { useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { en } from '../../locale/en'
import { MdDashboard, MdPeople, MdPerson, MdMenuBook, MdFactCheck } from 'react-icons/md'
import styles from './Topbar.module.css'

const PAGE_ICONS = {
  '/dashboard':  MdDashboard,
  '/students':   MdPeople,
  '/doctors':    MdPerson,
  '/subjects':   MdMenuBook,
  '/attendance': MdFactCheck,
}

const PAGE_KEYS = {
  '/dashboard':  'dashboard',
  '/students':   'students',
  '/doctors':    'doctors',
  '/subjects':   'subjects',
  '/attendance': 'attendance',
}

function resolveTitleKey(pathname) {
  if (pathname.startsWith('/doctors/') && pathname !== '/doctors') return 'doctorProfile'
  return PAGE_KEYS[pathname] || null
}

export default function Topbar() {
  const { pathname } = useLocation()
  const { user } = useAuthStore()
  const key = resolveTitleKey(pathname)
  const title = key ? en.topbar[key] : en.app.shortTitle
  const firstName = user?.name?.split(' ')[0] || ''

  let basePath = pathname
  if (pathname.startsWith('/doctors/')) basePath = '/doctors'
  const IconComponent = PAGE_ICONS[basePath]

  return (
    <header className={styles.topbar}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {IconComponent && <IconComponent size={20} style={{ color: 'var(--primary)' }} />}
        <h1 className={styles.title}>{title}</h1>
      </div>
      <div className={styles.right}>
        <span className={styles.greeting}>{en.topbar.welcome}, {firstName}</span>
        <div className={`${styles.avatar} ${styles.admin}`}>{user?.avatar}</div>
      </div>
    </header>
  )
}
