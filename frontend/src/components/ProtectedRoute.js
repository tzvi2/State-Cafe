import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const checkEmail = async () => {
      if (user) {
        try {
          const response = await fetch('/api/check-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: user.email }),
          });
          const data = await response.json();
          if (data.allowed) {
            setIsAllowed(true);
          } else {
            navigate('/unauthorized');
          }
        } catch (error) {
          console.error(error);
          navigate('/unauthorized');
        }
      } else {
        navigate('/login');
      }
      setLoading(false);
    };

    checkEmail();
  }, [user, navigate]);

  if (loading) {
    return <div>Loading...</div>; // or a loading spinner
  }

  if (!user || !isAllowed) {
    return null; // or a redirect to login/unauthorized page
  }

  return children;
};

export default ProtectedRoute;
