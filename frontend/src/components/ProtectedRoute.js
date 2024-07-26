import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { user, isAllowed, signInWithGoogle } = useAuth();

  if (isAllowed === null) {
    // Checking permissions or loading
    return <div>Loading...</div>; // or a loading spinner
  }

  if (!user) {
    // If no user, show the sign-in button
    return (
      <div>
        <p>Please sign in to access this page.</p>
        <button onClick={signInWithGoogle}>Sign in with Google</button>
      </div>
    );
  }

  if (!isAllowed) {
    // User is signed in but not allowed
    return <Navigate to="/unauthorized" />;
  }

  // User is signed in and allowed
  return children;
};

export default ProtectedRoute;
