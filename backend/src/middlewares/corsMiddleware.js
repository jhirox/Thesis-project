import cors from "cors";

const corsMiddleware = cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "https://your-frontend-url.up.railway.app",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5500", // VS Code Live Server
      "http://127.0.0.1:5500"
    ];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
});

export default corsMiddleware;