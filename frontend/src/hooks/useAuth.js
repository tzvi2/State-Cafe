import { useContext, createContext, useState, useEffect } from "react";
import { signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { auth } from "../firebaseConfig";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const provider = new GoogleAuthProvider();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(null); // null = not checked, true/false = checked

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setUser(user);
    } catch (error) {
      console.log(error);
    }
  };

  const signOutWithGoogle = () => {
    signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        try {
          const response = await fetch('http://localhost:8000/api/check-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: currentUser.email }),
          });
          const data = await response.json();
          setIsAllowed(data.allowed);
        } catch (error) {
          console.error('Error checking email:', error);
          setIsAllowed(false);
        }
      } else {
        setIsAllowed(null);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

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
