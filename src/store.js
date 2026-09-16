const { randomUUID } = require('crypto');

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F'];
const SEATS_PER_ROW = 8;

function buildSeatIds() {
  const ids = [];
  for (const row of ROWS) {
    for (let n = 1; n <= SEATS_PER_ROW; n++) {
      ids.push(`${row}${n}`);
    }
  }
  return ids;
}

const ALL_SEAT_IDS = buildSeatIds();

const movies = [
  {
    id: 'm1',
    title: 'Galactic Drift',
    genre: 'Sci-Fi / Adventure',
    duration: 128,
    rating: 'PG-13',
    synopsis: 'A stranded crew races against time to repair their ship before a dying star consumes their only way home.',
    color: '#4f46e5',
  },
  {
    id: 'm2',
    title: 'The Last Recipe',
    genre: 'Drama',
    duration: 110,
    rating: 'PG',
    synopsis: 'A retired chef teaches a rebellious teenager the family recipe that could save their struggling restaurant.',
    color: '#b45309',
  },
  {
    id: 'm3',
    title: 'Midnight Heist',
    genre: 'Thriller / Action',
    duration: 121,
    rating: 'R',
    synopsis: 'Six strangers with nothing to lose plan the one job that could change their lives forever.',
    color: '#991b1b',
  },
  {
    id: 'm4',
    title: 'Paws & Reflect',
    genre: 'Animation / Family',
    duration: 96,
    rating: 'G',
    synopsis: 'A lost puppy and a lonely inventor team up to find their way back home across a fantastical city.',
    color: '#0f766e',
  },
];

const showtimes = [];

function seedShowtimes() {
  const theaters = ['Screen 1', 'Screen 2', 'Screen 3'];
  const times = ['13:30', '16:45', '19:15', '21:50'];
  let counter = 1;

  for (const movie of movies) {
    for (let i = 0; i < 3; i++) {
      const theater = theaters[i % theaters.length];
      const time = times[(i + movies.indexOf(movie)) % times.length];
      showtimes.push({
        id: `s${counter++}`,
        movieId: movie.id,
        theater,
        time,
        date: '2026-09-18',
        price: 12.5,
        bookedSeats: new Set(),
      });
    }
  }
}

seedShowtimes();

const bookings = new Map();

function getMovies() {
  return movies;
}

function getMovie(movieId) {
  return movies.find((m) => m.id === movieId) || null;
}

function getShowtimesForMovie(movieId) {
  return showtimes.filter((s) => s.movieId === movieId);
}

function getShowtime(showtimeId) {
  return showtimes.find((s) => s.id === showtimeId) || null;
}

function getSeatMap(showtimeId) {
  const showtime = getShowtime(showtimeId);
  if (!showtime) return null;
  return ALL_SEAT_IDS.map((id) => ({
    id,
    booked: showtime.bookedSeats.has(id),
  }));
}

function createBooking(showtimeId, seatIds, customer) {
  const showtime = getShowtime(showtimeId);
  if (!showtime) {
    return { error: 'Showtime not found' };
  }
  if (!Array.isArray(seatIds) || seatIds.length === 0) {
    return { error: 'At least one seat must be selected' };
  }
  const invalidSeat = seatIds.find((id) => !ALL_SEAT_IDS.includes(id));
  if (invalidSeat) {
    return { error: `Invalid seat: ${invalidSeat}` };
  }
  const alreadyBooked = seatIds.filter((id) => showtime.bookedSeats.has(id));
  if (alreadyBooked.length > 0) {
    return { error: `Seat(s) already booked: ${alreadyBooked.join(', ')}` };
  }
  if (!customer || !customer.name || !customer.email) {
    return { error: 'Customer name and email are required' };
  }

  for (const id of seatIds) {
    showtime.bookedSeats.add(id);
  }

  const movie = getMovie(showtime.movieId);
  const booking = {
    id: randomUUID(),
    showtimeId,
    movieTitle: movie ? movie.title : 'Unknown',
    theater: showtime.theater,
    date: showtime.date,
    time: showtime.time,
    seats: seatIds,
    totalPrice: Number((seatIds.length * showtime.price).toFixed(2)),
    customer: { name: customer.name, email: customer.email },
    createdAt: new Date().toISOString(),
  };
  bookings.set(booking.id, booking);
  return { booking };
}

function getBooking(bookingId) {
  return bookings.get(bookingId) || null;
}

module.exports = {
  getMovies,
  getMovie,
  getShowtimesForMovie,
  getShowtime,
  getSeatMap,
  createBooking,
  getBooking,
};
