import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    unique: true,
  },
  tasks: [
    {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      dueDate: {
        type: Date,
        required: true,
      },
      priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "low",
      },
      status: {
        type: String,
        enum: ["pending", "in-progress", "completed"],
        default: "pending",
      },
      history: [
        {
          action: String,
          details: String,
          timestamp: { type: Date, default: Date.now },
        },
      ],
    },
  ],
});

const Task = mongoose.model("Task", taskSchema);

export default Task;
