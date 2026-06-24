import { useState } from 'react'
import { useDataStore } from '../../store/dataStore'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { MdAdd, MdDelete, MdMenuBook, MdSchool } from 'react-icons/md'
import { en } from '../../locale/en'

const DEPTS = ['Computer Science', 'Mathematics', 'Physics', 'Engineering']

export default function SubjectsPage() {
  const { subjects, doctors, addSubject, deleteSubject } = useDataStore()
  const defaultDoctor = doctors[0]?.name || ''

  const [modal, setModal] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [form, setForm] = useState({ code: '', name: '', doctor: defaultDoctor, department: 'Computer Science', credits: 3 })

  const doctorNames = doctors.map((d) => d.name)

  const handleOpenModal = () => {
    setForm({ code: '', name: '', doctor: doctors[0]?.name || '', department: 'Computer Science', credits: 3 })
    setModal(true)
  }

  const handleSave = () => {
    if (!form.name || !form.code) return
    addSubject({ ...form, credits: Number(form.credits) })
    setModal(false)
  }

  return (
    <div>
      <div className="uni-card">
        <div className="uni-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MdMenuBook size={18} style={{ color: 'var(--primary)' }} />
            <h3>{en.subjects.title} <span style={{ color: 'var(--gray-400)', fontWeight: 400, fontSize: 13 }}>({subjects.length})</span></h3>
          </div>
          <button className="btn-primary-uni" onClick={handleOpenModal}><MdAdd size={16} /> {en.subjects.add}</button>
        </div>
        <div className="uni-card-body" style={{ padding: 0 }}>
          <table className="uni-table">
            <thead>
              <tr>
                <th>{en.subjects.code}</th>
                <th>{en.subjects.name}</th>
                <th>{en.subjects.doctor}</th>
                <th>{en.students.modal.department}</th>
                <th>{en.subjects.credits}</th>
                <th>{en.common.delete}</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.code}>
                  <td><span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}><MdSchool size={14} /> {s.code}</span></td>
                  <td><strong style={{ fontWeight: 600 }}>{s.name}</strong></td>
                  <td>{s.doctor}</td>
                  <td style={{ fontSize: 12, color: 'var(--gray-400)' }}>{s.department}</td>
                  <td>{s.credits}</td>
                  <td>
                    <button className="icon-btn del" onClick={() => setConfirm(s.code)} title={en.common.delete}><MdDelete size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={en.subjects.add}
        footer={
          <>
            <button className="btn-outline-uni" onClick={() => setModal(false)}>{en.common.cancel}</button>
            <button className="btn-primary-uni" onClick={handleSave}>{en.common.save}</button>
          </>
        }
      >
        <div className="form-field"><label>{en.subjects.nameLabel}</label><input className="uni-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="form-field"><label>{en.subjects.codeLabel}</label><input className="uni-input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} /></div>
        <div className="form-field"><label>{en.subjects.assignDoctor}</label>
          <select className="uni-select" value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })}>
            {doctorNames.map((n) => <option key={n}>{n}</option>)}
          </select>
        </div>
        <div className="form-field"><label>{en.students.modal.department}</label>
          <select className="uni-select" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
            {DEPTS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div className="form-field"><label>{en.subjects.credits}</label>
          <input className="uni-input" type="number" min={1} max={6} value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} />
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => deleteSubject(confirm)} message={en.subjects.deleteConfirm} />
    </div>
  )
}
