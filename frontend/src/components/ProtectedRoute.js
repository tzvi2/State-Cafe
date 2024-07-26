import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { user, isAllowed } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    if (user && isAllowed !== null) {
      setIsChecking(false);
      setAuthorized(isAllowed);
    } else if (!user) {
      setIsChecking(false);
      setAuthorized(false);
    }
  }, [user, isAllowed]);

  console.log('ProtectedRoute - user:', user, 'isAllowed:', isAllowed, 'isChecking:', isChecking, 'authorized:', authorized);

  if (isChecking) {
    console.log('Checking permissions, showing loading...');
    return <div>Loading...</div>; // or a loading spinner
  }

  if (!user) {
    console.log('No user, redirecting to login...');
    return <Navigate to="/login" />;
  }

  if (authorized === false) {
    console.log('User is not authorized, redirecting to unauthorized...');
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;
