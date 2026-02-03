# SPEC-MVP-006: Gestion Vidéos YouTube Joueur

**Phase:** MVP
**Sprint:** 1
**Domaine:** Player Management - Media
**Priorité:** Haute
**Dépendances:** SPEC-MVP-004

---

## Description

Système de gestion de vidéos YouTube pour les profils joueurs. Permet aux joueurs d'ajouter jusqu'à 3 vidéos YouTube (highlights, matchs, skills) à leur profil pour démontrer leurs compétences aux recruteurs.

---

## Requirements

### REQ-VIDEO-001: YouTube URL Validation
The system SHALL validate YouTube URLs (youtube.com, youtu.be formats).

### REQ-VIDEO-002: Video Limit
The system MUST limit to maximum 3 videos per player profile (MVP).

### REQ-VIDEO-003: Video Metadata
The system SHALL store video URL and optional title for each video.

### REQ-VIDEO-004: Video Array Management
The system SHALL store videos as JSON array in player.videoUrls field.

### REQ-VIDEO-005: Authorization
The system MUST restrict video management to authenticated player (owner only).

### REQ-VIDEO-006: URL Extraction
The system SHALL extract YouTube video ID from various URL formats.

---

## Endpoints API

### POST /api/players/:id/videos
**Description:** Ajouter une vidéo YouTube au profil

**Authentication:** Requiert JWT access token + ownership

**Request Body:**
```json
{
  "url": "string (required)",
  "title": "string (optional, max 100 chars)"
}
```

**Formats URL acceptés:**
```
https://www.youtube.com/watch?v=VIDEO_ID
https://youtu.be/VIDEO_ID
https://www.youtube.com/embed/VIDEO_ID
https://m.youtube.com/watch?v=VIDEO_ID
```

**Response 201 Created:**
```json
{
  "message": "Vidéo ajoutée avec succès",
  "video": {
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "title": "Highlights 2025",
    "videoId": "dQw4w9WgXcQ",
    "thumbnailUrl": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    "addedAt": "2026-02-02T23:00:00Z"
  },
  "totalVideos": 1
}
```

**Response 400 Bad Request (URL invalide):**
```json
{
  "error": "URL YouTube invalide",
  "code": "VIDEO_INVALID_URL"
}
```

**Response 400 Bad Request (limite atteinte):**
```json
{
  "error": "Limite de 3 vidéos atteinte",
  "code": "VIDEO_LIMIT_REACHED",
  "maxVideos": 3
}
```

**Response 403 Forbidden:**
```json
{
  "error": "Vous ne pouvez modifier que votre propre profil",
  "code": "AUTH_FORBIDDEN_OWNERSHIP"
}
```

---

### GET /api/players/:id/videos
**Description:** Récupérer les vidéos d'un profil joueur

**Authentication:** Optionnelle (public)

**Response 200 OK:**
```json
{
  "videos": [
    {
      "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "title": "Highlights 2025",
      "videoId": "dQw4w9WgXcQ",
      "thumbnailUrl": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      "addedAt": "2026-02-02T23:00:00Z"
    }
  ],
  "totalVideos": 1,
  "maxVideos": 3
}
```

---

### DELETE /api/players/:id/videos/:videoId
**Description:** Supprimer une vidéo du profil

**Authentication:** Requiert JWT access token + ownership

**Response 200 OK:**
```json
{
  "message": "Vidéo supprimée avec succès",
  "remainingVideos": 2
}
```

**Response 404 Not Found:**
```json
{
  "error": "Vidéo introuvable",
  "code": "VIDEO_NOT_FOUND"
}
```

---

### PUT /api/players/:id/videos/:videoId
**Description:** Mettre à jour le titre d'une vidéo

**Authentication:** Requiert JWT access token + ownership

**Request Body:**
```json
{
  "title": "string (required, max 100 chars)"
}
```

**Response 200 OK:**
```json
{
  "message": "Vidéo mise à jour avec succès",
  "video": {
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "title": "Nouveau titre",
    "videoId": "dQw4w9WgXcQ",
    "thumbnailUrl": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    "addedAt": "2026-02-02T23:00:00Z"
  }
}
```

---

## Structure des Données

### Schéma Vidéo (JSON)

```typescript
interface PlayerVideo {
  url: string;              // URL YouTube complète
  title?: string;           // Titre personnalisé (max 100 chars)
  videoId: string;          // ID YouTube extrait
  thumbnailUrl: string;     // URL miniature YouTube
  addedAt: string;          // ISO 8601 timestamp
}
```

### Stockage dans Player.videoUrls

```prisma
model Player {
  // ...
  videoUrls Json @default("[]") @map("video_urls") @db.JsonB
  // ...
}
```

**Exemple de données:**
```json
[
  {
    "url": "https://www.youtube.com/watch?v=VIDEO1",
    "title": "Highlights 2025",
    "videoId": "VIDEO1",
    "thumbnailUrl": "https://img.youtube.com/vi/VIDEO1/hqdefault.jpg",
    "addedAt": "2026-02-02T10:00:00Z"
  },
  {
    "url": "https://youtu.be/VIDEO2",
    "title": "Match final",
    "videoId": "VIDEO2",
    "thumbnailUrl": "https://img.youtube.com/vi/VIDEO2/hqdefault.jpg",
    "addedAt": "2026-02-02T11:00:00Z"
  }
]
```

---

## Validation des URLs

### Formats YouTube Supportés

```typescript
const YOUTUBE_REGEX = [
  // Format standard
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,

  // Format court
  /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,

  // Format embed
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,

  // Format mobile
  /(?:https?:\/\/)?m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/
];
```

### Validation

```typescript
export function extractYouTubeVideoId(url: string): string | null {
  for (const regex of YOUTUBE_REGEX) {
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}
```

---

## Miniatures YouTube

### URL de Miniature

YouTube fournit plusieurs tailles de miniatures:

```typescript
export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'high'): string {
  const sizes = {
    default: 'default',      // 120x90
    medium: 'mqdefault',     // 320x180
    high: 'hqdefault',       // 480x360
    maxres: 'maxresdefault'  // 1280x720 (pas toujours disponible)
  };

  return `https://img.youtube.com/vi/${videoId}/${sizes[quality]}.jpg`;
}
```

**MVP:** Utiliser `hqdefault` (480x360) pour un bon compromis qualité/poids.

---

## Schéma de Validation

### Zod Schema: Ajouter Vidéo

```typescript
import { z } from 'zod';

export const addVideoSchema = z.object({
  url: z.string()
    .url('URL invalide')
    .refine(
      (url) => isValidYouTubeUrl(url),
      'URL YouTube invalide'
    ),

  title: z.string()
    .max(100, 'Le titre ne peut pas dépasser 100 caractères')
    .trim()
    .optional()
});

export type AddVideoInput = z.infer<typeof addVideoSchema>;
```

### Zod Schema: Mettre à Jour Titre

```typescript
export const updateVideoTitleSchema = z.object({
  title: z.string()
    .min(1, 'Le titre ne peut pas être vide')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères')
    .trim()
});

export type UpdateVideoTitleInput = z.infer<typeof updateVideoTitleSchema>;
```

---

## Structure du Code

### Fichiers à créer

```
backend/src/
├── validators/
│   └── video.validator.ts          # Schémas Zod validation
├── utils/
│   └── youtube.utils.ts            # Extraction videoId, miniatures
├── services/
│   └── video.service.ts            # Logique métier vidéos
├── controllers/
│   └── video.controller.ts         # Handlers requêtes HTTP
└── routes/
    └── video.routes.ts             # Routes API vidéos
```

---

## Implémentation

### 1. Utilitaires YouTube

**backend/src/utils/youtube.utils.ts:**
```typescript
/**
 * Regex pour différents formats d'URL YouTube
 */
const YOUTUBE_REGEX = [
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/
];

/**
 * Extraire l'ID de vidéo YouTube depuis une URL
 */
export function extractYouTubeVideoId(url: string): string | null {
  for (const regex of YOUTUBE_REGEX) {
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * Vérifier si l'URL est une URL YouTube valide
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}

/**
 * Obtenir l'URL de la miniature YouTube
 */
export function getYouTubeThumbnail(
  videoId: string,
  quality: 'default' | 'medium' | 'high' | 'maxres' = 'high'
): string {
  const sizes = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    maxres: 'maxresdefault'
  };

  return `https://img.youtube.com/vi/${videoId}/${sizes[quality]}.jpg`;
}

/**
 * Normaliser l'URL YouTube (format standard)
 */
export function normalizeYouTubeUrl(url: string): string {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    throw new Error('VIDEO_INVALID_URL');
  }
  return `https://www.youtube.com/watch?v=${videoId}`;
}
```

### 2. Service Vidéos

**backend/src/services/video.service.ts:**
```typescript
import { prisma } from '../config/database';
import { extractYouTubeVideoId, getYouTubeThumbnail, normalizeYouTubeUrl } from '../utils/youtube.utils';

const MAX_VIDEOS_MVP = 3;

interface VideoData {
  url: string;
  title?: string;
  videoId: string;
  thumbnailUrl: string;
  addedAt: string;
}

/**
 * Ajouter une vidéo au profil joueur
 */
export async function addVideoToPlayer(playerId: string, url: string, title?: string) {
  // Récupérer le profil
  const player = await prisma.player.findUnique({
    where: { id: playerId }
  });

  if (!player) {
    throw new Error('PLAYER_NOT_FOUND');
  }

  // Vérifier la limite de vidéos
  const currentVideos = player.videoUrls as VideoData[];
  if (currentVideos.length >= MAX_VIDEOS_MVP) {
    throw new Error('VIDEO_LIMIT_REACHED');
  }

  // Extraire videoId et créer données vidéo
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    throw new Error('VIDEO_INVALID_URL');
  }

  // Vérifier si la vidéo existe déjà
  const videoExists = currentVideos.some(v => v.videoId === videoId);
  if (videoExists) {
    throw new Error('VIDEO_ALREADY_EXISTS');
  }

  const normalizedUrl = normalizeYouTubeUrl(url);
  const thumbnailUrl = getYouTubeThumbnail(videoId, 'high');

  const videoData: VideoData = {
    url: normalizedUrl,
    title: title || undefined,
    videoId,
    thumbnailUrl,
    addedAt: new Date().toISOString()
  };

  // Ajouter la vidéo
  const updatedVideos = [...currentVideos, videoData];

  await prisma.player.update({
    where: { id: playerId },
    data: {
      videoUrls: updatedVideos as any
    }
  });

  return videoData;
}

/**
 * Récupérer les vidéos d'un joueur
 */
export async function getPlayerVideos(playerId: string) {
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: { videoUrls: true }
  });

  if (!player) {
    throw new Error('PLAYER_NOT_FOUND');
  }

  return {
    videos: player.videoUrls as VideoData[],
    totalVideos: (player.videoUrls as VideoData[]).length,
    maxVideos: MAX_VIDEOS_MVP
  };
}

/**
 * Supprimer une vidéo
 */
export async function deleteVideoFromPlayer(playerId: string, videoId: string) {
  const player = await prisma.player.findUnique({
    where: { id: playerId }
  });

  if (!player) {
    throw new Error('PLAYER_NOT_FOUND');
  }

  const currentVideos = player.videoUrls as VideoData[];
  const videoIndex = currentVideos.findIndex(v => v.videoId === videoId);

  if (videoIndex === -1) {
    throw new Error('VIDEO_NOT_FOUND');
  }

  const updatedVideos = currentVideos.filter(v => v.videoId !== videoId);

  await prisma.player.update({
    where: { id: playerId },
    data: {
      videoUrls: updatedVideos as any
    }
  });

  return {
    success: true,
    remainingVideos: updatedVideos.length
  };
}

/**
 * Mettre à jour le titre d'une vidéo
 */
export async function updateVideoTitle(playerId: string, videoId: string, title: string) {
  const player = await prisma.player.findUnique({
    where: { id: playerId }
  });

  if (!player) {
    throw new Error('PLAYER_NOT_FOUND');
  }

  const currentVideos = player.videoUrls as VideoData[];
  const videoIndex = currentVideos.findIndex(v => v.videoId === videoId);

  if (videoIndex === -1) {
    throw new Error('VIDEO_NOT_FOUND');
  }

  const updatedVideos = [...currentVideos];
  updatedVideos[videoIndex] = {
    ...updatedVideos[videoIndex],
    title
  };

  await prisma.player.update({
    where: { id: playerId },
    data: {
      videoUrls: updatedVideos as any
    }
  });

  return updatedVideos[videoIndex];
}
```

### 3. Controller

**backend/src/controllers/video.controller.ts:**
```typescript
import { Request, Response } from 'express';
import * as videoService from '../services/video.service';
import * as playerService from '../services/player.service';

/**
 * POST /api/players/:id/videos
 * Ajouter une vidéo YouTube
 */
export async function addVideo(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { url, title } = req.body;

    // Vérifier ownership
    const player = await playerService.getPlayerById(id);
    if (player.userId !== req.user!.userId) {
      return res.status(403).json({
        error: 'Vous ne pouvez modifier que votre propre profil',
        code: 'AUTH_FORBIDDEN_OWNERSHIP'
      });
    }

    const video = await videoService.addVideoToPlayer(id, url, title);

    return res.status(201).json({
      message: 'Vidéo ajoutée avec succès',
      video,
      totalVideos: (player.videoUrls as any[]).length + 1
    });
  } catch (error: any) {
    if (error.message === 'PLAYER_NOT_FOUND') {
      return res.status(404).json({
        error: 'Profil joueur introuvable',
        code: 'PLAYER_NOT_FOUND'
      });
    }
    if (error.message === 'VIDEO_LIMIT_REACHED') {
      return res.status(400).json({
        error: 'Limite de 3 vidéos atteinte',
        code: 'VIDEO_LIMIT_REACHED',
        maxVideos: 3
      });
    }
    if (error.message === 'VIDEO_INVALID_URL') {
      return res.status(400).json({
        error: 'URL YouTube invalide',
        code: 'VIDEO_INVALID_URL'
      });
    }
    if (error.message === 'VIDEO_ALREADY_EXISTS') {
      return res.status(409).json({
        error: 'Cette vidéo existe déjà dans votre profil',
        code: 'VIDEO_ALREADY_EXISTS'
      });
    }

    console.error('Erreur ajout vidéo:', error);
    return res.status(500).json({
      error: 'Erreur lors de l\'ajout de la vidéo',
      code: 'VIDEO_ADD_ERROR'
    });
  }
}

/**
 * GET /api/players/:id/videos
 * Récupérer les vidéos d'un joueur
 */
export async function getVideos(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = await videoService.getPlayerVideos(id);
    return res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'PLAYER_NOT_FOUND') {
      return res.status(404).json({
        error: 'Profil joueur introuvable',
        code: 'PLAYER_NOT_FOUND'
      });
    }

    console.error('Erreur récupération vidéos:', error);
    return res.status(500).json({
      error: 'Erreur lors de la récupération des vidéos',
      code: 'VIDEO_GET_ERROR'
    });
  }
}

/**
 * DELETE /api/players/:id/videos/:videoId
 * Supprimer une vidéo
 */
export async function deleteVideo(req: Request, res: Response) {
  try {
    const { id, videoId } = req.params;

    // Vérifier ownership
    const player = await playerService.getPlayerById(id);
    if (player.userId !== req.user!.userId) {
      return res.status(403).json({
        error: 'Vous ne pouvez modifier que votre propre profil',
        code: 'AUTH_FORBIDDEN_OWNERSHIP'
      });
    }

    const result = await videoService.deleteVideoFromPlayer(id, videoId);

    return res.status(200).json({
      message: 'Vidéo supprimée avec succès',
      remainingVideos: result.remainingVideos
    });
  } catch (error: any) {
    if (error.message === 'PLAYER_NOT_FOUND') {
      return res.status(404).json({
        error: 'Profil joueur introuvable',
        code: 'PLAYER_NOT_FOUND'
      });
    }
    if (error.message === 'VIDEO_NOT_FOUND') {
      return res.status(404).json({
        error: 'Vidéo introuvable',
        code: 'VIDEO_NOT_FOUND'
      });
    }

    console.error('Erreur suppression vidéo:', error);
    return res.status(500).json({
      error: 'Erreur lors de la suppression de la vidéo',
      code: 'VIDEO_DELETE_ERROR'
    });
  }
}

/**
 * PUT /api/players/:id/videos/:videoId
 * Mettre à jour le titre d'une vidéo
 */
export async function updateVideoTitle(req: Request, res: Response) {
  try {
    const { id, videoId } = req.params;
    const { title } = req.body;

    // Vérifier ownership
    const player = await playerService.getPlayerById(id);
    if (player.userId !== req.user!.userId) {
      return res.status(403).json({
        error: 'Vous ne pouvez modifier que votre propre profil',
        code: 'AUTH_FORBIDDEN_OWNERSHIP'
      });
    }

    const video = await videoService.updateVideoTitle(id, videoId, title);

    return res.status(200).json({
      message: 'Vidéo mise à jour avec succès',
      video
    });
  } catch (error: any) {
    if (error.message === 'PLAYER_NOT_FOUND') {
      return res.status(404).json({
        error: 'Profil joueur introuvable',
        code: 'PLAYER_NOT_FOUND'
      });
    }
    if (error.message === 'VIDEO_NOT_FOUND') {
      return res.status(404).json({
        error: 'Vidéo introuvable',
        code: 'VIDEO_NOT_FOUND'
      });
    }

    console.error('Erreur mise à jour vidéo:', error);
    return res.status(500).json({
      error: 'Erreur lors de la mise à jour de la vidéo',
      code: 'VIDEO_UPDATE_ERROR'
    });
  }
}
```

### 4. Routes

**backend/src/routes/video.routes.ts:**
```typescript
import { Router } from 'express';
import * as videoController from '../controllers/video.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validateRequest';
import { addVideoSchema, updateVideoTitleSchema } from '../validators/video.validator';

const router = Router();

/**
 * POST /api/players/:id/videos
 * Ajouter une vidéo YouTube
 */
router.post(
  '/:id/videos',
  requireAuth,
  validateRequest(addVideoSchema),
  videoController.addVideo
);

/**
 * GET /api/players/:id/videos
 * Récupérer les vidéos d'un joueur (public)
 */
router.get(
  '/:id/videos',
  videoController.getVideos
);

/**
 * DELETE /api/players/:id/videos/:videoId
 * Supprimer une vidéo
 */
router.delete(
  '/:id/videos/:videoId',
  requireAuth,
  videoController.deleteVideo
);

/**
 * PUT /api/players/:id/videos/:videoId
 * Mettre à jour le titre d'une vidéo
 */
router.put(
  '/:id/videos/:videoId',
  requireAuth,
  validateRequest(updateVideoTitleSchema),
  videoController.updateVideoTitle
);

export default router;
```

### 5. Validators

**backend/src/validators/video.validator.ts:**
```typescript
import { z } from 'zod';
import { isValidYouTubeUrl } from '../utils/youtube.utils';

export const addVideoSchema = z.object({
  url: z.string()
    .url('URL invalide')
    .refine(
      (url) => isValidYouTubeUrl(url),
      'URL YouTube invalide. Formats acceptés: youtube.com/watch?v=, youtu.be/'
    ),

  title: z.string()
    .max(100, 'Le titre ne peut pas dépasser 100 caractères')
    .trim()
    .optional()
});

export const updateVideoTitleSchema = z.object({
  title: z.string()
    .min(1, 'Le titre ne peut pas être vide')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères')
    .trim()
});

export type AddVideoInput = z.infer<typeof addVideoSchema>;
export type UpdateVideoTitleInput = z.infer<typeof updateVideoTitleSchema>;
```

---

## Tests à Implémenter

### Tests Unitaires

**youtube.utils.spec.ts:**
- ✅ Extract video ID from youtube.com/watch?v=
- ✅ Extract video ID from youtu.be/
- ✅ Extract video ID from youtube.com/embed/
- ✅ Return null for invalid URL
- ✅ Generate thumbnail URL
- ✅ Normalize YouTube URL

**video.service.spec.ts:**
- ✅ Add video with valid URL
- ✅ Reject when limit reached (3 videos)
- ✅ Reject invalid YouTube URL
- ✅ Reject duplicate video
- ✅ Delete video by ID
- ✅ Update video title
- ✅ Get player videos

### Tests d'Intégration

**video.routes.spec.ts:**
- ✅ POST /api/players/:id/videos - Valid URL
- ✅ POST /api/players/:id/videos - Invalid URL (400)
- ✅ POST /api/players/:id/videos - Limit reached (400)
- ✅ POST /api/players/:id/videos - Duplicate video (409)
- ✅ POST /api/players/:id/videos - Non-owner (403)
- ✅ GET /api/players/:id/videos - Public access
- ✅ DELETE /api/players/:id/videos/:videoId - Owner only
- ✅ PUT /api/players/:id/videos/:videoId - Update title

---

## Exemples d'Usage

### Frontend: Ajouter Vidéo

```typescript
async function addYouTubeVideo(playerId: string, url: string, title?: string) {
  const token = localStorage.getItem('accessToken');

  const response = await fetch(`${API_URL}/api/players/${playerId}/videos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ url, title })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return await response.json();
}
```

### Frontend: Afficher Vidéos

```tsx
function PlayerVideos({ videos }: { videos: VideoData[] }) {
  return (
    <div className="videos-grid">
      {videos.map((video) => (
        <div key={video.videoId} className="video-card">
          <img src={video.thumbnailUrl} alt={video.title} />
          <h3>{video.title || 'Sans titre'}</h3>
          <a href={video.url} target="_blank" rel="noopener">
            Voir sur YouTube
          </a>
        </div>
      ))}
    </div>
  );
}
```

---

## Sécurité

### Validation
- ✅ URL YouTube validée (regex strict)
- ✅ Limite de 3 vidéos (MVP)
- ✅ Titre max 100 caractères
- ✅ Pas d'exécution de code (JSON storage)

### Autorisation
- ✅ Seul le propriétaire peut ajouter/modifier/supprimer
- ✅ Lecture publique (GET /videos)
- ✅ Ownership vérifié à chaque opération

### Données Sensibles
- ✅ Aucune donnée sensible stockée
- ✅ URLs YouTube publiques uniquement
- ✅ Pas d'API YouTube (pas de quota)

---

## Limitations MVP

| Limitation | MVP | V2 |
|------------|-----|-----|
| Nombre max vidéos | 3 | 10 (premium) |
| Source | YouTube uniquement | + Vimeo, upload direct |
| Métadonnées | URL + titre manuel | Auto-fetch titre/durée |
| Ordre | Chronologique | Réordonnancement |
| Analytics | Non | Vues, clics |

---

## Évolutions V2

- Upload direct vidéo (Cloudinary Video)
- Support Vimeo
- Auto-fetch metadata (YouTube Data API)
- Réordonnancement vidéos (drag & drop)
- Statistiques de visionnage
- Vidéo principale/mise en avant
- Timestamps (moments clés)
- Playlists

---

## Critères d'Acceptation

- [ ] Un joueur peut ajouter jusqu'à 3 vidéos YouTube
- [ ] URLs YouTube validées (formats variés)
- [ ] Video ID extrait correctement
- [ ] Miniatures générées automatiquement
- [ ] Titre personnalisé optionnel
- [ ] Vidéos visibles publiquement
- [ ] Seul propriétaire peut gérer ses vidéos
- [ ] Pas de vidéos dupliquées
- [ ] Limite de 3 vidéos respectée
- [ ] Tous les tests passent

---

**Statut:** ✅ Spécification complète et prête pour implémentation
**Créé le:** 2026-02-03
**Dernière mise à jour:** 2026-02-03
