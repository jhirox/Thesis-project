import cors from "cors";

const corsMiddleware = cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000", "https://your-frontend-url.up.railway.app"], // Allow local development and production
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
});

export default corsMiddleware;