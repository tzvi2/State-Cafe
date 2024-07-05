import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';  

const allowedEmails = ['tzvib8@gmail.com'];

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!allowedEmails.includes(user.email)) {
      navigate('/unauthorized');
    }
  }, [user, navigate]);

  if (!user || !allowedEmails.includes(user.email)) {
    return null; // or a loading spinner
  }

  return children;
};

export default ProtectedRoute;
