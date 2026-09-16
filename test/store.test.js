const { test } = require('node:test');
const assert = require('node:assert/strict');
const store = require('../src/store');

test('lists movies', () => {
  const movies = store.getMovies();
  assert.ok(movies.length > 0);
});

test('gets showtimes for a movie', () => {
  const movies = store.getMovies();
  const showtimes = store.getShowtimesForMovie(movies[0].id);
  assert.ok(showtimes.length > 0);
});

test('seat map starts fully available', () => {
  const movies = store.getMovies();
  const [showtime] = store.getShowtimesForMovie(movies[0].id);
  const seatMap = store.getSeatMap(showtime.id);
  assert.ok(seatMap.every((s) => !s.booked));
});

test('creates a booking and marks seats as booked', () => {
  const movies = store.getMovies();
  const [showtime] = store.getShowtimesForMovie(movies[1].id);
  const result = store.createBooking(showtime.id, ['A1', 'A2'], {
    name: 'Test User',
    email: 'test@example.com',
  });
  assert.ok(result.booking);
  assert.equal(result.booking.seats.length, 2);
  assert.equal(result.booking.totalPrice, showtime.price * 2);

  const seatMap = store.getSeatMap(showtime.id);
  const a1 = seatMap.find((s) => s.id === 'A1');
  assert.equal(a1.booked, true);
});

test('rejects double-booking the same seat', () => {
  const movies = store.getMovies();
  const [showtime] = store.getShowtimesForMovie(movies[2].id);
  store.createBooking(showtime.id, ['B1'], { name: 'A', email: 'a@example.com' });
  const result = store.createBooking(showtime.id, ['B1'], { name: 'B', email: 'b@example.com' });
  assert.ok(result.error);
});

test('rejects booking without customer info', () => {
  const movies = store.getMovies();
  const [showtime] = store.getShowtimesForMovie(movies[3].id);
  const result = store.createBooking(showtime.id, ['C1'], { name: '', email: '' });
  assert.ok(result.error);
});

test('rejects invalid seat id', () => {
  const movies = store.getMovies();
  const [showtime] = store.getShowtimesForMovie(movies[0].id);
  const result = store.createBooking(showtime.id, ['Z9'], { name: 'A', email: 'a@example.com' });
  assert.ok(result.error);
});

test('retrieves a booking by id', () => {
  const movies = store.getMovies();
  const [showtime] = store.getShowtimesForMovie(movies[0].id);
  const { booking } = store.createBooking(showtime.id, ['D1'], {
    name: 'Retrieve Test',
    email: 'retrieve@example.com',
  });
  const fetched = store.getBooking(booking.id);
  assert.equal(fetched.id, booking.id);
});
