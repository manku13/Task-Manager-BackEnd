import jwt from "jsonwebtoken";
import User from "../models/User.mjs";
import bcrypt from "bcrypt";
import asyncHandler from "express-async-handler";
import Task from "../models/Task.mjs";
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ username, email, password });
    await Task.create({
      userEmail: email,
      tasks: [], // Empty array for tasks
    });
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
      tasks: [],
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export { authUser, registerUser };
