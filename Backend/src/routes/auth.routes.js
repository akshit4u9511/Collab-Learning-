import { Router } from "express";
import {
  googleAuthCallback,
  googleAuthHandler,
  handleGoogleLoginCallback,
  handleLogout,
} from "../controllers/auth.controllers.js";
import { verifyJWT_username } from "../middlewares/verifyJWT.middleware.js";

const router = Router();

// --- Google Auth Routes ---
router.get("/google", googleAuthHandler);
router.get("/google/callback", googleAuthCallback, handleGoogleLoginCallback);

// --- Logout Route ---
router.get("/logout", handleLogout);

// --- Verification Route (to fix the login loop) ---
// This route checks if the user's cookie is valid
router.get("/verify", verifyJWT_username, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication failed" });
  }
  // If verifyJWT_username middleware passes, req.user exists
  res.status(200).json({ user: req.user });
});

export default router;