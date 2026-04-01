import { motion } from 'framer-motion'
import './Pagination.css'

const Pagination = ({ 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange = () => {},
  perPage = 6
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePageClick = (page) => {
    onPageChange(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Générer les numéros de page à afficher
  const getPageNumbers = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []
    let l

    for (let i = 1; i <= totalPages; i++) {
      if (i == 1 || i == totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i)
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    })

    return rangeWithDots
  }

  if (totalPages <= 1) return null

  const pageNumbers = getPageNumbers()

  return (
    <motion.div 
      className="pagination-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <button 
        className="pagination-btn pagination-prev"
        onClick={handlePrevious}
        disabled={currentPage === 1}
      >
        ← Précédent
      </button>

      <div className="pagination-pages">
        {pageNumbers.map((page, idx) => (
          <motion.button
            key={idx}
            className={`pagination-page ${page === currentPage ? 'active' : ''} ${page === '...' ? 'dots' : ''}`}
            onClick={() => page !== '...' && handlePageClick(page)}
            disabled={page === '...'}
            whileHover={{ scale: page !== '...' ? 1.1 : 1 }}
            whileTap={{ scale: page !== '...' ? 0.95 : 1 }}
          >
            {page}
          </motion.button>
        ))}
      </div>

      <button 
        className="pagination-btn pagination-next"
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        Suivant →
      </button>

      <div className="pagination-info">
        Page <span className="current">{currentPage}</span> sur <span className="total">{totalPages}</span>
      </div>
    </motion.div>
  )
}

export default Pagination
