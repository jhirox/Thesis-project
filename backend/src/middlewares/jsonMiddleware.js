import express from "express";

const jsonMiddleware = express.json({ limit: "2mb" });

export default jsonMiddleware;
