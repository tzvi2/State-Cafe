// ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    // Redirect to login or show login button
    // For example, redirect to a "/login" route
    return <h4>You need to sign in to view this page.</h4>;
  }

  return children;
};

export default ProtectedRoute