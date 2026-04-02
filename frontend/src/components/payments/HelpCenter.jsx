import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../../services/api'

const HelpCenter = () => {
  const [categories, setCategories] = useState([])
  const [faqs, setFaqs] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('générale')
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    const loadHelpData = async () => {
      try {
        setLoading(true)
        const [categoriesRes, faqsRes] = await Promise.all([
          api.get('/payments/faqs/categories'),
          api.get('/payments/faqs')
        ])
        setCategories(categoriesRes.data)
        setFaqs(faqsRes.data)
      } catch (err) {
        console.error('Error loading help center:', err)
      } finally {
        setLoading(false)
      }
    }

    loadHelpData()
  }, [])

  const filteredFaqs = faqs.filter(faq => faq.category === selectedCategory)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="help-center"
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--border-radius-lg)',
        padding: '2rem'
      }}
    >
      <h3 style={{
        marginBottom: '2rem',
        color: 'var(--primary-color)',
        fontFamily: 'Playfair Display, serif',
        fontWeight: '700'
      }}>
        ❓ Centre d'Aide - Questions Fréquentes
      </h3>

      {loading ? (
        <div className="text-center py-5">
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '3px solid rgba(184,134,11,0.2)',
            borderTop: '3px solid var(--primary-color)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      ) : (
        <>
          {/* Category Navigation */}
          <div style={{ marginBottom: '2rem', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map(category => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: selectedCategory === category ? 'none' : '1px solid var(--primary-color)',
                  background: selectedCategory === category ? 'var(--primary-color)' : 'transparent',
                  color: selectedCategory === category ? 'white' : 'var(--primary-color)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textTransform: 'capitalize',
                  transition: 'all 0.3s ease'
                }}
              >
                {category}
              </motion.button>
            ))}
          </div>

          {/* FAQ List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                  style={{
                    border: '1px solid rgba(184,134,11,0.2)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                >
                  {/* Question Header */}
                  <div style={{
                    padding: '1rem',
                    background: expandedId === faq.id ? 'rgba(184,134,11,0.05)' : 'transparent',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'background 0.3s ease'
                  }}>
                    <h6 style={{
                      margin: 0,
                      color: 'var(--primary-color)',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      {faq.question}
                    </h6>
                    <span style={{
                      fontSize: '18px',
                      transform: expandedId === faq.id ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                      color: 'var(--primary-color)'
                    }}>
                      ▼
                    </span>
                  </div>

                  {/* Answer */}
                  {expandedId === faq.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        padding: '0 1rem 1rem 1rem',
                        borderTop: '1px solid rgba(184,134,11,0.2)',
                        background: 'rgba(184,134,11,0.02)'
                      }}
                    >
                      <p style={{
                        margin: 0,
                        color: 'var(--text-color)',
                        fontSize: '13px',
                        lineHeight: '1.6'
                      }}>
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                Aucune question trouvée pour cette catégorie
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  )
}

export default HelpCenter
