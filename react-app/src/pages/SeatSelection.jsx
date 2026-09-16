import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client.js'

export default function SeatSelection() {
  const { showtimeId } = useParams()
  const navigate = useNavigate()

  const [showtime, setShowtime] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [selectedSeats, setSelectedSeats] = useState(new Set())
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setShowtime(null)
    setLoadError('')
    setSelectedSeats(new Set())
    api(`/showtimes/${showtimeId}`).then(setShowtime).catch((err) => setLoadError(err.message))
  }, [showtimeId])

  const rows = useMemo(() => {
    if (!showtime) return {}
    const grouped = {}
    for (const seat of showtime.seatMap) {
      const row = seat.id[0]
      if (!grouped[row]) grouped[row] = []
      grouped[row].push(seat)
    }
    return grouped
  }, [showtime])

  function toggleSeat(seatId) {
    setSelectedSeats((prev) => {
      const next = new Set(prev)
      if (next.has(seatId)) next.delete(seatId)
      else next.add(seatId)
      return next
    })
  }

  async function handleConfirm() {
    setSubmitError('')
    if (!name.trim() || !email.trim()) {
      setSubmitError('Please enter your name and email.')
      return
    }
    setSubmitting(true)
    try {
      const booking = await api(`/showtimes/${showtimeId}/book`, {
        method: 'POST',
        body: JSON.stringify({ seats: [...selectedSeats], name: name.trim(), email: email.trim() }),
      })
      navigate(`/confirmation/${booking.id}`)
    } catch (err) {
      setSubmitError(err.message)
      setSubmitting(false)
    }
  }

  if (loadError) return <p className="error-text">{loadError}</p>
  if (!showtime) return <p>Loading seats…</p>

  const seatCount = selectedSeats.size
  const total = seatCount * showtime.price

  return (
    <>
      <Link to={`/movie/${showtime.movieId}`} className="back-link">&larr; Back to {showtime.movieTitle}</Link>
      <h1>{showtime.movieTitle}</h1>
      <p className="movie-meta">{showtime.theater} · {showtime.date} · {showtime.time}</p>

      <div className="screen">
        <div className="screen-bar" />
        <div className="screen-label">SCREEN</div>
      </div>

      <div className="seat-map">
        {Object.entries(rows).map(([row, seats]) => (
          <div key={row} className="seat-row">
            <div className="row-label">{row}</div>
            {seats.map((seat) => (
              <div
                key={seat.id}
                className={
                  'seat' +
                  (seat.booked ? ' booked' : '') +
                  (selectedSeats.has(seat.id) ? ' selected' : '')
                }
                onClick={() => !seat.booked && toggleSeat(seat.id)}
              >
                {seat.id}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="legend">
        <div className="legend-item"><div className="legend-swatch" /> Available</div>
        <div className="legend-item"><div className="legend-swatch selected" /> Selected</div>
        <div className="legend-item"><div className="legend-swatch booked" /> Booked</div>
      </div>

      <div className="booking-panel">
        <h3>Your Details</h3>
        <div className="field">
          <label htmlFor="name">Full name</label>
          <input id="name" type="text" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" placeholder="jane@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="summary-row">
          <span>Selected seats</span>
          <span>{seatCount ? [...selectedSeats].sort().join(', ') : 'None'}</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <button className="btn" disabled={seatCount === 0 || submitting} onClick={handleConfirm}>
          {submitting ? 'Booking…' : seatCount === 0 ? 'Select at least one seat' : 'Confirm Booking'}
        </button>
        {submitError && <div className="error-text">{submitError}</div>}
      </div>
    </>
  )
}
