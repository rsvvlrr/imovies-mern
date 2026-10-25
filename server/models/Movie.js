import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  genre: { type: String, required: true },
  year: { type: Number, required: true },
  rating: { type: Number, default: 0, min: 0, max: 10 },
  duration: { type: String, default: "2h 00m" },
  poster: { type: String, required: true },
  description: { type: String, default: "" },
  showtimes: { type: [String], default: ["12:30", "16:00", "19:00"] }
}, { timestamps: true });

export default mongoose.model("Movie", movieSchema);