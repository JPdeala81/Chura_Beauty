import { useState, useEffect } from 'react'
import api from '../../services/api'

const DebugLogin = () => {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [testEmail, setTestEmail] = useState('developer@chura-beauty.dev')
  const [testPassword, setTestPassword] = useState('Dev@Chura2024!')
  const [testResult, setTestResult] = useState(null)
  const [testLoading, setTestLoading] = useState(false)

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const res = await api.get('/debug/admins')
      setAdmins(res.data.admins || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async (e) => {
    e.preventDefault()
    setTestLoading(true)
    setTestResult(null)
    try {
      const res = await api.post('/auth/login', {
        email: testEmail,
        password: testPassword
      })
      setTestResult({
        success: true,
        message: 'Connexion réussie!',
        token: res.data.token?.substring(0, 20) + '...',
        admin: res.data.admin
      })
    } catch (err) {
      setTestResult({
        success: false,
        message: err.response?.data?.message || 'Erreur de connexion',
        details: err.response?.data
      })
    } finally {
      setTestLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', background: '#f8f4f0' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        <h1 style={{ color: '#b8860b', marginBottom: '30px', textAlign: 'center' }}>
          🔍 Diagnostic Connexion
        </h1>

        {/* Test Login Section */}
        <div className="card mb-4 shadow-sm">
          <div className="card-header" style={{ background: '#b8860b', color: 'white', fontWeight: 'bold' }}>
            ✅ Tester la Connexion
          </div>
          <div className="card-body">
            <form onSubmit={testLogin}>
              <div className="row">
                <div className="col-md-5">
                  <input
                    type="email"
                    className="form-control mb-3"
                    placeholder="Email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>
                <div className="col-md-5">
                  <input
                    type="password"
                    className="form-control mb-3"
                    placeholder="Mot de passe"
                    value={testPassword}
                    onChange={(e) => setTestPassword(e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <button 
                    type="submit" 
                    className="btn w-100" 
                    disabled={testLoading}
                    style={{
                      background: '#28a745',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  >
                    {testLoading ? 'Test...' : 'Tester'}
                  </button>
                </div>
              </div>
            </form>

            {testResult && (
              <div className={`alert mt-3 ${testResult.success ? 'alert-success' : 'alert-danger'}`}>
                <strong>{testResult.message}</strong>
                {testResult.success && testResult.token && (
                  <div className="mt-2 small">
                    <p>✅ Token: {testResult.token}</p>
                    {testResult.admin && (
                      <p>👤 Role: {testResult.admin.role} | Email: {testResult.admin.email}</p>
                    )}
                  </div>
                )}
                {!testResult.success && (
                  <div className="mt-2 small">
                    <p className="text-muted">{JSON.stringify(testResult.details)}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Admins List */}
        <div className="card shadow-sm">
          <div className="card-header" style={{ background: '#b8860b', color: 'white', fontWeight: 'bold' }}>
            📋 Utilisateurs en Base de Données
          </div>
          <div className="card-body">
            {loading ? (
              <p>Chargement...</p>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : admins.length === 0 ? (
              <div className="alert alert-warning">⚠️ Aucun utilisateur trouvé en base de données!</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead style={{ background: '#f5e6d3' }}>
                    <tr>
                      <th>Email</th>
                      <th>Nom</th>
                      <th>Salon</th>
                      <th>Rôle</th>
                      <th>Mot de passe</th>
                      <th>Créé le</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin) => (
                      <tr key={admin.id}>
                        <td>
                          <code style={{ fontSize: '12px', background: '#f8f4f0', padding: '4px 8px', borderRadius: '4px' }}>
                            {admin.email}
                          </code>
                        </td>
                        <td>{admin.owner_name || '-'}</td>
                        <td>{admin.salon_name || '-'}</td>
                        <td>
                          <span 
                            className="badge" 
                            style={{
                              background: admin.role === 'super_admin' ? '#dc3545' : admin.role === 'admin' ? '#b8860b' : '#6c757d'
                            }}
                          >
                            {admin.role}
                          </span>
                        </td>
                        <td>
                          {admin.password ? (
                            <span className="text-success">✅ Hashé ({admin.password.substring(0, 15)}...)</span>
                          ) : (
                            <span className="text-danger">❌ Non défini</span>
                          )}
                        </td>
                        <td className="small text-muted">
                          {admin.created_at ? new Date(admin.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          }) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Information */}
        <div className="alert alert-info mt-4">
          <h5>ℹ️ Informations Importantes:</h5>
          <ul className="mb-0">
            <li><strong>Supabase connecté:</strong> Cette page charge depuis le backend qui se connecte à Supabase</li>
            <li><strong>Vérification:</strong> Si vous voyez vos utilisateurs listés, c'est que Supabase fonctionne correctement</li>
            <li><strong>Test:</strong> Utilisez les credentials exacts que vous voyez pour tester la connexion</li>
            <li><strong>Mot de passe:</strong> Les mots de passe doivent être hashés (bcrypt) et commencer par <code>$2a$</code> ou <code>$2b$</code></li>
            <li><strong>Déboguer:</strong> Si le login échoue mais l'user existe, le mot de passe est probablement incorrect ou mal hashé</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default DebugLogin
