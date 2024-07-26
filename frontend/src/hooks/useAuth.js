import { useContext, createContext, useState, useEffect } from "react";
import { signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { auth } from "../firebaseConfig";
import apiUrl from '../config';

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const provider = new GoogleAuthProvider();
  const [user, setUser] = useState(null);
  const [isAllowed, setIsAllowed] = useState(null);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setUser(user);
      await checkUserAccess(user); // Check access immediately after sign-in
    } catch (error) {
      console.log(error);
    }
  };

  const signOutWithGoogle = () => {
    signOut(auth);
    setUser(null);
    setIsAllowed(null);
  };

  const checkUserAccess = async (currentUser) => {
    if (currentUser) {
      try {
        const response = await fetch(`${apiUrl}/api/check-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: currentUser.email }),
        });
        const data = await response.json();
        console.log('API response:', JSON.stringify(data));
        setIsAllowed(data.allowed);
      } catch (error) {
        console.error('Error checking email:', error);
        setIsAllowed(false);
      }
    } else {
      setIsAllowed(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      await checkUserAccess(currentUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAllowed,
        signInWithGoogle,
        signOutWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
