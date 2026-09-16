# CineBook — Sample Movie Ticket Booking App

A small full-stack sample app for browsing movies, picking a showtime, selecting seats, and booking tickets.

## Stack

- **Backend:** Node.js + Express, serving a JSON API with in-memory data (no database needed).
- **Frontend:** Vanilla HTML/CSS/JS single-page app (hash-based routing, no build step).

## Getting started

```bash
npm install
npm start
```

Then open http://localhost:3000 in your browser.

For auto-reload during development:

```bash
npm run dev
```

## Features

- Browse a catalog of movies with genre, rating, and runtime.
- View showtimes (theater, date, time, price) per movie.
- Interactive seat map with available / selected / booked states.
- Book one or more seats with a name and email, with server-side validation
  (no double-booking, required fields, valid seat IDs).
- Confirmation screen with a booking ID and ticket summary.

## API

| Method | Path                              | Description                          |
|--------|------------------------------------|---------------------------------------|
| GET    | `/api/movies`                      | List all movies                       |
| GET    | `/api/movies/:movieId`             | Movie details + its showtimes         |
| GET    | `/api/showtimes/:showtimeId`       | Showtime details + seat map           |
| POST   | `/api/showtimes/:showtimeId/book`  | Book seats `{ seats, name, email }`   |
| GET    | `/api/bookings/:bookingId`         | Retrieve a booking confirmation       |

## Notes

Data is stored in memory and resets whenever the server restarts. This is a
demo app — no real payments are processed and no persistent database is used.

## Tests

```bash
npm test
```
