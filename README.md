# Salon de Beauté - Application Web Full-Stack

Application web complète pour un salon de beauté/coiffure avec gestion des rendez-vous, services, notifications et tableau de bord administrateur.

## 🎯 Fonctionnalités principales

### Public
- Accueil avec héro section (photo de couverture, profil gérante)
- Catalogue des services avec filtres (catégorie, prix, disponibilité)
- Recherche puissante (textuelle + filtres)
- Page détail service (galerie, disponibilités, options)
- Formulaire de réservation en 4 étapes (date/heure → options → coordonnées → récapitulatif)
- Notifications en temps réel du statut du RDV (WhatsApp automatique)
- QR code paiement mobile (verrouillé - bientôt disponible)

### Admin
- Authentification sécurisée (JWT)
- Tableau de bord avec KPIs et graphiques Recharts
- Gestion des services : créer, modifier, supprimer, afficher/masquer
- Upload images vers Cloudinary (drag & drop)
- Gestion des rendez-vous : acccepter/refuser avec notification WhatsApp auto
- Notifications en temps réel (Socket.IO + bip sonore)
- Chiffre d'affaires avec 3 vues (semaine/mois/année) + répartition par catégorie
- Paramètres profil : modification infos salon, photo profil/couverture, réseaux sociaux
- Modifier mot de passe
- Configuration paiement mobile (interface visible mais verrouillée)

## 🏗️ Architecture

```
salon-beaute/
├── frontend/           ← React.js + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/  (API Axios)
│   │   ├── utils/
│   │   └── styles/
│   ├── public/
│   ├── vite.config.js
│   └── package.json
│
├── backend/            ← Node.js + Express
│   ├── config/         (DB, Cloudinary)
│   ├── models/         (Mongoose)
│   ├── controllers/
│   ├── routes/
│   ├── middleware/     (Auth JWT, Upload, Erreurs)
│   ├── sockets/        (Socket.IO)
│   ├── utils/          (Slots, WhatsApp, Email)
│   ├── scripts/        (seedAdmin.js)
│   ├── server.js
│   └── package.json
│
├── .env.example
├── .gitignore
└── README.md
```

## 🔧 Stack technique

### Frontend
- **React 18** (Vite)
- **Bootstrap 5.3** (CSS exclusif)
- **React Router v6**
- **Axios** (API)
- **Socket.IO Client** (notifications)
- **Recharts** (graphiques)
- **React DatePicker** (calendrier)
- **QR Code** (paiement mobile)
- **Framer Motion** (animations)

### Backend
- **Node.js 20 + Express**
- **MongoDB Atlas** (cloud, gratuit)
- **Mongoose** (ODM)
- **JWT + Bcrypt** (sécurité)
- **Multer + Cloudinary** (images)
- **Socket.IO** (temps réel)
- **Twilio WhatsApp API** (notifications)
- **Nodemailer** (email optionnel)

### Déploiement
- **Frontend** : GitHub Pages / Vercel (gratuit)
- **Backend** : Render.com / Railway (gratuit)
- **DB** : MongoDB Atlas (M0 gratuit, 512MB)
- **Images** : Cloudinary (gratuit, 25GB)

## 🚀 Installation locale

### Prérequis
- Node.js 20+
- npm ou yarn
- Compte MongoDB Atlas
- Compte Cloudinary
- Compte Twilio

### 1. Clone le repos

```bash
git clone <your-repo-url>
cd salon-beaute
```

### 2. Configuration MongoDB Atlas

1. Crée un compte gratuit : https://www.mongodb.com/cloud/atlas
2. Crée un cluster M0 (gratuit)
3. Ajoute un utilisateur DB (ex: `admin` / `password123`)
4. Récupère la connexion string : `mongodb+srv://admin:password123@cluster.mongodb.net/salon_beaute?retryWrites=true&w=majority`

### 3. Configuration Cloudinary

1. Crée un compte gratuit : https://cloudinary.com
2. Va sur le Dashboard
3. Récupère :
   - Cloud Name
   - API Key
   - API Secret

### 4. Configuration Twilio WhatsApp

1. Crée un compte Twilio : https://www.twilio.com
2. Récupère un numéro WhatsApp Sandbox
3. Récupère :
   - Account SID
   - Auth Token
   - Numéro WhatsApp (ex: `+1415...`)

### 5. Installation Backend

```bash
cd backend
npm install
cp ../.env.example .env
```

**Modifie `.env` avec tes données :**

```env
MONGODB_URI=mongodb+srv://admin:password123@cluster.mongodb.net/salon_beaute
JWT_SECRET=your_ultra_secure_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_FROM=whatsapp:+1415...
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@salon.com
ADMIN_PASSWORD=ChangeMe123!
```

**Lance le seed admin :** (crée le premier compte administrateur)

```bash
npm run seed:admin
```

**Démarrage du serveur :**

```bash
npm run dev  # développement avec nodemon
npm start    # production
```

Le backend sera sur `http://localhost:5000`

### 6. Installation Frontend

```bash
cd frontend
npm install
```

**Démarre Vite :**

```bash
npm run dev
```

Le site sera sur `http://localhost:5173`

### 7. Accès Admin

- URL : `http://localhost:5173/admin/login`
- Email : `admin@salon.com`
- Mot de passe : `ChangeMe123!`

⚠️ **IMPORTANT** : Change ces identifiants après la première connexion !

## 📋 Gestion des créneaux

Le système de créneaux fonctionne ainsi :

1. **Définition des créneaux de disponibilité** (via admin) :
   - Récurrents : chaque lundi de 10h à 14h
   - Ponctuels : date spécifique (11/04/2024, 15h-17h)

2. **Calcul des créneaux libres** :
   - Les créneaux sont générés en fonction de la durée du service
   - (Ex: service 30min, 10h-14h → slots de 30min : 10h, 10:30, 11h, 11:30, ...)

3. **Blocage des créneaux réservés** :
   - Si un RDV est accepté (status: "accepted"), son créneau est bloqué
   - Les autres clients voient ce créneau comme indisponible

## 🔔 Notifications en temps réel

### Socket.IO (Admin)
- Connection à la socket quand l'admin se connecte
- Event `announcement:new_appointment` envoyé quand nouveau RDV
- Badge rouge sur l'icône 🔔 (compte des notifications non lues)
- Bip sonore (fichier `notification.mp3`)
- Panel notifications avec horodatage

### WhatsApp automatique
- **À l'acceptation** : message de confirmation avec détails RDV
- **Au refus ** : message d'excuses + invitation à reprendre RDV
- Via Twilio WhatsApp API
- Templates de messages dans `utils/whatsappUtil.js`

## 💳 Paiement mobile (VERROUILLÉ)

### État actuel
- Composant `QRCodeBlock` visible sur chaque service (opacité réduite)
- Badge "🔒 Bientôt disponible" superposé
- QR code généré mais inactif
- Interface config admin verrouillée

### Fonctionnement quand déverrouillé
- Admin configure codes Airtel Money et Moov Money
- QR code contient schéma URI : `tel:*555*1*NUMERO*MONTANT%23`
- Client scanne → ouvre composeur téléphone avec code pré-rempli
- Client n'a qu'à entrer son PIN

## 📊 Graphiques Recharts

Le dashboard de CA affiche :

1. **Graphique linéaire** : évolution du CA (séries temporelles)
   - Semaine : par jour
   - Mois : par semaine
   - Année : par mois

2. **Graphique camembert** : répartition CA par catégorie service

3. **Statistiques** :
   - CA total (acceptés uniquement)
   - Nombre de RDV acceptés
   - CA moyen par RDV

## 🎨 Design & Responsive

- **Bootstrap 5.3** exclusif
- **Variables CSS** : palette rose poudré, doré, blanc cassé (luxe beauté)
- **Polices Google** : `Playfair Display` (titres) + `Nunito` (corps)
- **Icônes** : Bootstrap Icons + FontAwesome 6
- **Animations** : Framer Motion (entrées/sorties composants)
- **Responsive mobile-first** : 320px → 1440px+
- **Accessibilité** : WCAG AA (aria-labels, contraste)
- **Images** : lazy loading, ratio fixe (16:9 ou 4:3)

## 🔐 Sécurité

✅ **Implémenté :**
- Mot de passe bcrypté (salt rounds: 12)
- JWT avec expiration 24h + refresh token
- Toutes les variables sensibles en `.env` (jamais en hard code)
- CORS configuré pour n'accepter que le frontend
- Validation des entrées côté serveur
- Rate limiting sur les routes API
- Headers sécurisés (Helmet.js)
- `.gitignore` : node_modules, .env, uploads/

## 📦 Dépendances principales

### Frontend (package.json)
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.22.0",
  "axios": "^1.6.0",
  "socket.io-client": "^4.7.0",
  "react-bootstrap": "^2.10.0",
  "bootstrap": "^5.3.0",
  "recharts": "^2.12.0",
  "qrcode.react": "^3.1.0"
}
```

### Backend (package.json)
```json
{
  "express": "^4.18.0",
  "mongoose": "^8.2.0",
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.3",
  "multer": "^1.4.5",
  "cloudinary": "^2.0.0",
  "socket.io": "^4.7.0",
  "twilio": "^5.0.0"
}
```

## 🚀 Déploiement

### Frontend (GitHub Pages)

1. Crée le build :
   ```bash
   cd frontend
   npm run build
   ```

2. Crée un repo GitHub `salon-beaute`

3. **Via Vercel (recommandé)** :
   - Importthe repo sur Vercel.com
   - Déploiement auto à chaque push
   - URL : `salon-beaute-xxx.vercel.app`

4. **Via GitHub Pages** :
   - Configure dans `vite.config.js` : `base: '/salon-beaute/'`
   - Ajoute GitHub Actions pour deployer sur `gh-pages` branch

### Backend (Render.com)

1. Crée un compte Render.com gratuit

2. "New" → "Web Service"

3. Configure :
   - Build Command : `npm install`
   - Start Command : `npm start`
   - Environnement : Node
   - Variables d'env : colle le contenu de `.env`

4. Deploy

5. Récupère l'URL (ex : `https://salon-beaute-api.onrender.com`)

6. **Met à jour frontend** `.env` :
   ```
   VITE_API_URL=https://salon-beaute-api.onrender.com/api
   ```

### Base de données (MongoDB Atlas)

- Déjà en cloud ✅
- Les données sont persistantes
- Gratuit jusqu'à 512MB

### Images (Cloudinary)

- Déjà en cloud ✅
- Gratuit jusqu'à 25GB

## 🧪 Testing rapide

1. Frontend : ouvre `http://localhost:5173`
2. Crée un RDV public (pas de compte requis)
3. Admin se connecte : `/admin/login`
4. Gère les RDV : `/admin/appointments`
5. Ajoute des services : `/admin/services`
6. Vois les stats : `/admin/revenue`

## 📧 Support & Contact

- GitHub issues : signalez les bugs
- Email : contact@salon.com
- WhatsApp : demandes commerciales

## 📄 Licence

MIT License - Libre d'utilisation

---

**Prêt à déployer ? 🚀 Suis les étapes d'installation et tu devras voir le projet en ligne en 30 minutes.**
