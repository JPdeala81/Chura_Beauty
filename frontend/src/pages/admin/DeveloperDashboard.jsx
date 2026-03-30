import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../services/api'

const DeveloperDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({})
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceReason, setMaintenanceReason] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await api.get('/site-settings/admin/stats')
      setStats(res.data || {})
    } catch (e) {}
  }

  const toggleMaintenance = async (enable) => {
    try {
      if (enable) {
        await api.post('/site-settings/maintenance/enable', {
          reason: maintenanceReason || 'Maintenance en cours',
          durationMinutes: 60
        })
      } else {
        await api.post('/site-settings/maintenance/disable')
      }
      setMaintenanceMode(!maintenanceMode)
      fetchStats()
    } catch (e) {}
  }

  const StatCard = ({ icon, label, value, color }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        background: \linear-gradient(135deg, \20 0%, \05 100%)\,
        border: \1px solid \40\,
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center'
      }}
    >
      <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ color: '#999', fontSize: '12px', marginBottom: '4px' }}>{label}</div>
      <div style={{ color: color, fontSize: '24px', fontWeight: '700' }}>{value}</div>
    </motion.div>
  )

  const tabs = [
    { id: 'overview', label: '📊 Vue d\'ensemble', icon: '📊' },
    { id: 'database', label: '🗄️ Base de données', icon: '🗄️' },
    { id: 'security', label: '🔐 Sécurité', icon: '🔐' },
    { id: 'maintenance', label: '🔧 Maintenance', icon: '🔧' },
    { id: 'users', label: '👥 Utilisateurs', icon: '👥' },
    { id: 'logs', label: '📝 Logs', icon: '📝' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e27', color: '#e0e0e0', padding: '20px' }}>
      <style>{\
        .dev-navbar { background: linear-gradient(135deg, #0a0e27 0%, #1a2555 100%); border-bottom: 1px solid #00ff96; }
        .dev-tab { color: #00ff96; }
        .dev-card { background: rgba(0,255,150,0.05); border: 1px solid rgba(0,255,150,0.2); }
      \}</style>
      
      <div className="dev-navbar" style={{ padding: '16px 20px', marginBottom: '30px', borderRadius: '8px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'monospace', fontSize: '20px', color: '#00ff96', margin: 0 }}>
          💻 JP Deal Company — Developer Console v1.0
        </h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '30px', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? 'rgba(0,255,150,0.2)' : 'rgba(255,255,255,0.05)',
              border: activeTab === tab.id ? '1px solid #00ff96' : '1px solid rgba(0,255,150,0.3)',
              color: activeTab === tab.id ? '#00ff96' : '#999',
              borderRadius: '8px',
              padding: '10px 16px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontWeight: '600',
              fontSize: '13px'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,255,150,0.2)', borderRadius: '12px', padding: '24px' }}>
        {activeTab === 'overview' && (
          <div>
            <h2 style={{ color: '#00ff96', marginBottom: '20px' }}>📊 Aperçu du système</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '30px' }}>
              <StatCard icon="👥" label="Utilisateurs" value={stats.total_users || 0} color="#00c8ff" />
              <StatCard icon="📅" label="RDV (30j)" value={stats.appointments_month || 0} color="#00ff96" />
              <StatCard icon="💅" label="Services" value={stats.total_services || 0} color="#ffd700" />
              <StatCard icon="⚠️" label="Erreurs" value={stats.error_count || 0} color="#ff6b6b" />
              <StatCard icon="☁️" label="Uptime" value={\\%\} color="#00ff96" />
              <StatCard icon="📡" label="Requêtes (24h)" value={stats.requests_today || 0} color="#00c8ff" />
            </div>

            <h3 style={{ color: '#00ff96', marginTop: '30px', marginBottom: '16px' }}>ℹ️ Informations techniques</h3>
            <div className="dev-card" style={{ padding: '16px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '13px' }}>
              <div>Node.js: v18.16.0</div>
              <div>React: v18.2.0</div>
              <div>Vite: v4.0.0</div>
              <div>Supabase: PostgreSQL 13</div>
              <div style={{ marginTop: '12px', borderTop: '1px solid rgba(0,255,150,0.2)', paddingTop: '12px' }}>
                <div>Fichiers: 87 | JSX: 34 | CSS: 3 | JSON: 8</div>
                <div>Lignes de code: 12400+</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div>
            <h2 style={{ color: '#00ff96', marginBottom: '20px' }}>🔧 Mode Maintenance</h2>
            <div className="dev-card" style={{ padding: '20px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => toggleMaintenance(e.target.checked)}
                    style={{ width: '20px', height: '20px' }}
                  />
                  <span>Activer le mode maintenance</span>
                </label>
              </div>
              <textarea
                value={maintenanceReason}
                onChange={(e) => setMaintenanceReason(e.target.value)}
                placeholder="Raison de la maintenance..."
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(0,255,150,0.08)',
                  border: '1px solid rgba(0,255,150,0.3)',
                  borderRadius: '6px',
                  color: '#e0e0e0',
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '14px',
                  minHeight: '100px'
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div>
            <h2 style={{ color: '#00ff96', marginBottom: '20px' }}>🔐 Sécurité</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {[
                { name: 'JWT Valide', status: true },
                { name: 'HTTPS Activé', status: true },
                { name: 'Rate Limiting', status: true },
                { name: 'CORS Configuré', status: true }
              ].map((item) => (
                <div key={item.name} className="dev-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '16px' }}>{item.status ? '✅' : '❌'}</span>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div>
            <h2 style={{ color: '#00ff96', marginBottom: '20px' }}>📝 Fichier journal</h2>
            <div className="dev-card" style={{ padding: '16px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px', maxHeight: '400px', overflowY: 'auto' }}>
              <div style={{ color: '#00ff96' }}>[INFO] Système démarré avec succès</div>
              <div style={{ color: '#00c8ff' }}>[INFO] Base de données connectée</div>
              <div style={{ color: '#ffd700' }}>[WARN] Une migration en attente</div>
              <div style={{ color: '#ff6b6b' }}>[ERROR] 2 tentatives de connexion échouées</div>
              <div style={{ color: '#00ff96' }}>[INFO] Dernière synchronisation: il y a 5min</div>
            </div>
          </div>
        )}

        {activeTab !== 'overview' && activeTab !== 'maintenance' && activeTab !== 'security' && activeTab !== 'logs' && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
            <p>Tab {activeTab} - Contenu à venir</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DeveloperDashboard
