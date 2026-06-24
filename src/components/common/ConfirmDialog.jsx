import Modal from './Modal'
import { MdWarning } from 'react-icons/md'
import { en } from '../../locale/en'

export default function ConfirmDialog({ isOpen, onClose, onConfirm, message }) {
  const msg = message ?? en.confirm.defaultMessage
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={en.confirm.title}
      footer={
        <>
          <button className="btn-outline-uni" onClick={onClose}>{en.confirm.cancel}</button>
          <button
            className="btn-primary-uni"
            style={{ background: 'var(--danger)' }}
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {en.confirm.delete}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <MdWarning size={22} color="var(--warning)" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 14, color: 'var(--gray-600)' }}>{msg}</p>
      </div>
    </Modal>
  )
}
