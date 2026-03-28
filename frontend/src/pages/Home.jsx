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
  const servicesRef = useRef(null)

  useEffect(() => {
    if (location.state?.errorMessage) {
      setErrorMessage(location.state.errorMessage)
      const timer = setTimeout(() => setErrorMessage(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [location.state])

  useEffect(() => { fetchServices() }, [])

  useEffect(() => { filterServices() }, [services, activeCategory, searchQuery, priceRange])

  const fetchServices = async () => {
    try {
      const response = await api.get('/services')
      const data = response.data.services || response.data || []
      setServices(data)
      const cats = ['Tous', ...new Set(data.map(s => s.category).filter(Boolean))]
      setCategories(cats)
    } catch (error) {
      console.error('Erreur chargement services:', error)
      setServices([])
      setFiltered([])
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

  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <Navbar />
      <ErrorToast message={errorMessage} onClose={() => setErrorMessage('')} />
      <HeroSection onScrollToServices={scrollToServices} />

      {/* Services Section */}
      <section
        ref={servicesRef}
        className="py-5"
        style={{ background: 'var(--light-color)', minHeight: '60vh' }}
      >
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-5"
          >
            <span style={{
              background: 'rgba(184,134,11,0.1)',
              color: 'var(--primary-color)',
              padding: '6px 20px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              border: '1px solid rgba(184,134,11,0.2)',
              display: 'inline-block',
              marginBottom: '16px'
            }}>
              ✨ Nos Prestations
            </span>
            <h2 className="section-title centered" style={{ display: 'block' }}>
              Découvrez Nos Services
            </h2>
            <p className="text-muted mt-3" style={{ maxWidth: '500px', margin: '12px auto 0' }}>
              Des soins de beauté personnalisés pour révéler votre éclat naturel
            </p>
          </motion.div>

          <SearchBar onSearch={setSearchQuery} onPriceChange={setPriceRange} />

          <CategoryFilter
            categories={categories}
            active={activeCategory}
            onChange={setActiveCategory}
          />

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-5"
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  border: '3px solid rgba(184,134,11,0.2)',
                  borderTop: '3px solid var(--primary-color)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 20px'
                }}></div>
                <p className="text-muted">Chargement des services...</p>
              </motion.div>
            ) : filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-5"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                  style={{ fontSize: '5rem', marginBottom: '20px' }}
                >
                  🔍
                </motion.div>
                <h4 style={{ color: 'var(--primary-color)', fontFamily: 'Playfair Display, serif' }}>
                  Aucun service trouvé
                </h4>
                <p className="text-muted mb-4">Essayez une autre recherche ou catégorie</p>
                <motion.button
                  className="btn-luxury-primary"
                  onClick={() => { setSearchQuery(''); setActiveCategory('Tous') }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Voir tous les services
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="services"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="row g-4 mt-2"
              >
                {filtered.map((service, index) => (
                  <motion.div
                    key={service.id || service._id || index}
                    className="col-lg-4 col-md-6"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: Math.min(index * 0.08, 0.4) }}
                    viewport={{ once: true, margin: '-50px' }}
                  >
                    <ServiceCard service={service} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Why Us Section */}
      <section style={{ background: 'white', padding: '80px 0' }}>
        <div className="container">
          <motion.div
            className="text-center mb-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title centered" style={{ display: 'block' }}>
              Pourquoi Nous Choisir
            </h2>
          </motion.div>
          <div className="row g-4">
            {[
              { icon: '👑', title: 'Expertise Premium', desc: 'Des années de formation et de passion pour la beauté' },
              { icon: '🌿', title: 'Produits Naturels', desc: 'Nous utilisons uniquement des produits de qualité supérieure' },
              { icon: '💝', title: 'Service Personnalisé', desc: 'Chaque cliente est unique et mérite une attention particulière' },
              { icon: '📅', title: 'Réservation Facile', desc: 'Prenez rendez-vous en ligne en quelques clics' }
            ].map((item, i) => (
              <div key={i} className="col-md-6 col-lg-3">
                <motion.div
                  className="text-center p-4"
                  style={{
                    borderRadius: '20px',
                    border: '1px solid rgba(184,134,11,0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'default'
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(184,134,11,0.15)' }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{item.icon}</div>
                  <h5 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--dark-color)', marginBottom: '12px' }}>
                    {item.title}
                  </h5>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.7' }}>
                    {item.desc}
                  </p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}

export default Home