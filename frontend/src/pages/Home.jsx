import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ErrorToast from '../components/layout/ErrorToast'
import HeroSection from '../components/public/HeroSection'
import SearchBar from '../components/public/SearchBar'
import CategoryFilter from '../components/public/CategoryFilter'
import ServiceCard from '../components/public/ServiceCard'
import api from '../services/api'

const Home = () => {
  const location = useLocation()
  const [services, setServices] = useState([])
  const [filtered, setFiltered] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Tous')
  const [searchQuery, setSearchQuery] = useState('')
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [errorMessage, setErrorMessage] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceInfo, setMaintenanceInfo] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState('')
  const ITEMS_PER_PAGE = 6
  const servicesRef = useRef(null)

  useEffect(() => {
    if (location.state?.errorMessage) {
      setErrorMessage(location.state.errorMessage)
      const timer = setTimeout(() => setErrorMessage(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [location.state])

  useEffect(() => {
    checkMaintenanceMode()
    fetchServices()
  }, [])

  useEffect(() => {
    filterServices()
    setCurrentPage(1)
  }, [services, activeCategory, searchQuery, priceRange])

  const checkMaintenanceMode = async () => {
    try {
      const response = await api.get('/site-settings')
      if (response.data && response.data.is_maintenance) {
        setMaintenanceMode(true)
        setMaintenanceInfo({
          reason: response.data.maintenance_reason || 'Maintenance en cours',
          reopenDate: response.data.maintenance_end ? new Date(response.data.maintenance_end).toISOString().split('T')[0] : '',
          reopenTime: response.data.maintenance_end ? new Date(response.data.maintenance_end).toTimeString().slice(0, 5) : '09:00'
        })
      } else {
        setMaintenanceMode(false)
      }
    } catch (err) {
      console.warn('Maintenance check failed:', err)
      setMaintenanceMode(false)
    }
  }

  useEffect(() => {
    if (!maintenanceMode || !maintenanceInfo?.reopenDate) return
    const updateTimer = () => {
      const reopenDateTime = new Date(`${maintenanceInfo.reopenDate}T${maintenanceInfo.reopenTime}`)
      const now = new Date()
      const diff = reopenDateTime - now
      if (diff <= 0) {
        setTimeRemaining('Prochainement...')
        checkMaintenanceMode()
        return
      }
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
    }
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [maintenanceMode, maintenanceInfo])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await api.get('/services')
      const data = response.data.services || response.data || []
      setServices(Array.isArray(data) ? data : [])
      const cats = ['Tous', ...new Set(data.map(s => s.category).filter(Boolean))]
      setCategories(cats)
    } catch (error) {
      console.error('Erreur chargement services:', error)
      setServices([])
      setCategories(['Tous'])
    } finally {
      setLoading(false)
    }
  }

  const filterServices = () => {
    let result = [...services]
    if (activeCategory !== 'Tous') {
      result = result.filter(s => s.category === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(s =>
        s.title?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q)
      )
    }
    result = result.filter(s => {
      const price = parseFloat(s.price) || 0
      return price >= priceRange[0] && price <= priceRange[1]
    })
    setFiltered(result)
  }

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedServices = filtered.slice(startIndex, endIndex)

  const goToPage = (page) => {
    const pageNum = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(pageNum)
    servicesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (maintenanceMode) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(20px, 5vw, 40px)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          style={{
            textAlign: 'center',
            maxWidth: '600px',
            color: 'white',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: 'clamp(30px, 8vw, 60px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)'
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ fontSize: 'clamp(80px, 15vw, 120px)', marginBottom: '20px' }}
          >
            🔧
          </motion.div>
          <h1 style={{
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            fontWeight: '800',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 16px 0'
          }}>
            Maintenance en Cours
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', marginBottom: '24px', opacity: 0.9 }}>
            {maintenanceInfo?.reason}
          </p>
          {timeRemaining && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
                fontWeight: '700',
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '16px 24px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 215, 0, 0.4)'
              }}
            >
              ⏳ Réouverture dans {timeRemaining}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <Navbar />
      {errorMessage && <ErrorToast message={errorMessage} />}

      <HeroSection onScrollToServices={() => servicesRef.current?.scrollIntoView({ behavior: 'smooth' })} />

      {/* SERVICES SECTION - MAGNIFIQUE DESIGN */}
      <section ref={servicesRef} style={{ padding: 'clamp(60px, 10vw, 100px) clamp(16px, 5vw, 48px)', background: '#f8f9fb' }}>
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 'clamp(40px, 8vw, 80px)' }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <span style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: 'clamp(14px, 2vw, 16px)',
              fontWeight: '700',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}>
              ✨ Nos Services Premium ✨
            </span>
          </motion.div>
          <h2 style={{
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            fontWeight: '900',
            color: '#333',
            margin: '0 0 16px 0',
            lineHeight: '1.2'
          }}>
            Découvrez l'Excellence
          </h2>
          <p style={{
            fontSize: 'clamp(14px, 2vw, 18px)',
            color: '#999',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Une sélection curatée de services beauté conçus pour sublimer votre beauté naturelle
          </p>
        </motion.div>

        {/* SEARCH & FILTERS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginBottom: 'clamp(40px, 6vw, 60px)' }}
        >
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <motion.div style={{ marginTop: 'clamp(20px, 3vw, 32px)' }}>
            <CategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />
          </motion.div>
        </motion.div>

        {/* SERVICES GRID */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '80px 20px' }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ fontSize: '64px', display: 'inline-block' }}
            >
              ✨
            </motion.div>
            <p style={{ marginTop: '16px', color: '#999', fontWeight: '600' }}>Chargement des services...</p>
          </motion.div>
        ) : paginatedServices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center',
              padding: 'clamp(40px, 8vw, 80px) 20px',
              background: 'white',
              borderRadius: '20px',
              border: '2px dashed #ddd'
            }}
          >
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ fontSize: 'clamp(18px, 3vw, 24px)', color: '#333', margin: '0 0 8px 0', fontWeight: '700' }}>
              Aucun service trouvé
            </h3>
            <p style={{ color: '#999', margin: 0 }}>Essayez une autre recherche ou catégorie</p>
          </motion.div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(280px, 30vw, 380px), 1fr))',
              gap: 'clamp(24px, 3vw, 32px)',
              marginBottom: 'clamp(40px, 6vw, 60px)'
            }}>
              <AnimatePresence>
                {paginatedServices.map((service, idx) => (
                  <motion.div
                    key={service.id || service._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.12 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <ServiceCard service={service} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 'clamp(8px, 2vw, 16px)',
                  flexWrap: 'wrap',
                  padding: 'clamp(24px, 4vw, 40px)',
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 16px',
                    background: currentPage === 1 ? '#f0f0f0' : 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: currentPage === 1 ? '#ccc' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  ← Précédent
                </motion.button>

                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <motion.button
                      key={page}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => goToPage(page)}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        border: 'none',
                        background: currentPage === page ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f0f0f0',
                        color: currentPage === page ? 'white' : '#333',
                        fontWeight: currentPage === page ? '700' : '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                    >
                      {page}
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 16px',
                    background: currentPage === totalPages ? '#f0f0f0' : 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: currentPage === totalPages ? '#ccc' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  Suivant →
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </section>

      <Footer />
    </div>
  )
}

export default Home
