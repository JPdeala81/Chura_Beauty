import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const initialState = {
  salonName: '',
  heroTitle: '',
  heroSubtitle: '',
  bio: '',
  phone: '',
  whatsapp: '',
  address: '',
  instagram: '',
  facebook: '',
  heroBgColor: '#2c1810',
  heroTextColor: '#f8c8d4',
  coverPhoto: '',
  profilePhoto: '',
  faviconEmoji: '💆‍♀️',
  faviconImage: '',
  heroAnimation: 'particles',
  heroCta: 'Découvrir maintenant',
  heroCtaSecondary: 'Consulter',
  navbarCta: 'Réserver',
  adminBtnText: 'Bon marché',
  // Design tokens
  primaryColor: '#ffd700',
  secondaryColor: '#764ba2',
  cardBorderRadius: '16',
  cardShadowBlur: '24',
  animationEnabled: true,
  themeName: 'gold'
};

const SiteSettings = ({ onUpdate }) => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [profilePreview, setProfilePreview] = useState('');
  const [faviconPreview, setFaviconPreview] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      const d = res.data?.admin || res.data;
      if (d) {
        setForm({
          salonName: d.salon_name || '',
          heroTitle: d.hero_title || '',
          heroSubtitle: d.hero_subtitle || '',
          bio: d.bio || '',
          phone: d.phone || '',
          whatsapp: d.whatsapp || '',
          address: d.address || '',
          instagram: d.instagram || '',
          facebook: d.facebook || '',
          heroBgColor: d.hero_bg_color || '#2c1810',
          heroTextColor: d.hero_text_color || '#f8c8d4',
          coverPhoto: d.cover_photo || '',
          profilePhoto: d.profile_photo || '',
          faviconEmoji: d.favicon_emoji || '💆‍♀️',
          faviconImage: d.favicon_image || '',
          heroAnimation: d.hero_animation || 'particles',
          heroCta: d.hero_cta_text || 'Découvrir maintenant',
          heroCtaSecondary: d.hero_cta2_text || 'Consulter',
          navbarCta: d.navbar_cta_text || 'Réserver',
          adminBtnText: d.admin_btn_text || 'Bon marché',
          // Design tokens
          primaryColor: d.primary_color || '#ffd700',
          secondaryColor: d.secondary_color || '#764ba2',
          cardBorderRadius: d.card_border_radius || '16',
          cardShadowBlur: d.card_shadow_blur || '24',
          animationEnabled: d.animation_enabled !== false,
          themeName: d.theme_name || 'gold'
        });
        setCoverPreview(d.cover_photo || '');
        setProfilePreview(d.profile_photo || '');
      }
    } catch (e) {}
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'cover') setCoverPreview(reader.result);
      if (type === 'profile') setProfilePreview(reader.result);
      if (type === 'favicon') setFaviconPreview(reader.result);
    };
    reader.readAsDataURL(file);
    setForm(f => ({ 
      ...f, 
      [type === 'cover' ? 'coverPhoto' : type === 'profile' ? 'profilePhoto' : 'faviconImage']: file 
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      // Prepare form data for file upload
      const data = new FormData();
      data.append('salon_name', form.salonName);
      data.append('hero_title', form.heroTitle);
      data.append('hero_subtitle', form.heroSubtitle);
      data.append('bio', form.bio);
      data.append('phone', form.phone);
      data.append('whatsapp', form.whatsapp);
      data.append('address', form.address);
      data.append('instagram', form.instagram);
      data.append('facebook', form.facebook);
      data.append('hero_bg_color', form.heroBgColor);
      data.append('hero_text_color', form.heroTextColor);
      data.append('favicon_emoji', form.faviconEmoji);
      data.append('hero_animation', form.heroAnimation);
      data.append('hero_cta_text', form.heroCta);
      data.append('hero_cta2_text', form.heroCtaSecondary);
      data.append('navbar_cta_text', form.navbarCta);
      data.append('admin_btn_text', form.adminBtnText);
      // Design tokens
      data.append('primary_color', form.primaryColor);
      data.append('secondary_color', form.secondaryColor);
      data.append('card_border_radius', form.cardBorderRadius);
      data.append('card_shadow_blur', form.cardShadowBlur);
      data.append('animation_enabled', form.animationEnabled);
      data.append('theme_name', form.themeName);
      if (form.coverPhoto instanceof File) data.append('cover_photo', form.coverPhoto);
      if (form.profilePhoto instanceof File) data.append('profile_photo', form.profilePhoto);
      if (form.faviconImage instanceof File) data.append('favicon_image', form.faviconImage);
      await api.put('/auth/profile', data);
      setMessage({ type: 'success', text: '✅ Paramètres du site sauvegardés !' });
      if (onUpdate) onUpdate();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la sauvegarde' });
    } finally {
      setLoading(false);
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={cardStyle}>
      <h5 style={{ fontFamily: 'Playfair Display, serif', color: '#2c1810', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        🌐 Paramètres du site
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
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="row g-3">
          <div className="col-md-6">
            <label style={labelStyle}>Nom du salon</label>
            <input type="text" name="salonName" value={form.salonName} onChange={handleChange} style={inputStyle} />
          </div>
          <div className="col-md-6">
            <label style={labelStyle}>Téléphone</label>
            <input type="text" name="phone" value={form.phone} onChange={handleChange} style={inputStyle} />
          </div>
          <div className="col-md-6">
            <label style={labelStyle}>WhatsApp</label>
            <input type="text" name="whatsapp" value={form.whatsapp} onChange={handleChange} style={inputStyle} />
          </div>
          <div className="col-md-6">
            <label style={labelStyle}>Adresse</label>
            <input type="text" name="address" value={form.address} onChange={handleChange} style={inputStyle} />
          </div>
        </div>
        <div className="row g-3 mt-2">
          <div className="col-md-6">
            <label style={labelStyle}>Instagram</label>
            <input type="text" name="instagram" value={form.instagram} onChange={handleChange} style={inputStyle} />
          </div>
          <div className="col-md-6">
            <label style={labelStyle}>Facebook</label>
            <input type="text" name="facebook" value={form.facebook} onChange={handleChange} style={inputStyle} />
          </div>
        </div>
        <div className="row g-3 mt-2">
          <div className="col-md-6">
            <label style={labelStyle}>Slogan principal</label>
            <input type="text" name="heroTitle" value={form.heroTitle} onChange={handleChange} style={inputStyle} />
          </div>
          <div className="col-md-6">
            <label style={labelStyle}>Sous-titre</label>
            <input type="text" name="heroSubtitle" value={form.heroSubtitle} onChange={handleChange} style={inputStyle} />
          </div>
        </div>
        <div className="mt-2">
          <label style={labelStyle}>Bio / Description</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} style={{ ...inputStyle, minHeight: '80px' }} />
        </div>
        <div className="row g-3 mt-2">
          <div className="col-md-6">
            <label style={labelStyle}>Couleur principale du hero</label>
            <input type="color" name="heroBgColor" value={form.heroBgColor} onChange={handleChange} style={{ ...inputStyle, height: '48px', padding: '0 8px' }} />
          </div>
          <div className="col-md-6">
            <label style={labelStyle}>Couleur du texte hero</label>
            <input type="color" name="heroTextColor" value={form.heroTextColor} onChange={handleChange} style={{ ...inputStyle, height: '48px', padding: '0 8px' }} />
          </div>
        </div>
        <div className="row g-3 mt-2">
          <div className="col-md-6">
            <label style={labelStyle}>Photo de couverture</label>
            <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'cover')} style={inputStyle} />
            {coverPreview && <img src={coverPreview} alt="cover" style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', borderRadius: '10px', marginTop: '8px' }} />}
          </div>
          <div className="col-md-6">
            <label style={labelStyle}>Photo de profil</label>
            <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'profile')} style={inputStyle} />
            {profilePreview && <img src={profilePreview} alt="profile" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '50%', marginTop: '8px' }} />}
          </div>
        </div>

        {/* Animations Section */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ background: 'linear-gradient(135deg, rgba(184,134,11,0.04), rgba(212,165,116,0.02))', borderRadius: '16px', padding: '20px', marginTop: '28px', border: '1px solid rgba(184,134,11,0.1)' }}>
          <h6 style={{ fontFamily: 'Playfair Display, serif', color: '#2c1810', marginBottom: '16px', fontSize: '1.1rem' }}>✨ Animations Hero</h6>
          <label style={labelStyle}>Sélectionnez une animation</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '16px' }}>
            {[
              { id: 'particles', label: '🎆 Particules', desc: 'Flottantes et dynamiques' },
              { id: 'gradient', label: '🌈 Gradient', desc: 'Dégradé animé' },
              { id: 'waves', label: '🌊 Vagues', desc: 'Vagues souples' },
              { id: 'stars', label: '⭐ Étoiles', desc: 'Scintillantes' },
              { id: 'bubbles', label: '🫧 Bulles', desc: 'Bulles flottantes' },
              { id: 'geometric', label: '🔷 Géométrique', desc: 'Formes animées' }
            ].map(anim => (
              <motion.div
                key={anim.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setForm(f => ({ ...f, heroAnimation: anim.id }))}
                style={{
                  background: form.heroAnimation === anim.id ? 'linear-gradient(135deg, #b8860b, #d4a574)' : 'white',
                  border: form.heroAnimation === anim.id ? 'none' : '2px solid rgba(184,134,11,0.2)',
                  borderRadius: '12px',
                  padding: '14px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  color: form.heroAnimation === anim.id ? 'white' : '#2c1810',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>{anim.label.split(' ')[0]}</div>
                <div style={{ fontSize: '11px', fontWeight: '600', lineHeight: 1.2 }}>{anim.label.split(' ').slice(1).join(' ')}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Favicon Section */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ background: 'linear-gradient(135deg, rgba(32,201,151,0.04), rgba(32,201,151,0.02))', borderRadius: '16px', padding: '20px', marginTop: '20px', border: '1px solid rgba(32,201,151,0.1)' }}>
          <h6 style={{ fontFamily: 'Playfair Display, serif', color: '#2c1810', marginBottom: '16px', fontSize: '1.1rem' }}>🎨 Favicon & Logo</h6>
          <div className="row g-3">
            <div className="col-md-6">
              <label style={labelStyle}>Emoji Favicon</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '8px' }}>
                {['💆‍♀️', '💄', '💅', '✨', '🌹', '👑', '💎', '🌺'].map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, faviconEmoji: emoji }))}
                    style={{
                      background: form.faviconEmoji === emoji ? '#20c997' : 'white',
                      border: form.faviconEmoji === emoji ? 'none' : '1px solid rgba(32,201,151,0.2)',
                      fontSize: '24px',
                      padding: '10px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <input type="text" value={form.faviconEmoji} onChange={e => setForm(f => ({ ...f, faviconEmoji: e.target.value }))} style={inputStyle} placeholder="Ou entrez un emoji..." maxLength="2" />
            </div>
            <div className="col-md-6">
              <label style={labelStyle}>Image Favicon (optionnel)</label>
              <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'favicon')} style={inputStyle} />
              {faviconPreview && <img src={faviconPreview} alt="favicon" style={{ width: '60px', height: '60px', objectFit: 'contain', marginTop: '8px' }} />}
            </div>
          </div>
        </motion.div>

        {/* Design Tokens Section */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} style={{ background: 'linear-gradient(135deg, rgba(102,126,234,0.04), rgba(118,75,162,0.02))', borderRadius: '16px', padding: '20px', marginTop: '20px', border: '1px solid rgba(102,126,234,0.1)' }}>
          <h6 style={{ fontFamily: 'Playfair Display, serif', color: '#2c1810', marginBottom: '16px', fontSize: '1.1rem' }}>🎨 Jetons de Design</h6>
          <div className="row g-3">
            <div className="col-md-6">
              <label style={labelStyle}>Couleur Principale</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input type="color" name="primaryColor" value={form.primaryColor} onChange={handleChange} style={{ ...inputStyle, width: '60px', height: '48px', padding: '0 8px' }} />
                <input type="text" name="primaryColor" value={form.primaryColor} onChange={handleChange} style={{ ...inputStyle, flex: 1 }} />
              </div>
            </div>
            <div className="col-md-6">
              <label style={labelStyle}>Couleur Secondaire</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input type="color" name="secondaryColor" value={form.secondaryColor} onChange={handleChange} style={{ ...inputStyle, width: '60px', height: '48px', padding: '0 8px' }} />
                <input type="text" name="secondaryColor" value={form.secondaryColor} onChange={handleChange} style={{ ...inputStyle, flex: 1 }} />
              </div>
            </div>
            <div className="col-md-6">
              <label style={labelStyle}>Rayon des Coins Cartes (px)</label>
              <input type="number" name="cardBorderRadius" value={form.cardBorderRadius} onChange={handleChange} min="0" max="50" style={inputStyle} />
            </div>
            <div className="col-md-6">
              <label style={labelStyle}>Flou Ombre Cartes (px)</label>
              <input type="number" name="cardShadowBlur" value={form.cardShadowBlur} onChange={handleChange} min="0" max="50" style={inputStyle} />
            </div>
            <div className="col-md-6">
              <label style={labelStyle}>Thème</label>
              <select name="themeName" value={form.themeName} onChange={handleChange} style={inputStyle}>
                <option value="gold">Or</option>
                <option value="dark">Sombre</option>
                <option value="rose">Rose</option>
                <option value="green">Vert</option>
                <option value="blue">Bleu</option>
              </select>
            </div>
            <div className="col-md-6">
              <label style={labelStyle}>Animations</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, animationEnabled: true }))}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: form.animationEnabled ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white',
                    border: form.animationEnabled ? 'none' : '2px solid rgba(102,126,234,0.2)',
                    color: form.animationEnabled ? 'white' : '#2c1810',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  ✅ Activé
                </button>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, animationEnabled: false }))}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: !form.animationEnabled ? '#f0f0f0' : 'white',
                    border: !form.animationEnabled ? '2px solid #999' : '2px solid rgba(0,0,0,0.1)',
                    color: '#2c1810',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  ⏸️ Désactivé
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Texts Section */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ background: 'linear-gradient(135deg, rgba(233,62,140,0.04), rgba(233,62,140,0.02))', borderRadius: '16px', padding: '20px', marginTop: '20px', border: '1px solid rgba(233,62,140,0.1)' }}>
          <h6 style={{ fontFamily: 'Playfair Display, serif', color: '#2c1810', marginBottom: '16px', fontSize: '1.1rem' }}>📝 Textes Personnalisés</h6>
          <div className="row g-3">
            <div className="col-md-6">
              <label style={labelStyle}>Bouton Hero Principal</label>
              <input type="text" name="heroCta" value={form.heroCta} onChange={handleChange} style={inputStyle} placeholder="ex: Réserver maintenant" />
            </div>
            <div className="col-md-6">
              <label style={labelStyle}>Bouton Hero Secondaire</label>
              <input type="text" name="heroCtaSecondary" value={form.heroCtaSecondary} onChange={handleChange} style={inputStyle} placeholder="ex: En savoir plus" />
            </div>
            <div className="col-md-6">
              <label style={labelStyle}>Bouton Navbar CTA</label>
              <input type="text" name="navbarCta" value={form.navbarCta} onChange={handleChange} style={inputStyle} placeholder="ex: Appeler" />
            </div>
            <div className="col-md-6">
              <label style={labelStyle}>Bouton Admin (Texte)</label>
              <input type="text" name="adminBtnText" value={form.adminBtnText} onChange={handleChange} style={inputStyle} placeholder="ex: Bon plan" />
            </div>
          </div>
        </motion.div>

        <button type="submit" disabled={loading} style={{
          marginTop: '28px',
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
          {loading ? '⏳ Sauvegarde...' : '✨ Sauvegarder tout'}
        </button>
      </form>
    </motion.div>
  );
};

export default SiteSettings;
