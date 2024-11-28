import jwt from "jsonwebtoken";
import "dotenv/config.js";
export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, (err, decode) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }
      req.user = decode;
      return next();
    });
  } else {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
};
