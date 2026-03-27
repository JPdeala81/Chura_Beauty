import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            fontFamily: 'sans-serif',
            padding: '20px',
            backgroundColor: '#f5f5f5'
          }}>
            <h1>💆‍♀️ Salon de Beauté</h1>
            <p>Application de gestion salon - Mode TEST</p>
            
            <div style={{ marginTop: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
              <h2>🔗 Navigation</h2>
              <ul>
                <li><a href="/">Accueil</a></li>
                <li><a href="/services">Services</a></li>
                <li><a href="/admin/login">Login Admin</a></li>
                <li><a href="/admin/dashboard">Dashboard</a></li>
              </ul>
            </div>

            <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
              <h3>⚠️ Status</h3>
              <p>✅ Frontend: Running on port 5173</p>
              <p>✅ Backend: Running on port 5000</p>
              <p>⚠️  Database: MongoDB non disponible (mode test)</p>
            </div>

            <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
              <h3>📝 Identifiants Admin</h3>
              <p><strong>Email:</strong> admin@salon.com</p>
              <p><strong>Password:</strong> ChangeMe123!</p>
            </div>

            <footer style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #ddd', textAlign: 'center', color: '#666' }}>
              <p>© 2026 Salon de Beauté. All rights reserved.</p>
            </footer>
          </div>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
