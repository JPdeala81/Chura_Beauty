import { useEffect, useState } from 'react'
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
    <footer style={{ background: 'linear-gradient(135deg, #2c1810 0%, #4a2c1a 100%)', color: '#f8c8d4' }}>
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <h5 style={{ fontFamily: 'Playfair Display, serif', color: '#d4a574', fontSize: '22px' }}>
              💆‍♀️ {adminInfo.salonName}
            </h5>
            <p className="mt-3 small" style={{ color: 'rgba(248,200,212,0.8)', lineHeight: '1.8' }}>
              Votre salon de beauté de confiance à Libreville. Nous prenons soin de vous avec passion et professionnalisme.
            </p>
            <div className="d-flex gap-3 mt-3">
              {adminInfo.instagram && (
                <a href={adminInfo.instagram} target="_blank" rel="noreferrer"
                  className="btn btn-sm rounded-circle"
                  style={{ background: 'rgba(212,165,116,0.2)', color: '#d4a574', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bi bi-instagram"></i>
                </a>
              )}
              {adminInfo.facebook && (
                <a href={adminInfo.facebook} target="_blank" rel="noreferrer"
                  className="btn btn-sm rounded-circle"
                  style={{ background: 'rgba(212,165,116,0.2)', color: '#d4a574', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bi bi-facebook"></i>
                </a>
              )}
              <a href={`https://wa.me/${adminInfo.whatsapp?.replace(/\s/g, '').replace('+', '')}`}
                target="_blank" rel="noreferrer"
                className="btn btn-sm rounded-circle"
                style={{ background: 'rgba(37,211,102,0.2)', color: '#25d366', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-whatsapp"></i>
              </a>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <h6 style={{ color: '#d4a574', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '13px' }}>
              Nos Services
            </h6>
            <ul className="list-unstyled mt-3">
              {['Coiffure & Tresses', 'Soins du visage', 'Ongles mains & pieds', 'Soins des sourcils', 'Maquillage'].map((service, i) => (
                <li key={i} className="mb-2">
                  <a href="/services" className="text-decoration-none small"
                    style={{ color: 'rgba(248,200,212,0.7)' }}>
                    <i className="bi bi-chevron-right me-1" style={{ color: '#d4a574', fontSize: '11px' }}></i>
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-lg-4 col-md-6">
            <h6 style={{ color: '#d4a574', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '13px' }}>
              Contact
            </h6>
            <ul className="list-unstyled mt-3">
              <li className="mb-3 d-flex align-items-start gap-2">
                <i className="bi bi-geo-alt-fill mt-1" style={{ color: '#d4a574' }}></i>
                <span className="small" style={{ color: 'rgba(248,200,212,0.8)' }}>{adminInfo.address}</span>
              </li>
              <li className="mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-telephone-fill" style={{ color: '#d4a574' }}></i>
                <a href={`tel:${adminInfo.phone}`} className="text-decoration-none small"
                  style={{ color: 'rgba(248,200,212,0.8)' }}>{adminInfo.phone}</a>
              </li>
              <li className="mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-whatsapp" style={{ color: '#25d366' }}></i>
                <a href={`https://wa.me/${adminInfo.whatsapp?.replace(/\s/g, '').replace('+', '')}`}
                  target="_blank" rel="noreferrer" className="text-decoration-none small"
                  style={{ color: 'rgba(248,200,212,0.8)' }}>{adminInfo.whatsapp}</a>
              </li>
            </ul>
            <a href="/admin/login"
              style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', textDecoration: 'none' }}>
              Espace administrateur
            </a>
          </div>
        </div>

        <hr style={{ borderColor: 'rgba(212,165,116,0.2)', marginTop: '40px' }} />

        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="small mb-0" style={{ color: 'rgba(248,200,212,0.5)' }}>
              © {new Date().getFullYear()} {adminInfo.salonName}. Tous droits réservés.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <p className="small mb-0" style={{ color: 'rgba(248,200,212,0.5)' }}>
              Fait avec ❤️ à Libreville, Gabon
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
