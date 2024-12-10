import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import styles from '../components/styles/route styles/LoginPage.module.css'

const LoginPage = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard/stock');
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  return (
    <div className={styles.page}>
      <p className={styles.loginText}>Sign in to peep this page👀</p>
      <button className={styles.signInButton} onClick={signInWithGoogle}>Sign in with Google</button>
    </div>
  );
};

export default LoginPage;
