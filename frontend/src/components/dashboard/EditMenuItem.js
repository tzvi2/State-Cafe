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
    optionGroups: [],
    description: '',
    active: false,
  });

  useEffect(() => {
    const fetchMenuItem = async () => {
      try {
        const item = await getMenuItemByItemId(itemId);
        if (item) {
          setMenuItem({
            ...item,
            options: item.options || [],
            optionGroups: item.optionGroups || [],
            active: item.active !== undefined ? item.active : false
          });
        }
      } catch (error) {
        console.error('Error fetching menu item:', error);
      }
    };
  
    fetchMenuItem();
  }, [itemId]);
  
  const uploadImage = () => {}

  const handleImageChange = async (e) => {
    return
    const file = e.target.files[0];
    if (file) {
      const imageUrl = await uploadImage(file); // Use your actual API call to upload the image
      setMenuItem((prevState) => ({ ...prevState, img: imageUrl }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMenuItem(prev => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index, e, isGroup = false, groupIndex = null) => {
    const { name, value } = e.target;
  
    if (isGroup) {
      setMenuItem(prevState => {
        const updatedOptionGroups = prevState.optionGroups.map((group, idx) => {
          if (idx === groupIndex) {
            if (index === null) {
              // Editing group-level properties
              return { ...group, [name]: name.includes('Selection') ? parseInt(value, 10) : value };
            } else {
              // Editing sub-options within the group
              const updatedSubOptions = group.options.map((subOption, subIdx) => {
                if (subIdx === index) {
                  return { ...subOption, [name]: value };
                }
                return subOption;
              });
              return { ...group, options: updatedSubOptions };
            }
          }
          return group;
        });
  
        return { ...prevState, optionGroups: updatedOptionGroups };
      });
    } else {
      // Handling changes to individual options
      setMenuItem(prevState => ({
        ...prevState,
        options: prevState.options.map((option, optIdx) => optIdx === index ? { ...option, [name]: value } : option),
      }));
    }
  };
  
  const addOptionGroup = () => {
    setMenuItem(prevState => ({
      ...prevState,
      optionGroups: [...prevState.optionGroups, { title: '', minSelection: 1, maxSelection: 1, options: [] }],
    }));
  };
  
  const addIndividualOption = () => {
    setMenuItem(prevState => ({
      ...prevState,
      options: [...prevState.options, { title: '', price: '', timeToCook: '' }],
    }));
  };
  
  const addSubOptionToGroup = (groupIndex) => {
    setMenuItem((prevState) => {
      const newOptionGroups = [...prevState.optionGroups];
      newOptionGroups[groupIndex].options = [
        ...newOptionGroups[groupIndex].options,
        { title: '', price: '', timeToCook: '' },
      ];

      return { ...prevState, optionGroups: newOptionGroups };
    });
  };
  
  const deleteOption = (index, isGroup = false, groupIndex = null) => {
    setMenuItem((prevState) => {
      if (isGroup) {
        const newOptionGroups = prevState.optionGroups.map((group, idx) => {
          if (idx === groupIndex) {
            const newOptions = group.options.filter((_, optionIdx) => optionIdx !== index);
            return { ...group, options: newOptions };
          }
          return group;
        });

        return { ...prevState, optionGroups: newOptionGroups };
      } else {
        const newOptions = prevState.options.filter((_, optionIdx) => optionIdx !== index);
        return { ...prevState, options: newOptions };
      }
    });
  };

  const deleteGroup = (groupIndex) => {
    setMenuItem((prevState) => ({
      ...prevState,
      optionGroups: prevState.optionGroups.filter((_, idx) => idx !== groupIndex),
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

        {/* Image upload and preview */}
        <label>
          Image:
          <input type="file" onChange={handleImageChange} />
          {menuItem.img && <img src={menuItem.img} alt="Menu Item" style={{ width: '100px', height: '100px' }} />}
        </label>

        {/* Rendering and editing individual options */}
        {menuItem.options.map((option, index) => (
          <div key={index}>
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
              Price:
              <input
                type="number"
                name="price"
                value={option.price}
                onChange={(e) => handleOptionChange(index, e)}
              />
            </label>
            <label>
              Time to Cook:
              <input
                type="number"
                name="timeToCook"
                value={option.timeToCook}
                onChange={(e) => handleOptionChange(index, e)}
              />
            </label>
            <button type="button" onClick={() => deleteOption(index, false)}>Delete Option</button>
          </div>
        ))}
        <button type="button" onClick={addIndividualOption}>Add New Option</button>

        {/* Rendering and editing option groups */}
        {menuItem.optionGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            <input
              type="text"
              name='title'
              value={group.title}
              onChange={(e) => handleOptionChange(null, e, true, groupIndex)}
              placeholder="Group Title"
            />
            <input
              type="number"
              name="minSelection"
              value={group.minSelection}
              onChange={(e) => handleOptionChange(null, e, true, groupIndex)}
              placeholder="Minimum Selection"
            />
            <input
              type="number"
              name="maxSelection"
              value={group.maxSelection}
              onChange={(e) => handleOptionChange(null, e, true, groupIndex)}
              placeholder="Maximum Selection"
            />

            {group.options.map((subOption, subIndex) => (
              <div key={subIndex}>
                <input 
                  name="title" 
                  value={subOption.title} 
                  onChange={(e) => handleOptionChange(subIndex, e, true, groupIndex)} 
                  placeholder="Sub-Option Title" 
                />
                <input 
                  name="price" 
                  type="number" 
                  value={subOption.price} 
                  onChange={(e) => handleOptionChange(subIndex, e, true, groupIndex)} 
                  placeholder="Sub-Option Price" 
                />
                <input 
                  name="timeToCook" 
                  type="number" 
                  value={subOption.timeToCook} 
                  onChange={(e) => handleOptionChange(subIndex, e, true, groupIndex)} 
                  placeholder="Sub-Option Time to Cook" 
                />
                <button type="button" onClick={() => deleteOption(subIndex, true, groupIndex)}>Delete Sub-Option</button>
              </div>
            ))}
            <button type="button" onClick={() => addSubOptionToGroup(groupIndex)}>Add Sub-Option</button>
            <button type="button" onClick={() => deleteGroup(groupIndex)}>Delete Group</button>
          </div>
        ))}
        <button type="button" onClick={addOptionGroup}>Add Option Group</button>

      <button type="submit" className={styles.saveButton}>Save Changes</button>

      </form>
    </div>
  );
};

export default EditMenuItem;
