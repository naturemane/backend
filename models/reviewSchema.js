import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  name: { type: String },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  review: {
    type: String,
    required: true,
  },
  isShown: { type: Boolean, default: false },
});

const reviewModel = mongoose.model("Review", reviewSchema);
export default reviewModel;
