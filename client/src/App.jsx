import React from 'react';
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, CalendarDays, Clapperboard, Clock3, Film, LogIn,
  LogOut, Search, ShieldCheck, Star, Ticket, UserRound, X, Check
} from "lucide-react";
import { api, getToken } from "./api";

const fallbackMovies = [
  { _id:"demo-1", title:"Interstellar", genre:"Sci-Fi", year:2014, rating:8.7, duration:"2h 49m", poster:"https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", description:"A team of explorers travels beyond this galaxy to discover a future for humanity.", showtimes:["12:30","15:45","19:00"] },
  { _id:"demo-2", title:"Dune: Part Two", genre:"Adventure", year:2024, rating:8.5, duration:"2h 46m", poster:"https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg", description:"A journey across a desert world where destiny, courage and power collide.", showtimes:["11:15","16:00","20:15"] },
  { _id:"demo-3", title:"The Batman", genre:"Action", year:2022, rating:7.8, duration:"2h 56m", poster:"https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg", description:"A detective uncovers a dangerous mystery hidden beneath a city's surface.", showtimes:["10:30","14:20","18:40"] },
  { _id:"demo-4", title:"Avatar: The Way of Water", genre:"Fantasy", year:2022, rating:7.5, duration:"3h 12m", poster:"https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg", description:"Explore a breathtaking world of oceans, family and extraordinary creatures.", showtimes:["12:00","16:30","20:00"] },
  { _id:"demo-5", title:"Oppenheimer", genre:"Drama", year:2023, rating:8.3, duration:"3h 00m", poster:"https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg", description:"A historical drama about scientific ambition and its far-reaching consequences.", showtimes:["11:00","15:10","19:30"] },
  { _id:"demo-6", title:"Spider-Man: Across the Spider-Verse", genre:"Animation", year:2023, rating:8.6, duration:"2h 20m", poster:"https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg", description:"An animated adventure through a multiverse of extraordinary Spider-heroes.", showtimes:["10:45","14:00","18:15"] }
];
const genres = ["All", "Sci-Fi", "Action", "Adventure", "Drama", "Fantasy", "Animation"];
const seats = Array.from({ length: 48 }, (_, i) => `${String.fromCharCode(65 + Math.floor(i / 8))}${(i % 8) + 1}`);
const rupees = n => `₹${n}`;

export default function App() {
  const [movies, setMovies] = useState(fallbackMovies);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [modal, setModal] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("imovies_user") || "null"); } catch { return null; }
  });
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showtime, setShowtime] = useState("");
  const [bookings, setBookings] = useState([]);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api("/movies").then(data => { if (data.movies?.length) setMovies(data.movies); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (user && getToken()) api("/bookings/mine").then(data => setBookings(data.bookings || [])).catch(() => {});
  }, [user]);

  const filteredMovies = useMemo(() => movies.filter(movie =>
    movie.title.toLowerCase().includes(search.toLowerCase()) &&
    (genre === "All" || movie.genre === genre)
  ), [movies, search, genre]);

  function openBooking(movie) {
    setSelectedSeats([]);
    setShowtime(movie.showtimes?.[0] || "19:00");
    setModal({ type: "booking", movie });
  }

  async function submitAuth(event) {
    event.preventDefault();
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const data = await api(`/auth/${authMode}`, { method: "POST", body: payload });
      localStorage.setItem("imovies_token", data.token);
      localStorage.setItem("imovies_user", JSON.stringify(data.user));
      setUser(data.user);
      setModal(null);
      setNotice(`Welcome${data.user.name ? `, ${data.user.name}` : ""}! You are signed in.`);
    } catch (err) { setNotice(err.message); }
    finally { setBusy(false); }
  }

  async function confirmBooking() {
    if (!user || !getToken()) {
      setAuthMode("login");
      setModal({ type: "auth" });
      setNotice("Please sign in before confirming your booking.");
      return;
    }
    if (!selectedSeats.length || !showtime) {
      setNotice("Choose a showtime and at least one seat.");
      return;
    }
    if (String(modal.movie._id).startsWith("demo-")) {
      setNotice("Demo catalogue is active. Add sample movies to MongoDB to enable saved bookings.");
      return;
    }
    setBusy(true);
    try {
      const data = await api("/bookings", {
        method: "POST",
        body: { movieId: modal.movie._id, showtime, seats: selectedSeats, showDate: new Date().toISOString().slice(0,10) }
      });
      setBookings(old => [data.booking, ...old]);
      setModal(null);
      setNotice(`Booking confirmed! Reference: ${data.booking.bookingCode}`);
    } catch (err) { setNotice(err.message); }
    finally { setBusy(false); }
  }

  async function loadBookings() {
    if (!user) { setAuthMode("login"); setModal({ type: "auth" }); return; }
    try {
      const data = await api("/bookings/mine");
      setBookings(data.bookings || []);
      setModal({ type: "bookings" });
    } catch (err) { setNotice(err.message); }
  }

  function signOut() {
    localStorage.removeItem("imovies_token");
    localStorage.removeItem("imovies_user");
    setUser(null);
    setBookings([]);
    setNotice("You have signed out.");
  }

  return <div className="app-shell" id="home">
    <header className="navbar">
      <a className="brand" href="#home"><span className="brand-icon"><Clapperboard size={22}/></span><span>i<span className="accent">Movies</span></span></a>
      <nav className="nav-links"><a href="#home">Discover</a><a href="#movies">Movies</a><a href="#about">About</a></nav>
      <div className="nav-actions">
        <label className="search-box"><Search size={16}/><input aria-label="Search movies" placeholder="Search movies..." value={search} onChange={e=>setSearch(e.target.value)}/></label>
        <button className="icon-button" aria-label="My bookings" onClick={loadBookings}><Ticket size={18}/></button>
        {user ? <button className="avatar" title="Sign out" onClick={signOut}><LogOut size={17}/></button> : <button className="avatar" title="Sign in" onClick={()=>{setAuthMode("login");setModal({type:"auth"});}}><UserRound size={18}/></button>}
      </div>
    </header>

    <main className="main-content">
      <section className="hero">
        <div className="hero-content">
          <div className="eyebrow"><span className="live-dot"/> YOUR NEXT CINEMATIC EXPERIENCE</div>
          <h1>Every story<br/>deserves a <span>big screen.</span></h1>
          <p>Discover extraordinary stories, explore your next favourite film, and make every movie night memorable.</p>
          <div className="hero-actions"><a href="#movies" className="primary-button">Explore movies <ArrowRight size={16}/></a><a href="#movies" className="secondary-button"><Film size={16}/> Browse collection</a></div>
          <div className="hero-stats"><div><strong>{movies.length.toString().padStart(2,"0")}</strong><span>Curated titles</span></div><div><strong>{genres.length-1}</strong><span>Genres to explore</span></div><div><strong>01</strong><span>Perfect movie night</span></div></div>
        </div>
        <div className="hero-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="hero-poster"><img src={movies[0]?.poster} alt={movies[0]?.title}/><div className="poster-overlay"><span>FEATURED FILM</span><h2>{movies[0]?.title}</h2><div className="poster-meta"><span><Star size={13} fill="currentColor"/> {movies[0]?.rating}</span><span><Clock3 size={13}/> {movies[0]?.duration}</span></div></div></div><div className="floating-note"><Clapperboard size={19}/><div><strong>Lights. Camera.</strong><span>Your next favourite.</span></div></div></div>
      </section>

      <section className="movies-section" id="movies">
        <div className="section-heading"><div><div className="eyebrow"><CalendarDays size={14}/> THE COLLECTION</div><h2>Find your <span>next favourite.</span></h2><p>Handpicked stories for every kind of movie lover.</p></div><div className="movie-count"><strong>{filteredMovies.length.toString().padStart(2,"0")}</strong><span>FILMS FOUND</span></div></div>
        <div className="genre-list">{genres.map(item=><button key={item} onClick={()=>setGenre(item)} className={`genre-chip ${genre===item?"active":""}`}>{item}</button>)}</div>
        {filteredMovies.length ? <div className="movie-grid">{filteredMovies.map(movie=><article className="movie-card" key={movie._id}><button className="movie-poster" onClick={()=>setModal({type:"details",movie})} aria-label={`View ${movie.title} details`}><img src={movie.poster} alt={movie.title} loading="lazy"/><span className="rating"><Star size={12} fill="currentColor"/> {movie.rating}</span><span className="poster-cta">View details <ArrowRight size={14}/></span></button><div className="movie-info"><div className="movie-meta">{movie.genre} <span>•</span> {movie.year}</div><h3>{movie.title}</h3><div className="movie-bottom"><span><Clock3 size={13}/> {movie.duration}</span><button className="round-arrow" onClick={()=>openBooking(movie)} aria-label={`Book ${movie.title}`}><Ticket size={15}/></button></div></div></article>)}</div> : <div className="empty-state"><Search size={28}/><h3>No movies found</h3><p>Try another title or genre.</p><button className="primary-button" onClick={()=>{setSearch("");setGenre("All");}}>Reset filters</button></div>}
      </section>

      <section className="booking-banner"><div className="banner-icon"><Clapperboard size={26}/></div><div><span className="eyebrow">YOUR SEAT IS WAITING</span><h2>Great stories. Better evenings.</h2><p>Choose a film and start planning your next cinema visit.</p></div><a href="#movies" className="primary-button">Find a movie <ArrowRight size={15}/></a></section>
      <footer id="about"><a href="#home" className="brand"><Clapperboard size={20}/> i<span className="accent">Movies</span></a><p>Crafted for the love of cinema. © 2026 IMovies.</p><span className="footer-security"><ShieldCheck size={14}/> Secure account flow</span></footer>
    </main>

    {notice && <div className="toast" role="status">{notice}<button onClick={()=>setNotice("")} aria-label="Dismiss notification"><X size={15}/></button></div>}

    {modal && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(null);}}>
      <section className="modal" role="dialog" aria-modal="true">
        <button className="modal-close" onClick={()=>setModal(null)} aria-label="Close"><X size={18}/></button>
        {modal.type==="auth" && <div className="auth-panel"><div className="modal-icon"><Clapperboard size={24}/></div><span className="eyebrow">WELCOME TO IMOVIES</span><h2>{authMode==="login"?"Your next movie night awaits.":"Create your account."}</h2><p className="muted">Sign in to manage your cinema bookings.</p><form onSubmit={submitAuth} className="auth-form">{authMode==="register" && <label>Full name<input name="name" placeholder="Your name" required minLength="2"/></label>}<label>Email address<input type="email" name="email" placeholder="you@example.com" required/></label><label>Password<input type="password" name="password" placeholder="At least 8 characters" required minLength="8"/></label><button className="primary-button full-width" disabled={busy}>{busy?"Please wait…":authMode==="login"?"Sign in":"Create account"} <ArrowRight size={16}/></button></form><p className="switch-auth">{authMode==="login"?"New to IMovies?":"Already have an account?"} <button onClick={()=>setAuthMode(authMode==="login"?"register":"login")}>{authMode==="login"?"Create account":"Sign in"}</button></p></div>}
        {modal.type==="details" && <div className="detail-modal"><img className="detail-poster" src={modal.movie.poster} alt={modal.movie.title}/><div className="detail-copy"><span className="eyebrow">MOVIE SPOTLIGHT</span><h2>{modal.movie.title}</h2><p>{modal.movie.genre} · {modal.movie.year} · {modal.movie.duration}</p><div className="modal-rating"><Star size={15} fill="currentColor"/> {modal.movie.rating} / 10</div><p>{modal.movie.description}</p><button className="primary-button" onClick={()=>openBooking(modal.movie)}>Choose showtime <ArrowRight size={16}/></button></div></div>}
        {modal.type==="booking" && <div className="booking-modal"><span className="eyebrow">RESERVE YOUR EXPERIENCE</span><h2>{modal.movie.title}</h2><p className="muted">Select a showtime, then choose your seats.</p><label className="field-label">SHOWTIME</label><div className="showtimes">{(modal.movie.showtimes||["12:30","16:00","19:00"]).map(t=><button key={t} className={showtime===t?"selected":""} onClick={()=>{setShowtime(t);setSelectedSeats([]);}}>{t}</button>)}</div><div className="screen">SCREEN THIS WAY</div><div className="seat-grid">{seats.map((seat,i)=>{const unavailable=[3,10,16,21,27,35,42].includes(i);const active=selectedSeats.includes(seat);return <button key={seat} disabled={unavailable} className={`seat ${unavailable?"taken":active?"chosen":""}`} onClick={()=>setSelectedSeats(old=>active?old.filter(s=>s!==seat):[...old,seat])} aria-label={`Seat ${seat}`} title={unavailable?"Unavailable":seat}>{unavailable?"×":seat.slice(-1)}</button>;})}</div><div className="seat-legend"><span><i/> Available</span><span><i className="chosen-key"/> Selected</span><span><i className="taken-key"/> Unavailable</span></div><div className="booking-summary"><div><span>{selectedSeats.length} seat(s) selected</span><strong>{selectedSeats.length?selectedSeats.join(", "):"Choose your seats"}</strong></div><div><span>Total</span><strong>{rupees(selectedSeats.length*250)}</strong></div></div><button className="primary-button full-width" disabled={busy||!selectedSeats.length} onClick={confirmBooking}>{busy?"Processing…":user?"Confirm booking":"Sign in to continue"} <ArrowRight size={16}/></button><p className="fine-print">Demo price ₹250 per seat. Payment processing is not connected.</p></div>}
        {modal.type==="bookings" && <div className="bookings-panel"><span className="eyebrow">YOUR CINEMA HISTORY</span><h2>My bookings</h2>{bookings.length ? <div className="booking-list">{bookings.map(b=><article key={b._id} className="booking-item"><div className="booking-item-icon"><Ticket size={19}/></div><div><strong>{b.movie?.title || "Movie booking"}</strong><p>{b.showDate} · {b.showtime} · {b.seats?.join(", ")}</p><span>Reference: {b.bookingCode}</span></div><span className="confirmed"><Check size={13}/> Saved</span></article>)}</div>:<div className="empty-state"><Ticket size={28}/><h3>No bookings yet</h3><p>Your confirmed bookings will appear here.</p><button className="primary-button" onClick={()=>{setModal(null);document.querySelector("#movies")?.scrollIntoView({behavior:"smooth"});}}>Browse movies</button></div>}</div>}
      </section>
    </div>}
  </div>;
}