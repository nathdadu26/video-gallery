import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'
import VideoCard from '../components/VideoCard'
import api from '../api'

const REC_COUNT = 12

export default function Watch() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const containerRef = useRef(null)
  const playerRef    = useRef(null)

  const [video, setVideo]       = useState(null)
  const [recs, setRecs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  // Fetch current video
  const fetchVideo = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/videos/${id}`)
      setVideo(res.data)
    } catch {
      setError('Video load nahi ho saka.')
    } finally {
      setLoading(false)
    }
  }, [id])

  // Fetch recommended (random sample excluding current)
  const fetchRecs = useCallback(async () => {
    try {
      const res = await api.get('/videos/random', {
        params: { limit: REC_COUNT, exclude: id }
      })
      setRecs(res.data.videos)
    } catch {
      // silent
    }
  }, [id])

  useEffect(() => {
    fetchVideo()
    fetchRecs()
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [fetchVideo, fetchRecs])

  // Init Plyr after video loads
  useEffect(() => {
    if (!video || !containerRef.current) return

    // Destroy previous instance
    if (playerRef.current) {
      playerRef.current.destroy()
      playerRef.current = null
    }

    const el = containerRef.current.querySelector('video')
    if (!el) return

    playerRef.current = new Plyr(el, {
      controls: [
        'play-large', 'play', 'progress',
        'current-time', 'mute', 'volume',
        'fullscreen'
      ],
      ratio: undefined,
      storage: { enabled: false },
    })

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }, [video])

  if (loading) return (
    <>
      <div className="player-page">
        <div className="state-center"><div className="spinner" /></div>
      </div>
    </>
  )

  if (error) return (
    <div className="player-page">
      <div className="state-center">
        <span>{error}</span>
        <button className="pg-btn" onClick={fetchVideo}>Retry</button>
      </div>
    </div>
  )

  if (!video) return null

  return (
    <div className="player-page">
      {/* Back */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      {/* Player */}
      <div className="player-wrap" ref={containerRef}>
        <video
          src={video.url}
          playsInline
          crossOrigin="anonymous"
        />
      </div>

      {/* Recommended */}
      {recs.length > 0 && (
        <>
          <p className="rec-label">More Videos</p>
          <div className="rec-grid">
            {recs.map((v, i) => (
              <VideoCard key={v._id} video={v} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
