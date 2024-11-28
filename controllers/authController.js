import bcryptjs from "bcryptjs";
import userModel from "../models/userSchema.js";
import jwt from "jsonwebtoken";
import "dotenv/config.js";
const SECRET_KEY = process.env.SECRET_KEY;

const createToken = (id) => {
  const token = jwt.sign(id, SECRET_KEY, {
    expiresIn: "5d",
  });
  return token;
};

export const signUp = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (name && email && password) {
      const userExist = await userModel.findOne({ email });
      if (!userExist) {
        const salt = await bcryptjs.genSalt(10);
        const hashedPass = await bcryptjs.hash(password, salt);
        const user = await userModel.create({
          name,
          email,
          password: hashedPass,
        });
        const token = createToken({
          id: user._id,
          name,
          email,
        });
        res.status(201).json({ name, email, token });
      } else {
        res.status(400).json({ message: "user already exist" });
      }
    } else {
      res.status(400).json({ message: "please fill out all the fields" });
    }
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

export const log_in = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (email && password) {
      const userExist = await userModel.findOne({ email });
      if (userExist) {
        const matchPass = await bcryptjs.compare(password, userExist.password);
        if (matchPass) {
          const token = createToken({
            id: userExist._id,
            name: userExist.name,
            email,
            role: userExist.role,
          });
          res.status(200).json({
            name: userExist.name,
            email,
            role: userExist.role,
            token,
          });
        } else {
          res.status(400).json({ message: "user not found" });
        }
      } else {
        res.status(400).json({ message: "user not found" });
      }
    } else {
      res.status(400).json({ message: "please fill out all the fields" });
    }
  } catch (error) {
    res.status(400).json({ message: error });
  }
};
