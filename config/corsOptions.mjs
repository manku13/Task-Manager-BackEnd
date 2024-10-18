const allowedOrigins = [
  "http://localhost:5000",
  "http://localhost:4200",
  "https://codingninja-task.onrender.com",
  "https://coding-ninja-task-delta.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export default corsOptions;
