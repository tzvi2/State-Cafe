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
      if (item) {
        // Provide defaults for potentially missing fields
        setMenuItem({
          title: item.title || '',
          pieces: item.pieces || '',
          description: item.description || '',
          price: item.price || '',
          category: item.category || '',
          tags: item.tags || '',
          timeToCook: item.timeToCook || '',
          options: item.options || [],
          active: item.active !== undefined ? item.active : false,
          // Other fields...
        });
      }
    };
    fetchMenuItem();
  }, [itemId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMenuItem(prev => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index, e, optionType = 'individual', subIndex = null) => {
    const { name, value } = e.target;
    setMenuItem(prevState => {
      const newOptions = [...prevState.options];
      if (optionType === 'individual') {
        newOptions[index] = { ...newOptions[index], [name]: value };
      } else if (optionType === 'group' && subIndex !== null) {
        newOptions[index].options[subIndex] = { ...newOptions[index].options[subIndex], [name]: value };
      }
      return { ...prevState, options: newOptions };
    });
  };

  const deleteOption = (index) => {
    setMenuItem(prevState => ({
      ...prevState,
      options: prevState.options.filter((_, optionIndex) => optionIndex !== index),
    }));
  };
  
  const deleteSubOption = (groupIndex, subOptionIndex) => {
    setMenuItem(prevState => {
      const newOptions = [...prevState.options];
      newOptions[groupIndex].options = newOptions[groupIndex].options.filter((_, index) => index !== subOptionIndex);
      return { ...prevState, options: newOptions };
    });
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
            value={menuItem.title || ''}
            onChange={handleChange}
          />
        </label>
        <label>
          Item ID:
          <input
            type="text"
            name="itemId"
            value={menuItem.itemId || ''}
            onChange={handleChange}
          />
        </label>
        <label>
          Pieces:
          <input
            type="number"
            name="pieces"
            value={menuItem.pieces || ''}
            onChange={handleChange}
          />
        </label>
        
        <label>Description: 
          <textarea 
            name="description" 
            value={menuItem.description || ''} 
            onChange={handleChange}
            rows="4" // Adjust the number of rows according to your design needs
          />
        </label>

        <label>
          Category:
          <input
            type="text"
            name="category"
            value={menuItem.category || ''}
            onChange={handleChange}
          />
        </label>
        <label>
          Image URL:
          <input
            type="text"
            name="img"
            value={menuItem.img || ''}
            onChange={handleChange}
          />
        </label>
        
        
        <label>
          Price:
          <input
            type="number"
            name="price"
            value={menuItem.price || ''}
            onChange={handleChange}
          />
        </label>
        <label>
          Tags:
          <input
            type="text"
            name="tags"
            value={menuItem.tags || ''}
            onChange={handleChange}
          />
        </label>
        <label>
          Time to Cook:
          <input
            type="number"
            name="timeToCook"
            value={menuItem.timeToCook || ''}
            onChange={handleChange}
          />
        </label>
       
        {menuItem.options.map((option, index) => (
          option.type === 'group' ? (
            <div key={index} className={styles.optionGroup}>
              <h3>Group: {option.group}</h3>
              <p>Min Selection: {option.selectionMin}</p>
              <p>Max Selection: {option.selectionMax}</p>
              <button type="button" onClick={() => deleteOption(index)}>Delete Group</button>
              {option.options.map((subOption, subIndex) => (
                <div key={subIndex} className={styles.subOption}>
                  <h4>Sub Option {subIndex + 1}</h4>
                  <label>
                    Title:
                    <input
                      type="text"
                      value={subOption.title || ''}
                      onChange={(e) => handleOptionChange(index, e, 'group', subIndex)}
                    />
                  </label>
                  <label>
                    Price:
                    <input
                      type="number"
                      value={subOption.price || ''}
                      onChange={(e) => handleOptionChange(index, e, 'group', subIndex)}
                    />
                  </label>
                  <label>
                    Time to Cook:
                    <input
                      type="number"
                      value={subOption.timeToCook || ''}
                      onChange={(e) => handleOptionChange(index, e, 'group', subIndex)}
                    />
                  </label>
                  <button type="button" onClick={() => deleteSubOption(index, subIndex)}>Delete Sub-Option</button>
                </div>
              ))}
            </div>
          ) : (
            <div key={index} className={styles.individualOption}>
              <h4>Individual Option {index + 1}</h4>
              <label>
                Title:
                <input
                  type="text"
                  name="title"
                  value={option.title || ''}
                  onChange={(e) => handleOptionChange(index, e)}
                />
              </label>
              <label>
                Price:
                <input
                  type="number"
                  name="price"
                  value={option.price || ''}
                  onChange={(e) => handleOptionChange(index, e)}
                />
              </label>
              <label>
                Time to Cook:
                <input
                  type="number"
                  name="timeToCook"
                  value={option.timeToCook || ''}
                  onChange={(e) => handleOptionChange(index, e)}
                />
              </label>
              <button type="button" onClick={() => deleteOption(index)}>Delete Option</button>
            </div>
          )
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
