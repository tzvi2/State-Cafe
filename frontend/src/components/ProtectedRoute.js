import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginPage from './LoginPage';

const ProtectedRoute = ({ element }) => {
  const { currentUser, isAllowed, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
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
