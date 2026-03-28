import { useState, useContext, useEffect } from 'react'
import { Container, Button, Form, Card, Alert, Row, Col } from 'react-bootstrap'
import { AuthContext } from '../../context/AuthContext'
import Sidebar from '../../components/layout/Sidebar'
import api from '../../services/api'

const Settings = () => {
  const { updateAdmin } = useContext(AuthContext)
  const [showSidebar, setShowSidebar] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    salonName: '',
    bio: '',
    heroTitle: 'Révélez Votre Beauté Naturelle',
    heroSubtitle: 'Des soins d\'exception pour sublimer votre beauté',
    heroBgColor: '#2c1810',
    heroTextColor: '#f8c8d4',
    phone: '',
    whatsapp: '',
    address: '',
    instagram: '',
    facebook: '',
    profilePicture: null,
    coverPicture: null
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile')
        if (res.data) setFormData(prev => ({ ...prev, ...res.data }))
      } catch (e) { console.error(e) }
    }
    fetchProfile()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await api.put('/auth/profile', formData)
      setMessage('Profil mis à jour avec succès !')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Sidebar show={showSidebar} onHide={() => setShowSidebar(false)} />

      <Container fluid className="py-5">
        <Button variant="outline-secondary" className="d-lg-none mb-3" onClick={() => setShowSidebar(true)}>
          ☰ Menu
        </Button>

        <h1 className="mb-4">⚙️ Paramètres du Salon</h1>

        {message && (
          <Alert variant={message.includes('succès') ? 'success' : 'danger'} dismissible>
            {message}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Infos salon */}
          <Card className="mb-4">
            <Card.Header className="bg-dark text-white">
              <h5 className="mb-0">📍 Infos Salon</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Label>Nom du Salon</Form.Label>
                  <Form.Control type="text" name="salonName" value={formData.salonName} onChange={handleChange} />
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label>Slogan</Form.Label>
                  <Form.Control type="text" name="bio" value={formData.bio} onChange={handleChange} />
                </Col>
              </Row>
              <div className="mb-3">
                <Form.Label>Adresse</Form.Label>
                <Form.Control type="text" name="address" value={formData.address} onChange={handleChange} />
              </div>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Label>Téléphone</Form.Label>
                  <Form.Control type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label>WhatsApp</Form.Label>
                  <Form.Control type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Personnalisation Hero */}
          <Card className="mb-4">
            <Card.Header className="bg-dark text-white">
              <h5 className="mb-0">🎨 Personnalisation Page d\'Accueil</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <Form.Label>Titre Principal</Form.Label>
                <Form.Control type="text" name="heroTitle" value={formData.heroTitle} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <Form.Label>Sous-titre</Form.Label>
                <Form.Control as="textarea" rows={2} name="heroSubtitle" value={formData.heroSubtitle} onChange={handleChange} />
              </div>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Label>Couleur de fond du Hero</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control type="color" name="heroBgColor" value={formData.heroBgColor} onChange={handleChange} style={{ width: '80px' }} />
                    <Form.Control type="text" name="heroBgColor" value={formData.heroBgColor} onChange={handleChange} />
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label>Couleur du texte Hero</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control type="color" name="heroTextColor" value={formData.heroTextColor} onChange={handleChange} style={{ width: '80px' }} />
                    <Form.Control type="text" name="heroTextColor" value={formData.heroTextColor} onChange={handleChange} />
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Réseaux sociaux */}
          <Card className="mb-4">
            <Card.Header className="bg-dark text-white">
              <h5 className="mb-0">📱 Réseaux Sociaux</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Label>Instagram</Form.Label>
                  <Form.Control type="url" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="https://instagram.com/..." />
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label>Facebook</Form.Label>
                  <Form.Control type="url" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="https://facebook.com/..." />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <div className="mb-3">
            <Button type="submit" variant="success" disabled={loading} className="me-2">
              {loading ? 'Sauvegarde...' : '💾 Sauvegarder'}
            </Button>
            <Button type="reset" variant="outline-secondary">
              Annuler
            </Button>
          </div>
        </form>
      </Container>
    </div>
  )
}

export default Settings
