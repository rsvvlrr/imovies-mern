import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  bookingCode: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
  showDate: { type: String, required: true },
  showtime: { type: String, required: true },
  seats: { type: [String], required: true },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" }
}, { timestamps: true });

bookingSchema.index({ movie: 1, showDate: 1, showtime: 1, status: 1 });
export default mongoose.model("Booking", bookingSchema);