import { Link, Route, Routes } from 'react-router-dom'
import MovieList from './pages/MovieList.jsx'
import MovieDetail from './pages/MovieDetail.jsx'
import SeatSelection from './pages/SeatSelection.jsx'
import Confirmation from './pages/Confirmation.jsx'

export default function App() {
  return (
    <>
      <header className="topbar">
        <Link to="/" className="brand">🎬 CineBook</Link>
      </header>

      <main className="app">
        <Routes>
          <Route path="/" element={<MovieList />} />
          <Route path="/movie/:movieId" element={<MovieDetail />} />
          <Route path="/showtime/:showtimeId" element={<SeatSelection />} />
          <Route path="/confirmation/:bookingId" element={<Confirmation />} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>

      <footer className="footer">Sample app for demo purposes only. No real payments are processed.</footer>
    </>
  )
}
