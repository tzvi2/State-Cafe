import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMenuItems, updateMenuItemActiveStatus, deleteMenuItem } from '../../api/menuRequests';
import styles from '../styles/dashboard/MenuDashboard.module.css'
import { useAuth } from '../../hooks/useAuth';

const MenuDashboard = () => {
  const [menuItems, setMenuItems] = useState([]);
  const { user, signInWithGoogle } = useAuth(); 
	const AUTHORIZED_EMAILS = ['tzvib8@gmail.com']; 
	const isAuthorized = user && AUTHORIZED_EMAILS.includes(user.email);

	const fetchMenuItems = async () => {
		const items = await getMenuItems();
		setMenuItems(items);
	};

  useEffect(() => {
    
    fetchMenuItems();
  }, []);

	useEffect(() => {
		console.log(menuItems)
	}, [menuItems])

	const handleDeleteMenuItem = async (documentId) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this menu item?');
    if (isConfirmed) {
      await deleteMenuItem(documentId);
      fetchMenuItems();
    }
  };

  const handleToggleActiveStatus = async (itemId, isActive) => {
    try {
      // Attempt to update the backend first
      await updateMenuItemActiveStatus(itemId, !isActive);
      console.log(`Successfully updated active status for item: ${itemId}`);
      
      // After successful backend update, reflect the change in the UI
      const updatedMenuItems = menuItems.map((item) => {
        if (item.id === itemId) { // Ensure this matches the case sensitivity of your property
          // Toggle active status
          return { ...item, active: !isActive };
        }
        return item;
      });
      setMenuItems(updatedMenuItems);
    } catch (error) {
      console.error(`Failed to update active status for item: ${itemId}`, error);
      // Optionally, inform the user about the failure
      alert(`Failed to update active status for ${itemId}. Please try again.`);
    }
  };

  
  
	

  return (
    <div className={styles.dashboardContainer}>
			<div className={styles.addMenuItemButtonContainer}>
        <Link to="/menu-dashboard/add-menu-item" className={styles.addMenuItemButton}>
          Add Menu Item
        </Link>
      </div>
      {menuItems.map((item) => (
        <div key={item.itemId} className={styles.menuItem}>
          <Link to={`/menu-dashboard/edit-item/${item.itemId}`}>
            <h3>{item.title}</h3>
            <img src={item.img} alt={item.title} className={styles.menuItemImage} />
          </Link>
          <label className={styles.toggleLabel}>
            <span>Active:</span>
            <input
              type="checkbox"
              checked={item.active}
              onChange={() => handleToggleActiveStatus(item.id, item.active)}
              className={styles.toggleInput}
            />
            <span className={`${styles.activeStatusIndicator} ${item.active ? styles.isActive : styles.isInactive}`} />
          </label>
					<button onClick={() => handleDeleteMenuItem(item.id)} className={styles.deleteButton}>X</button>
        </div>
      ))}
    </div>
  );
};

export default MenuDashboard;
