import express from "express";
const router = express.Router();

import {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController.mjs";

router
  .route("/")
  .get(getTasks) // GET /tasks?userEmail=
  .post(addTask); // POST /tasks

// Route to update and delete a specific task by taskId
router
  .route("/:taskId")
  .patch(updateTask) // PATCH /tasks/:taskId
  .delete(deleteTask); // DELETE /tasks/:taskId

export default router;
