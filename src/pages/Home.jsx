import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import VideoCard from '../components/VideoCard'
import Pagination from '../components/Pagination'
import api from '../api'

const PER_PAGE = 32

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('p') || '1', 10)

  const [videos, setVideos]           = useState([])
  const [totalPages, setTotalPages]   = useState(1)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)

  const fetchVideos = useCallback(async (pg) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/videos', {
        params: { page: pg, limit: PER_PAGE }
      })
      setVideos(res.data.videos)
      setTotalPages(res.data.totalPages)
    } catch (err) {
      setError('Videos load nahi ho sake.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVideos(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page, fetchVideos])

  const handlePage = (p) => {
    setSearchParams({ p })
  }

  if (loading) return (
    <main className="page-wrap">
      <div className="state-center">
        <div className="spinner" />
      </div>
    </main>
  )

  if (error) return (
    <main className="page-wrap">
      <div className="state-center">
        <span>{error}</span>
        <button className="pg-btn" onClick={() => fetchVideos(page)}>Retry</button>
      </div>
    </main>
  )

  if (!videos.length) return (
    <main className="page-wrap">
      <div className="state-center">
        <span>Koi video nahi mila.</span>
      </div>
    </main>
  )

  return (
    <main className="page-wrap">
      <div className="video-grid">
        {videos.map((v, i) => (
          <VideoCard key={v._id} video={v} index={(page - 1) * PER_PAGE + i} />
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={handlePage} />
    </main>
  )
}
