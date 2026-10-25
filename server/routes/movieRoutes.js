import { Router } from "express";
import Movie from "../models/Movie.js";

const router = Router();

const demoMovies = [
  { title:"Interstellar", genre:"Sci-Fi", year:2014, rating:8.7, duration:"2h 49m", poster:"https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", description:"A team of explorers travels beyond this galaxy to discover a future for humanity.", showtimes:["12:30","15:45","19:00"] },
  { title:"Dune: Part Two", genre:"Adventure", year:2024, rating:8.5, duration:"2h 46m", poster:"https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg", description:"A journey across a desert world where destiny, courage and power collide.", showtimes:["11:15","16:00","20:15"] },
  { title:"The Batman", genre:"Action", year:2022, rating:7.8, duration:"2h 56m", poster:"https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg", description:"A detective uncovers a dangerous mystery hidden beneath a city's surface.", showtimes:["10:30","14:20","18:40"] },
  { title:"Avatar: The Way of Water", genre:"Fantasy", year:2022, rating:7.5, duration:"3h 12m", poster:"https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg", description:"Explore a breathtaking world of oceans, family and extraordinary creatures.", showtimes:["12:00","16:30","20:00"] },
  { title:"Oppenheimer", genre:"Drama", year:2023, rating:8.3, duration:"3h 00m", poster:"https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg", description:"A historical drama about scientific ambition and its far-reaching consequences.", showtimes:["11:00","15:10","19:30"] },
  { title:"Spider-Man: Across the Spider-Verse", genre:"Animation", year:2023, rating:8.6, duration:"2h 20m", poster:"https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg", description:"An animated adventure through a multiverse of extraordinary Spider-heroes.", showtimes:["10:45","14:00","18:15"] }
];

router.get("/", async (_req, res, next) => {
  try {
    const movies = await Movie.find().sort({ title: 1 }).lean();
    res.json({ movies });
  } catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) return res.status(400).json({ message: "Invalid movie id." });
    const movie = await Movie.findById(req.params.id).lean();
    if (!movie) return res.status(404).json({ message: "Movie not found." });
    res.json({ movie });
  } catch (error) { next(error); }
});

// Development helper: seed only if collection is empty. Remove/protect before production.
router.post("/seed", async (_req, res, next) => {
  try {
    const count = await Movie.countDocuments();
    if (count > 0) return res.json({ message: "Movies already exist; seed skipped.", count });
    const movies = await Movie.insertMany(demoMovies);
    res.status(201).json({ message: "Sample movies added.", count: movies.length });
  } catch (error) { next(error); }
});

export default router;