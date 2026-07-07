import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export default function VideoCard({ video, index }) {
  const navigate    = useNavigate()
  const [loaded, setLoaded]   = useState(false)
  const [playing, setPlaying] = useState(false)
  const videoRef    = useRef(null)
  const hoverTimer  = useRef(null)

  // Encode video id safely for URL
  const videoId = encodeURIComponent(video._id)

  const handleClick = useCallback(() => {
    navigate(`/watch/${videoId}`)
  }, [navigate, videoId])

  const handleMouseEnter = useCallback(() => {
    hoverTimer.current = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {})
        setPlaying(true)
      }
    }, 350)
  }, [])

  const handleMouseLeave = useCallback(() => {
    clearTimeout(hoverTimer.current)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
      setPlaying(false)
    }
  }, [])

  return (
    <article
      className="video-card"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
      aria-label={`Video ${index + 1}`}
      role="button"
    >
      <div className="thumb-wrap">
        {/* Shimmer shown until video metadata loads */}
        {!loaded && <div className="thumb-skeleton" />}

        <video
          ref={videoRef}
          className="thumb-video"
          src={video.url}
          muted
          loop
          playsInline
          preload="metadata"
          style={{ opacity: loaded ? 1 : 0 }}
          onLoadedMetadata={() => setLoaded(true)}
        />

        <div className="play-overlay">
          <div className="play-icon">
            <svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21" /></svg>
          </div>
        </div>
      </div>
    </article>
  )
}
