import cors from "cors";

const corsMiddleware = cors({
  origin: "https://your-frontend-url.up.railway.app", // palitan mo
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
});

export default corsMiddleware;