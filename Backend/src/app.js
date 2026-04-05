import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";


import requestRouter from "./routes/request.routes.js";
import reportRouter from "./routes/report.routes.js";
import ratingRouter from "./routes/rating.routes.js";

// Using routes
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/chat", chatRouter);
app.use("/message", messageRouter);
app.use("/request", requestRouter);
app.use("/report", reportRouter);
app.use("/rating", ratingRouter);

// --- MOVED THIS FROM INDEX.JS ---
// Health check route
app.get("/", (req, res) => {
  res.send("✅ SkillSwap Backend is Running! 🚀");
});

export { app };
