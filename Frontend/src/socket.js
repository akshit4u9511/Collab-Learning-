import { io } from "socket.io-client";

// Your backend server URL
const URL = "http://localhost:8000"; // Or process.env.REACT_APP_BACKEND_URL

// Create a new socket instance
// We set autoConnect to false so we can manually connect
// when the user logs in, but for this example, we'll connect immediately.
export const socket = io(URL, {
  autoConnect: true,
  // You might want to add auth tokens here later
  // auth: {
  //   token: "your-jwt-token"
  // }
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Socket disconnected");
});