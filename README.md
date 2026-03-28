# Salon de Beauté - Application Web Full-Stack

Application web complète pour un salon de beauté/coiffure avec gestion des rendez-vous, services, notifications et tableau de bord administrateur. Utilise **Supabase PostgreSQL** comme base de données.

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
- Gestion des rendez-vous : accepter/refuser avec notification WhatsApp auto
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
│   ├── vercel.json    (déploiement)
│   └── package.json
│
├── backend/            ← Node.js + Express
│   ├── config/         (Supabase, Cloudinary)
│   ├── controllers/    (API logique)
│   ├── routes/         (Endpoints)
│   ├── middleware/     (Auth JWT, Upload, Erreurs)
│   ├── sockets/        (Socket.IO)
│   ├── utils/          (Slots, WhatsApp, Email)
│   ├── scripts/        (seedAdmin.js)
│   ├── server.js
│   └── package.json
│
├── vercel.json         (déploiement full-stack)
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
- **Supabase Client** (base de données)

### Backend
- **Node.js 20 + Express**
- **Supabase PostgreSQL** (cloud, 500MB gratuit)
- **JWT + Bcrypt** (sécurité)
- **Multer + Cloudinary** (images)
- **Socket.IO** (temps réel)
- **Twilio WhatsApp API** (notifications)
- **Nodemailer** (email optionnel)

### Déploiement
- **Full-Stack** : Vercel (gratuit)
- **Database** : Supabase (500MB gratuit)
- **Images** : Cloudinary (gratuit, 25GB)

## 🚀 Installation locale

### Prérequis
- Node.js 20+
- npm ou yarn
- Compte Supabase (gratuit)
- Compte Cloudinary (gratuit)
- Compte Twilio (optionnel, pour WhatsApp)

### 1. Clone le repos

```bash
git clone <your-repo-url>
cd salon-beaute
```

### 2. Configuration Supabase PostgreSQL

1. Crée un compte gratuit : https://supabase.com
2. Crée un nouveau projet
3. Note les identifiants :
   - **URL Supabase** : `https://xxxx.supabase.co`
   - **Service Key** (clé privée)
4. Va dans l'éditeur SQL et exécute le contenu de `backend/config/database.sql` pour créer les tables

### 3. Configuration Cloudinary

1. Crée un compte gratuit : https://cloudinary.com
2. Va sur le Dashboard
3. Récupère :
   - Cloud Name
   - API Key
   - API Secret

### 4. Configuration Twilio WhatsApp (optionnel)

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

**Modifie `.env` avec tes données Supabase :**

```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=votre_cle_service_secrete
JWT_SECRET=your_ultra_secure_jwt_secret_32_chars_min
JWT_EXPIRE=24h
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_FROM=whatsapp:+1415...
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@salon.com
ADMIN_PASSWORD=Admin123!
ADMIN_NAME=Administratrice
SALON_NAME=Chura Beauty Salon
ADMIN_PHONE=+241000000000
ADMIN_WHATSAPP=+241000000000
ADMIN_ADDRESS=Libreville, Gabon
```

### 6. Crée l'admin avec seed

```bash
npm run seed:admin
```

### 7. Démarre le backend

```bash
npm run dev
```

Le backend est accessible sur `http://localhost:5000`

### 8. Installation Frontend

```bash
cd ../frontend
npm install
```

### 9. Démarre le frontend

```bash
npm run dev
```

Le frontend est accessible sur `http://localhost:5173`

## 📋 Admin Credentials (Local)

Par défaut, après `npm run seed:admin` :

```
Email: admin@salon.com
Password: Admin123!
```

**À CHANGER en production via les Paramètres Admin !**

## 🗄️ Schéma Supabase

Le schéma PostgreSQL inclut :

- **admins** : Profil admin unique
- **services** : Catalogue des services
- **availabilities** : Créneaux de disponibilité
- **appointments** : Rendez-vous clients
- **notifications** : Notificationstemps réel

Tous les fichiers sont générés automatiquement avec UUIDs et timestamps.

## 🚢 Déploiement Vercel (Full-Stack)

### Backend

1. Push le code sur GitHub
2. Va sur https://vercel.com
3. Importe le repo
4. Configure les variables d'environnement (SUPABASE_URL, SUPABASE_SERVICE_KEY, etc.)
5. Déploie !

Le backend sera sur : `https://your-project.vercel.app/api/...`

### Frontend

Le frontend est déployé avec le backend via le même projet Vercel.

## 🔗 Variables d'environnement

Voir `.env.example` pour le template complet.

**IMPORTANT :**
- Ne jamais commiter `.env` (sauvegardé dans `.gitignore`)
- Les clés Supabase et Cloudinary sont sécurisées côté serveur
- En dev local, utilise `.env` ; en prod, configure via Vercel

## 📝 Troubleshooting

### "Supabase connexion échouée"
→ Vérifiez `SUPABASE_URL` et `SUPABASE_SERVICE_KEY` dans `.env`

### "Admin already exists"
→ Normal lors du seed. Supprimez la ligne de la table `admins` sur Supabase si vous voulez relancer

### "Port 5173 already in use"
```bash
lsof -ti:5173 | xargs kill -9
```

### "Module not found: @supabase/supabase-js"
```bash
npm install @supabase/supabase-js
```

## 📄 Licence

MIT

## 👨‍💻 Support

Pour toute question, consultez la documentation Supabase : https://supabase.com/docs

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
