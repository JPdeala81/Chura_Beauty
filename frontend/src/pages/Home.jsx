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
    window.scrollTo({ top: 300, behavior: 'smooth' })
  }

  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Maintenance Mode Screen
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

          <p style={{
            fontSize: 'clamp(15px, 2.5vw, 18px)',
            marginBottom: '24px',
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: '1.7'
          }}>
            {maintenanceInfo?.reason || 'Nous effectuons une maintenance programmée pour améliorer votre expérience.'}
          </p>

          {timeRemaining && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                background: 'rgba(255, 215, 0, 0.15)',
                border: '2px solid #ffd700',
                borderRadius: '16px',
                padding: 'clamp(20px, 4vw, 30px)',
                marginBottom: '24px'
              }}
            >
              <p style={{ margin: 0, color: '#ffed4e', fontSize: 'clamp(12px, 2vw, 14px)', marginBottom: '8px', fontWeight: '600' }}>
                ⏱️ Réouverture dans
              </p>
              <h2 style={{
                margin: 0,
                fontSize: 'clamp(28px, 6vw, 42px)',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                color: '#ffd700',
                letterSpacing: '2px'
              }}>
                {timeRemaining}
              </h2>
            </motion.div>
          )}

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: 'clamp(20px, 4vw, 30px)',
              marginBottom: '24px',
              textAlign: 'left'
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '12px', color: 'white', fontSize: 'clamp(14px, 2vw, 16px)', fontWeight: '700' }}>
              ✨ Pendant la maintenance
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              fontSize: 'clamp(13px, 2vw, 15px)'
            }}>
              <li style={{ marginBottom: '8px', color: 'rgba(255, 255, 255, 0.8)' }}>✓ Les réservations rouvriront après</li>
              <li style={{ marginBottom: '8px', color: 'rgba(255, 255, 255, 0.8)' }}>✓ Nous améliorons continuellement</li>
              <li style={{ color: 'rgba(255, 255, 255, 0.8)' }}>✓ Merci de votre patience!</li>
            </ul>
          </motion.div>

          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 'clamp(12px, 2vw, 14px)', margin: 0 }}>
            Besoin d'aide?{' '}
            <a href="mailto:support@chura.com" style={{ color: '#ffd700', textDecoration: 'none', fontWeight: '600' }}>
              Contactez-nous
            </a>
          </p>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <>
      <Navbar />
      <ErrorToast message={errorMessage} onClose={() => setErrorMessage('')} />

      <HeroSection onScrollToServices={scrollToServices} />

      {/* Services Section */}
      <section
        ref={servicesRef}
        style={{
          background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
          minHeight: '70vh',
          paddingTop: 'clamp(40px, 8vw, 80px)',
          paddingBottom: 'clamp(40px, 10vw, 100px)',
          position: 'relative'
        }}
      >
        {/* Background animation */}
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
          style={{
            position: 'absolute',
            top: 0,
            right: '10%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.1), transparent)',
            zIndex: 0
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 'clamp(30px, 5vw, 50px)' }}
          >
            <h2 style={{
              fontSize: 'clamp(2rem, 6vw, 3rem)',
              fontFamily: 'Playfair Display, serif',
              color: '#333',
              fontWeight: '800',
              margin: 0,
              marginBottom: '12px'
            }}>
              ✨ Nos Services Magnifiques
            </h2>
            <p style={{
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              color: '#999',
              margin: 0,
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              Découvrez notre collection exclusive de services beauté haut de gamme
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: 'clamp(20px, 4vw, 30px)',
              marginBottom: 'clamp(30px, 5vw, 50px)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(255, 215, 0, 0.1)'
            }}
          >
            <div style={{ marginBottom: '20px' }}>
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>

            <CategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </motion.div>

          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '300px'
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: '50px',
                  height: '50px',
                  border: '3px solid rgba(255, 215, 0, 0.2)',
                  borderTop: '3px solid #ffd700',
                  borderRadius: '50%'
                }}
              />
            </motion.div>
          )}

          {/* Services Grid */}
          {!loading && paginatedServices.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(280px, 30vw, 320px), 1fr))',
                gap: 'clamp(20px, 3vw, 30px)',
                marginBottom: 'clamp(30px, 5vw, 50px)'
              }}
            >
              {paginatedServices.map((service, idx) => (
                <ServiceCard key={service.id} service={service} index={idx} />
              ))}
            </motion.div>
          )}

          {/* No Services Message */}
          {!loading && paginatedServices.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                textAlign: 'center',
                padding: 'clamp(40px, 8vw, 60px)',
                background: 'rgba(255, 215, 0, 0.05)',
                borderRadius: '16px',
                border: '2px dashed rgba(255, 215, 0, 0.2)'
              }}
            >
              <p style={{ fontSize: 'clamp(16px, 3vw, 18px)', color: '#999', margin: 0 }}>
                Aucun service ne correspond à votre recherche. Essayez d'autres critères! 🔍
              </p>
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                flexWrap: 'wrap'
              }}
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <motion.button
                  key={page}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => goToPage(page)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: page === currentPage ? '#ffd700' : 'white',
                    color: page === currentPage ? '#000' : '#333',
                    fontWeight: page === currentPage ? '700' : '600',
                    cursor: 'pointer',
                    fontSize: 'clamp(12px, 2vw, 14px)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {page}
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </>
  )
}

export default Home
