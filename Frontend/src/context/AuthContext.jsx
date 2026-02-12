// src/context/AuthContext.jsx

import React, { createContext, useContext, useState } from 'react';

// Create the context
const AuthContext = createContext(null);

// Create a custom hook to easily use the context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading

  const value = {
    user,
    setUser,
    isLoading,
    setIsLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};