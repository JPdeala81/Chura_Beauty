import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode.react';
import JsBarcode from 'jsbarcode';
import api from '../../services/api';

const ProfileSettings = ({ onUpdate }) => {
  const [formData, setFormData] = useState({
    email: '',
    salonName: '',
    ownerName: '',
    phone: '',
    whatsapp: '',
    address: '',
    bio: '',
    instagram: '',
    facebook: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [qrValue, setQrValue] = useState('');
  const barcodeRef = useRef();

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (qrValue && barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, qrValue, { format: 'CODE128', width: 2, height: 50 });
      } catch (e) {}
    }
  }, [qrValue]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      if (res.data) {
        setFormData({
          email: res.data.email || '',
          salonName: res.data.salon_name || '',
          ownerName: res.data.owner_name || '',
          phone: res.data.phone || '',
          whatsapp: res.data.whatsapp || '',
          address: res.data.address || '',
          bio: res.data.bio || '',
          instagram: res.data.instagram || '',
          facebook: res.data.facebook || '',
        });
        setQrValue(window.location.origin);
      }
    } catch (e) {}
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await api.put('/auth/profile', {
        email: formData.email,
        salon_name: formData.salonName,
        owner_name: formData.ownerName,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        address: formData.address,
        bio: formData.bio,
        instagram: formData.instagram,
        facebook: formData.facebook,
      });
      setMessage({ type: 'success', text: '✅ Profil sauvegardé !' });
      if (onUpdate) onUpdate();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la sauvegarde' });
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    const element = document.getElementById('qrcode');
    if (element) {
      const canvas = element.querySelector('canvas');
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `${formData.salonName || 'salon'}-qr.png`;
      link.click();
    }
  };

  const downloadBarcode = () => {
    const svg = barcodeRef.current;
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `${formData.salonName || 'salon'}-barcode.png`;
        link.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '20px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    marginBottom: '24px',
    border: '1px solid rgba(184,134,11,0.08)'
  };

  const inputStyle = {
    border: '2px solid rgba(184,134,11,0.15)',
    borderRadius: '12px',
    padding: '12px 16px',
    width: '100%',
    fontFamily: 'Nunito, sans-serif',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.3s'
  };

  const labelStyle = {
    fontSize: '12px',
    fontWeight: '700',
    color: '#6c757d',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px',
    display: 'block'
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={cardStyle}>
        <h5 style={{ fontFamily: 'Playfair Display, serif', color: '#2c1810', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          👤 Mon Profil
        </h5>
        {message && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '14px',
            background: message.type === 'success' ? 'rgba(40,167,69,0.1)' : 'rgba(220,53,69,0.1)',
            color: message.type === 'success' ? '#28a745' : '#dc3545',
            border: `1px solid ${message.type === 'success' ? 'rgba(40,167,69,0.3)' : 'rgba(220,53,69,0.3)'}`
          }}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label style={labelStyle}>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} />
            </div>
            <div className="col-md-6">
              <label style={labelStyle}>Nom du Salon</label>
              <input type="text" name="salonName" value={formData.salonName} onChange={handleChange} style={inputStyle} />
            </div>
            <div className="col-md-6">
              <label style={labelStyle}>Nom du Propriétaire</label>
              <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} style={inputStyle} />
            </div>
            <div className="col-md-6">
              <label style={labelStyle}>Téléphone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} style={inputStyle} />
            </div>
            <div className="col-md-6">
              <label style={labelStyle}>WhatsApp</label>
              <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} style={inputStyle} />
            </div>
            <div className="col-md-6">
              <label style={labelStyle}>Adresse</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} style={inputStyle} />
            </div>
            <div className="col-md-6">
              <label style={labelStyle}>Instagram</label>
              <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} style={inputStyle} placeholder="@username" />
            </div>
            <div className="col-md-6">
              <label style={labelStyle}>Facebook</label>
              <input type="text" name="facebook" value={formData.facebook} onChange={handleChange} style={inputStyle} placeholder="@username" />
            </div>
            <div className="col-12">
              <label style={labelStyle}>Bio / Description</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} style={{ ...inputStyle, minHeight: '100px' }} />
            </div>
          </div>
          <button type="submit" disabled={loading} style={{
            marginTop: '24px',
            background: 'linear-gradient(135deg, #b8860b, #d4a574)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            padding: '12px 28px',
            fontWeight: '700',
            fontSize: '14px',
            cursor: 'pointer',
            fontFamily: 'Nunito, sans-serif'
          }}>
            {loading ? '⏳ Sauvegarde...' : '💾 Sauvegarder profil'}
          </button>
        </form>
      </motion.div>

      {/* QR Code Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(90,204,230,0.04), rgba(90,204,230,0.02))', border: '1px solid rgba(90,204,230,0.2)' }}>
        <h5 style={{ fontFamily: 'Playfair Display, serif', color: '#2c1810', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          📱 Code QR - Votre Salon
        </h5>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', alignItems: 'start' }}>
          <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '2px solid rgba(90,204,230,0.2)' }}>
            <div id="qrcode" style={{ margin: '0 auto' }}>
              <QRCode value={qrValue} size={200} level="H" includeMargin={true} />
            </div>
            <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '12px', marginBottom: '12px' }}>
              URL: {qrValue.substring(0, 25)}...
            </p>
            <button onClick={downloadQR} style={{
              background: 'linear-gradient(135deg, #17a2b8, #20c997)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              padding: '8px 16px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: 'Nunito, sans-serif'
            }}>
              📥 Télécharger QR
            </button>
          </div>
          <div style={{ padding: '16px' }}>
            <h6 style={{ color: '#2c1810', marginBottom: '12px', fontWeight: 'bold' }}>💡 Utilisation</h6>
            <ul style={{ fontSize: '13px', color: '#6c757d', lineHeight: '1.8', marginBottom: 0 }}>
              <li>Imprimez et affichez en vitrine</li>
              <li>Partagez sur les réseaux sociaux</li>
              <li>Printez sur vos cartes de visite</li>
              <li>Affichage dans les annuaires</li>
              <li>Tags clients - accès direct</li>
            </ul>
            <div style={{ background: 'rgba(90,204,230,0.1)', padding: '12px', borderRadius: '10px', marginTop: '12px', fontSize: '12px', color: '#17a2b8', fontWeight: '600' }}>
              ℹ️ Le lien pointe vers votre salon{formData.salonName ? ` (${formData.salonName})` : ''}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Barcode Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={cardStyle}>
        <h5 style={{ fontFamily: 'Playfair Display, serif', color: '#2c1810', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          📊 Code Barre - Contact
        </h5>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', backgroundColor: '#f8f9fa', padding: '24px', borderRadius: '16px', border: '2px solid rgba(253,126,20,0.2)' }}>
            <svg ref={barcodeRef} style={{ maxWidth: '100%', height: 'auto' }} />
            <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '12px', marginBottom: '12px' }}>
              Code: {qrValue.substring(0, 20)}
            </p>
            <button onClick={downloadBarcode} style={{
              background: 'linear-gradient(135deg, #fd7e14, #ffc107)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              padding: '8px 16px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: 'Nunito, sans-serif'
            }}>
              📥 Télécharger Code Barre
            </button>
          </div>
          <div style={{ padding: '16px' }}>
            <h6 style={{ color: '#2c1810', marginBottom: '12px', fontWeight: 'bold' }}>📌 Informations</h6>
            <div style={{ background: 'rgba(253,126,20,0.08)', padding: '12px', borderRadius: '10px', fontSize: '13px', color: '#6c757d', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#2c1810' }}>Salon:</strong> {formData.salonName || 'Non défini'}
              </p>
              <p style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#2c1810' }}>Propriétaire:</strong> {formData.ownerName || 'Non défini'}
              </p>
              <p style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#2c1810' }}>Téléphone:</strong> {formData.phone || 'Non défini'}
              </p>
              <p style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#2c1810' }}>Adresse:</strong> {formData.address || 'Non défini'}
              </p>
              <div style={{ background: 'white', padding: '8px', borderRadius: '6px', marginTop: '8px', fontSize: '11px', fontWeight: '600', color: '#fd7e14' }}>
                ✓ Code encodé automatiquement
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileSettings;
