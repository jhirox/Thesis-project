import cors from "cors";

const corsMiddleware = cors({
  origin: "*", // or restrict to your frontend domain
  methods: ["GET", "POST", "PUT", "DELETE"],
});

export default corsMiddleware;