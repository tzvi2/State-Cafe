import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMenuItems, updateMenuItemActiveStatus, deleteMenuItem } from '../../api/menuRequests';
import styles from '../styles/dashboard/MenuDashboard.module.css'

const MenuDashboard = () => {
  const [menuItems, setMenuItems] = useState([]);

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

	const handleToggleActiveStatus = async (documentId, isActive) => {
		try {
			// Attempt to update the backend first
			await updateMenuItemActiveStatus(documentId, !isActive);
			console.log(`Successfully updated active status for item: ${documentId}`);
			
			// After successful backend update, reflect the change in the UI
			const updatedMenuItems = menuItems.map((item) => {
				if (item.documentId === documentId) {
					// Toggle active status
					return { ...item, active: !isActive };
				}
				return item;
			});
			setMenuItems(updatedMenuItems);
		} catch (error) {
			console.error(`Failed to update active status for item: ${documentId}`, error);
			// Optionally, inform the user about the failure
			alert(`Failed to update active status for ${documentId}. Please try again.`);
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
              onChange={() => handleToggleActiveStatus(item.documentId, item.active)}
              className={styles.toggleInput}
            />
            <span className={`${styles.activeStatusIndicator} ${item.active ? styles.isActive : styles.isInactive}`} />
          </label>
					<button onClick={() => handleDeleteMenuItem(item.documentId)} className={styles.deleteButton}>X</button>
        </div>
      ))}
    </div>
  );
};

export default MenuDashboard;
