import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import DashboardMenu from './DashboardMenu';
import styles from '../styles/dashboard/DashboardLayout.module.css';

const DashboardLayout = () => {
  const getLocalDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const navigate = useNavigate();

  return (
    <div className={styles.dashboardContainer}>
      <DashboardMenu selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      <Outlet context={[selectedDate, setSelectedDate]} />
    </div>
  );
};

export default DashboardLayout;
