import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebaseConfig';
import apiUrl from '../config';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const response = await fetch(`${apiUrl}/api/check-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: user.email }),
          });

          if (!response.ok) {
            throw new Error('Failed to check email');
          }

          const data = await response.json();
          console.log('Email check response:', data);
          setIsAllowed(data.allowed);
        } catch (error) {
          console.error('Error checking email:', error);
          setIsAllowed(null);
        } finally {
          setLoading(false);
        }
      } else {
        setIsAllowed(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    //console.log('Auth state - currentUser:', currentUser);
    //console.log('Auth state - isAllowed:', isAllowed);
  }, [currentUser, isAllowed]);

  const value = {
    currentUser,
    isAllowed,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
