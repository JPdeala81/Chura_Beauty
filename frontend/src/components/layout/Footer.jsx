import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

const Footer = () => {
  const [adminInfo, setAdminInfo] = useState({
    salonName: 'Chura Beauty Salon',
    phone: '+241 00 00 00 00',
    whatsapp: '+241 00 00 00 00',
    address: 'Libreville, Gabon',
    instagram: '',
    facebook: ''
  })

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await api.get('/auth/profile')
        if (response.data) setAdminInfo(response.data)
      } catch (error) {
        console.log('Infos salon non disponibles')
      }
    }
    fetchAdmin()
  }, [])

  return (
    <footer className="footer-luxury">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <h5 className="footer-brand">
              💆‍♀️ {adminInfo.salonName}
            </h5>
            <p className="footer-tagline mt-3">
              Votre salon de beauté de confiance à Libreville. Nous prenons soin de vous avec passion et professionnalisme.
            </p>
            <div className="d-flex gap-3 mt-3">
              {adminInfo.instagram && (
                <a href={adminInfo.instagram} target="_blank" rel="noreferrer"
                  className="footer-social-btn">
                  <span><i className="bi bi-instagram"></i></span>
                </a>
              )}
              {adminInfo.facebook && (
                <a href={adminInfo.facebook} target="_blank" rel="noreferrer"
                  className="footer-social-btn">
                  <span><i className="bi bi-facebook"></i></span>
                </a>
              )}
              <a href={`https://wa.me/${adminInfo.whatsapp?.replace(/\s/g, '').replace('+', '')}`}
                target="_blank" rel="noreferrer"
                className="footer-social-btn">
                <span><i className="bi bi-whatsapp"></i></span>
              </a>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <h6 className="footer-section-title">
              Nos Services
            </h6>
            <ul className="list-unstyled mt-3">
              {['Coiffure & Tresses', 'Soins du visage', 'Ongles mains & pieds', 'Soins des sourcils', 'Maquillage'].map((service, i) => (
                <li key={i} className="mb-2">
                  <Link to="/services" className="footer-link">
                    <i className="bi bi-chevron-right" style={{ fontSize: '11px' }}></i>
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-lg-4 col-md-6">
            <h6 className="footer-section-title">
              Contact
            </h6>
            <ul className="list-unstyled mt-3">
              <li className="footer-contact-item">
                <i className="bi bi-geo-alt-fill footer-contact-icon"></i>
                <span>{adminInfo.address}</span>
              </li>
              <li className="footer-contact-item">
                <i className="bi bi-telephone-fill footer-contact-icon"></i>
                <a href={`tel:${adminInfo.phone}`} className="text-decoration-none">{adminInfo.phone}</a>
              </li>
              <li className="footer-contact-item">
                <i className="bi bi-whatsapp footer-contact-icon"></i>
                <a href={`https://wa.me/${adminInfo.whatsapp?.replace(/\s/g, '').replace('+', '')}`}
                  target="_blank" rel="noreferrer" className="text-decoration-none">{adminInfo.whatsapp}</a>
              </li>
            </ul>
            <Link to="/admin/login" className="footer-admin-link d-block mt-3">
              Espace administrateur
            </Link>
          </div>
        </div>

        <hr style={{ borderColor: 'rgba(212,165,116,0.2)', marginTop: '40px' }} />

        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="footer-bottom-link mb-0">
              © {new Date().getFullYear()} {adminInfo.salonName}. Tous droits réservés.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <p className="footer-made-with mb-0">
              Fait avec ❤️ à Libreville, Gabon
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
