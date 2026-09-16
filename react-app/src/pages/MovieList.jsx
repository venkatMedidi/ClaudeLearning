import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'

export default function MovieList() {
  const [movies, setMovies] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api('/movies').then(setMovies).catch((err) => setError(err.message))
  }, [])

  if (error) return <p className="error-text">{error}</p>
  if (!movies) return <p>Loading movies…</p>

  return (
    <>
      <h1>Now Showing</h1>
      <div className="movie-grid">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="movie-card"
            onClick={() => navigate(`/movie/${movie.id}`)}
          >
            <div className="movie-poster" style={{ background: movie.color }}>🎬</div>
            <div className="movie-body">
              <div className="movie-title">{movie.title}</div>
              <div className="movie-meta">{movie.genre} · {movie.duration} min</div>
              <span className="badge">{movie.rating}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
