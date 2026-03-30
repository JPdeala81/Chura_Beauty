import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

const DeveloperDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({ users: 0, errors: 0, requests: 0, uptime: 99.9 })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const devTabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
    { id: 'database', label: 'Base de données', icon: '🗄️' },
    { id: 'security', label: 'Sécurité', icon: '🔐' },
    { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
    { id: 'users', label: 'Utilisateurs', icon: '👥' },
    { id: 'logs', label: 'Journaux', icon: '📝' },
  ]

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      // Exemple : appels API pour récupérer les stats
      const res = await api.get('/admin/stats')
      setStats(res.data || stats)
    } catch (e) {
      // Valeurs par défaut si erreur
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ label, value, icon, color }) => (
    <motion.div
      whileHover={{ scale: 1.05, boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}
      style={{
        background: `linear-gradient(135deg, ${color}15, ${color}08)`,
        border: `2px solid ${color}30`,
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center',
        cursor: 'pointer'
      }}
    >
      <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{icon}</div>
      <div style={{ fontSize: '2rem', fontWeight: '700', color, marginBottom: '8px', fontFamily: 'monospace' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>{label}</div>
    </motion.div>
  )

  const CodeBlock = ({ title, code }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#1e1e1e',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
        overflow: 'auto',
        border: '1px solid rgba(0,255,150,0.2)'
      }}
    >
      <p style={{ color: '#00ff96', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', fontFamily: 'monospace' }}>
        {title}
      </p>
      <pre style={{
        color: '#a0a0a0',
        fontSize: '0.8rem',
        margin: 0,
        fontFamily: 'monospace',
        lineHeight: '1.5'
      }}>
        {code}
      </pre>
    </motion.div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e27', color: '#e0e0e0' }}>
      {/* Futuristic Navbar */}
      <nav style={{
        background: 'linear-gradient(135deg, rgba(0,255,150,0.1) 0%, rgba(0,200,255,0.05) 100%)',
        borderBottom: '2px solid rgba(0,255,150,0.3)',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.5rem', fontWeight: '700' }}>
            <span>⚙️</span>
            <span style={{ color: '#00ff96' }}>Developer</span>
            <span style={{ color: '#00c8ff' }}>Dashboard</span>
          </div>
          <button
            onClick={() => navigate('/admin')}
            style={{
              background: 'rgba(255,0,100,0.2)',
              border: '2px solid rgba(255,0,100,0.4)',
              color: '#ff0064',
              borderRadius: '8px',
              padding: '8px 16px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontFamily: 'Nunito, sans-serif'
            }}
          >
            ← Retour Admin
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ padding: '40px 24px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', marginBottom: '32px', color: '#00ff96' }}>
              Système d'information
            </h2>

            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '40px'
            }}>
              <StatCard label="Utilisateurs actifs" value={stats.users} icon="👥" color="#00ff96" />
              <StatCard label="Erreurs système" value={stats.errors} icon="⚠️" color="#ff0064" />
              <StatCard label="Requêtes/min" value={stats.requests} icon="📡" color="#00c8ff" />
              <StatCard label="Uptime %" value={`${stats.uptime}%`} icon="✅" color="#ffd700" />
            </div>

            {/* Code Examples */}
            <h3 style={{ color: '#00ff96', fontSize: '1.4rem', marginBottom: '16px', marginTop: '40px' }}>
              💻 Endpoints API
            </h3>
            <CodeBlock
              title="GET /api/owner-profile"
              code={`curl -X GET https://api.chura.com/owner-profile \\
  -H "Authorization: Bearer <token>"`}
            />
            <CodeBlock
              title="POST /api/maintenance/enable"
              code={`curl -X POST https://api.chura.com/maintenance/enable \\
  -H "Content-Type: application/json" \\
  -d '{"reason":"Mise à jour système","end":"2024-01-20"}'`}
            />
          </motion.div>
        )}

        {/* Database Tab */}
        {activeTab === 'database' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', marginBottom: '32px', color: '#00c8ff' }}>
              🗄️ Gestion Base de Données
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              {['admins', 'site_settings', 'appointments', 'services'].map((table, i) => (
                <motion.div
                  key={table}
                  whileHover={{ scale: 1.02 }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,200,255,0.1), rgba(0,255,150,0.05))',
                    border: '1px solid rgba(0,200,255,0.3)',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>📊</div>
                  <h4 style={{ color: '#00ff96', marginBottom: '8px' }}>{table}</h4>
                  <p style={{ color: '#a0a0a0', fontSize: '0.9rem', marginBottom: '12px' }}>
                    Enregistrements: {Math.floor(Math.random() * 10000) + 100}
                  </p>
                  <button style={{
                    background: 'rgba(0,255,150,0.2)',
                    border: '1px solid rgba(0,255,150,0.4)',
                    color: '#00ff96',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    Inspecter →
                  </button>
                </motion.div>
              ))}
            </div>

            <CodeBlock
              title="Query: Statistiques Base de Données"
              code={`SELECT 
  COUNT(*) as total_records,
  table_name
FROM information_schema.tables
WHERE table_schema = 'public'
GROUP BY table_name;`}
            />
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', marginBottom: '32px', color: '#ff0064' }}>
              🔐 Sécurité & Authentification
            </h2>

            <div style={{ display: 'grid', gap: '16px' }}>
              {[
                { status: '✅', text: 'JWT Tokens valides', color: '#00ff96' },
                { status: '✅', text: 'HTTPS activé', color: '#00ff96' },
                { status: '⚠️', text: '3 tentatives échouées récentes', color: '#ffd700' },
                { status: '✅', text: 'Rate limiting actif', color: '#00ff96' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  style={{
                    background: `linear-gradient(135deg, ${item.color}15, ${item.color}08)`,
                    border: `1px solid ${item.color}30`,
                    borderRadius: '10px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <span style={{ fontSize: '1.3rem' }}>{item.status}</span>
                  <span style={{ color: '#e0e0e0' }}>{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', marginBottom: '32px', color: '#ffd700' }}>
              🔧 Maintenance & Monitoring
            </h2>

            <motion.div style={{
              background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(0,255,150,0.05))',
              border: '2px solid rgba(255,215,0,0.3)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <h4 style={{ color: '#ffd700', marginBottom: '16px' }}>État du Système</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {[
                  { label: 'CPU', value: '45%' },
                  { label: 'Mémoire', value: '62%' },
                  { label: 'Disque', value: '38%' },
                  { label: 'Bande passante', value: '28%' }
                ].map((item, i) => (
                  <div key={i} style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.9rem', marginBottom: '6px', color: '#a0a0a0' }}>{item.label}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ffd700', fontFamily: 'monospace' }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <button style={{
              background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
              border: 'none',
              borderRadius: '10px',
              color: '#0a0e27',
              padding: '12px 24px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '1rem',
              marginBottom: '24px'
            }}>
              ⚙️ Planer Maintenance
            </button>

            <CodeBlock
              title="Diagnostic système"
              code={`$ pm2 monit
$ docker stats
$ systemctl status backend
$ nginx -s reload`}
            />
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', marginBottom: '32px', color: '#00ff96' }}>
              👥 Gestion des Administrateurs
            </h2>

            <div style={{
              background: 'rgba(0,255,150,0.05)',
              border: '1px solid rgba(0,255,150,0.2)',
              borderRadius: '12px',
              overflow: 'auto',
              marginBottom: '24px'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,255,150,0.1)', borderBottom: '2px solid rgba(0,255,150,0.2)' }}>
                    {['Email', 'Salon', 'Rôle', 'Créé', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px', textAlign: 'left', color: '#00ff96', fontWeight: '700' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map(i => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(0,255,150,0.1)' }}>
                      <td style={{ padding: '12px' }}>admin{i}@salon.com</td>
                      <td style={{ padding: '12px' }}>Beauty Salon {i}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: 'rgba(0,255,150,0.2)', color: '#00ff96', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600' }}>
                          {i === 1 ? 'Admin' : 'Developer'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#a0a0a0', fontSize: '0.9rem' }}>2024-01-{10 + i}</td>
                      <td style={{ padding: '12px' }}>
                        <button style={{ background: 'transparent', border: '1px solid rgba(255,0,100,0.4)', color: '#ff0064', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button style={{
              background: 'linear-gradient(135deg, #00ff96, #00c8ff)',
              border: 'none',
              borderRadius: '10px',
              color: '#0a0e27',
              padding: '12px 24px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '1rem'
            }}>
              ➕ Créer Developer
            </button>
          </motion.div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', marginBottom: '32px', color: '#00c8ff' }}>
              📝 Journaux Système
            </h2>

            <div style={{
              background: '#1a1e3f',
              border: '1px solid rgba(0,200,255,0.2)',
              borderRadius: '12px',
              padding: '20px',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              maxHeight: '400px',
              overflow: 'auto',
              color: '#00c8ff'
            }}>
              {[
                '[2024-01-20 14:32:45] ✅ System started',
                '[2024-01-20 14:35:12] 📝 User auth: admin@salon.com',
                '[2024-01-20 14:38:01] 📊 Database backup completed',
                '[2024-01-20 14:42:33] ⚠️ High CPU usage detected',
                '[2024-01-20 14:45:21] ✅ All systems operational'
              ].map((log, i) => (
                <div key={i} style={{ marginBottom: '8px', color: log.includes('✅') ? '#00ff96' : log.includes('⚠️') ? '#ffd700' : '#00c8ff' }}>
                  {log}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div style={{
        position: 'fixed',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        background: 'rgba(10,14,39,0.95)',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(0,255,150,0.3)',
        borderRadius: '20px',
        padding: '8px',
        zIndex: 100
      }}>
        {devTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? 'rgba(0,255,150,0.2)' : 'transparent',
              border: activeTab === tab.id ? '1px solid rgba(0,255,150,0.5)' : '1px solid transparent',
              color: activeTab === tab.id ? '#00ff96' : '#a0a0a0',
              padding: '8px 16px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default DeveloperDashboard
