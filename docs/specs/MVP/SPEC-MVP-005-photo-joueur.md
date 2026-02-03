# SPEC-MVP-005: Upload Photo Profil Joueur

**Phase:** MVP
**Sprint:** 1
**Domaine:** Player Management - Media
**Priorité:** Haute
**Dépendances:** SPEC-MVP-004

---

## Description

Système d'upload de photo de profil pour les joueurs via Cloudinary. Permet aux joueurs d'ajouter une photo professionnelle à leur profil avec validation de taille, format et dimensions. L'upload est sécurisé et optimisé pour un affichage web performant.

---

## Requirements

### REQ-PHOTO-001: File Upload Validation
The system SHALL validate uploaded files for type (JPG, PNG, WebP), size (max 5MB), and minimum dimensions (200x200px).

### REQ-PHOTO-002: Cloudinary Integration
The system MUST upload photos to Cloudinary with automatic optimization and transformation.

### REQ-PHOTO-003: Secure Upload
The system SHALL use server-side Cloudinary upload (API secret never exposed to client).

### REQ-PHOTO-004: URL Storage
The system SHALL store the Cloudinary URL in player.profilePhotoUrl field.

### REQ-PHOTO-005: Photo Replacement
The system SHALL replace existing photo when uploading a new one (delete old from Cloudinary).

### REQ-PHOTO-006: Authorization
The system MUST restrict photo upload to authenticated player users (owner only).

---

## Endpoints API

### POST /api/players/:id/photo
**Description:** Upload ou remplacer la photo de profil d'un joueur

**Authentication:** Requiert JWT access token + ownership (propriétaire uniquement)

**Content-Type:** `multipart/form-data`

**Request Body:**
```
photo: File (required)
  - Type: image/jpeg, image/png, image/webp
  - Max size: 5 MB
  - Min dimensions: 200x200px
  - Recommended: Square format (1:1 ratio)
```

**Response 200 OK:**
```json
{
  "message": "Photo de profil mise à jour avec succès",
  "profilePhotoUrl": "https://res.cloudinary.com/scoutme/image/upload/v1234567890/players/uuid.jpg"
}
```

**Response 400 Bad Request:**
```json
{
  "error": "Fichier invalide",
  "code": "PHOTO_INVALID_FILE",
  "details": "Le fichier doit être au format JPG, PNG ou WebP"
}
```

**Response 400 Bad Request (taille):**
```json
{
  "error": "Fichier trop volumineux",
  "code": "PHOTO_FILE_TOO_LARGE",
  "details": "La taille maximale est de 5 MB"
}
```

**Response 400 Bad Request (dimensions):**
```json
{
  "error": "Dimensions insuffisantes",
  "code": "PHOTO_DIMENSIONS_TOO_SMALL",
  "details": "Les dimensions minimales sont 200x200 pixels"
}
```

**Response 403 Forbidden:**
```json
{
  "error": "Vous ne pouvez modifier que votre propre profil",
  "code": "AUTH_FORBIDDEN_OWNERSHIP"
}
```

**Response 404 Not Found:**
```json
{
  "error": "Profil joueur introuvable",
  "code": "PLAYER_NOT_FOUND"
}
```

---

### DELETE /api/players/:id/photo
**Description:** Supprimer la photo de profil d'un joueur

**Authentication:** Requiert JWT access token + ownership

**Response 200 OK:**
```json
{
  "message": "Photo de profil supprimée avec succès"
}
```

**Response 404 Not Found:**
```json
{
  "error": "Aucune photo de profil à supprimer",
  "code": "PHOTO_NOT_FOUND"
}
```

---

## Configuration Cloudinary

### Variables d'Environnement

**Backend (.env):**
```env
# Cloudinary Configuration (DO NOT EXPOSE TO CLIENT)
CLOUDINARY_CLOUD_NAME=scoutme
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_secret_key_here

# Alternative: Cloudinary URL
# CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

**IMPORTANT:** Les clés API Cloudinary ne doivent JAMAIS être exposées au client. L'upload se fait exclusivement côté serveur.

### Compte Cloudinary

**Plan recommandé:** Free tier (suffisant pour MVP)
- 25 GB stockage
- 25 GB bande passante/mois
- Transformations illimitées

**Configuration du compte:**
1. Créer compte sur https://cloudinary.com
2. Récupérer Cloud Name, API Key, API Secret
3. Créer dossier "players" dans Media Library
4. Activer auto-backup (recommandé)

---

## Configuration Upload

### Paramètres Cloudinary

```typescript
const uploadConfig = {
  folder: 'scoutme/players',           // Dossier de destination
  allowed_formats: ['jpg', 'png', 'webp'], // Formats acceptés
  transformation: [
    {
      width: 800,                      // Redimensionner à 800px max
      height: 800,
      crop: 'limit',                   // Ne pas agrandir si plus petit
      quality: 'auto',                 // Compression automatique
      fetch_format: 'auto'             // Format optimal (WebP si supporté)
    }
  ],
  overwrite: true,                     // Remplacer si existe déjà
  unique_filename: true,               // Nom de fichier unique
  use_filename: false,                 // Ne pas utiliser nom original
  resource_type: 'image'               // Type de ressource
};
```

### Optimisations Appliquées

**Compression:**
- Quality: auto (compression intelligente)
- Format: auto (WebP pour navigateurs modernes, JPEG/PNG fallback)

**Redimensionnement:**
- Max 800x800px (suffisant pour affichage web)
- Crop: limit (ne pas déformer)
- Preserve aspect ratio

**Sécurité:**
- Format whitelist (JPG, PNG, WebP uniquement)
- Validation MIME type serveur
- Validation taille avant upload

---

## Validation des Fichiers

### Validation Côté Serveur

```typescript
export interface PhotoValidationRules {
  maxSizeBytes: 5 * 1024 * 1024;        // 5 MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'];
  minWidth: 200;                         // 200px minimum
  minHeight: 200;                        // 200px minimum
  maxWidth: 4000;                        // 4000px maximum (éviter uploads énormes)
  maxHeight: 4000;                       // 4000px maximum
}
```

### Étapes de Validation

1. **Vérifier que le fichier existe**
2. **Valider MIME type** (image/jpeg, image/png, image/webp)
3. **Valider taille** (max 5 MB)
4. **Lire dimensions de l'image** (avec sharp ou image-size)
5. **Valider dimensions** (min 200x200, max 4000x4000)
6. **Upload vers Cloudinary**
7. **Récupérer URL sécurisée**
8. **Mettre à jour player.profilePhotoUrl**

---

## Gestion du Remplacement

### Workflow de Remplacement

Lorsqu'un joueur upload une nouvelle photo alors qu'il en a déjà une:

1. **Récupérer l'ancienne URL** depuis `player.profilePhotoUrl`
2. **Extraire public_id** de l'ancienne URL Cloudinary
3. **Upload nouvelle photo** vers Cloudinary
4. **Mettre à jour** `player.profilePhotoUrl` avec nouvelle URL
5. **Supprimer ancienne photo** de Cloudinary (cleanup)

### Extraction du Public ID

```typescript
// URL: https://res.cloudinary.com/scoutme/image/upload/v1234567890/scoutme/players/abc123.jpg
// Public ID: scoutme/players/abc123

function extractPublicId(cloudinaryUrl: string): string | null {
  const regex = /\/upload\/(?:v\d+\/)?(.+)\.\w+$/;
  const match = cloudinaryUrl.match(regex);
  return match ? match[1] : null;
}
```

---

## Structure du Code

### Fichiers à créer

```
backend/src/
├── config/
│   └── cloudinary.config.ts        # Configuration Cloudinary
├── middlewares/
│   └── upload.middleware.ts        # Multer config pour multipart/form-data
├── services/
│   ├── cloudinary.service.ts       # Logique upload/delete Cloudinary
│   └── player.service.ts           # Ajouter uploadPhoto() et deletePhoto()
├── controllers/
│   └── player.controller.ts        # Ajouter uploadPhoto() et deletePhoto()
├── routes/
│   └── player.routes.ts            # Ajouter routes photo
└── utils/
    └── photo.utils.ts              # Validation images
```

---

## Implémentation

### 1. Configuration Cloudinary

**backend/src/config/cloudinary.config.ts:**
```typescript
import { v2 as cloudinary } from 'cloudinary';

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;

export const CLOUDINARY_UPLOAD_CONFIG = {
  folder: 'scoutme/players',
  allowed_formats: ['jpg', 'png', 'webp'],
  transformation: [
    {
      width: 800,
      height: 800,
      crop: 'limit',
      quality: 'auto',
      fetch_format: 'auto'
    }
  ],
  overwrite: false,
  unique_filename: true,
  use_filename: false,
  resource_type: 'image' as const
};
```

### 2. Middleware Upload (Multer)

**backend/src/middlewares/upload.middleware.ts:**
```typescript
import multer from 'multer';

// Configuration Multer pour upload en mémoire
const storage = multer.memoryStorage();

// Validation du fichier
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('PHOTO_INVALID_FILE'), false);
  }
};

// Limite de taille: 5 MB
export const uploadPhoto = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  }
});
```

### 3. Service Cloudinary

**backend/src/services/cloudinary.service.ts:**
```typescript
import cloudinary, { CLOUDINARY_UPLOAD_CONFIG } from '../config/cloudinary.config';
import { Readable } from 'stream';

export async function uploadPlayerPhoto(
  buffer: Buffer,
  playerId: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        ...CLOUDINARY_UPLOAD_CONFIG,
        public_id: `scoutme/players/${playerId}`
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result!.secure_url);
      }
    );

    // Convertir buffer en stream
    const stream = Readable.from(buffer);
    stream.pipe(uploadStream);
  });
}

export async function deletePlayerPhoto(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export function extractPublicId(cloudinaryUrl: string): string | null {
  const regex = /\/upload\/(?:v\d+\/)?(.+)\.\w+$/;
  const match = cloudinaryUrl.match(regex);
  return match ? match[1] : null;
}
```

### 4. Validation Dimensions

**backend/src/utils/photo.utils.ts:**
```typescript
import sizeOf from 'image-size';

export interface PhotoValidationResult {
  valid: boolean;
  error?: string;
  code?: string;
}

export async function validatePhotoDimensions(
  buffer: Buffer
): Promise<PhotoValidationResult> {
  try {
    const dimensions = sizeOf(buffer);

    if (!dimensions.width || !dimensions.height) {
      return {
        valid: false,
        error: 'Impossible de lire les dimensions de l\'image',
        code: 'PHOTO_INVALID_DIMENSIONS'
      };
    }

    if (dimensions.width < 200 || dimensions.height < 200) {
      return {
        valid: false,
        error: 'Les dimensions minimales sont 200x200 pixels',
        code: 'PHOTO_DIMENSIONS_TOO_SMALL'
      };
    }

    if (dimensions.width > 4000 || dimensions.height > 4000) {
      return {
        valid: false,
        error: 'Les dimensions maximales sont 4000x4000 pixels',
        code: 'PHOTO_DIMENSIONS_TOO_LARGE'
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: 'Fichier image invalide',
      code: 'PHOTO_INVALID_FILE'
    };
  }
}
```

### 5. Controller Upload

**backend/src/controllers/player.controller.ts (ajouter):**
```typescript
import * as cloudinaryService from '../services/cloudinary.service';
import { validatePhotoDimensions } from '../utils/photo.utils';

export async function uploadPlayerPhoto(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        error: 'Aucun fichier fourni',
        code: 'PHOTO_FILE_MISSING'
      });
    }

    // Vérifier ownership
    const player = await playerService.getPlayerById(id);
    if (player.userId !== req.user!.userId) {
      return res.status(403).json({
        error: 'Vous ne pouvez modifier que votre propre profil',
        code: 'AUTH_FORBIDDEN_OWNERSHIP'
      });
    }

    // Valider dimensions
    const validation = await validatePhotoDimensions(file.buffer);
    if (!validation.valid) {
      return res.status(400).json({
        error: validation.error,
        code: validation.code
      });
    }

    // Upload vers Cloudinary
    const photoUrl = await cloudinaryService.uploadPlayerPhoto(
      file.buffer,
      id
    );

    // Supprimer ancienne photo si existe
    if (player.profilePhotoUrl) {
      const oldPublicId = cloudinaryService.extractPublicId(player.profilePhotoUrl);
      if (oldPublicId) {
        await cloudinaryService.deletePlayerPhoto(oldPublicId);
      }
    }

    // Mettre à jour le profil
    await playerService.updatePlayerProfile(id, {
      profilePhotoUrl: photoUrl
    });

    return res.status(200).json({
      message: 'Photo de profil mise à jour avec succès',
      profilePhotoUrl: photoUrl
    });
  } catch (error: any) {
    console.error('Erreur upload photo:', error);
    return res.status(500).json({
      error: 'Erreur lors de l\'upload de la photo',
      code: 'PHOTO_UPLOAD_ERROR'
    });
  }
}

export async function deletePlayerPhoto(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Vérifier ownership
    const player = await playerService.getPlayerById(id);
    if (player.userId !== req.user!.userId) {
      return res.status(403).json({
        error: 'Vous ne pouvez modifier que votre propre profil',
        code: 'AUTH_FORBIDDEN_OWNERSHIP'
      });
    }

    if (!player.profilePhotoUrl) {
      return res.status(404).json({
        error: 'Aucune photo de profil à supprimer',
        code: 'PHOTO_NOT_FOUND'
      });
    }

    // Supprimer de Cloudinary
    const publicId = cloudinaryService.extractPublicId(player.profilePhotoUrl);
    if (publicId) {
      await cloudinaryService.deletePlayerPhoto(publicId);
    }

    // Mettre à jour le profil
    await playerService.updatePlayerProfile(id, {
      profilePhotoUrl: null
    });

    return res.status(200).json({
      message: 'Photo de profil supprimée avec succès'
    });
  } catch (error: any) {
    console.error('Erreur suppression photo:', error);
    return res.status(500).json({
      error: 'Erreur lors de la suppression de la photo',
      code: 'PHOTO_DELETE_ERROR'
    });
  }
}
```

### 6. Routes

**backend/src/routes/player.routes.ts (ajouter):**
```typescript
import { uploadPhoto } from '../middlewares/upload.middleware';

// Upload photo de profil
router.post(
  '/:id/photo',
  requireAuth,
  uploadPhoto.single('photo'),
  playerController.uploadPlayerPhoto
);

// Supprimer photo de profil
router.delete(
  '/:id/photo',
  requireAuth,
  playerController.deletePlayerPhoto
);
```

---

## Dépendances NPM

### Installation

```bash
npm install cloudinary multer image-size
npm install --save-dev @types/multer @types/image-size
```

**Packages:**
- `cloudinary`: SDK Cloudinary officiel
- `multer`: Middleware upload multipart/form-data
- `image-size`: Lecture dimensions images (lightweight)

---

## Tests à Implémenter

### Tests Unitaires

**cloudinary.service.spec.ts:**
- ✅ Upload player photo with valid buffer
- ✅ Delete player photo with valid public_id
- ✅ Extract public_id from Cloudinary URL

**photo.utils.spec.ts:**
- ✅ Validate photo dimensions (valid)
- ✅ Reject photo with small dimensions (< 200x200)
- ✅ Reject photo with large dimensions (> 4000x4000)
- ✅ Handle invalid image buffer

### Tests d'Intégration

**player.routes.spec.ts (photo):**
- ✅ POST /api/players/:id/photo - Valid photo upload
- ✅ POST /api/players/:id/photo - No file provided (400)
- ✅ POST /api/players/:id/photo - Invalid file type (400)
- ✅ POST /api/players/:id/photo - File too large (400)
- ✅ POST /api/players/:id/photo - Dimensions too small (400)
- ✅ POST /api/players/:id/photo - Non-owner (403)
- ✅ POST /api/players/:id/photo - Replace existing photo
- ✅ DELETE /api/players/:id/photo - Delete existing photo
- ✅ DELETE /api/players/:id/photo - No photo to delete (404)

---

## Sécurité

### Upload Sécurisé

**Serveur uniquement:**
- ✅ API secrets Cloudinary jamais exposés au client
- ✅ Upload côté serveur exclusivement
- ✅ Validation MIME type serveur (ne jamais faire confiance au client)

**Validation stricte:**
- ✅ Whitelist formats (JPG, PNG, WebP)
- ✅ Limite taille fichier (5 MB)
- ✅ Validation dimensions (200x200 min)
- ✅ Vérification buffer image valide

**Autorisation:**
- ✅ Authentification JWT requise
- ✅ Ownership vérifié (seul propriétaire peut upload)
- ✅ Admin ne peut pas upload pour joueurs (policy)

### Protection Cloudinary

**Compte Cloudinary:**
- Activer "Strict transformations" (éviter manipulation URL)
- Activer rate limiting (éviter abus)
- Configurer allowed origins si besoin

---

## Critères d'Acceptation

- [ ] Un joueur peut upload une photo de profil (JPG, PNG, WebP)
- [ ] La photo est validée (format, taille max 5MB, dimensions min 200x200)
- [ ] La photo est uploadée vers Cloudinary avec optimisation automatique
- [ ] L'URL Cloudinary est stockée dans player.profilePhotoUrl
- [ ] Un joueur peut remplacer sa photo existante
- [ ] L'ancienne photo est supprimée de Cloudinary lors du remplacement
- [ ] Un joueur peut supprimer sa photo de profil
- [ ] Seul le propriétaire peut upload/supprimer sa photo
- [ ] Les secrets Cloudinary ne sont jamais exposés au client
- [ ] Tous les tests passent

---

## Notes d'Implémentation

### Frontend (Next.js)

**Composant Upload:**
```typescript
'use client';

import { useState } from 'react';

export default function PhotoUpload({ playerId }: { playerId: string }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation client (preview, pas de sécurité)
    if (file.size > 5 * 1024 * 1024) {
      alert('Fichier trop volumineux (max 5MB)');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/players/${playerId}/photo`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      if (response.ok) {
        const { profilePhotoUrl } = await response.json();
        setPreview(profilePhotoUrl);
        alert('Photo uploadée avec succès!');
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      alert('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <p>Upload en cours...</p>}
      {preview && <img src={preview} alt="Profile" width={200} />}
    </div>
  );
}
```

---

## Évolutions Futures

### V1
- Galerie photos (5 photos max) - SPEC-V1-001
- Crop/rotate interface (frontend)
- Filters/effects optionnels

### V2
- Photos premium (10 photos pour profils boostés)
- Upload direct depuis mobile
- Compression côté client avant upload
- Support GIF animés (avatar)

---

**Statut:** ✅ Spécification complète et prête pour implémentation
**Créé le:** 2026-02-02
**Dernière mise à jour:** 2026-02-02
