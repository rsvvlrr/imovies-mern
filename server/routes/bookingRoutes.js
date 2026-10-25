import { Router } from "express";
import crypto from "node:crypto";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const validSeat = /^[A-F][1-8]$/;

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { movieId, showDate, showtime } = req.body;
    const seats = Array.isArray(req.body.seats) ? req.body.seats : [];
    if (!/^[0-9a-fA-F]{24}$/.test(String(movieId || ""))) return res.status(400).json({ message: "Choose a valid movie." });
    if (!showDate || !/^\\d{4}-\\d{2}-\\d{2}$/.test(showDate)) return res.status(400).json({ message: "Choose a valid show date." });
    if (!/^([01]\\d|2[0-3]):[0-5]\\d$/.test(String(showtime || ""))) return res.status(400).json({ message: "Choose a valid showtime." });
    if (!seats.length || seats.length > 8 || new Set(seats).size !== seats.length || !seats.every(s => typeof s === "string" && validSeat.test(s))) {
      return res.status(400).json({ message: "Choose 1–8 unique valid seats." });
    }
    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: "Movie not found." });
    if (!movie.showtimes.includes(showtime)) return res.status(400).json({ message: "That showtime is not available for this movie." });

    const existing = await Booking.find({
      movie: movieId, showDate, showtime, status: "confirmed",
      seats: { $in: seats }
    }).select("seats").lean();
    const occupied = new Set(existing.flatMap(b => b.seats));
    const conflicts = seats.filter(s => occupied.has(s));
    if (conflicts.length) return res.status(409).json({ message: `These seats have already been booked: ${conflicts.join(", ")}` });

    // Basic application-level check for this learning project. For high concurrency,
    // use a transaction and a unique seat-allocation model on a replica set.
    const booking = await Booking.create({
      bookingCode: `IM-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
      user: req.userId, movie: movieId, showDate, showtime, seats,
      totalAmount: seats.length * 250
    });
    const populated = await booking.populate("movie", "title poster genre");
    res.status(201).json({ booking: populated });
  } catch (error) { next(error); }
});

router.get("/mine", requireAuth, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.userId }).populate("movie", "title poster genre").sort({ createdAt: -1 }).lean();
    res.json({ bookings });
  } catch (error) { next(error); }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.userId });
    if (!booking) return res.status(404).json({ message: "Booking not found." });
    booking.status = "cancelled";
    await booking.save();
    res.json({ message: "Booking cancelled.", booking });
  } catch (error) { next(error); }
});

export default router;