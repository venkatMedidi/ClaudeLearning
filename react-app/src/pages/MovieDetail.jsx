import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client.js'

export default function MovieDetail() {
  const { movieId } = useParams()
  const [movie, setMovie] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    setMovie(null)
    setError('')
    api(`/movies/${movieId}`).then(setMovie).catch((err) => setError(err.message))
  }, [movieId])

  if (error) return <p className="error-text">{error}</p>
  if (!movie) return <p>Loading…</p>

  return (
    <>
      <Link to="/" className="back-link">&larr; Back to movies</Link>
      <div className="detail-header">
        <div className="detail-poster" style={{ background: movie.color }}>🎬</div>
        <div>
          <h1>{movie.title}</h1>
          <div className="movie-meta">{movie.genre} · {movie.duration} min · {movie.rating}</div>
          <p>{movie.synopsis}</p>
        </div>
      </div>

      <h2>Showtimes</h2>
      <div className="showtime-list">
        {movie.showtimes.map((s) => (
          <div key={s.id} className="showtime-card" onClick={() => navigate(`/showtime/${s.id}`)}>
            <div className="time">{s.time}</div>
            <div className="theater">{s.theater} · {s.date}</div>
            <div className="price">${s.price.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </>
  )
}
