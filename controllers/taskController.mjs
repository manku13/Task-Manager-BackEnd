import express from "express";
import asyncHandler from "express-async-handler";
import Task from "../models/Task.mjs"; // Import Task model

const router = express.Router();

// @desc Get all tasks for a user
// @route GET /tasks
// @access Private
const getTasks = asyncHandler(async (req, res) => {
  const { userEmail } = req.query; // Fetch userEmail from query parameters

  if (!userEmail) {
    return res.status(400).json({ message: "User email is required" });
  }

  try {
    // Find the tasks document associated with the given userEmail
    const userTasks = await Task.findOne({ userEmail }).lean();

    // If no tasks found, return a 404 error
    if (!userTasks) {
      return res.status(404).json({ message: "No tasks found for this user" });
    }

    // Return the tasks array from the found document
    res.json(userTasks.tasks);
  } catch (error) {
    // Handle potential server errors
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc Create a new task
// @route POST /tasks
// @access Private
const addTask = asyncHandler(async (req, res) => {
  const { userEmail, title, description, dueDate, priority, status } = req.body;

  // Validate that required fields are present
  if (!userEmail || !title || !description || !dueDate) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Find the user's task document or create one if it doesn't exist
  let userTasks = await Task.findOne({ userEmail });

  if (!userTasks) {
    // If no document exists, create a new one
    userTasks = await Task.create({ userEmail, tasks: [] });
  }

  // Push the new task into the tasks array
  const newTask = {
    title,
    description,
    dueDate,
    priority,
    status,
  };

  userTasks.tasks.push(newTask);

  // Save the updated document
  await userTasks.save();

  // Respond with the updated tasks array
  res.status(201).json(userTasks.tasks);
});

// @desc Update a task
// @route PATCH /tasks/:taskId
// @access Private
const updateTask = asyncHandler(async (req, res) => {
  const { userEmail } = req.query; // Get user email from query params
  const { taskId } = req.params; // Get task ID from route params
  const updates = req.body; // Get updates from request body

  if (!userEmail || !taskId) {
    return res
      .status(400)
      .json({ message: "User email and task ID are required" });
  }

  try {
    // Find the user's tasks document
    const userTasks = await Task.findOne({ userEmail });

    if (!userTasks) {
      return res.status(404).json({ message: "Tasks not found for this user" });
    }

    // Find the task to update
    const taskIndex = userTasks.tasks.findIndex(
      (task) => task._id.toString() === taskId
    );

    if (taskIndex === -1) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update the task
    Object.assign(userTasks.tasks[taskIndex], updates);

    // Save the updated document
    await userTasks.save();

    // Respond with the updated task
    res.json(userTasks.tasks[taskIndex]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc Delete a task
// @route DELETE /tasks/:taskId
// @access Private
const deleteTask = asyncHandler(async (req, res) => {
  const { userEmail } = req.query; // Get user email from query params
  const { taskId } = req.params; // Get task ID from route params

  if (!userEmail || !taskId) {
    return res
      .status(400)
      .json({ message: "User email and task ID are required" });
  }

  try {
    // Find the user's tasks document
    const userTasks = await Task.findOne({ userEmail });

    if (!userTasks) {
      return res.status(404).json({ message: "Tasks not found for this user" });
    }

    // Remove the task
    const initialLength = userTasks.tasks.length;
    userTasks.tasks = userTasks.tasks.filter(
      (task) => task._id.toString() !== taskId
    );

    // Check if a task was deleted
    if (userTasks.tasks.length === initialLength) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Save the updated document
    await userTasks.save();

    // Respond with a success message
    res.json({ message: `Task with ID ${taskId} deleted` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export { getTasks, addTask, updateTask, deleteTask };
