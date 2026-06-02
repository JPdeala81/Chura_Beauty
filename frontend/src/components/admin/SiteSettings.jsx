import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { compressImage, isFileSizeAcceptable } from '../../utils/imageCompression';
import { sanitizeObject, isValidHexColor } from '../../utils/dataSanitization';
import { compressFormDataImages } from '../../utils/formDataCompression';

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
  heroCardMedia: '',
  heroCardMediaType: 'image',
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
      const [profileRes, siteRes] = await Promise.allSettled([
        api.get('/auth/profile'),
        api.get('/site-settings')
      ]);
      const d = profileRes.status === 'fulfilled' ? (profileRes.value.data?.admin || profileRes.value.data) : {};
      const s = siteRes.status === 'fulfilled' ? (siteRes.value.data || {}) : {};
      if (d || s) {
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
          heroCardMedia: s.hero_card_media || '',
          heroCardMediaType: s.hero_card_media_type || 'image',
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

    // Check file size before processing
    if (!isFileSizeAcceptable(file, 5)) {
      setMessage({ type: 'error', text: `Fichier trop volumineux (max 5MB). Taille actuelle: ${(file.size / 1024 / 1024).toFixed(2)}MB` });
      return;
    }

    try {
      // Compress image if it's an image file
      let processedFile = file;
      if (file.type.startsWith('image/')) {
        processedFile = await compressImage(file, 1920, 1080, 0.85);
        setMessage({ type: 'success', text: `✅ Image compressée de ${(file.size / 1024).toFixed(2)}KB à ${(processedFile.size / 1024).toFixed(2)}KB` });
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'cover') setCoverPreview(reader.result);
        if (type === 'profile') setProfilePreview(reader.result);
        if (type === 'favicon') setFaviconPreview(reader.result);
      };
      reader.readAsDataURL(processedFile);
      setForm(f => ({
        ...f,
        [type === 'cover' ? 'coverPhoto' : type === 'profile' ? 'profilePhoto' : 'faviconImage']: processedFile
      }));
    } catch (err) {
      setMessage({ type: 'error', text: `Erreur traitement image: ${err.message}` });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validation stricte
    const errors = [];

    // Salon name
    if (!form.salonName || form.salonName.trim().length < 2) {
      errors.push('Nom du salon: minimum 2 caractères requis');
    }
    if (form.salonName.length > 100) {
      errors.push('Nom du salon: maximum 100 caractères');
    }

    // Hero title
    if (!form.heroTitle || form.heroTitle.trim().length < 3) {
      errors.push('Titre principal: minimum 3 caractères requis');
    }
    if (form.heroTitle.length > 150) {
      errors.push('Titre principal: maximum 150 caractères');
    }

    // Hero subtitle
    if (form.heroSubtitle && form.heroSubtitle.length > 200) {
      errors.push('Sous-titre: maximum 200 caractères');
    }

    // Bio
    if (form.bio && form.bio.length > 500) {
      errors.push('Bio: maximum 500 caractères');
    }

    // Phone validation
    if (!form.phone || !/^[+]?[\d\s\-()]{7,}$/.test(form.phone.replace(/\s/g, ''))) {
      errors.push('Téléphone: format invalide (minimum 7 chiffres)');
    }

    // WhatsApp validation
    if (!form.whatsapp || !/^[+]?[\d\s\-()]{7,}$/.test(form.whatsapp.replace(/\s/g, ''))) {
      errors.push('WhatsApp: format invalide (minimum 7 chiffres)');
    }

    // Address
    if (!form.address || form.address.trim().length < 3) {
      errors.push('Adresse: minimum 3 caractères requis');
    }
    if (form.address.length > 200) {
      errors.push('Adresse: maximum 200 caractères');
    }

    // Social media handles
    if (form.instagram && form.instagram.length > 100) {
      errors.push('Instagram: maximum 100 caractères');
    }
    if (form.facebook && form.facebook.length > 100) {
      errors.push('Facebook: maximum 100 caractères');
    }

    // File size validation - CRITICAL
    const maxImageSize = 2 * 1024 * 1024; // 2MB max
    if (form.coverPhoto instanceof File && form.coverPhoto.size > maxImageSize) {
      errors.push(`Logo trop volumineux: ${(form.coverPhoto.size / 1024 / 1024).toFixed(2)}MB (max 2MB)`);
    }
    if (form.profilePhoto instanceof File && form.profilePhoto.size > maxImageSize) {
      errors.push(`Photo trop volumineuse: ${(form.profilePhoto.size / 1024 / 1024).toFixed(2)}MB (max 2MB)`);
    }
    if (form.faviconImage instanceof File && form.faviconImage.size > 500 * 1024) {
      errors.push(`Favicon trop volumineux: ${(form.faviconImage.size / 1024).toFixed(2)}KB (max 500KB)`);
    }

    // Color validation
    if (!/^#[0-9A-F]{6}$/i.test(form.heroBgColor)) {
      errors.push('Couleur de fond: format hex invalide (#RRGGBB)');
    }
    if (!/^#[0-9A-F]{6}$/i.test(form.heroTextColor)) {
      errors.push('Couleur du texte: format hex invalide (#RRGGBB)');
    }
    if (!/^#[0-9A-F]{6}$/i.test(form.primaryColor)) {
      errors.push('Couleur primaire: format hex invalide (#RRGGBB)');
    }
    if (!/^#[0-9A-F]{6}$/i.test(form.secondaryColor)) {
      errors.push('Couleur secondaire: format hex invalide (#RRGGBB)');
    }

    // Border radius validation
    const borderRadius = parseInt(form.cardBorderRadius);
    if (isNaN(borderRadius) || borderRadius < 0 || borderRadius > 50) {
      errors.push('Rayon des bordures: doit être entre 0 et 50px');
    }

    // Shadow blur validation
    const shadowBlur = parseInt(form.cardShadowBlur);
    if (isNaN(shadowBlur) || shadowBlur < 0 || shadowBlur > 100) {
      errors.push('Flou des ombres: doit être entre 0 et 100px');
    }

    if (errors.length > 0) {
      setMessage({ type: 'error', text: errors.join(' | ') });
      setLoading(false);
      return;
    }

    try {
      // Sanitize all text fields
      const sanitizedForm = sanitizeObject({
        salonName: form.salonName,
        heroTitle: form.heroTitle,
        heroSubtitle: form.heroSubtitle,
        bio: form.bio,
        phone: form.phone,
        whatsapp: form.whatsapp,
        address: form.address,
        instagram: form.instagram,
        facebook: form.facebook,
        heroCta: form.heroCta,
        heroCtaSecondary: form.heroCtaSecondary,
        navbarCta: form.navbarCta,
        adminBtnText: form.adminBtnText
      });

      // Prepare form data for file upload
      const data = new FormData();
      data.append('salon_name', sanitizedForm.salonName);
      data.append('hero_title', sanitizedForm.heroTitle);
      data.append('hero_subtitle', sanitizedForm.heroSubtitle);
      data.append('bio', sanitizedForm.bio);
      data.append('phone', sanitizedForm.phone);
      data.append('whatsapp', sanitizedForm.whatsapp);
      data.append('address', sanitizedForm.address);
      data.append('instagram', sanitizedForm.instagram);
      data.append('facebook', sanitizedForm.facebook);
      data.append('hero_bg_color', form.heroBgColor);
      data.append('hero_text_color', form.heroTextColor);
      data.append('favicon_emoji', form.faviconEmoji);
      data.append('hero_animation', form.heroAnimation);
      data.append('hero_cta_text', sanitizedForm.heroCta);
      data.append('hero_cta2_text', sanitizedForm.heroCtaSecondary);
      data.append('navbar_cta_text', sanitizedForm.navbarCta);
      data.append('admin_btn_text', sanitizedForm.adminBtnText);
      // Design tokens (hero_card_media sauvegardé séparément vers /site-settings)
      data.append('primary_color', form.primaryColor);
      data.append('secondary_color', form.secondaryColor);
      data.append('card_border_radius', form.cardBorderRadius);
      data.append('card_shadow_blur', form.cardShadowBlur);
      data.append('animation_enabled', form.animationEnabled);
      data.append('theme_name', form.themeName);

      // Add images with compression
      if (form.coverPhoto instanceof File) {
        data.append('cover_photo', form.coverPhoto);
      }
      if (form.profilePhoto instanceof File) {
        data.append('profile_photo', form.profilePhoto);
      }
      if (form.faviconImage instanceof File) {
        data.append('favicon_image', form.faviconImage);
      }

      // Compress all images before sending
      console.log('📦 Compressing images in FormData before upload...');
      const compressedData = await compressFormDataImages(data);
      console.log('✅ All images compressed, sending to API...');

      await api.put('/auth/profile', compressedData);

      // Sauvegarder hero_card_media vers site_settings (table séparée lue par HeroSection)
      await api.put('/site-settings', {
        hero_card_media: form.heroCardMedia || '',
        hero_card_media_type: form.heroCardMediaType || 'image'
      });

      setMessage({ type: 'success', text: '✅ Paramètres du site sauvegardés !' });
      if (onUpdate) onUpdate();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Erreur lors de la sauvegarde';
      if (err.response?.status === 413) {
        setMessage({ type: 'error', text: '❌ Données trop volumineux. Réduisez la taille des images.' });
      } else {
        setMessage({ type: 'error', text: errorMsg });
      }
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

        {/* ── CARTE FLOTTANTE HERO ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            background: 'linear-gradient(135deg, rgba(44,24,16,0.05), rgba(184,134,11,0.08))',
            borderRadius: '20px',
            padding: '24px',
            marginTop: '24px',
            border: '2px solid rgba(184,134,11,0.25)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ fontSize: '32px' }}>💆‍♀️</div>
            <div>
              <h6 style={{ fontFamily: 'Playfair Display, serif', color: '#2c1810', margin: 0, fontSize: '1.15rem', fontWeight: '700' }}>
                Carte Flottante — Page d'Accueil
              </h6>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6c757d' }}>
                C'est la carte animée (💆‍♀️ + nom du salon + ville) visible à droite de la page d'accueil
              </p>
            </div>
          </div>

          {/* Aperçu de l'état actuel */}
          <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(184,134,11,0.1)' }}>
            <div style={{ fontSize: '20px' }}>
              {form.heroCardMedia ? (form.heroCardMediaType === 'video' ? '🎥' : '🖼️') : '✨'}
            </div>
            <div style={{ fontSize: '13px', color: '#2c1810' }}>
              <strong>État actuel :</strong>{' '}
              {form.heroCardMedia
                ? `Média personnalisé (${form.heroCardMediaType}) — ${form.heroCardMedia.substring(0, 50)}${form.heroCardMedia.length > 50 ? '...' : ''}`
                : 'Animation par défaut (💆‍♀️ + ' + (form.salonName || 'Nom du salon') + ' + Ville)'
              }
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <p style={{ fontSize: '13px', color: '#6c757d', marginBottom: '12px', lineHeight: '1.5' }}>
              <strong>Option A (actuel) :</strong> L'animation par défaut s'affiche si aucun média n'est défini.<br/>
              <strong>Option B :</strong> Collez une URL d'image ou vidéo pour la remplacer entièrement.
            </p>
          </div>

          <div className="row g-3">
            <div className="col-md-8">
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#6c757d', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
                🔗 URL image ou vidéo (laisser vide = animation par défaut)
              </label>
              <input
                type="url"
                name="heroCardMedia"
                value={form.heroCardMedia}
                onChange={handleChange}
                style={{ border: '2px solid rgba(184,134,11,0.3)', borderRadius: '12px', padding: '12px 16px', width: '100%', fontFamily: 'Nunito, sans-serif', fontSize: '13px', outline: 'none', background: 'white' }}
                placeholder="https://exemple.com/mon-image.jpg"
              />
              <small style={{ color: '#6c757d', fontSize: '11px' }}>
                Formats supportés : JPG, PNG, WebP, GIF, MP4, WebM
              </small>
            </div>
            <div className="col-md-4">
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#6c757d', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
                Type de média
              </label>
              <select
                name="heroCardMediaType"
                value={form.heroCardMediaType}
                onChange={handleChange}
                style={{ border: '2px solid rgba(184,134,11,0.3)', borderRadius: '12px', padding: '12px 16px', width: '100%', fontFamily: 'Nunito, sans-serif', fontSize: '13px', background: 'white' }}
              >
                <option value="image">🖼️ Image</option>
                <option value="video">🎥 Vidéo</option>
              </select>
            </div>
          </div>

          {form.heroCardMedia && (
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(40,167,69,0.06)', borderRadius: '12px', padding: '12px 16px', border: '1px solid rgba(40,167,69,0.2)' }}>
              {form.heroCardMediaType === 'video' ? (
                <video src={form.heroCardMedia} style={{ height: '70px', width: '100px', borderRadius: '8px', objectFit: 'cover' }} muted />
              ) : (
                <img src={form.heroCardMedia} alt="Aperçu carte" style={{ height: '70px', width: '100px', borderRadius: '8px', objectFit: 'cover' }} onError={e => { e.target.style.display='none' }} />
              )}
              <div>
                <div style={{ fontSize: '13px', color: '#28a745', fontWeight: '700', marginBottom: '4px' }}>✅ Média personnalisé configuré</div>
                <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '6px' }}>Ce média remplacera l'animation sur la page d'accueil</div>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, heroCardMedia: '', heroCardMediaType: 'image' }))}
                  style={{ background: 'none', border: '1px solid #dc3545', color: '#dc3545', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}
                >
                  ✕ Supprimer — revenir à l'animation
                </button>
              </div>
            </div>
          )}
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
