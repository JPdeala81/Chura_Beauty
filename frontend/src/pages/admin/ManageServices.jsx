import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../services/api'

const ManageServices = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: 0,
    duration_minutes: 30,
    description: '',
    active: true,
  })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await api.get('/services')
      setServices(response.data.services || response.data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (service) => {
    setEditingService(service)
    setFormData(service)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      try {
        await api.delete(`/services/${id}`)
        setServices(services.filter((s) => s.id !== id && s._id !== id))
      } catch (error) {
        console.error('Error deleting service:', error)
        alert('Erreur lors de la suppression')
      }
    }
  }

  const handleSaveService = async () => {
    try {
      if (editingService) {
        await api.put(`/services/${editingService.id || editingService._id}`, formData)
      } else {
        await api.post('/services', formData)
      }
      setShowForm(false)
      setEditingService(null)
      setFormData({
        title: '',
        category: '',
        price: 0,
        duration_minutes: 30,
        description: '',
        active: true,
      })
      fetchServices()
    } catch (error) {
      console.error('Error saving service:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingService(null)
    setFormData({
      title: '',
      category: '',
      price: 0,
      duration_minutes: 30,
      description: '',
      active: true,
    })
  }

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const categories = ['all', ...new Set(services.map((s) => s.category))]

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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'clamp(20px, 4vw, 40px)',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', color: '#333', margin: 0, fontWeight: '700' }}>
          💅 Gestion des Services
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: 'clamp(10px, 2vw, 14px) clamp(16px, 3vw, 24px)',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: 'clamp(12px, 1.8vw, 14px)',
          }}
        >
          ➕ Ajouter Service
        </motion.button>
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
          placeholder="Rechercher un service..."
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
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: 'clamp(10px, 1.5vw, 12px) clamp(12px, 2vw, 16px)',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            fontSize: 'clamp(12px, 1.8vw, 14px)',
            background: 'white',
          }}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'Toutes catégories' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Services Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(200px, 45vw, 350px), 1fr))',
        gap: 'clamp(16px, 3vw, 24px)',
      }}>
        {filteredServices.map((service, i) => (
          <motion.div
            key={service.id || service._id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)' }}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: 'clamp(16px, 3vw, 24px)',
              border: '2px solid #f0f0f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontWeight: '700', color: '#333', fontSize: 'clamp(14px, 2vw, 16px)' }}>
                  {service.title}
                </h3>
                <span style={{
                  display: 'inline-block',
                  background: '#f0f0f0',
                  color: '#666',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: 'clamp(11px, 1.5vw, 12px)',
                  fontWeight: '600',
                  marginTop: '4px',
                }}>
                  {service.category || 'Sans catégorie'}
                </span>
              </div>
              <span style={{ fontSize: '18px' }}>
                {service.active ? '✅' : '❌'}
              </span>
            </div>

            <p style={{
              margin: 0,
              color: '#999',
              fontSize: 'clamp(12px, 1.8vw, 13px)',
              lineHeight: '1.5',
            }}>
              {service.description?.substring(0, 80)}...
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '12px',
              borderTop: '1px solid #f0f0f0',
            }}>
              <div>
                <div style={{ fontWeight: '700', color: '#667eea', fontSize: 'clamp(14px, 2vw, 16px)' }}>
                  {service.price} FCFA
                </div>
                <div style={{ fontSize: 'clamp(11px, 1.5vw, 12px)', color: '#999' }}>
                  {service.duration_minutes || 30}min
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEdit(service)}
                  style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  ✏️
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(service.id || service._id)}
                  style={{
                    background: '#ff6b6b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  🗑️
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: 'clamp(40px, 8vw, 80px) 20px',
          color: '#999',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <div style={{ fontSize: 'clamp(14px, 2vw, 16px)', fontWeight: '600' }}>
            Aucun service trouvé
          </div>
          <div style={{ fontSize: 'clamp(12px, 1.8vw, 13px)', marginTop: '8px' }}>
            Créez un nouveau service pour commencer
          </div>
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseForm}
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
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              }}
            >
              <h2 style={{ margin: '0 0 24px 0', fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: '700', color: '#333' }}>
                {editingService ? '✏️ Modifier Service' : '➕ Nouveau Service'}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input
                  type="text"
                  placeholder="Nom du service"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    padding: 'clamp(10px, 1.5vw, 12px) clamp(12px, 2vw, 16px)',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    fontSize: 'clamp(12px, 1.8vw, 14px)',
                  }}
                />

                <input
                  type="text"
                  placeholder="Catégorie"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    padding: 'clamp(10px, 1.5vw, 12px) clamp(12px, 2vw, 16px)',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    fontSize: 'clamp(12px, 1.8vw, 14px)',
                  }}
                />

                <input
                  type="number"
                  placeholder="Prix (FCFA)"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  style={{
                    padding: 'clamp(10px, 1.5vw, 12px) clamp(12px, 2vw, 16px)',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    fontSize: 'clamp(12px, 1.8vw, 14px)',
                  }}
                />

                <input
                  type="number"
                  placeholder="Durée (minutes)"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  style={{
                    padding: 'clamp(10px, 1.5vw, 12px) clamp(12px, 2vw, 16px)',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    fontSize: 'clamp(12px, 1.8vw, 14px)',
                  }}
                />

                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    padding: 'clamp(10px, 1.5vw, 12px) clamp(12px, 2vw, 16px)',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    fontSize: 'clamp(12px, 1.8vw, 14px)',
                    minHeight: '100px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: 'clamp(12px, 1.8vw, 14px)', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                  Service actif
                </label>

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveService}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: 'clamp(10px, 1.5vw, 12px)',
                      fontWeight: '700',
                      cursor: 'pointer',
                      fontSize: 'clamp(12px, 1.8vw, 14px)',
                    }}
                  >
                    💾 Enregistrer
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCloseForm}
                    style={{
                      flex: 1,
                      background: '#f0f0f0',
                      color: '#333',
                      border: 'none',
                      borderRadius: '8px',
                      padding: 'clamp(10px, 1.5vw, 12px)',
                      fontWeight: '700',
                      cursor: 'pointer',
                      fontSize: 'clamp(12px, 1.8vw, 14px)',
                    }}
                  >
                    ✕ Annuler
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default ManageServices
