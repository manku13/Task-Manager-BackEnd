import express from "express";
import "./loadEnvironment.mjs";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import mongoose from "mongoose";
import errorHandler from "./middleware/errorHandler.mjs";
import { logger, logEvents } from "./middleware/logger.mjs";
import { fileURLToPath } from "url";
import corsOptions from "./config/corsOptions.mjs";
import router from "./routes/root.mjs";
import connectDB from "./config/conn.mjs";
import userRoutes from "./routes/userRoutes.mjs";
import authRoutes from "./routes/authRoutes.mjs";
import taskRoutes from "./routes/taskRoutes.mjs";
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();
app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/", express.static(path.join(__dirname, "/public")));
app.use("/", router);
app.use("/api/users/tasks", taskRoutes);
app.use("/api/auth", authRoutes);
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});
