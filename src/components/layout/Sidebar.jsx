import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { en } from '../../locale/en'
import {
  MdDashboard, MdPeople, MdPerson, MdMenuBook,
  MdFactCheck, MdLogout, MdSchool,
} from 'react-icons/md'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  { labelKey: 'dashboard',  path: '/dashboard',  icon: MdDashboard },
  { labelKey: 'students',   path: '/students',   icon: MdPeople    },
  { labelKey: 'doctors',    path: '/doctors',    icon: MdPerson    },
  { labelKey: 'subjects',   path: '/subjects',   icon: MdMenuBook  },
  { labelKey: 'attendance', path: '/attendance', icon: MdFactCheck },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}><MdSchool size={20} /></div>
        <div>
          <p className={styles.logoTitle}>{en.app.shortTitle}</p>
          <p className={styles.logoSub}>{en.app.title}</p>
        </div>
      </div>

      <div className={styles.userSection}>
        <div className={`${styles.avatar} ${styles.admin}`}>{user?.avatar}</div>
        <div>
          <p className={styles.userName}>{user?.name}</p>
          <span className={`${styles.roleBadge} ${styles.admin}`}>{en.nav.admin}</span>
        </div>
      </div>

      <nav className={styles.nav}>
        <p className={styles.navSection}>{en.nav.menu}</p>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <item.icon size={18} />
            <span>{en.nav[item.labelKey]}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.bottom}>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <MdLogout size={18} />
          <span>{en.nav.signOut}</span>
        </button>
      </div>
    </aside>
  )
}
