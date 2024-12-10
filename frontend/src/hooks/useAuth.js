import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebaseConfig'; // Firebase auth import
import { onAuthStateChanged } from 'firebase/auth';
import { checkUserPermissions } from '../api/authRequests'; // Example API request to check permissions

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAllowed, setIsAllowed] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('User logged in:', user);
        setCurrentUser(user);

        try {
          const allowed = await checkUserPermissions(user.email);
          setIsAllowed(allowed);
        } catch (error) {
          console.error('Error checking permissions:', error);
          setIsAllowed(false);
        }
      } else {
        console.log('No user logged in');
        setCurrentUser(null);
        setIsAllowed(null);
      }

      setLoading(false); // Ensure loading state transitions to false
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, isAllowed, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
