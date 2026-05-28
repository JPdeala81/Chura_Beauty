import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import api from '../../services/api'

const Revenue = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    appointments: 0,
    services: 0,
    average_price: 0,
  })
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')

  useEffect(() => {
    fetchRevenueData()
  }, [period])

  const fetchRevenueData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/revenue/stats')
      setStats(response.data || {})
    } catch (error) {
      console.error('Error fetching revenue:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = {
    week: [
      { day: 'Lun', revenue: 45000 },
      { day: 'Mar', revenue: 52000 },
      { day: 'Mer', revenue: 48000 },
      { day: 'Jeu', revenue: 61000 },
      { day: 'Ven', revenue: 55000 },
      { day: 'Sam', revenue: 78000 },
      { day: 'Dim', revenue: 42000 },
    ],
    month: [
      { week: 'Sem 1', revenue: 280000 },
      { week: 'Sem 2', revenue: 320000 },
      { week: 'Sem 3', revenue: 310000 },
      { week: 'Sem 4', revenue: 340000 },
    ],
    year: [
      { month: 'Jan', revenue: 1200000 },
      { month: 'Fév', revenue: 1100000 },
      { month: 'Mar', revenue: 1300000 },
      { month: 'Avr', revenue: 1400000 },
      { month: 'Mai', revenue: 1250000 },
      { month: 'Juin', revenue: 1500000 },
    ],
  }

  const serviceRevenue = [
    { name: 'Coiffure', value: 35, color: '#ffd700' },
    { name: 'Ongles', value: 25, color: '#667eea' },
    { name: 'Visage', value: 20, color: '#ff6b6b' },
    { name: 'Sourcils', value: 15, color: '#20c997' },
    { name: 'Maquillage', value: 5, color: '#764ba2' },
  ]

  const kpiCards = [
    { label: 'Total Revenus', value: `${(stats.revenue || 0).toLocaleString()} FCFA`, icon: '💰', color: '#667eea', trend: '+24%' },
    { label: 'Rendez-vous', value: stats.appointments || 0, icon: '📅', color: '#20c997', trend: '+12%' },
    { label: 'Prix Moyen', value: `${(stats.average_price || 0).toLocaleString()} FCFA`, icon: '💵', color: '#ffd700', trend: '+8%' },
    { label: 'Services', value: stats.services || 0, icon: '💅', color: '#ff6b6b', trend: '+4%' },
  ]

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
        📊 Revenus & Statistiques
      </h2>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(200px, 20vw, 260px), 1fr))',
        gap: 'clamp(16px, 3vw, 24px)',
        marginBottom: 'clamp(30px, 5vw, 50px)',
      }}>
        {kpiCards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)' }}
            style={{
              background: 'white',
              borderRadius: '14px',
              padding: 'clamp(16px, 3vw, 24px)',
              border: '2px solid #f0f0f0',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <span style={{ fontSize: 'clamp(1.8rem, 4vw, 2.2rem)' }}>{card.icon}</span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#20c997' }}>{card.trend}</span>
            </div>
            <h3 style={{ fontSize: 'clamp(11px, 1.5vw, 13px)', color: '#999', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
              {card.label}
            </h3>
            <p style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: '700', color: '#333', margin: 0 }}>
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(300px, 45vw, 600px), 1fr))',
        gap: 'clamp(16px, 3vw, 24px)',
        marginBottom: 'clamp(30px, 5vw, 50px)',
      }}>
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'white',
            borderRadius: '14px',
            padding: 'clamp(16px, 3vw, 24px)',
            border: '2px solid #f0f0f0',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontWeight: '700', color: '#333', fontSize: 'clamp(13px, 2vw, 15px)' }}>
              📈 Tendance des Revenus
            </h3>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #e0e0e0',
                fontSize: 'clamp(11px, 1.5vw, 12px)',
                background: 'white',
              }}
            >
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="year">Cette année</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData[period]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={period === 'week' ? 'day' : period === 'month' ? 'week' : 'month'} stroke="#999" style={{ fontSize: 'clamp(11px, 1.5vw, 12px)' }} />
              <YAxis stroke="#999" style={{ fontSize: 'clamp(11px, 1.5vw, 12px)' }} />
              <Tooltip contentStyle={{ background: '#f9f9f9', border: '1px solid #e0e0e0', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#667eea" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Service Distribution */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            background: 'white',
            borderRadius: '14px',
            padding: 'clamp(16px, 3vw, 24px)',
            border: '2px solid #f0f0f0',
          }}
        >
          <h3 style={{ margin: '0 0 16px 0', fontWeight: '700', color: '#333', fontSize: 'clamp(13px, 2vw, 15px)' }}>
            🎯 Répartition par Service
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={serviceRevenue} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                {serviceRevenue.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Service Revenue List */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <h3 style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.4rem)', color: '#333', marginBottom: '16px', fontWeight: '700' }}>
          💼 Revenus par Service
        </h3>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '2px solid #f0f0f0',
          overflow: 'hidden',
        }}>
          {serviceRevenue.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'clamp(12px, 2vw, 16px) clamp(16px, 3vw, 24px)',
                borderBottom: i < serviceRevenue.length - 1 ? '1px solid #f0f0f0' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: service.color,
                  }}
                />
                <span style={{ fontWeight: '700', color: '#333', fontSize: 'clamp(13px, 1.8vw, 14px)' }}>
                  {service.name}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '200px',
                  height: '8px',
                  background: '#f0f0f0',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${service.value}%` }}
                    transition={{ duration: 0.8 }}
                    style={{
                      height: '100%',
                      background: service.color,
                    }}
                  />
                </div>
                <span style={{ fontWeight: '700', color: '#667eea', fontSize: 'clamp(13px, 1.8vw, 14px)', minWidth: '40px', textAlign: 'right' }}>
                  {service.value}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Revenue
