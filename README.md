# Video Gallery

MongoDB-backed video gallery — React frontend + Express backend.

## Project Structure

```
videogallery/
├── src/                  # React frontend
│   ├── components/
│   │   ├── Header.jsx    # Sitename + day/night toggle
│   │   ├── VideoCard.jsx # Thumbnail card (hover preview)
│   │   └── Pagination.jsx
│   ├── pages/
│   │   ├── Home.jsx      # Grid + pagination
│   │   └── Watch.jsx     # Plyr player + recommended
│   ├── hooks/
│   │   └── useTheme.js
│   ├── api.js            # Axios instance
│   └── index.css         # Design tokens + all styles
├── server.js             # Express API
├── package.json          # Frontend deps
├── package-backend.json  # Backend deps
└── .env.example
```

## Setup

### 1. Environment files

```bash
cp .env.example .env
# Edit .env with your values
```

Frontend ke liye ek alag `.env` file banao (same folder mein):
```env
VITE_SITE_NAME=HotStyleVideo
VITE_API_TOKEN=your-secret-token
```

### 2. Backend install + run

```bash
# Backend dependencies
cp package-backend.json package-server.json
npm install --prefix . express mongoose helmet cors express-rate-limit dotenv

node server.js
# Server: http://localhost:4000
```

### 3. Frontend install + run

```bash
npm install
npm run dev
# Frontend: http://localhost:5173
```

### 4. Production build

```bash
npm run build
# dist/ folder serve karo kisi bhi static host se
# Backend alag server pe chalao
```

## MongoDB Collection Format

Scraper jo `video_urls` collection mein save karta hai:
```json
{
  "_id": "ObjectId(...)",
  "url": "https://hotstylevideo.site/uploads/videos/vid_xxx.mp4",
  "post_url": "https://hotstylevideo.site/index.php?p=watch&id=122",
  "found_at": "2026-07-07T10:00:00Z",
  "scraped_at": "2026-07-07T10:00:05Z"
}
```

`COLLECTION` env var se collection name change karo agar alag hai.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/videos?page=1&limit=32` | Paginated video list |
| GET | `/api/videos/:id` | Single video by ID |
| GET | `/api/videos/random?limit=12&exclude=<id>` | Random recommended videos |

## Security

- **Helmet** — HTTP security headers
- **CORS** — Sirf allowed origins
- **Rate limiting** — 500 req/15min per IP
- **Bearer token** — `API_TOKEN` env se (optional)
- **robots noindex** — Search engines index nahi karenge
- **Input validation** — ObjectId validation har request pe

## Features

- 📱 Mobile first: 2 column → 3 → 4 → 6 → 8 columns
- 🌙 Dark / Light toggle (localStorage mein save)
- ▶️ Hover pe video preview (350ms delay)
- 📄 Pagination with ellipsis
- 🎬 Plyr.io player — fullscreen, volume, progress
- 🎲 Random recommended videos below player
- ⚡ Shimmer skeleton loading
