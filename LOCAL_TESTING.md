# 🚀 GUIDE LOCAL - Tester l'Application en Local

## ✅ État des Serveurs

| Serveur | Port | Status | URL |
|---------|------|--------|-----|
| **Frontend (Vite React)** | 5173 | 🟢 Running | http://localhost:5173 |
| **Backend (Express API)** | 5000 | 🟢 Running | http://localhost:5000 |
| **Database (MongoDB)** | 27017 | ✅ Connected | mongodb://localhost:27017 |

---

## 🌐 Accéder à l'Application

### Option 1 : Accueil Public
```
http://localhost:5173
```
Vous verrez:
- Page d'accueil avec les services
- Catalogue des services
- Formulaire de réservation
- QR Code de paiement (verrouillé - fonctionnalité)

### Option 2 : Admin Dashboard
```
http://localhost:5173/admin/login
```
Identifiants:
```
Email:    admin@salon.com
Password: ChangeMe123!
```

Après login, vous accédez à:
- **Dashboard** : KPIs, graphiques de chiffre d'affaires
- **Gestion Services** : Créer/modifier/supprimer services
- **Gestion RDV** : Accepter/refuser rendez-vous
- **Revenues** : Statistiques CA (semaine/mois/année)
- **Notifications** : Notifications en temps réel
- **Settings** : Profil admin, mot de passe

---

## 🗄️ Configuration MongoDB

### ✅ Status Actuel
MongoDB est **déjà conecté** localement !

Vérification:
```
MONGODB_URI=mongodb://localhost:27017/salon_beaute
```

### Option 1 : MongoDB Local (Gratuit, Rapide)

#### Windows - Installer MongoDB Community

1. **Télécharger**:
   https://www.mongodb.com/try/download/community

2. **Installer**:
   - Laisser toutes les options par défaut
   - Cocher "Install MongoDB Compass" (GUI optionnel)
   - Cocher "Run MongoDB as a Windows Service"

3. **Vérifier**(après redémarrage):
   ```powershell
   Get-Service MongoDB | Select-Object Status, Name
   ```
   Doit afficher: `Running`

#### macOS - Avec Homebrew

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt-get install -y mongodb
sudo systemctl start mongod
```

#### Vérifier la Connection

```bash
mongo mongodb://localhost:27017/salon_beaute
```

---

### Option 2 : MongoDB Atlas (Gratuit Cloud, Recommandé)

#### Étape 1 : Créer un Cluster Gratuit

1. Aller sur: https://www.mongodb.com/cloud/atlas
2. **S'inscrire** (email/Google)
3. **Create Deployment** → Choisir **Free (M0)**
4. Cloud Provider: **AWS**
5. Region: **Ireland** (gratuit disponible)
6. **Create Cluster** (attendre 2-3 minutes)

#### Étape 2 : Créer un Utilisateur DB

1. Cliquer **Database Access** (menu de gauche)
2. **Add new database user**:
   - Username: `admin`
   - Password: Générer un mot de passe fort (garder en local !)
   - Privilege: **Read and write to any database**
3. **Create User**

#### Étape 3 : Configurer l'Accès Réseau

1. Cliquer **Network Access**
2. **Add IP Address**:
   - Cliquer "Allow access from anywhere" → `0.0.0.0/0`
   - Confirmer (⚠️ seulement pour test local)
3. **Confirm**

#### Étape 4 : Récupérer la Connection String

1. Cliquer **Databases** (menu)
2. Cliquer **Connect** sur votre cluster
3. Choisir **Drivers**
4. **Node.js** → Version "5.x" ou latest
5. Copier la connection string:
   ```
   mongodb+srv://admin:YOUR_PASSWORD@cluster.mongodb.net/salon_beaute?retryWrites=true&w=majority
   ```

#### Étape 5 : Mettre à Jour `.env`

Ouvrir `/backend/.env` et remplacer:

**Avant:**
```
MONGODB_URI=mongodb://localhost:27017/salon_beaute
```

**Après:**
```
MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@cluster.mongodb.net/salon_beaute?retryWrites=true&w=majority
```

Replace `YOUR_PASSWORD` avec le password créé.

#### Étape 6 : Relancer le Backend

```powershell
cd backend
npm run dev
```

Vous devriez voir:
```
✅ MongoDB connected successfully
Server running on port 5000
```

---

## 🧪 Tester les Fonctionnalités

### 1. Frontend Public

#### 1.1 Accueil
```
http://localhost:5173
```
✅ Vérifie:
- Hero section affiche
- Services s'affichent (ou "No services" si vide)
- Navigation fonctionne

#### 1.2 Services
```
http://localhost:5173/services
```
✅ Vérifie:
- Recherche par texte fonctionne
- Filtres par catégorie fonctionnent
- Clic sur "See details & book" ouvre le modal

#### 1.3 Détail Service
```
http://localhost:5173/service/:id
```
✅ Vérifie:
- Galerie d'images fonctionne
- Options visibles
- "Book this service" fonctionne

#### 1.4 Réservation (4 étapes)
✅ Teste:
- Étape 1: Sélectionner date + créneaux disponibles
- Étape 2: Sélectionner options + notes
- Étape 3: Entrer contact + téléphone
- Étape 4: Récapitulatif + soumettre
- ✅ Après submit: "Rendez-vous créé !"

### 2. Admin Dashboard

#### 2.1 Login
```
http://localhost:5173/admin/login
```
- Email: `admin@salon.com`
- Password: `ChangeMe123!`
- ✅ Redirection vers dashboard

#### 2.2 Dashboard Principal
```
http://localhost:5173/admin/dashboard
```
✅ Vérifie:
- KPIs affichent (Pending, Accepted, Refused)
- Graphique de chiffre d'affaires (semaine/mois/année)
- Derniers rendez-vous listés

#### 2.3 Gestion Services
```
http://localhost:5173/admin/services
```
✅ Tester:
- Cliquer "+ Add Service"
- Remplir formulaire (titre, prix, durée, image)
- Valider → Service aparaît dans la liste
- Éditer un service
- Supprimer un service

#### 2.4 Gestion Rendez-vous
```
http://localhost:5173/admin/appointments
```
✅ Tester:
- Voir les rendez-vous créés en public
- Cliquer "Accept" → Change status ✅
- Cliquer "Refuse" → Change status ❌
- Ajouter des notes

#### 2.5 Revenues
```
http://localhost:5173/admin/revenue
```
✅ Vérifie:
- Graphique CA affiche
- Sélecteur semaine/mois/année fonctionne
- Données actualisent

#### 2.6 Profil Admin
```
http://localhost:5173/admin/settings
```
✅ Tester:
- Modifier salon name, bio, réseaux sociaux → Save
- Changer password → Valide ancien + nouveau

---

## 🔧 API Endpoints (Test via cURL)

### Services
```bash
# Lister tous les services
curl http://localhost:5000/api/services

# Créer un service (admin)
curl -X POST http://localhost:5000/api/services \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Coiffure" \
  -F "price=15000"
```

### Rendez-vous
```bash
# Créer rendez-vous (public)
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "SERVICE_ID",
    "clientName": "John Doe",
    "clientPhone": "+241666000000",
    "desiredDate": "2026-04-01",
    "desiredTimeSlot": {"start": "09:00", "end": "10:00"}
  }'

# Lister rendez-vous (admin)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/appointments
```

### Admin Login
```bash
# Se connecter
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@salon.com",
    "password": "ChangeMe123!"
  }'
```

---

## ⚠️ Problèmes Courants

### ❌ "Cannot GET /api/services"
**Cause**: Backend n'est pas en écoute

**Solution**:
```powershell
cd backend
npm run dev
```

### ❌ "Cannot reach localhost:5173"
**Cause**: Frontend n'est pas en écoute

**Solution**:
```powershell
cd frontend
npm run dev
```

### ❌ "MongoDB connection refused"
**Cause**: Pas de MongoDB local, ou connexion Atlas incorrecte

**Solutions**:
1. Installez MongoDB local, OU
2. Vérifiez la connection string dans `.env`, OU
3. Pour Atlas: vérifiez IP whitelist (0.0.0.0/0)

### ❌ "Port 5000/5173 already in use"
**Cause**: Processus Node.js déjà en écoute

**Solution**:
```powershell
# Lister tous les processus Node
Get-Process node

# Tuer un processus par ID
Stop-Process -Id 12345 -Force

# Ou tuer tout Node:
Get-Process node | Stop-Process -Force
```

### ❌ "Rendez-vous ne s'affiche pas après création"
**Cause**: MongoDB n'a pas persisté

**Solution**:
1. Vérifiez connexion MongoDB (logs backend)
2. Créez d'abord un service en admin
3. Puis créez un rendez-vous pour ce service

---

## 📋 Checklist Avant Déploiement

- [ ] Frontend fonctionne (`http://localhost:5173`)
- [ ] Backend fonctionne (`http://localhost:5000`)
- [ ] MongoDB est connecté (voir logs)
- [ ] Admin login fonctionne
- [ ] Créer un service fonctionne
- [ ] Créer un rendez-vous fonctionne
- [ ] Accepter/refuser RDV fonctionne
- [ ] Graphiques affichent les données
- [ ] Toutes les pages répondent
- [ ] Pas d'erreurs console (F12)

---

## 🚀 Prochaines Étapes (Déploiement)

Une fois satisfait des tests locaux:

1. **Coller credentials Atlas dans `.env` (garder local)**
2. **Pousser sur GitHub**: `git push origin main`
3. **Déployer Frontend**: Vercel (voir DEPLOYMENT.md)
4. **Déployer Backend**: Render.com (voir DEPLOYMENT.md)
5. **Configurer domaine** (optionnel)

---

✅ **Amusez-vous à tester l'application !** 🎉
