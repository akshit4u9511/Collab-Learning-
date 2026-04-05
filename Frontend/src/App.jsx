import { Route, Routes } from "react-router-dom";
import Footer from "./Components/Footer/Footer";
import Discover from "./Pages/Discover/Discover";
import Login from "./Pages/Login/Login";
import Header from "./Components/Navbar/Navbar";
import LandingPage from "./Pages/LandingPage/LandingPage";
import AboutUs from "./Pages/AboutUs/AboutUs";
import Chats from "./Pages/Chats/Chats";
import Report from "./Pages/Report/Report";
import Profile from "./Pages/Profile/Profile";
import NotFound from "./Pages/NotFound/NotFound";
import Register from "./Pages/Register/Register";
import Rating from "./Pages/Rating/Rating";
import EditProfile from "./Pages/EditProfile/EditProfile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VideoCallPage from "./Pages/VideoCall/VideoCallPage";
import Sessions from "./Pages/Sessions/Sessions";
import StudentDashboard from "./Pages/Dashboard/StudentDashboard";
import MentorDashboard from "./Pages/Dashboard/MentorDashboard";

// --- THIS IS THE FIX ---
// Import the component with the correct logic
import ProtectedRoute from "./Components/ProtectedRoute.jsx";
import AIAssistant from "./Components/AIAssistant/AIAssistant";
import { useAuth } from "./context/AuthContext";

const App = () => {
  const { user } = useAuth();
  return (
    <>
      <Header />
      {user && <AIAssistant />}
      <ToastContainer position="top-right" />
      <Routes>
        {/* --- All Protected Routes Go Inside Here --- */}
        {/* Use the correct component */}
        <Route element={<ProtectedRoute />}>
          <Route path="/discover" element={<Discover />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/dashboard/mentor" element={<MentorDashboard />} />
          <Route path="/call/:roomId" element={<VideoCallPage />} />
          <Route path="/edit_profile" element={<EditProfile />} />
          <Route path="/report/:username" element={<Report />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/rating/:username" element={<Rating />} />
        </Route>

        {/* --- All Public Routes Stay Outside --- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about_us" element={<AboutUs />} />

        {/* --- Catch-all 404 Route --- */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </>
  );
};

export default App;
