import User from "../models/User.mjs";
import bcrypt from "bcrypt";
import asyncHandler from "express-async-handler";

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  // Get all users from MongoDB
  const users = await User.find().select("-password").lean();

  // If no users
  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }

  res.json(users);
});

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles, email } = req.body;

  // Confirm data
  if (
    !username ||
    !email ||
    !password ||
    !Array.isArray(roles) ||
    !roles.length
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for duplicate username
  const duplicate = await User.findOne({ username }).lean().exec();
  const duplicate_email = await User.findOne({ email }).lean().exec();
  if (duplicate) {
    return res.status(409).json({ message: "Username already used" });
  }

  if (duplicate_email) {
    return res.status(409).json({ message: "Email already exists" });
  }

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

  const userObject = { username, email, password: hashedPwd, roles };

  // Create and store new user
  const user = await User.create(userObject);

  if (user) {
    // Created
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
});

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  const { id, username, roles, active, password } = req.body;

  // Confirm data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res
      .status(400)
      .json({ message: "All fields except password are required" });
  }

  // Does the user exist to update?
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Check for duplicate
  const duplicate = await User.findOne({ username }).lean().exec();

  // Allow updates to the original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    // Hash password
    user.password = await bcrypt.hash(password, 10); // salt rounds
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} updated` });
});

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "User ID required" });
  }

  // Does the user exist to delete?
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const result = await user.deleteOne();

  const reply = `Username ${result.username} with ID ${result._id} deleted`;

  res.json({ message: reply });
});

const createTask = async (req, res) => {
  const { userEmail, title, description, dueDate, priority, status } = req.body;

  try {
    const task = await Task.create({
      userEmail,
      title,
      description,
      dueDate,
      priority,
      status,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update task function (example)
const updateTask = async (req, res) => {
  const { taskId, updates } = req.body;

  try {
    const task = await Task.findByIdAndUpdate(taskId, updates, { new: true });

    // Update history
    task.history.push({
      action: "updated",
      details: `Task updated with new data`,
    });

    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
  createTask,
  updateTask,
};
