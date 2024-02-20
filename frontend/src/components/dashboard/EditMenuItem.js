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
          itemId: itemId
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

  const handleGroupOptionChange = (groupIndex, e) => {
    const { name, value } = e.target; // `name` could be 'group', 'selectionMin', or 'selectionMax'.
  
    setMenuItem(prevState => {
      // Create a deep copy of options to avoid direct state mutation
      const updatedOptions = prevState.options.map((option, idx) =>
        idx === groupIndex
          ? { ...option, [name]: name === 'selectionMin' || name === 'selectionMax' ? parseInt(value, 10) : value }
          : option
      );
  
      // Update the state with the modified options array
      return { ...prevState, options: updatedOptions };
    });
  };
  
  
  
  
  
  
  

  const addIndividualOption = () => {
    setMenuItem(prev => ({
      ...prev,
      options: [...prev.options, { type: 'individual', title: '', price: '', timeToCook: '' }],
    }));
  };

  const addOptionGroup = () => {
    setMenuItem(prev => ({
      ...prev,
      options: [
        ...prev.options,
        {
          type: 'group',
          group: '', // Group name
          selectionMin: 1,
          selectionMax: 1,
          options: [], // Sub-options
        },
      ],
    }));
  };
  
  const addSubOptionToGroup = (groupIndex) => {
    setMenuItem(prevState => {
      const newOptions = [...prevState.options];
      newOptions[groupIndex].options.push({
        title: '',
        price: '',
        timeToCook: '',
      });
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
  
  

  // const handleAddOption = () => {
  //   setMenuItem(prev => ({
  //     ...prev,
  //     options: [...prev.options, { title: '', price: '', timeToCook: '' }],
  //   }));
  // };

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

  const handleIndividualOptionChange = (index, e) => {
    const { name, value } = e.target;
    setMenuItem(prevState => {
      const updatedOptions = [...prevState.options];
      updatedOptions[index] = { ...updatedOptions[index], [name]: value };
      return { ...prevState, options: updatedOptions };
    });
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
       
        {menuItem.options.map((option, index) =>
        option.type === 'group' ? (
          <div key={index} className={styles.optionGroup}>
            <label>
              Group Name:
              <input
                name='group'
                type="text"
                value={option.group}
                onChange={(e) => handleGroupOptionChange(index, e)}
              />
            </label>
            <label>
              Min Selection:
              <input
                name='selectionMin'
                type="number"
                value={option.selectionMin}
                onChange={(e) => handleGroupOptionChange(index, e)}
              />
            </label>
            <label>
              Max Selection:
              <input
              name='selectionMax'
                type="number"
                value={option.selectionMax}
                onChange={(e) => handleGroupOptionChange(index, e)}
              />
            </label>
            <button type="button" onClick={() => deleteOption(index)}>Delete Group</button>
            {option.options.map((subOption, subIndex) => (
              <div key={subIndex} className={styles.subOption}>
                <label>
                  Sub Option Title:
                  <input
                    type="text"
                    value={subOption.title}
                    onChange={(e) => handleGroupOptionChange(index, e, subIndex)}
                  />
                </label>
                <label>
                  Price:
                  <input
                    type="number"
                    value={subOption.price}
                    onChange={(e) => handleGroupOptionChange(index, e, subIndex)}
                  />
                </label>
                <label>
                  Time to Cook:
                  <input
                    type="number"
                    value={subOption.timeToCook}
                    onChange={(e) => handleGroupOptionChange(index, e, subIndex)}
                  />
                </label>
                <button type="button" onClick={() => deleteSubOption(index, subIndex)}>Delete Sub-Option</button>
              </div>
            ))}
            <button type="button" onClick={() => addSubOptionToGroup(index)} className={styles.addSubOptionButton}>Add Sub-Option</button>
          </div>
        ) : (
          <div key={index} className={styles.individualOption}>
            <label>
              Option Title:
              <input
                type="text"
                name="title"
                value={option.title}
                onChange={(e) => handleIndividualOptionChange(index, e)}
              />
            </label>
            <label>
              Price:
              <input
                type="number"
                name="price"
                value={option.price}
                onChange={(e) => handleIndividualOptionChange(index, e)}
              />
            </label>
            <label>
              Time to Cook:
              <input
                type="number"
                name="timeToCook"
                value={option.timeToCook}
                onChange={(e) => handleIndividualOptionChange(index, e)}
              />
            </label>
            <button type="button" onClick={() => deleteOption(index)}>Delete Option</button>
          </div>
        )
      )}

      <button type="button" onClick={addIndividualOption} className={styles.addButton}>Add Individual Option</button>
      <button type="button" onClick={addOptionGroup} className={styles.addButton}>Add Option Group</button>

      <button type="submit" className={styles.saveButton}>Save Changes</button>

      </form>
    </div>
  );
};

export default EditMenuItem;
