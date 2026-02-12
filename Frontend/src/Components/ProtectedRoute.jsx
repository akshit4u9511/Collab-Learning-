// src/components/ProtectedRoute.jsx

import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// --- IMPORTANT: Set this globally in main.jsx or App.jsx ---
// This tells axios to send cookies with every request.
axios.defaults.baseURL = 'http://localhost:8000'; // Your backend URL
axios.defaults.withCredentials = true;

const ProtectedRoute = () => {
  const { user, setUser, isLoading, setIsLoading } = useAuth();

  useEffect(() => {
    // Only verify if we don't have a user and are still loading
    if (!user && isLoading) {
      const verifyUser = async () => {
        try {
          // 1. Call your new backend "verify" endpoint
          const { data } = await axios.get('/auth/verify');
          // 2. If successful, set the user in global state
          setUser(data.user);
        } catch (err) {
          // 3. If it fails (401 error), set user to null
          setUser(null);
        } finally {
          // 4. Stop loading
          setIsLoading(false);
        }
      };
      
      verifyUser();
    }
  }, [user, isLoading, setUser, setIsLoading]);

  // 1. If we are still checking, show a loading screen
  if (isLoading) {
    // You can make a fancy full-page loading spinner here
    return <div>Loading your session...</div>;
  }

  // 2. If we finished loading and there's NO user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. If we finished loading and there IS a user, show the page
  return <Outlet />; // This renders the child route (e.g., <Discover />)
};

export default ProtectedRoute;