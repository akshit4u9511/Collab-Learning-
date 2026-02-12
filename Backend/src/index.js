import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";
import { app } from "./app.js";
import { Server } from "socket.io";

dotenv.config();

const port = process.env.PORT || 8000;

// Maps to store user socket data
const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log("✅ Database connected successfully");

    // Start Express server
    const server = app.listen(port, () => {
      console.log(`🚀 Server is running on http://localhost:${port}`);
    });

    // WebSocket Configuration
    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: ["http://localhost:5173", "http://localhost:5174"],
      },
    });

    // WebSocket Events
    io.on("connection", (socket) => {
      console.log("🟢 Connected to WebSocket:", socket.id);

      // --- CHAT EVENTS ---
      socket.on("setup", (userData) => {
        console.log("User connected:", userData.username, "with ID:", userData._id);
        socket.join(userData._id);
        socket.emit("connected");
      });

      socket.on("join chat", (room) => {
        console.log(`User joined chat: ${room}`);
        socket.join(room);
      });

      socket.on("new message", (newMessage) => {
        let chat = newMessage.chatId;
        if (!chat.users) return console.log("❌ Chat users not found!");

        chat.users.forEach((user) => {
          if (user._id === newMessage.sender._id) return;
          io.to(user._id).emit("message received", newMessage);
          console.log(`📩 Message sent to: ${user._id}`);
        });
      });
      // --- END CHAT EVENTS ---

      // ------------------------------------------------
      // --- 🎥 VIDEO CALL SIGNALING EVENTS ---
      // ------------------------------------------------
      // (This logic is correct and retained from your file)

      socket.on("video:join-room", (data) => {
        const { room, email } = data;
        console.log(`🎥 User ${email} (Socket: ${socket.id}) joined video room: ${room}`);

        emailToSocketIdMap.set(email, socket.id);
        socketIdToEmailMap.set(socket.id, email);

        socket.join(room);

        socket.to(room).emit("video:user-joined", { email, id: socket.id });
        io.to(socket.id).emit("video:joined-room", data);
      });

      socket.on("video:offer", (payload) => {
        const { to, offer } = payload;
        console.log(`Offer from ${socket.id} to ${to}`);
        io.to(to).emit("video:incoming-offer", { from: socket.id, offer });
      });

      socket.on("video:answer", (payload) => {
        const { to, answer } = payload;
        console.log(`Answer from ${socket.id} to ${to}`);
        io.to(to).emit("video:offer-accepted", { from: socket.id, answer });
      });

      socket.on("video:ice-candidate", (payload) => {
        const { to, candidate } = payload;
        io.to(to).emit("video:ice-candidate", { from: socket.id, candidate });
      });

      socket.on("video:hang-up", (payload) => {
        const { to } = payload;
        console.log(`Hang up from ${socket.id} to ${to}`);
        io.to(to).emit("video:peer-disconnected", { from: socket.id });
      });

      socket.on("disconnect", () => {
        console.log("🔴 User disconnected from WebSocket:", socket.id);
        const email = socketIdToEmailMap.get(socket.id);
        if (email) {
          console.log(`Cleaning up user ${email}`);
          emailToSocketIdMap.delete(email);
          socketIdToEmailMap.delete(socket.id);
        }
      });
    });

    // --- REMOVED app.get("/") --- 
    // (It's now in app.js)

  })
  .catch((err) => {
    console.error("❌ Database connection error:", err);
  });