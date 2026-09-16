import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client.js'

export default function Confirmation() {
  const { bookingId } = useParams()
  const [booking, setBooking] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api(`/bookings/${bookingId}`).then(setBooking).catch((err) => setError(err.message))
  }, [bookingId])

  if (error) return <p className="error-text">{error}</p>
  if (!booking) return <p>Loading…</p>

  return (
    <div className="confirmation">
      <div className="check">✅</div>
      <h1>Booking Confirmed!</h1>
      <p>A confirmation has been sent to {booking.customer.email}.</p>
      <div className="booking-id">{booking.id}</div>
      <div className="ticket-details">
        <div className="summary-row"><span>Movie</span><span>{booking.movieTitle}</span></div>
        <div className="summary-row"><span>Theater</span><span>{booking.theater}</span></div>
        <div className="summary-row"><span>Date &amp; time</span><span>{booking.date} · {booking.time}</span></div>
        <div className="summary-row"><span>Seats</span><span>{booking.seats.join(', ')}</span></div>
        <div className="summary-row total"><span>Total paid</span><span>${booking.totalPrice.toFixed(2)}</span></div>
      </div>
      <button className="btn secondary" onClick={() => navigate('/')}>Book another movie</button>
    </div>
  )
}
