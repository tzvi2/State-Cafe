import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { user, isAllowed } = useAuth();

  if (isAllowed === null) {
    return <div>Loading...</div>; // or a loading spinner
  }

  if (!user || !isAllowed) {
    return <Navigate to="/unauthorized" />; // or a redirect to login/unauthorized page
  }

  return children;
};

export default ProtectedRoute;
