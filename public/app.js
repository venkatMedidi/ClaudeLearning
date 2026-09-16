const appEl = document.getElementById('app');
document.getElementById('brand-link').addEventListener('click', () => navigate('#/'));

const state = {
  selectedSeats: new Set(),
};

function navigate(hash) {
  window.location.hash = hash;
}

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', render);

async function api(path, options) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function route() {
  const hash = window.location.hash || '#/';
  const parts = hash.replace(/^#\//, '').split('/').filter(Boolean);
  return parts;
}

async function render() {
  const parts = route();
  try {
    if (parts.length === 0) {
      await renderMovieList();
    } else if (parts[0] === 'movie' && parts[1]) {
      await renderMovieDetail(parts[1]);
    } else if (parts[0] === 'showtime' && parts[1]) {
      await renderSeatSelection(parts[1]);
    } else if (parts[0] === 'confirmation' && parts[1]) {
      await renderConfirmation(parts[1]);
    } else {
      appEl.innerHTML = '<p>Page not found.</p>';
    }
  } catch (err) {
    appEl.innerHTML = `<p class="error-text">${escapeHtml(err.message)}</p>`;
  }
}

async function renderMovieList() {
  appEl.innerHTML = '<p>Loading movies…</p>';
  const movies = await api('/movies');
  appEl.innerHTML = `
    <h1>Now Showing</h1>
    <div class="movie-grid">
      ${movies.map((m) => `
        <div class="movie-card" data-id="${m.id}">
          <div class="movie-poster" style="background:${m.color}">🎬</div>
          <div class="movie-body">
            <div class="movie-title">${escapeHtml(m.title)}</div>
            <div class="movie-meta">${escapeHtml(m.genre)} · ${m.duration} min</div>
            <span class="badge">${escapeHtml(m.rating)}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  appEl.querySelectorAll('.movie-card').forEach((card) => {
    card.addEventListener('click', () => navigate(`#/movie/${card.dataset.id}`));
  });
}

async function renderMovieDetail(movieId) {
  appEl.innerHTML = '<p>Loading…</p>';
  const movie = await api(`/movies/${movieId}`);
  appEl.innerHTML = `
    <span class="back-link" id="back">&larr; Back to movies</span>
    <div class="detail-header">
      <div class="detail-poster" style="background:${movie.color}">🎬</div>
      <div>
        <h1>${escapeHtml(movie.title)}</h1>
        <div class="movie-meta">${escapeHtml(movie.genre)} · ${movie.duration} min · ${escapeHtml(movie.rating)}</div>
        <p>${escapeHtml(movie.synopsis)}</p>
      </div>
    </div>
    <h2>Showtimes</h2>
    <div class="showtime-list">
      ${movie.showtimes.map((s) => `
        <div class="showtime-card" data-id="${s.id}">
          <div class="time">${s.time}</div>
          <div class="theater">${escapeHtml(s.theater)} · ${s.date}</div>
          <div class="price">$${s.price.toFixed(2)}</div>
        </div>
      `).join('')}
    </div>
  `;
  document.getElementById('back').addEventListener('click', () => navigate('#/'));
  appEl.querySelectorAll('.showtime-card').forEach((card) => {
    card.addEventListener('click', () => navigate(`#/showtime/${card.dataset.id}`));
  });
}

async function renderSeatSelection(showtimeId) {
  appEl.innerHTML = '<p>Loading seats…</p>';
  const showtime = await api(`/showtimes/${showtimeId}`);
  state.selectedSeats = new Set();

  const rows = {};
  for (const seat of showtime.seatMap) {
    const row = seat.id[0];
    if (!rows[row]) rows[row] = [];
    rows[row].push(seat);
  }

  appEl.innerHTML = `
    <span class="back-link" id="back">&larr; Back to ${escapeHtml(showtime.movieTitle)}</span>
    <h1>${escapeHtml(showtime.movieTitle)}</h1>
    <p class="movie-meta">${escapeHtml(showtime.theater)} · ${showtime.date} · ${showtime.time}</p>

    <div class="screen">
      <div class="screen-bar"></div>
      <div class="screen-label">SCREEN</div>
    </div>

    <div class="seat-map" id="seat-map">
      ${Object.entries(rows).map(([row, seats]) => `
        <div class="seat-row">
          <div class="row-label">${row}</div>
          ${seats.map((seat) => `
            <div class="seat${seat.booked ? ' booked' : ''}" data-id="${seat.id}">${seat.id}</div>
          `).join('')}
        </div>
      `).join('')}
    </div>

    <div class="legend">
      <div class="legend-item"><div class="legend-swatch"></div> Available</div>
      <div class="legend-item"><div class="legend-swatch selected"></div> Selected</div>
      <div class="legend-item"><div class="legend-swatch booked"></div> Booked</div>
    </div>

    <div class="booking-panel">
      <h3>Your Details</h3>
      <div class="field">
        <label for="name">Full name</label>
        <input type="text" id="name" placeholder="Jane Doe" />
      </div>
      <div class="field">
        <label for="email">Email</label>
        <input type="email" id="email" placeholder="jane@example.com" />
      </div>
      <div class="summary-row"><span>Selected seats</span><span id="seats-summary">None</span></div>
      <div class="summary-row total"><span>Total</span><span id="total-summary">$0.00</span></div>
      <button class="btn" id="confirm-btn" disabled>Select at least one seat</button>
      <div id="error" class="error-text"></div>
    </div>
  `;

  document.getElementById('back').addEventListener('click', () => navigate(`#/movie/${showtime.movieId}`));

  appEl.querySelectorAll('.seat:not(.booked)').forEach((seatEl) => {
    seatEl.addEventListener('click', () => {
      const id = seatEl.dataset.id;
      if (state.selectedSeats.has(id)) {
        state.selectedSeats.delete(id);
        seatEl.classList.remove('selected');
      } else {
        state.selectedSeats.add(id);
        seatEl.classList.add('selected');
      }
      updateSummary(showtime.price);
    });
  });

  document.getElementById('confirm-btn').addEventListener('click', async () => {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const errorEl = document.getElementById('error');
    errorEl.textContent = '';

    if (!name || !email) {
      errorEl.textContent = 'Please enter your name and email.';
      return;
    }

    const btn = document.getElementById('confirm-btn');
    btn.disabled = true;
    btn.textContent = 'Booking…';

    try {
      const booking = await api(`/showtimes/${showtimeId}/book`, {
        method: 'POST',
        body: JSON.stringify({ seats: [...state.selectedSeats], name, email }),
      });
      navigate(`#/confirmation/${booking.id}`);
    } catch (err) {
      errorEl.textContent = err.message;
      btn.disabled = false;
      btn.textContent = 'Confirm Booking';
    }
  });

  function updateSummary(price) {
    const seats = [...state.selectedSeats].sort();
    document.getElementById('seats-summary').textContent = seats.length ? seats.join(', ') : 'None';
    document.getElementById('total-summary').textContent = `$${(seats.length * price).toFixed(2)}`;
    const btn = document.getElementById('confirm-btn');
    btn.disabled = seats.length === 0;
    btn.textContent = seats.length === 0 ? 'Select at least one seat' : 'Confirm Booking';
  }
}

async function renderConfirmation(bookingId) {
  appEl.innerHTML = '<p>Loading…</p>';
  const booking = await api(`/bookings/${bookingId}`);
  appEl.innerHTML = `
    <div class="confirmation">
      <div class="check">✅</div>
      <h1>Booking Confirmed!</h1>
      <p>A confirmation has been sent to ${escapeHtml(booking.customer.email)}.</p>
      <div class="booking-id">${escapeHtml(booking.id)}</div>
      <div class="ticket-details">
        <div class="summary-row"><span>Movie</span><span>${escapeHtml(booking.movieTitle)}</span></div>
        <div class="summary-row"><span>Theater</span><span>${escapeHtml(booking.theater)}</span></div>
        <div class="summary-row"><span>Date &amp; time</span><span>${booking.date} · ${booking.time}</span></div>
        <div class="summary-row"><span>Seats</span><span>${booking.seats.join(', ')}</span></div>
        <div class="summary-row total"><span>Total paid</span><span>$${booking.totalPrice.toFixed(2)}</span></div>
      </div>
      <button class="btn secondary" id="home-btn">Book another movie</button>
    </div>
  `;
  document.getElementById('home-btn').addEventListener('click', () => navigate('#/'));
}
