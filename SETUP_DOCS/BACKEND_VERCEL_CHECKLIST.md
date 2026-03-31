# ✅ BACKEND VERCEL - CHECKLIST INTERACTIVE

## 📋 PHASE 2: DÉPLOIEMENT BACKEND

---

### SECTION 1: CRÉATION DU PROJET

- [ ] Allez sur https://vercel.com
- [ ] Cliquez: **Add New** → **Project**
- [ ] Sélectionnez: **JPdeala81/Chura_Beauty**
- [ ] Laissez **Framework Preset**: vide
- [ ] Entrez **Root Directory**: `backend` ⚠️ **IMPORTANT**
- [ ] Entrez **Project Name**: `chura-beauty-backend`
- [ ] Cliquez: **Continue**

---

### SECTION 2: VARIABLES D'ENVIRONNEMENT

⚠️ **IMPORTANT: AVANT de déployer, configurez les variables!**

#### Variable 1: SUPABASE_URL
- [ ] Allez à: **Settings** → **Environment Variables**
- [ ] Cliquez: **Add**
- [ ] Name: `SUPABASE_URL`
- [ ] Value: `https://crpokewlpjqujxojmmsz.supabase.co`
- [ ] Cochez: ✅ Production
- [ ] Cochez: ✅ Preview
- [ ] Cochez: ✅ Development
- [ ] Cliquez: **Add**

#### Variable 2: SUPABASE_SERVICE_ROLE_KEY
- [ ] Cliquez: **Add**
- [ ] Name: `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Value: (copier depuis Supabase → Settings → API → service_role secret)
- [ ] Cochez: ✅ Production
- [ ] Cochez: ✅ Preview
- [ ] Cochez: ✅ Development
- [ ] Cliquez: **Add**

#### Variable 3: JWT_SECRET
- [ ] Cliquez: **Add**
- [ ] Name: `JWT_SECRET`
- [ ] Value: (générer une clé aléatoire longue, ex: `your-super-secret-jwt-key-12345`)
- [ ] Cochez: ✅ Production
- [ ] Cochez: ✅ Preview
- [ ] Cochez: ✅ Development
- [ ] Cliquez: **Add**

#### Variable 4: NODE_ENV
- [ ] Cliquez: **Add**
- [ ] Name: `NODE_ENV`
- [ ] Value: `production`
- [ ] Cochez: ✅ Production
- [ ] Cochez: ✅ Preview
- [ ] Cochez: ✅ Development
- [ ] Cliquez: **Add**

#### Variable 5: PORT (optionnel)
- [ ] Cliquez: **Add**
- [ ] Name: `PORT`
- [ ] Value: `5000`
- [ ] Cochez: ✅ Production
- [ ] Cliquez: **Add**

#### Vérification
- [ ] Les 5 variables sont visibles dans la liste
- [ ] Toutes sont cochées pour **Production**

---

### SECTION 3: BUILD SETTINGS

- [ ] Allez à: **Settings** → **Build & Development Settings**
- [ ] **Build Command**: `npm install`
- [ ] **Output Directory**: Laisser vide (ou `.`)
- [ ] **Install Command**: `npm install`
- [ ] Cliquez: **Save**

---

### SECTION 4: DÉPLOIEMENT

- [ ] Allez à: **Deployments**
- [ ] Cliquez sur le dernier commit
- [ ] Cliquez: **Deploy** ou **Redeploy**
- [ ] Attendez: ✅ **Success** (5-10 minutes)
- [ ] Notez l'URL: `https://chura-beauty-backend-xxxx.vercel.app`

---

### SECTION 5: VÉRIFICATION BASIQUE

#### Test 1: Backend répond
- [ ] Allez sur: `https://chura-beauty-backend-xxxx.vercel.app/api`
- [ ] Vous voyez une réponse JSON (pas 404)?

#### Test 2: Supabase connecté
- [ ] Allez sur: `https://chura-beauty-backend-xxxx.vercel.app/api/site-settings/maintenance-status`
- [ ] Vous voyez: `{"is_maintenance": false, ...}`?

#### Test 3: Logs Vercel
- [ ] Allez à: **Settings** → **Logs** ou **Deployments**
- [ ] Cherchez des erreurs (500, connection refused)?
- [ ] Vérifiez: "✅ Supabase connecté avec succès"

---

### SECTION 6: TEST DES ROUTES PRINCIPALES

#### Route 1: Healthcheck
- [ ] GET: `https://chura-beauty-backend-xxxx.vercel.app/api/health`
- [ ] Réponse: `{"status": "ok"}`?

#### Route 2: Services
- [ ] GET: `https://chura-beauty-backend-xxxx.vercel.app/api/services`
- [ ] Réponse: liste des services?

#### Route 3: Maintenance Status
- [ ] GET: `https://chura-beauty-backend-xxxx.vercel.app/api/site-settings/maintenance-status`
- [ ] Réponse: statut de maintenance?

#### Route 4: Settings
- [ ] GET: `https://chura-beauty-backend-xxxx.vercel.app/api/site-settings`
- [ ] Réponse: paramètres du salon?

---

### SECTION 7: VÉRIFIER LES VARIABLES D'ENVIRONNEMENT

#### Backend peut accéder aux variables?
- [ ] Pas d'erreur "SUPABASE_URL is not defined"
- [ ] Pas d'erreur "JWT_SECRET is not defined"
- [ ] Les logs mentionnent "Supabase connecté"?

#### Variables correctes dans Supabase?
- [ ] SUPABASE_URL: URL complète de Supabase?
- [ ] SUPABASE_SERVICE_ROLE_KEY: Clé commençant par "eyJ..."?

---

## 🎯 STATUT FINAL

- [ ] Backend créé sur Vercel: ✅
- [ ] 5 variables configurées: ✅
- [ ] Build réussi: ✅
- [ ] Routes répondent: ✅
- [ ] Supabase connecté: ✅
- [ ] Aucune erreur 500: ✅

---

## 📱 URLs à noter

- **Backend**: https://chura-beauty-backend-xxxx.vercel.app
- **API Base**: https://chura-beauty-backend-xxxx.vercel.app/api
- **Supabase**: https://crpokewlpjqujxojmmsz.supabase.co

---

## 🔗 Routes disponibles (après déploiement)

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/health` | GET | Healthcheck |
| `/api/services` | GET | Liste des services |
| `/api/services/:id` | GET | Détail service |
| `/api/site-settings` | GET | Paramètres du salon |
| `/api/site-settings/maintenance-status` | GET | Statut maintenance |
| `/api/auth/login` | POST | Login |
| `/api/auth/logout` | POST | Logout |

---

## ⚠️ Problèmes courants

### **Erreur: Environment Variable ... does not exist**
- Vérifiez que les 5 variables sont bien cochées pour **Production**
- Attendez 2-3 minutes après l'ajout des variables
- Redéployez manuellement

### **Erreur 500 sur /api/...**
- Vérifiez les logs Vercel (Deployments → Logs)
- Vérifiez que SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont corrects
- Vérifiez que la table `site_settings` existe dans Supabase

### **Backend répond mais routes retournent vide**
- Vérifiez que Supabase database a les tables (users, services, etc.)
- Vérifiez les permissions dans Supabase

---

**Une fois tous les ☑️ cochés = BACKEND PRÊT! 🚀**

Ensuite → Allez au **FRONTEND Vercel Setup**
