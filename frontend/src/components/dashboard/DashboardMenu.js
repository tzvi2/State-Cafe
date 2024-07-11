import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styles from '../styles/dashboard/DashboardMenu.module.css';

function DashboardMenu({ selectedDate, setSelectedDate }) {

  const location = useLocation();

  // const showDateInput = !location.pathname.startsWith('/dashboard/menu');
  const showDateInput = true

  return (
    <nav className={styles.dashboardNav}>
      <ul className={styles.dashboardMenu}>
        <li>
          <NavLink to="/dashboard/stock" className={({ isActive }) => isActive ? styles.activeLink : ''}>
            Stock
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard/hours" className={({ isActive }) => isActive ? styles.activeLink : ''}>
            Hours
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard/menu" className={({ isActive }) => isActive ? styles.activeLink : ''}>
            Menu
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard/orders" className={({ isActive }) => isActive ? styles.activeLink : ''}>
            Orders
          </NavLink>
        </li>
      </ul>
      {showDateInput && <input
        className={styles.date}
        type="date"
        value={selectedDate}
        onChange={e => setSelectedDate(e.target.value)}
      />}
    </nav>
  );
}

export default DashboardMenu;
