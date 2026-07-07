/**
 * server.js — Express API backend
 * MongoDB se videos serve karta hai, security headers + rate limiting ke saath
 *
 * Install: npm install express mongoose helmet cors express-rate-limit dotenv
 * Run    : node server.js
 */

require('dotenv').config()
const express      = require('express')
const mongoose     = require('mongoose')
const helmet       = require('helmet')
const cors         = require('cors')
const rateLimit    = require('express-rate-limit')

const app  = express()
const PORT = process.env.PORT || 4000

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,  // handled by frontend
}))

// CORS — sirf frontend origin allow karo
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',').map(s => s.trim())

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true)
    cb(new Error('Not allowed by CORS'))
  },
  methods: ['GET'],
}))

// Rate limiting — DoS se bachao
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try later.' }
})
app.use('/api/', limiter)

// Optional Bearer token auth
const API_TOKEN = process.env.API_TOKEN
function authMiddleware(req, res, next) {
  if (!API_TOKEN) return next()
  const auth = req.headers['authorization'] || ''
  if (auth === `Bearer ${API_TOKEN}`) return next()
  return res.status(401).json({ error: 'Unauthorized' })
}

// ── MongoDB ───────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017'
const DB_NAME   = process.env.DB_NAME   || 'videogallery'

mongoose.connect(`${MONGO_URI}/${DB_NAME}`)
  .then(() => console.log(`MongoDB connected: ${DB_NAME}`))
  .catch(err => { console.error('MongoDB error:', err); process.exit(1) })

// ── Schema ────────────────────────────────────────────────────────────────────
// Adjust collection/field names to match your scraper output
const VideoSchema = new mongoose.Schema({
  url:        { type: String, required: true },
  post_url:   { type: String },
  found_at:   { type: Date, default: Date.now },
  scraped_at: { type: Date },
}, { collection: process.env.COLLECTION || 'video_urls' })

VideoSchema.index({ found_at: -1 })
const Video = mongoose.model('Video', VideoSchema)

// ── Routes ────────────────────────────────────────────────────────────────────
app.use(express.json())

// GET /api/videos?page=1&limit=32
app.get('/api/videos', authMiddleware, async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 32))
    const skip  = (page - 1) * limit

    const [videos, total] = await Promise.all([
      Video.find({}, { url: 1, found_at: 1 })
           .sort({ found_at: -1 })
           .skip(skip)
           .limit(limit)
           .lean(),
      Video.countDocuments()
    ])

    res.json({
      videos,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/videos/random?limit=12&exclude=<id>
app.get('/api/videos/random', authMiddleware, async (req, res) => {
  try {
    const limit   = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12))
    const exclude = req.query.exclude

    const match = {}
    if (exclude && mongoose.isValidObjectId(exclude)) {
      match._id = { $ne: new mongoose.Types.ObjectId(exclude) }
    }

    const videos = await Video.aggregate([
      { $match: match },
      { $sample: { size: limit } },
      { $project: { url: 1, found_at: 1 } }
    ])

    res.json({ videos })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/videos/:id
app.get('/api/videos/:id', authMiddleware, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID' })
    }
    const video = await Video.findById(req.params.id, { url: 1, found_at: 1 }).lean()
    if (!video) return res.status(404).json({ error: 'Not found' })
    res.json(video)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// 404 catch
app.use((req, res) => res.status(404).json({ error: 'Not found' }))

// Global error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal error' })
})

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})
