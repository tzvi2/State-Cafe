import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/dashboard/MenuPage.module.css';
import { getMenuItems, deleteMenuItem, updateMenuItemActiveStatus } from '../../api/menuRequests';

function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const navigate = useNavigate();

  const fetchMenuItems = async () => {
    try {
      const items = await getMenuItems();
      setMenuItems(items);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    console.log(menuItems);
  }, [menuItems]);

  const handleDeleteMenuItem = async (documentId) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this menu item?');
    if (isConfirmed) {
      try {
        await deleteMenuItem(documentId);
        setMenuItems((prevItems) => prevItems.filter(item => item.id !== documentId));
      } catch (error) {
        console.error('Failed to delete menu item:', error);
      }
    }
  };

  const handleToggleActiveStatus = async (itemId, isActive) => {
    try {
      await updateMenuItemActiveStatus(itemId, !isActive);
      setMenuItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, active: !isActive } : item
        )
      );
    } catch (error) {
      console.error(`Failed to update active status for item: ${itemId}`, error);
      alert(`Failed to update active status for ${itemId}. Please try again.`);
    }
  };

  return (
    <div className={styles.menuPage}>
      <ul className={styles.menuContainer}>
        {menuItems.map((item) => (
          <li className={styles.menuItem} key={item.id}>
            <div className={styles.square} onClick={() => navigate(`/dashboard/menu/${item.id}`)}>
              <h5>{item.title}</h5>
              <img src={item.img} alt={item.title} />
            </div>
            <div className={styles.flexRow}>
              <label className={styles.activeBox} onClick={(e) => e.stopPropagation()}>
                <input 
                  type="checkbox" 
                  checked={item.active} 
                  onChange={(e) => handleToggleActiveStatus(item.id, item.active)}
                />
                Active
              </label>
              <button className={styles.delete_button} onClick={(e) => { e.stopPropagation(); handleDeleteMenuItem(item.id); }}>x</button>
            </div>
          </li>
        ))}
      </ul>
      <button onClick={() => navigate('/dashboard/menu/new')}>Add New Menu Item</button>
    </div>
  );
}

export default MenuPage;
