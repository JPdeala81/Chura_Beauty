# 🚀 GUIDE DE DÉPLOIEMENT - Salon de Beauté

Déploiement complet sur services gratuits : GitHub Pages/Vercel + Render.com

---

## 📋 Résumé des services

| Composant | Service | URL Type | Gratuit |
|-----------|---------|----------|---------|
| **Frontend** | Vercel | salon-beaute.vercel.app | ✅ Oui |
| **Backend** | Render.com | salon-beaute-api.onrender.com | ✅ Oui |
| **Database** | MongoDB Atlas | M0 (512MB) | ✅ Oui |
| **Images** | Cloudinary | Gratuit (25GB) | ✅ Oui |
| **WhatsApp** | Twilio | Sandbox gratuit | ✅ Oui |

---

## 1️⃣ PRÉPARATION (avant déploiement)

### Vérifier les fichiers essentiels

```bash
salon-beaute/
├── backend/
│   ├── .env (contient les secrets - JAMAIS à committer)
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── .env.local (optionnel - contient VITE_API_URL)
│   ├── vite.config.js
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

### Vérifier .gitignore

```bash
cat .gitignore | grep -E "\.env|node_modules|dist"
```

Doit contenir :
```
.env
node_modules/
dist/
```

### Créer le repo GitHub

```bash
git init
git add .
git commit -m "Initial commit: salon beauté full-stack"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/salon-beaute.git
git push -u origin main
```

---

## 2️⃣ DÉPLOIEMENT BACKEND (Render.com)

### Étape 1 : Créer un compte Render

1. Aller sur https://render.com
2. S'inscrire (GitHub recommended)
3. Valider email

### Étape 2 : Créer un Web Service

1. **New** → **Web Service**
2. Connecter le repo GitHub
3. Choisir `salon-beaute` repo
4. Configuration :
   - **Name** : `salon-beaute-api`
   - **Runtime** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Branch** : `main`

### Étape 3 : Ajouter les variables d'environnement

Cliquer **Environment** et ajouter :

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://admin:PASSWORD@cluster.mongodb.net/salon_beaute
JWT_SECRET=your_ultra_secure_jwt_secret_here
JWT_EXPIRE=24h
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
FRONTEND_URL=https://salon-beaute.vercel.app
ADMIN_EMAIL=admin@salon.com
ADMIN_PASSWORD=ChangeMe123!
ADMIN_NAME=Admin
SALON_NAME=Mon Salon de Beauté
ADMIN_PHONE=+241666000000
ADMIN_WHATSAPP=+241666000000
ADMIN_ADDRESS=123 Rue du Salon
```

### Étape 4 : Deploy

- Cliquer **Create Web Service**
- Attendre 3-5 minutes
- Récupérer l'URL (ex: `https://salon-beaute-api.onrender.com`)

### ⚠️ Notes Render

- Le service "s'endort" après 15 minutes d'inactivité (plan gratuit)
- Premier démarrage peut être lent (30s)
- Relancer : cliquer **Manual Deploy** si nécessaire

**Solution** : Une requête toutes les 10 minutes pour garder actif (optionnel)

---

## 3️⃣ DÉPLOIEMENT FRONTEND (Vercel)

### Étape 1 : Créer un compte Vercel

1. Aller sur https://vercel.com
2. S'inscrire avec GitHub
3. Autoriser Vercel à accéder à tes repos

### Étape 2 : Import du projet

1. **Add New** → **Project**
2. Importer le repo `salon-beaute`
3. Configuration Vercel :
   - **Framework** : Vite
   - **Root Directory** : `frontend`
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`

### Étape 3 : Ajouter les variables d'environnement

Cliquer **Settings** → **Environment Variables**

```env
VITE_API_URL=https://salon-beaute-api.onrender.com/api
```

### Étape 4 : Deploy

- Vercel déploie automatiquement à chaque **push** sur `main`
- URL : `https://salon-beaute.vercel.app`

---

## 4️⃣ CONFIGURATION MONGODB ATLAS

### Créer un Cluster Gratuit

1. Aller sur https://www.mongodb.com/cloud/atlas
2. S'inscrire / Se connecter
3. **Create a Deployment**
   - Plan : **Free M0**
   - Cloud Provider : **AWS**
   - Region : **Ireland** (disponible en gratuit)
4. **Create Cluster**

### Créer un User DB

1. **Network Access** → **Add IP Address**
   - Ajouter `0.0.0.0/0` (accepte toutes les IP)
   - ✅ Valider
2. **Database Access** → **Add new database user**
   - Username : `admin`
   - Password : `your_secure_password`
   - Privilege : **Read and write to any database**
   - ✅ Créer

### Récupérer la connection string

1. **Databases** → **Connect**
2. Choisir **Drivers**
3. **Node.js** → version 4.1 or later
4. Copier la string :
   ```
   mongodb+srv://admin:your_secure_password@cluster.mongodb.net/salon_beaute?retryWrites=true&w=majority
   ```
5. **Remplacer** `your_secure_password` par le mot de passe réel

**Coller dans Render.com** en variable `MONGODB_URI`

---

## 5️⃣ CONFIGURATION CLOUDINARY

### Créer un compte gratuit

1. https://cloudinary.com
2. S'inscrire
3. Valider email
4. Aller sur **Dashboard**

### Récupérer les credentials

1. **Cloud Name** : visible en haut du dashboard
2. **API Key** : visible sous Cloud Name
3. **API Secret** : cliquer l'eye icon pour révéler

**Coller dans Render.com** :
```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

## 6️⃣ CONFIGURATION TWILIO WHATSAPP

### Créer un account Twilio

1. https://www.twilio.com/console
2. S'inscrire
3. Valider numéro téléphone

### Obtenir WhatsApp Sandbox

1. **Explore** → **Messaging** → **Try it out** → **Send an SMS**
2. Cliquer **WhatsApp** (onglet)
3. Sandbox activé automatiquement
4. Récupérer le numéro (ex: `+14155238886`)

### Obtenir les credentials

1. Retour **Console Dashboard**
2. Copier :
   - **Account SID**
   - **Auth Token**

**Coller dans Render.com** :
```env
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

---

## 7️⃣ CREAZIONE ADMIN (Production)

Après les déploiements, créer le compte admin :

```bash
cd backend
npm run seed:admin
```

Ou directement via Render.com :

1. Render Dashboard → salon-beaute-api
2. **Shell** (en haut à droite)
3. Exécuter :
   ```bash
   node scripts/seedAdmin.js
   ```

**Identifiants par défaut** (changéables via paramètres UI) :
- **Email** : `admin@salon.com`
- **Mot de passe** : `ChangeMe123!`

⚠️ **Changer immédiatement après première connexion !**

---

## 8️⃣ TEST DE DÉPLOIEMENT

### Vérifier Frontend

```bash
# Ouvrir
https://salon-beaute.vercel.app/

# Tester :
# 1. Accueil
# 2. Services (doit être vide)
# 3. Connexion admin
```

### Vérifier Backend

```bash
# Tester l'API
curl https://salon-beaute-api.onrender.com/api/services

# Doit retourner :
{
  "success": true,
  "services": []
}
```

### Tester Connexion Admin

1. Aller sur `/admin/login`
2. Email : `admin@salon.com`
3. Mot de passe : `ChangeMe123!`
4. Doit être redirigé vers `/admin/dashboard`

---

## 9️⃣ DÉPANNAGE

### ❌ "Cannot GET /api/services"

**Cause** : Frontend ne trouve pas le backend

**Solution** :
1. Vérifier que Render backend est **"Live"**
2. Checker variable `VITE_API_URL` sur Vercel
3. Vérifier CORS dans `backend/server.js`

### ❌ "MongooseError: Cannot connect to DB"

**Cause** : Problème MongoDB Atlas

**Solution** :
1. Vérifier que IP `0.0.0.0/0` est whitelistée
2. Vérifier password caractères spéciaux (URL-encode : `@` → `%40`)
3. Tester la connection string localement

### ❌ Twilio WhatsApp envoi échoue

**Cause** : Sandbox pas configuré

**Solution** :
1. Ajouter le numéro client à la Sandbox Twilio
2. Envoyer un message : "join YOUR_JOIN_CODE"
3. Accepter (message auto-reçu)

### ❌ Vercel build échoue

**Cause** : Dépendances manquantes

**Solution** :
1. Vérifier `frontend/package.json` (toutes les imports y sont ?)
2. Redéployer : Vercel → **Redeploy**

---

## 🔄 MISE À JOUR

### Mettre à jour le code

```bash
# Localement
git add .
git commit -m "Fix: description du changement"
git push origin main

# Vercel redéploie automatiquement
# Render redéploie automatiquement (si configuré)
```

### Mettre à jour les dépendances

```bash
cd backend && npm update
cd ../frontend && npm update
git add package*.json
git commit -m "Update dependencies"
git push
```

---

## 🛡️ CHECKLIST PRÉ-PRODUCTION

- [ ] `.env` contient tous les secrets (jamais en hard code)
- [ ] `.gitignore` bloque `.env`, `node_modules`, `dist`
- [ ] Admin créé via `seed:admin`
- [ ] Mot de passe admin changé
- [ ] MongoDB IP whitelistée (`0.0.0.0/0`)
- [ ] Twilio Sandbox Join Code envoyé et accepté
- [ ] Cloudinary images uploadent correctement
- [ ] CORS Render accepte domaine Vercel
- [ ] Variables d'env identiques côté Render et .env
- [ ] Notification.mp3 existe (placeholder actuel)

---

## 📧 SUPPORT

- Erreur Render ? Voir **Logs** dans le dashboard
- Erreur Vercel ? Voir **Deployments** → **View Build Logs**
- Erreur MongoDB ? Tester connection string via MongoDB Compass

---

✅ **Félicitations ! Ton salon de beauté est en ligne !**

**Prochaines étapes optionnelles** :
1. Ajouter un domaine personnalisé (Vercel settings)
2. Configurer SSL (automatique sur Vercel & Render)
3. Ajouter Google Analytics
4. Mettre en place des backups MongoDB
