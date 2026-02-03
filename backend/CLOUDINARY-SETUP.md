# Configuration Cloudinary - Guide de Setup

## 🎯 Objectif

Configurer Cloudinary pour l'upload de photos de profil joueur (SPEC-MVP-005).

---

## 📝 Étapes de Configuration

### 1. Créer un Compte Cloudinary

1. Aller sur https://cloudinary.com
2. Cliquer sur "Sign Up" (inscription gratuite)
3. Créer un compte avec email ou GitHub/Google

**Plan recommandé:** Free tier
- ✅ 25 GB stockage
- ✅ 25 GB bande passante/mois
- ✅ Transformations illimitées
- ✅ Suffisant pour MVP

---

### 2. Récupérer les Identifiants

Une fois connecté au dashboard Cloudinary:

1. Aller sur **Dashboard** (page d'accueil)
2. Voir la section **Account Details**
3. Copier les informations suivantes:
   - **Cloud Name**: `your_cloud_name`
   - **API Key**: `123456789012345`
   - **API Secret**: `your_secret_key` (cliquer sur l'œil pour révéler)

**IMPORTANT:** Ne JAMAIS commiter l'API Secret dans Git!

---

### 3. Configurer les Variables d'Environnement

Ouvrir `backend/.env` et mettre à jour:

```env
# Cloudinary (DO NOT EXPOSE TO CLIENT)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_secret_key_here
```

**Alternative: Utiliser CLOUDINARY_URL (méthode rapide)**

```env
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

---

### 4. Créer le Dossier de Destination (Optionnel)

Dans le dashboard Cloudinary:

1. Aller dans **Media Library**
2. Cliquer sur **New Folder**
3. Créer dossier: `scoutme`
4. À l'intérieur, créer sous-dossier: `players`

Résultat: `scoutme/players/`

**Note:** Le dossier sera créé automatiquement lors du premier upload si inexistant.

---

### 5. Configuration Recommandée

#### Sécurité

1. **Settings** → **Security**
   - ✅ Activer "Strict transformations" (éviter manipulation URL)
   - ✅ Configurer "Allowed fetch domains" si besoin

2. **Settings** → **Upload**
   - ✅ "Upload preset" sur "Unsigned" → désactivé (on utilise signed upload)
   - ✅ "Auto backup" activé (recommandé)

#### Optimisation

1. **Settings** → **Image optimization**
   - ✅ Auto quality: Enabled
   - ✅ Auto format: Enabled (WebP pour navigateurs modernes)

---

## ✅ Tester la Configuration

### Test 1: Vérifier les Credentials

Créer un fichier de test: `backend/test-cloudinary.js`

```javascript
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test ping
cloudinary.api.ping((error, result) => {
  if (error) {
    console.error('❌ Erreur connexion Cloudinary:', error);
  } else {
    console.log('✅ Cloudinary connecté:', result);
  }
});
```

Exécuter:
```bash
cd backend
node test-cloudinary.js
```

**Résultat attendu:**
```
✅ Cloudinary connecté: { status: 'ok' }
```

---

### Test 2: Upload de Test

```bash
curl -X POST http://localhost:5000/api/players/PLAYER_ID/photo \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "photo=@/path/to/test-image.jpg"
```

**Résultat attendu:**
```json
{
  "message": "Photo de profil mise à jour avec succès",
  "profilePhotoUrl": "https://res.cloudinary.com/scoutme/image/upload/v1234567890/scoutme/players/uuid.jpg"
}
```

---

## 🔒 Sécurité

### ✅ Ce qui est Sécurisé

- API Secret stocké uniquement côté serveur (jamais exposé au client)
- Upload signé (authentification Cloudinary)
- Validation côté serveur (MIME type, taille, dimensions)
- Rate limiting sur les uploads

### ❌ Ce qu'il NE FAUT PAS Faire

- ❌ Exposer `CLOUDINARY_API_SECRET` au client
- ❌ Utiliser "unsigned upload" pour production
- ❌ Mettre les credentials dans le code source
- ❌ Commiter `.env` dans Git

---

## 📊 Monitoring

### Vérifier l'Usage

Dashboard Cloudinary → **Analytics**

Surveiller:
- Storage utilisé (max 25 GB sur free tier)
- Bandwidth utilisé (max 25 GB/mois)
- Transformations par mois (illimité)

### Alertes Recommandées

Configurer alertes email quand:
- Storage > 80% (20 GB)
- Bandwidth > 80% (20 GB/mois)

---

## 🚀 Production

### Variables d'Environnement Production

Sur Render / Vercel / autre:

1. Aller dans **Environment Variables**
2. Ajouter:
   ```
   CLOUDINARY_CLOUD_NAME=scoutme_prod
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=your_prod_secret
   ```

### Cloudinary Production Checklist

- [ ] Compte Cloudinary dédié production (ou environment séparé)
- [ ] Strict transformations activé
- [ ] Auto backup activé
- [ ] Rate limiting configuré
- [ ] Monitoring alertes activées
- [ ] API secrets différents de dev

---

## 🆘 Troubleshooting

### Erreur: "Invalid API key or secret"

**Solution:**
- Vérifier que `.env` contient les bonnes credentials
- Redémarrer le serveur backend après modification `.env`
- Vérifier qu'il n'y a pas d'espaces dans les variables

### Erreur: "Upload failed"

**Causes possibles:**
1. Network timeout → Augmenter timeout Cloudinary
2. Fichier trop large → Vérifier limite 5MB
3. Format invalide → Vérifier MIME type

### Erreur: "Quota exceeded"

**Solution:**
- Vérifier usage dans dashboard Cloudinary
- Nettoyer anciennes photos inutilisées
- Upgrader plan si nécessaire

---

## 📚 Ressources

- Documentation officielle: https://cloudinary.com/documentation
- Node.js SDK: https://cloudinary.com/documentation/node_integration
- Transformations: https://cloudinary.com/documentation/image_transformations
- Support: https://support.cloudinary.com

---

**Dernière mise à jour:** 2026-02-02
**Statut:** Configuration requise pour SPEC-MVP-005
