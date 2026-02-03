# Test Photo Upload - Guide Manuel

## 🎯 Prérequis

- ✅ Backend démarré sur http://localhost:5000
- ✅ Cloudinary configuré (voir CLOUDINARY-SETUP.md)
- ✅ Avoir un profil joueur créé et token JWT
- ✅ Image de test (JPG/PNG/WebP, min 200x200px, max 5MB)

---

## 🧪 Tests Manuels

### 1. Upload Photo de Profil

**Requête:**
```bash
curl -X POST http://localhost:5000/api/players/PLAYER_ID/photo \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "photo=@/path/to/image.jpg"
```

**Windows PowerShell:**
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_ACCESS_TOKEN"
}
$formData = @{
    photo = Get-Item -Path "C:\path\to\image.jpg"
}
Invoke-RestMethod -Uri "http://localhost:5000/api/players/PLAYER_ID/photo" `
    -Method POST `
    -Headers $headers `
    -Form $formData
```

**Résultat attendu (200 OK):**
```json
{
  "message": "Photo de profil mise à jour avec succès",
  "profilePhotoUrl": "https://res.cloudinary.com/scoutme/image/upload/v1234567890/scoutme/players/uuid.jpg"
}
```

---

### 2. Vérifier la Photo dans le Profil

```bash
curl http://localhost:5000/api/players/PLAYER_ID
```

**Résultat attendu (200 OK):**
```json
{
  "player": {
    "id": "uuid",
    "fullName": "Jean Dupont",
    "profilePhotoUrl": "https://res.cloudinary.com/scoutme/...",
    ...
  }
}
```

---

### 3. Remplacer la Photo Existante

Upload une nouvelle photo avec la même commande.

**Comportement attendu:**
- L'ancienne photo est supprimée de Cloudinary
- La nouvelle photo est uploadée
- `profilePhotoUrl` est mis à jour

---

### 4. Supprimer la Photo de Profil

```bash
curl -X DELETE http://localhost:5000/api/players/PLAYER_ID/photo \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Résultat attendu (200 OK):**
```json
{
  "message": "Photo de profil supprimée avec succès"
}
```

---

## ❌ Tests d'Erreur

### Test 1: Upload sans Authentification (401)

```bash
curl -X POST http://localhost:5000/api/players/PLAYER_ID/photo \
  -F "photo=@/path/to/image.jpg"
```

**Résultat attendu (401 Unauthorized):**
```json
{
  "error": "Token d'authentification manquant",
  "code": "AUTH_TOKEN_MISSING"
}
```

---

### Test 2: Upload sans Fichier (400)

```bash
curl -X POST http://localhost:5000/api/players/PLAYER_ID/photo \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Résultat attendu (400 Bad Request):**
```json
{
  "error": "Aucun fichier fourni",
  "code": "PHOTO_FILE_MISSING"
}
```

---

### Test 3: Upload Fichier Invalide (400)

Upload un fichier PDF ou autre format non-image:

```bash
curl -X POST http://localhost:5000/api/players/PLAYER_ID/photo \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "photo=@/path/to/document.pdf"
```

**Résultat attendu (400 Bad Request):**
```json
{
  "error": "Fichier invalide",
  "code": "PHOTO_INVALID_FILE",
  "details": "Le fichier doit être au format JPG, PNG ou WebP"
}
```

---

### Test 4: Upload Fichier Trop Grand (400)

Upload une image > 5 MB:

```bash
curl -X POST http://localhost:5000/api/players/PLAYER_ID/photo \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "photo=@/path/to/large-image.jpg"
```

**Résultat attendu (400 Bad Request):**
```json
{
  "error": "Fichier trop volumineux",
  "code": "PHOTO_FILE_TOO_LARGE"
}
```

**Note:** Multer rejette automatiquement les fichiers > 5MB.

---

### Test 5: Upload Image Trop Petite (400)

Upload une image < 200x200 pixels:

```bash
curl -X POST http://localhost:5000/api/players/PLAYER_ID/photo \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "photo=@/path/to/small-image.jpg"
```

**Résultat attendu (400 Bad Request):**
```json
{
  "error": "Les dimensions minimales sont 200x200 pixels",
  "code": "PHOTO_DIMENSIONS_TOO_SMALL"
}
```

---

### Test 6: Upload sur Profil d'un Autre Joueur (403)

Essayer d'upload une photo sur le profil d'un autre joueur:

```bash
curl -X POST http://localhost:5000/api/players/OTHER_PLAYER_ID/photo \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "photo=@/path/to/image.jpg"
```

**Résultat attendu (403 Forbidden):**
```json
{
  "error": "Vous ne pouvez modifier que votre propre profil",
  "code": "AUTH_FORBIDDEN_OWNERSHIP"
}
```

---

### Test 7: Supprimer Photo Inexistante (404)

```bash
curl -X DELETE http://localhost:5000/api/players/PLAYER_ID/photo \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Résultat attendu (404 Not Found):**
```json
{
  "error": "Aucune photo de profil à supprimer",
  "code": "PHOTO_NOT_FOUND"
}
```

---

## 🧪 Test avec Postman

### Configuration

1. Créer une nouvelle requête
2. Méthode: **POST**
3. URL: `http://localhost:5000/api/players/PLAYER_ID/photo`
4. Headers:
   - `Authorization`: `Bearer YOUR_ACCESS_TOKEN`
5. Body:
   - Type: **form-data**
   - Key: `photo` (type: File)
   - Value: Sélectionner image

### Test Upload

1. Cliquer sur "Send"
2. Vérifier status code: **200 OK**
3. Copier `profilePhotoUrl` de la réponse
4. Ouvrir URL dans navigateur pour voir l'image

---

## 🔍 Vérification Cloudinary

### Via Dashboard Cloudinary

1. Se connecter à https://cloudinary.com
2. Aller dans **Media Library**
3. Naviguer vers dossier: `scoutme/players/`
4. Vérifier que l'image est présente
5. Vérifier les transformations appliquées (800x800, quality auto)

### Vérifier les Transformations

L'URL Cloudinary devrait ressembler à:
```
https://res.cloudinary.com/scoutme/image/upload/
  c_limit,f_auto,q_auto,w_800,h_800/
  v1234567890/
  scoutme/players/uuid.jpg
```

Décomposition:
- `c_limit`: Crop mode limit (ne pas agrandir)
- `f_auto`: Format auto (WebP si supporté)
- `q_auto`: Quality auto (compression intelligente)
- `w_800,h_800`: Max dimensions 800x800

---

## 📊 Checklist de Test

### Tests Fonctionnels
- [ ] Upload nouvelle photo (JPG)
- [ ] Upload nouvelle photo (PNG)
- [ ] Upload nouvelle photo (WebP)
- [ ] Remplacer photo existante
- [ ] Supprimer photo
- [ ] Vérifier URL dans profil après upload
- [ ] Vérifier image affichée dans navigateur

### Tests Validation
- [ ] Rejeter fichier non-image (PDF, TXT)
- [ ] Rejeter fichier > 5MB
- [ ] Rejeter image < 200x200px
- [ ] Accepter image exactement 200x200px
- [ ] Accepter image > 4000x4000px → doit être rejetée

### Tests Sécurité
- [ ] Upload sans authentification (401)
- [ ] Upload sur profil d'un autre (403)
- [ ] Upload avec token expiré (401)
- [ ] Upload avec token invalide (401)

### Tests Cloudinary
- [ ] Image uploadée visible dans Media Library
- [ ] Transformations appliquées correctement
- [ ] Ancienne photo supprimée lors du remplacement
- [ ] Photo supprimée de Cloudinary lors du DELETE

---

## 🐛 Debug

### Logs Backend

Vérifier les logs backend pour:
```
✅ Upload photo: /api/players/:id/photo
✅ Validation dimensions: valid
✅ Cloudinary upload: success
✅ URL: https://res.cloudinary.com/...
✅ Profile updated
```

### Erreurs Courantes

**"CLOUDINARY_UPLOAD_ERROR"**
- Vérifier credentials Cloudinary dans .env
- Vérifier connexion internet
- Vérifier quota Cloudinary (25GB free tier)

**"PHOTO_DIMENSIONS_TOO_SMALL"**
- Vérifier dimensions avec: `identify -format "%wx%h" image.jpg`
- Redimensionner image si nécessaire

**"Unexpected end of form"**
- Vérifier que le fichier existe au chemin spécifié
- Vérifier les permissions de lecture du fichier

---

## 📸 Images de Test Recommandées

### Télécharger des Images de Test

**Sites gratuits:**
- Unsplash: https://unsplash.com (photos haute qualité)
- Pexels: https://www.pexels.com
- Picsum Photos: https://picsum.photos (images aléatoires)

**Générer image de test:**
```bash
# ImageMagick (si installé)
convert -size 500x500 xc:blue test-500x500.jpg

# Ou télécharger:
curl https://picsum.photos/500 > test-image.jpg
```

---

## 🎯 Workflow Complet

1. **S'inscrire comme joueur** → récupérer userId
2. **Créer profil joueur** → récupérer playerId
3. **Upload photo** → récupérer profilePhotoUrl
4. **Vérifier profil** → voir photo dans profil
5. **Upload nouvelle photo** → remplacer ancienne
6. **Supprimer photo** → profilePhotoUrl = null

---

**Dernière mise à jour:** 2026-02-02
**Spec:** SPEC-MVP-005
