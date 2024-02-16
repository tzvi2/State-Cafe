import React from 'react';
import { Route, Redirect } from 'react-router-dom';

function ProtectedRoute({ component: Component, user, ...rest }) {
  return (
    <Route
      {...rest}
      render={props => {
        if (user.isAuthenticated && user.isAdmin) {
          return <Component {...props} />;
        } else {
          return <Redirect to="/login" />;
        }
      }}
    />
  );
}

export default ProtectedRoute;
