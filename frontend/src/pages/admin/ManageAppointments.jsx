import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../services/api'

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await api.get('/appointments')
      setAppointments(response.data.appointments || response.data || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/appointments/${id}`, { status: newStatus })
      setAppointments(appointments.map((apt) =>
        apt.id === id || apt._id === id ? { ...apt, status: newStatus } : apt
      ))
    } catch (error) {
      console.error('Error updating appointment:', error)
      alert('Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce rendez-vous ?')) {
      try {
        await api.delete(`/appointments/${id}`)
        setAppointments(appointments.filter((apt) => apt.id !== id && apt._id !== id))
      } catch (error) {
        console.error('Error deleting appointment:', error)
        alert('Erreur lors de la suppression')
      }
    }
  }

  const statuses = {
    pending: { label: 'En attente', color: '#ffc107', icon: '⏳', bg: '#fff3cd' },
    confirmed: { label: 'Confirmé', color: '#28a745', icon: '✅', bg: '#d4edda' },
    completed: { label: 'Terminé', color: '#17a2b8', icon: '📋', bg: '#d1ecf1' },
    cancelled: { label: 'Annulé', color: '#dc3545', icon: '❌', bg: '#f8d7da' },
  }

  const filteredAppointments = appointments.filter((apt) => {
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus
    const matchesSearch = apt.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          apt.service_name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const statsCounts = {
    pending: appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
  }

  if (loading) {
    return (
      <div style={{ padding: 'clamp(20px, 5vw, 40px)', textAlign: 'center' }}>
        <div style={{ fontSize: '24px', animation: 'spin 1s linear infinite' }}>⏳</div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', color: '#333', marginBottom: '24px', fontWeight: '700' }}>
        📅 Gestion des Rendez-vous
      </h2>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(140px, 20vw, 180px), 1fr))',
        gap: 'clamp(12px, 2vw, 16px)',
        marginBottom: 'clamp(24px, 4vw, 32px)',
      }}>
        {Object.entries(statsCounts).map(([status, count]) => (
          <motion.button
            key={status}
            onClick={() => setFilterStatus(status)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: filterStatus === status ? statuses[status].bg : 'white',
              border: `2px solid ${statuses[status].color}`,
              borderRadius: '10px',
              padding: 'clamp(12px, 2vw, 16px)',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '6px' }}>
              {statuses[status].icon}
            </div>
            <div style={{ fontSize: 'clamp(11px, 1.5vw, 12px)', color: '#999', fontWeight: '600' }}>
              {statuses[status].label}
            </div>
            <div style={{ fontSize: 'clamp(1.2rem, 3vw, 1.4rem)', fontWeight: '700', color: statuses[status].color }}>
              {count}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: 'clamp(12px, 2vw, 16px)',
        marginBottom: 'clamp(20px, 3vw, 30px)',
        flexWrap: 'wrap',
      }}>
        <input
          type="text"
          placeholder="Rechercher (client ou service)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: 'clamp(10px, 1.5vw, 12px) clamp(12px, 2vw, 16px)',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            fontSize: 'clamp(12px, 1.8vw, 14px)',
          }}
        />
        <motion.button
          onClick={() => setFilterStatus('all')}
          whileHover={{ scale: 1.02 }}
          style={{
            background: filterStatus === 'all' ? '#667eea' : '#f0f0f0',
            color: filterStatus === 'all' ? 'white' : '#333',
            border: 'none',
            borderRadius: '8px',
            padding: 'clamp(10px, 1.5vw, 12px) clamp(12px, 2vw, 16px)',
            cursor: 'pointer',
            fontSize: 'clamp(12px, 1.8vw, 14px)',
            fontWeight: '600',
          }}
        >
          Tous
        </motion.button>
      </div>

      {/* Appointments List */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '2px solid #f0f0f0',
        overflow: 'hidden',
      }}>
        {filteredAppointments.map((apt, i) => (
          <motion.div
            key={apt.id || apt._id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile() ? '1fr' : '40px 1fr auto',
              gap: 'clamp(12px, 2vw, 16px)',
              padding: 'clamp(12px, 2vw, 16px) clamp(16px, 3vw, 24px)',
              borderBottom: i < filteredAppointments.length - 1 ? '1px solid #f0f0f0' : 'none',
              alignItems: 'center',
            }}
          >
            {/* Status Icon */}
            <div style={{ fontSize: '20px', textAlign: 'center' }}>
              {statuses[apt.status]?.icon || '📋'}
            </div>

            {/* Details */}
            <div>
              <h3 style={{ margin: '0 0 6px 0', fontWeight: '700', color: '#333', fontSize: 'clamp(13px, 1.8vw, 15px)' }}>
                {apt.service_name || 'Service'}
              </h3>
              <div style={{ fontSize: 'clamp(11px, 1.5vw, 12px)', color: '#999', marginBottom: '4px' }}>
                👤 {apt.client_name || 'Client'}
              </div>
              <div style={{ fontSize: 'clamp(11px, 1.5vw, 12px)', color: '#999' }}>
                📅 {apt.appointment_date || 'Date TBD'} • {apt.appointment_time || 'Heure TBD'}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  setSelectedAppointment(apt)
                  setShowDetails(true)
                }}
                style={{
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                👁️
              </motion.button>
              {apt.status === 'pending' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleStatusChange(apt.id || apt._id, 'confirmed')}
                  style={{
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}
                >
                  ✅
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => handleDelete(apt.id || apt._id)}
                style={{
                  background: '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                🗑️
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: 'clamp(40px, 8vw, 80px) 20px',
          color: '#999',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <div style={{ fontSize: 'clamp(14px, 2vw, 16px)', fontWeight: '600' }}>
            Aucun rendez-vous
          </div>
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {showDetails && selectedAppointment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetails(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              padding: '20px',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: 'clamp(20px, 5vw, 40px)',
                maxWidth: '500px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              }}
            >
              <h2 style={{ margin: '0 0 24px 0', fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: '700', color: '#333' }}>
                📋 Détails du Rendez-vous
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ color: '#999', fontWeight: '600' }}>Service:</span>
                  <span style={{ fontWeight: '700', color: '#333' }}>{selectedAppointment.service_name || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ color: '#999', fontWeight: '600' }}>Client:</span>
                  <span style={{ fontWeight: '700', color: '#333' }}>{selectedAppointment.client_name || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ color: '#999', fontWeight: '600' }}>Date:</span>
                  <span style={{ fontWeight: '700', color: '#333' }}>{selectedAppointment.appointment_date || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ color: '#999', fontWeight: '600' }}>Heure:</span>
                  <span style={{ fontWeight: '700', color: '#333' }}>{selectedAppointment.appointment_time || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ color: '#999', fontWeight: '600' }}>Statut:</span>
                  <span style={{
                    fontWeight: '700',
                    color: statuses[selectedAppointment.status]?.color,
                  }}>
                    {statuses[selectedAppointment.status]?.label || 'Inconnu'}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowDetails(false)}
                style={{
                  width: '100%',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: 'clamp(10px, 1.5vw, 12px)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: 'clamp(12px, 1.8vw, 14px)',
                }}
              >
                Fermer
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function isMobile() {
  return typeof window !== 'undefined' && window.innerWidth < 768
}

export default ManageAppointments
