// EditMenuItem.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMenuItemByItemId, updateMenuItem } from '../../api/menuRequests';
import styles from '../styles/dashboard/EditMenuItem.module.css'; // Ensure the correct path to your CSS module

const EditMenuItem = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [menuItem, setMenuItem] = useState({
    category: '',
    img: '',
    itemId: '',
    pieces: '',
    price: '',
    tags: '',
    timeToCook: '',
    title: '',
    options: [],
    description: '',
    active: false,
  });

  useEffect(() => {
    const fetchMenuItem = async () => {
      const item = await getMenuItemByItemId(itemId);
      setMenuItem(item || {});
    };
    fetchMenuItem();
  }, [itemId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMenuItem(prev => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (optionIndex, e) => {
    const { name, value } = e.target;
    const updatedOptions = menuItem.options.map((option, index) =>
      index === optionIndex ? { ...option, [name]: value } : option
    );
    setMenuItem(prev => ({ ...prev, options: updatedOptions }));
  };

  const handleAddOption = () => {
    setMenuItem(prev => ({
      ...prev,
      options: [...prev.options, { title: '', price: '', timeToCook: '' }],
    }));
  };

  const handleSubmit = async (e) => {
    console.log('description: ', menuItem.description)
    e.preventDefault();
    try {
      await updateMenuItem(menuItem);
      alert('Menu item updated successfully');
      navigate('/menu-dashboard/');
    } catch (error) {
      alert('Failed to update menu item');
      console.error('Update error:', error);
    }
  };

  return (
    <div className={styles.editMenuItemContainer}>
      <form onSubmit={handleSubmit} className={styles.editForm}>
        <h2>Edit Menu Item</h2>
        <label>
          Title:
          <input
            type="text"
            name="title"
            value={menuItem.title}
            onChange={handleChange}
          />
        </label>
        <label>
          Item ID:
          <input
            type="text"
            name="itemId"
            value={menuItem.itemId}
            onChange={handleChange}
          />
        </label>
        <label>
          Pieces:
          <input
            type="number"
            name="pieces"
            value={menuItem.pieces}
            onChange={handleChange}
          />
        </label>
        
        <label>Description: 
          <textarea 
            name="description" 
            value={menuItem.description} 
            onChange={handleChange}
            rows="4" // Adjust the number of rows according to your design needs
          />
        </label>

        <label>
          Category:
          <input
            type="text"
            name="category"
            value={menuItem.category}
            onChange={handleChange}
          />
        </label>
        <label>
          Image URL:
          <input
            type="text"
            name="img"
            value={menuItem.img}
            onChange={handleChange}
          />
        </label>
        
        
        <label>
          Price:
          <input
            type="number"
            name="price"
            value={menuItem.price}
            onChange={handleChange}
          />
        </label>
        <label>
          Tags:
          <input
            type="text"
            name="tags"
            value={menuItem.tags}
            onChange={handleChange}
          />
        </label>
        <label>
          Time to Cook:
          <input
            type="number"
            name="timeToCook"
            value={menuItem.timeToCook}
            onChange={handleChange}
          />
        </label>
       
        {menuItem.options.map((option, index) => (
          <div key={index} className={styles.optionGroup}>
            <h4>Option {index + 1}</h4>
            <label>
              Option Title:
              <input
                type="text"
                name="title"
                value={option.title}
                onChange={(e) => handleOptionChange(index, e)}
              />
            </label>
            <label>
              Option Price:
              <input
                type="number"
                name="price"
                value={option.price}
                onChange={(e) => handleOptionChange(index, e)}
              />
            </label>
            <label>
              Option Time to Cook:
              <input
                type="number"
                name="timeToCook"
                value={option.timeToCook}
                onChange={(e) => handleOptionChange(index, e)}
              />
            </label>
          </div>
        ))}
        <button type="button" onClick={handleAddOption} className={styles.addButton}>
          Add Option
        </button>
        <button type="submit" className={styles.saveButton}>
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditMenuItem;
