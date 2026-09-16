const express = require('express');
const path = require('path');
const store = require('./src/store');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/movies', (req, res) => {
  res.json(store.getMovies());
});

app.get('/api/movies/:movieId', (req, res) => {
  const movie = store.getMovie(req.params.movieId);
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  const showtimes = store.getShowtimesForMovie(movie.id).map(({ bookedSeats, ...rest }) => rest);
  res.json({ ...movie, showtimes });
});

app.get('/api/showtimes/:showtimeId', (req, res) => {
  const showtime = store.getShowtime(req.params.showtimeId);
  if (!showtime) return res.status(404).json({ error: 'Showtime not found' });
  const movie = store.getMovie(showtime.movieId);
  const seatMap = store.getSeatMap(showtime.id);
  const { bookedSeats, ...rest } = showtime;
  res.json({ ...rest, movieTitle: movie ? movie.title : null, seatMap });
});

app.post('/api/showtimes/:showtimeId/book', (req, res) => {
  const { seats, name, email } = req.body || {};
  const result = store.createBooking(req.params.showtimeId, seats, { name, email });
  if (result.error) return res.status(400).json({ error: result.error });
  res.status(201).json(result.booking);
});

app.get('/api/bookings/:bookingId', (req, res) => {
  const booking = store.getBooking(req.params.bookingId);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  res.json(booking);
});

app.listen(PORT, () => {
  console.log(`Movie ticket booking app running at http://localhost:${PORT}`);
});
