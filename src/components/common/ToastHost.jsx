import { useToastStore } from '../../store/toastStore'
import styles from './ToastHost.module.css'

export default function ToastHost() {
  const toasts = useToastStore((s) => s.toasts)
  if (!toasts.length) return null
  return (
    <div className={styles.host} aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`${styles.toast} ${styles[t.type] || styles.info}`}>
          {t.message}
        </div>
      ))}
    </div>
  )
}
