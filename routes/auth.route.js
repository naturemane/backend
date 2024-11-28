import express from "express";
import { log_in, signUp } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const authRoute = express.Router();

authRoute.post("/sign-up", signUp);
authRoute.post("/login", log_in);
authRoute.get("/test", authMiddleware, (req, res) => {
  res.json({ message: req.user });
});

export default authRoute;
