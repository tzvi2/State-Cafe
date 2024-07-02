import React from 'react';
import DashboardMenu from './DashboardMenu';
import { Outlet } from 'react-router-dom';

function NewDashboard() {
  return (
    <div>
      <DashboardMenu />
      <Outlet />
    </div>
  );
}

export default NewDashboard;
