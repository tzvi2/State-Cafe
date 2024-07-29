import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginPage from './LoginPage';

const ProtectedRoute = ({ element }) => {
  const { currentUser, isAllowed, loading } = useAuth();
  const navigate = useNavigate()

  console.log('ProtectedRoute - currentUser:', currentUser);
  console.log('ProtectedRoute - isAllowed:', isAllowed);

  if (loading) {
    return <div>Loading...</div>; // or a spinner
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  if (isAllowed === false) {
    return <Navigate to="/unauthorized" />;
  }

  return element;
};

export default ProtectedRoute;
