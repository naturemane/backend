import express from "express";
import reviewController from "../controllers/review.controller.js";

const reviewRouter = express.Router();
reviewRouter.get("/reviews", reviewController.getAllReviews);
reviewRouter.post("/reviews", reviewController.createReview);
reviewRouter.get("/reviews/:id", reviewController.getReviewById);
reviewRouter.put("/reviews/:id", reviewController.updateReview);
reviewRouter.delete("/reviews/:id", reviewController.deleteReivew);

export default reviewRouter;
