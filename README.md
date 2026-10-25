# IMovies — MERN Movie Ticket Booking

A full-stack learning project built with React + Vite, Express, MongoDB/Mongoose and JWT authentication.

## Features
- Responsive cinematic movie catalogue with search and genre filters
- Movie details and showtime selection
- Seat selection UI and booking flow
- Register/login with hashed passwords and JWT
- Protected “My Bookings” view
- REST API for movies, authentication, and bookings
- Server-side seat availability checks to reduce duplicate bookings
- Demo movie seed endpoint for local development

> This is an educational starter project, not a production ticketing platform. Before real public use, add rate limiting, email verification, payment-provider integration, stronger operational monitoring, and a transactional booking strategy appropriate for your MongoDB deployment.

## Requirements
- Node.js 20.19+ or 22.12+
- MongoDB local instance or MongoDB Atlas connection string
- npm

## 1. Install
From this folder:
```bash
npm install
```

## 2. Configure the server
Copy `server/.env.example` to `server/.env` and set `MONGODB_URI` and a long random `JWT_SECRET`.

Example local MongoDB URI:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/imovies
JWT_SECRET=replace_with_a_long_random_secret
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

## 3. Run the app
```bash
npm run dev
```
- Frontend: http://localhost:5173
- API health: http://localhost:5000/api/health

## 4. Add demo movies
With the server running, send:
```bash
curl -X POST http://localhost:5000/api/movies/seed
```
The seed endpoint only inserts sample data when the movie collection is empty. Do not expose this endpoint in a production deployment; remove or protect it before publishing.

## 5. Build frontend
```bash
npm run build
```

## API overview
- `GET /api/health`
- `GET /api/movies`
- `GET /api/movies/:id`
- `POST /api/movies/seed` (development only)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token)
- `POST /api/bookings` (Bearer token)
- `GET /api/bookings/mine` (Bearer token)
- `DELETE /api/bookings/:id` (Bearer token; cancels booking record)

## Upload to GitHub
1. Create a new empty repository on GitHub.
2. Open this folder in VS Code.
3. In the terminal:
```bash
git init
git add .
git commit -m "Build IMovies MERN ticket booking app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```
Replace the remote URL with your own repository URL. Never commit `.env` or real secrets.

## Deployment
Deploy the client and server separately (for example, a static frontend host and a Node.js host). Set the frontend `VITE_API_URL` to the deployed API base URL, and set the server environment variables in the host dashboard. Configure `CLIENT_ORIGIN` to the deployed frontend origin. Use a hosted MongoDB database.
