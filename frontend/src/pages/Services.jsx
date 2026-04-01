import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SearchBar from '../components/public/SearchBar';
import CategoryFilter from '../components/public/CategoryFilter';
import ServiceCard from '../components/public/ServiceCard';
import Pagination from '../components/public/Pagination';
import * as serviceService from '../services/serviceService';

const ITEMS_PER_PAGE = 6

export default function Services() {
  const [services, setServices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [services, selectedCategory, searchTerm, priceRange]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await serviceService.getAllServices();
      const fetchedServices = response.data.services || response.data || [];
      setServices(fetchedServices);

      const uniqueCategories = ['Tous', ...new Set(fetchedServices.map((s) => s.category).filter(Boolean))];
      setCategories(uniqueCategories);
      console.log('✅ Services chargés:', fetchedServices.length)
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

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section style={{ background: 'var(--gradient-primary)', padding: '100px 0 60px', minHeight: '50vh', display: 'flex', alignItems: 'center' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '3.5rem',
              fontWeight: '700',
              color: 'white',
              marginBottom: '20px',
              textShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}>
              Nos Services
            </h1>
            <p style={{
              fontSize: '1.2rem',
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
      <section style={{ background: 'var(--light-color)', padding: '60px 0', minHeight: '70vh' }}>
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
              <>
                <motion.div
                  key="services"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="row g-4 mt-2"
                >
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
                </motion.div>

                {/* Pagination Component */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    perPage={ITEMS_PER_PAGE}
                  />
                )}

                {/* Results Info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center mt-4"
                  style={{ color: 'var(--text-muted)', fontSize: '14px' }}
                >
                  Affichage de <strong>{startIndex + 1}</strong> à <strong>{Math.min(endIndex, filtered.length)}</strong> sur <strong>{filtered.length}</strong> résultats
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </>
  );
}
