# Test Vidéos YouTube - Guide Manuel

## 🎯 Prérequis

- ✅ Backend démarré sur http://localhost:5000
- ✅ Avoir un profil joueur créé
- ✅ Token JWT d'authentification
- ✅ URLs YouTube de test

---

## 🧪 Tests Fonctionnels

### Test 1: Ajouter une Vidéo YouTube

**Requête:**
```bash
curl -X POST http://localhost:5000/api/players/PLAYER_ID/videos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "title": "Highlights 2025"
  }'
```

**Windows PowerShell:**
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_ACCESS_TOKEN"
    "Content-Type" = "application/json"
}
$body = @{
    url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    title = "Highlights 2025"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/players/PLAYER_ID/videos" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

**Résultat attendu (201 Created):**
```json
{
  "message": "Vidéo ajoutée avec succès",
  "video": {
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "title": "Highlights 2025",
    "videoId": "dQw4w9WgXcQ",
    "thumbnailUrl": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    "addedAt": "2026-02-03T00:00:00Z"
  },
  "totalVideos": 1
}
```

---

### Test 2: Ajouter Vidéo sans Titre

```bash
curl -X POST http://localhost:5000/api/players/PLAYER_ID/videos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "url": "https://youtu.be/VIDEO_ID_2"
  }'
```

**Résultat attendu:** Vidéo ajoutée sans titre (optionnel)

---

### Test 3: Différents Formats d'URL

**Format standard:**
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

**Format court:**
```
https://youtu.be/dQw4w9WgXcQ
```

**Format embed:**
```
https://www.youtube.com/embed/dQw4w9WgXcQ
```

**Format mobile:**
```
https://m.youtube.com/watch?v=dQw4w9WgXcQ
```

**Tous ces formats doivent être acceptés !**

---

### Test 4: Récupérer les Vidéos d'un Profil

**Requête (Public, sans auth):**
```bash
curl http://localhost:5000/api/players/PLAYER_ID/videos
```

**Résultat attendu (200 OK):**
```json
{
  "videos": [
    {
      "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "title": "Highlights 2025",
      "videoId": "dQw4w9WgXcQ",
      "thumbnailUrl": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      "addedAt": "2026-02-03T00:00:00Z"
    }
  ],
  "totalVideos": 1,
  "maxVideos": 3
}
```

---

### Test 5: Mettre à Jour le Titre d'une Vidéo

```bash
curl -X PUT http://localhost:5000/api/players/PLAYER_ID/videos/dQw4w9WgXcQ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Nouveau titre - Match finale"
  }'
```

**Résultat attendu (200 OK):**
```json
{
  "message": "Vidéo mise à jour avec succès",
  "video": {
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "title": "Nouveau titre - Match finale",
    "videoId": "dQw4w9WgXcQ",
    "thumbnailUrl": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    "addedAt": "2026-02-03T00:00:00Z"
  }
}
```

---

### Test 6: Supprimer une Vidéo

```bash
curl -X DELETE http://localhost:5000/api/players/PLAYER_ID/videos/dQw4w9WgXcQ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Résultat attendu (200 OK):**
```json
{
  "message": "Vidéo supprimée avec succès",
  "remainingVideos": 0
}
```

---

## ❌ Tests d'Erreur

### Test 7: URL YouTube Invalide (400)

```bash
curl -X POST http://localhost:5000/api/players/PLAYER_ID/videos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "url": "https://vimeo.com/123456789"
  }'
```

**Résultat attendu (400 Bad Request):**
```json
{
  "error": "URL YouTube invalide",
  "code": "VIDEO_INVALID_URL"
}
```

---

### Test 8: Limite de 3 Vidéos Atteinte (400)

**Ajouter 3 vidéos, puis essayer d'en ajouter une 4ème:**

```bash
# Vidéo 1
curl -X POST http://localhost:5000/api/players/PLAYER_ID/videos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"url":"https://www.youtube.com/watch?v=VIDEO1","title":"Video 1"}'

# Vidéo 2
curl -X POST http://localhost:5000/api/players/PLAYER_ID/videos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"url":"https://www.youtube.com/watch?v=VIDEO2","title":"Video 2"}'

# Vidéo 3
curl -X POST http://localhost:5000/api/players/PLAYER_ID/videos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"url":"https://www.youtube.com/watch?v=VIDEO3","title":"Video 3"}'

# Vidéo 4 (devrait échouer)
curl -X POST http://localhost:5000/api/players/PLAYER_ID/videos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"url":"https://www.youtube.com/watch?v=VIDEO4","title":"Video 4"}'
```

**Résultat attendu (400 Bad Request):**
```json
{
  "error": "Limite de 3 vidéos atteinte",
  "code": "VIDEO_LIMIT_REACHED",
  "maxVideos": 3
}
```

---

### Test 9: Vidéo Déjà Existante (409)

**Ajouter la même vidéo deux fois:**

```bash
# Première fois
curl -X POST http://localhost:5000/api/players/PLAYER_ID/videos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"url":"https://www.youtube.com/watch?v=SAME_VIDEO"}'

# Deuxième fois (devrait échouer)
curl -X POST http://localhost:5000/api/players/PLAYER_ID/videos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"url":"https://www.youtube.com/watch?v=SAME_VIDEO"}'
```

**Résultat attendu (409 Conflict):**
```json
{
  "error": "Cette vidéo existe déjà dans votre profil",
  "code": "VIDEO_ALREADY_EXISTS"
}
```

---

### Test 10: Ajouter Vidéo sans Authentification (401)

```bash
curl -X POST http://localhost:5000/api/players/PLAYER_ID/videos \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=VIDEO"}'
```

**Résultat attendu (401 Unauthorized):**
```json
{
  "error": "Token d'authentification manquant",
  "code": "AUTH_TOKEN_MISSING"
}
```

---

### Test 11: Modifier Profil d'un Autre Joueur (403)

```bash
curl -X POST http://localhost:5000/api/players/OTHER_PLAYER_ID/videos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"url":"https://www.youtube.com/watch?v=VIDEO"}'
```

**Résultat attendu (403 Forbidden):**
```json
{
  "error": "Vous ne pouvez modifier que votre propre profil",
  "code": "AUTH_FORBIDDEN_OWNERSHIP"
}
```

---

### Test 12: Supprimer Vidéo Inexistante (404)

```bash
curl -X DELETE http://localhost:5000/api/players/PLAYER_ID/videos/FAKE_VIDEO_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Résultat attendu (404 Not Found):**
```json
{
  "error": "Vidéo introuvable",
  "code": "VIDEO_NOT_FOUND"
}
```

---

## 📊 Checklist de Test

### Tests Fonctionnels
- [ ] Ajouter vidéo avec titre
- [ ] Ajouter vidéo sans titre
- [ ] URL format standard (youtube.com/watch?v=)
- [ ] URL format court (youtu.be/)
- [ ] URL format embed (youtube.com/embed/)
- [ ] URL format mobile (m.youtube.com)
- [ ] Récupérer vidéos (public, sans auth)
- [ ] Mettre à jour titre vidéo
- [ ] Supprimer vidéo
- [ ] Video ID extrait correctement
- [ ] Thumbnail URL généré correctement

### Tests Validation
- [ ] Rejeter URL non-YouTube
- [ ] Rejeter après 3 vidéos
- [ ] Rejeter vidéo dupliquée
- [ ] Titre max 100 caractères
- [ ] Titre optionnel

### Tests Sécurité
- [ ] Ajouter sans auth (401)
- [ ] Modifier profil d'autrui (403)
- [ ] Supprimer sans auth (401)
- [ ] Ownership vérifié

### Tests Données
- [ ] videoId stocké correctement
- [ ] thumbnailUrl format correct
- [ ] addedAt timestamp ISO 8601
- [ ] Array JSON dans player.videoUrls

---

## 🎥 URLs YouTube de Test

**Vidéos publiques de test:**
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ  (Rick Astley)
https://www.youtube.com/watch?v=jNQXAC9IVRw  (Me at the zoo)
https://www.youtube.com/watch?v=9bZkp7q19f0  (Gangnam Style)
```

**Formats alternatifs:**
```
https://youtu.be/dQw4w9WgXcQ
https://m.youtube.com/watch?v=dQw4w9WgXcQ
https://www.youtube.com/embed/dQw4w9WgXcQ
```

---

## 🔍 Vérification Miniatures

**Les miniatures YouTube suivent ce format:**
```
https://img.youtube.com/vi/{VIDEO_ID}/hqdefault.jpg
```

**Qualités disponibles:**
- `default.jpg` - 120x90
- `mqdefault.jpg` - 320x180
- `hqdefault.jpg` - 480x360 (utilisé par défaut)
- `maxresdefault.jpg` - 1280x720 (pas toujours disponible)

**Tester dans navigateur:**
```
https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg
```

---

## 🎯 Workflow Complet

### Scénario: Joueur Ajoute ses Highlights

1. **Créer profil joueur** (si pas déjà fait)
2. **Ajouter première vidéo** → Highlights 2025
3. **Ajouter deuxième vidéo** → Match finale
4. **Ajouter troisième vidéo** → Skills compilation
5. **Voir profil public** → 3 vidéos affichées
6. **Modifier titre** vidéo 1
7. **Supprimer** vidéo 2 (pour la remplacer)
8. **Ajouter nouvelle** vidéo en remplacement

---

## 💡 Tips

### Extraire Video ID manuellement

**Depuis URL standard:**
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
                              ↑ VIDEO_ID
```

**Depuis URL courte:**
```
https://youtu.be/dQw4w9WgXcQ
                 ↑ VIDEO_ID
```

### Tester avec Script PowerShell

```powershell
# Variables
$API = "http://localhost:5000"
$PLAYER_ID = "your-player-id"
$TOKEN = "your-access-token"

# Ajouter 3 vidéos
$videos = @(
    @{url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"; title="Video 1"},
    @{url="https://www.youtube.com/watch?v=jNQXAC9IVRw"; title="Video 2"},
    @{url="https://www.youtube.com/watch?v=9bZkp7q19f0"; title="Video 3"}
)

$headers = @{Authorization="Bearer $TOKEN"}

foreach ($video in $videos) {
    $body = $video | ConvertTo-Json
    $result = Invoke-RestMethod "$API/api/players/$PLAYER_ID/videos" `
        -Method POST -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "Ajoutée: $($result.video.title) - Total: $($result.totalVideos)"
}

# Récupérer toutes les vidéos
$allVideos = Invoke-RestMethod "$API/api/players/$PLAYER_ID/videos"
Write-Host "`nTotal vidéos: $($allVideos.totalVideos)/$($allVideos.maxVideos)"
```

---

## 📈 Vérification dans Profil

Après ajout de vidéos, vérifier le profil:

```bash
curl http://localhost:5000/api/players/PLAYER_ID
```

**Champ videoUrls devrait contenir:**
```json
{
  "player": {
    "videoUrls": [
      {
        "url": "...",
        "title": "...",
        "videoId": "...",
        "thumbnailUrl": "...",
        "addedAt": "..."
      }
    ]
  }
}
```

---

**Dernière mise à jour:** 2026-02-03
**Spec:** SPEC-MVP-006
