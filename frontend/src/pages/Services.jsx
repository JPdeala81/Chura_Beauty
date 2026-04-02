import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SearchBar from '../components/public/SearchBar';
import CategoryFilter from '../components/public/CategoryFilter';
import ServiceCard from '../components/public/ServiceCard';
import * as serviceService from '../services/serviceService';

export default function Services() {
  const [services, setServices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
    setCurrentPage(1); // Reset to first page when filters change
  }, [services, selectedCategory, searchTerm, priceRange]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await serviceService.getAllServices();
      const fetchedServices = response.data.services || response.data || [];
      setServices(fetchedServices);

      const uniqueCategories = ['Tous', ...new Set(fetchedServices.map((s) => s.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let result = [...services];
    if (selectedCategory !== 'Tous') {
      result = result.filter((s) => s.category === selectedCategory);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.title?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.category?.toLowerCase().includes(q)
      );
    }
    result = result.filter((s) => {
      const price = parseFloat(s.price) || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });
    setFiltered(result);
  };

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedServices = filtered.slice(startIndex, endIndex);

  const goToPage = (page) => {
    const pageNum = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNum);
    // Smooth scroll to services section
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section style={{ 
        background: 'var(--gradient-primary)', 
        padding: 'clamp(60px, 12vw, 100px) 0 clamp(40px, 8vw, 60px)', 
        minHeight: 'clamp(35vh, 50vw, 50vh)', 
        display: 'flex', 
        alignItems: 'center' 
      }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(2rem, 6vw, 3.5rem)',
              fontWeight: '700',
              color: 'white',
              marginBottom: '20px',
              textShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}>
              Nos Services
            </h1>
            <p style={{
              fontSize: 'clamp(0.9rem, 2.5vw, 1.2rem)',
              color: 'rgba(255,255,255,0.9)',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Découvrez notre sélection complète de soins de beauté premium
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section style={{ 
        background: 'var(--light-color)', 
        padding: 'clamp(40px, 8vw, 60px) 0', 
        minHeight: '70vh' 
      }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-5"
            style={{ textAlign: 'center' }}
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
              ✨ Catalogue Complet
            </span>
            <h2 className="section-title centered" style={{ display: 'block', marginTop: '20px' }}>
              Tous nos services
            </h2>
            <p className="text-muted mt-3" style={{ maxWidth: '500px', margin: '12px auto 0' }}>
              Des soins de beauté personnalisés pour revéler votre éclat naturel
            </p>
          </motion.div>

          <SearchBar onSearch={setSearchTerm} onPriceChange={setPriceRange} />

          <CategoryFilter
            categories={categories}
            active={selectedCategory}
            onChange={setSelectedCategory}
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
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('Tous');
                    setPriceRange([0, 100000]);
                  }}
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
              >
                <div className="row g-4 mt-2">
                  {paginatedServices.map((service, index) => (
                    <motion.div
                      key={service._id || service.id || index}
                      className="col-lg-4 col-md-6"
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: Math.min(index * 0.08, 0.4) }}
                      viewport={{ once: true, margin: '-50px' }}
                    >
                      <ServiceCard service={service} />
                    </motion.div>
                  ))}
                </div>

                {/* Pagination Info and Controls */}
                <div style={{
                  marginTop: '60px',
                  paddingTop: '40px',
                  borderTop: '2px solid rgba(184,134,11,0.2)',
                  textAlign: 'center'
                }}>
                  <p className="text-muted mb-4" style={{ fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>
                    📊 Affichage {startIndex + 1}-{Math.min(endIndex, filtered.length)} sur {filtered.length} services
                  </p>

                  {totalPages > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="d-flex justify-content-center align-items-center gap-3"
                      style={{ 
                        flexWrap: 'wrap',
                        marginTop: '20px'
                      }}
                    >
                    <motion.button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: '1px solid var(--primary-color)',
                        background: currentPage === 1 ? 'rgba(184,134,11,0.1)' : 'var(--primary-color)',
                        color: currentPage === 1 ? 'var(--primary-color)' : 'white',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        opacity: currentPage === 1 ? 0.5 : 1
                      }}
                    >
                      ← Précédent
                    </motion.button>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        if (pageNum < 1 || pageNum > totalPages) return null;

                        return (
                          <motion.button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '6px',
                              border: currentPage === pageNum ? 'none' : '1px solid var(--primary-color)',
                              background: currentPage === pageNum ? 'var(--primary-color)' : 'transparent',
                              color: currentPage === pageNum ? 'white' : 'var(--primary-color)',
                              fontWeight: '600',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            {pageNum}
                          </motion.button>
                        );
                      })}
                    </div>

                    <motion.button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: '1px solid var(--primary-color)',
                        background: currentPage === totalPages ? 'rgba(184,134,11,0.1)' : 'var(--primary-color)',
                        color: currentPage === totalPages ? 'var(--primary-color)' : 'white',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        opacity: currentPage === totalPages ? 0.5 : 1
                      }}
                    >
                      Suivant →
                    </motion.button>

                    <span
                      style={{
                        color: 'var(--primary-color)',
                        fontWeight: '600',
                        marginLeft: '16px',
                        fontSize: '14px'
                      }}
                    >
                      Page {currentPage} sur {totalPages}
                    </span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </>
  );
}
