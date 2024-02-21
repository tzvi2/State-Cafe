import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming you're using react-router for navigation
import { addMenuItem } from '../../api/menuRequests'; // Your API call for adding a menu item
import uploadImage from '../../api/imageRequests'
import styles from '../styles/dashboard/AddMenuItem.module.css'

function AddNewMenuItem() {
  const navigate = useNavigate();
  const [menuItem, setMenuItem] = useState({
    title: '',
    pieces: '',
    description: '',
    price: '',
    category: '',
    tags: '',
    timeToCook: '',
    options: [],
    active: true,
  });
  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMenuItem({ ...menuItem, [name]: value });
  };
  
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleToggleChange = (e) => {
    setMenuItem((prevMenuItem) => ({
      ...prevMenuItem,
      active: e.target.checked,
    }));
  };
  
  const handleOptionChange = (index, e, field, optionType = 'individual', subIndex = null) => {
    const { name, value } = e.target;
    const newValue = field === 'price' || field === 'timeToCook' ? parseFloat(value) || '' : value; // Handle numeric values
    
    setMenuItem(prevState => {
      let newOptions = [...prevState.options];
      if (optionType === 'individual') {
        // Update individual option directly
        newOptions[index][field] = newValue;
      } else if (optionType === 'group') {
        // Deep clone to avoid mutating nested state
        let newGroupOptions = [...newOptions[index].options];
        if (field === 'group' || field === 'selectionMin' || field === 'selectionMax') {
          // Update group's own fields
          newOptions[index][field] = newValue;
        } else if (subIndex !== null) {
          // Update sub-option within a group
          newGroupOptions[subIndex][field] = newValue;
          newOptions[index].options = newGroupOptions; // Update the group with the modified sub-options
        }
      }
      return { ...prevState, options: newOptions };
    });
  };
  
  
  const addOption = () => {
    setMenuItem({
      ...menuItem,
      options: [...menuItem.options, { type: 'individual', title: '', price: '', timeToCook: '' }],
    });
  };
  
  const addGroup = () => {
    setMenuItem({
      ...menuItem,
      options: [...menuItem.options, { type: 'group', group: '', selectionMin: 1, selectionMax: 1, options: [] }],
    });
  };
  
  const addOptionToGroup = (groupIndex) => {
    const newOptions = [...menuItem.options];
    newOptions[groupIndex].options.push({ title: '', price: '', timeToCook: '' });
    setMenuItem({ ...menuItem, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert price to cents
    const priceInCents = Math.round(menuItem.price * 100);
    // convert minutes to seconds
    const timeToCookInSeconds = menuItem.timeToCook * 60;
    // Convert tags from string to array
    const tagsArray = menuItem.tags.split(',').map(tag => tag.trim());
    
    const newMenuItem = {
      ...menuItem,
      itemId: menuItem.title,
      price: priceInCents,
      timeToCook: timeToCookInSeconds,
      tags: tagsArray,
      img: image
    };

    // convert all options' and sub options' price and timeToCook fields to 0 if left blank on submission
    newMenuItem.options = menuItem.options.map(option => {
      if (option.type === 'individual') {
        return {
          ...option,
          price: option.price ? parseFloat(option.price) : 0,
          timeToCook: option.timeToCook ? parseInt(option.timeToCook, 10) : 0,
        };
      } else if (option.type === 'group') {
        return {
          ...option,
          options: option.options.map(subOption => ({
            ...subOption,
            price: subOption.price ? parseFloat(subOption.price) : 0,
            timeToCook: subOption.timeToCook ? parseInt(subOption.timeToCook, 10) : 0,
          })),
        };
      }
      return option; // Return the option if it doesn't match the expected types
    });

    if (image) {
      try {
        const imageUrl = await uploadImage(image); 
        newMenuItem.img = imageUrl;
      } catch (error) {
        console.error("Error during the image upload", error);
        return; // Exit the function if image upload fails
      }
    }
  
    try {
      await addMenuItem(newMenuItem);
      console.log("Menu item added successfully");
      navigate("/menu-dashboard"); // Navigate to dashboard or confirmation page
    } catch (error) {
      console.error("Error adding menu item", error);
    }
  };

  const deleteOption = (index) => {
    setMenuItem((prevState) => ({
      ...prevState,
      options: prevState.options.filter((_, optionIndex) => optionIndex !== index),
    }));
  };
  
  const deleteGroup = (groupIndex) => {
    setMenuItem((prevState) => ({
      ...prevState,
      options: prevState.options.filter((_, index) => index !== groupIndex),
    }));
  };
  
  const deleteSubOption = (groupIndex, subOptionIndex) => {
    setMenuItem((prevState) => {
      let optionsCopy = [...prevState.options];
      let groupOptionsCopy = [...optionsCopy[groupIndex].options.filter((_, index) => index !== subOptionIndex)];
      optionsCopy[groupIndex].options = groupOptionsCopy;
      return { ...prevState, options: optionsCopy };
    });
  };
  

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input name="title" value={menuItem.title} onChange={handleChange} placeholder="Title" />
      <input name="pieces" type="number" value={menuItem.pieces} onChange={handleChange} placeholder="Pieces" />
      <textarea name="description" value={menuItem.description} onChange={handleChange} placeholder="Description" />
      <input name="price" type="text" value={menuItem.price} onChange={handleChange} placeholder="Price (in dollars)" />
      <input name="category" value={menuItem.category} onChange={handleChange} placeholder="Category" />
      <input name="tags" value={menuItem.tags} onChange={handleChange} placeholder="Tags (comma-separated)" />
      <input name="timeToCook" type="text" value={menuItem.timeToCook} onChange={handleChange} placeholder="Time to Cook (in minutes)" />
      <input type="file" onChange={handleImageChange} />
      <button type="button" onClick={addOption}>Add Individual Option</button>
      <button type="button" onClick={addGroup}>Add Option Group</button>
      {menuItem.options.map((option, index) => (
        option.type === 'group' ? (
          <div key={index}>
            <input name="group" value={option.group} onChange={(e) => handleOptionChange(index, e, 'group', 'group')} placeholder="Group Name" />
            <input name="selectionMin" type="number" value={option.selectionMin} onChange={(e) => handleOptionChange(index, e, 'selectionMin', 'group')} placeholder="Min Selection" />
            <input name="selectionMax" type="number" value={option.selectionMax} onChange={(e) => handleOptionChange(index, e, 'selectionMax', 'group')} placeholder="Max Selection" />
            <button type="button" onClick={() => deleteGroup(index)}>Delete Group</button>
            {option.options.map((subOption, subIndex) => (
              <div key={subIndex}>
                <input 
                  name="title" 
                  value={subOption.title} 
                  onChange={(e) => handleOptionChange(index, e, 'title', 'group', subIndex)} 
                  placeholder="Sub-Option Title" 
                />
                <input 
                  name="price" 
                  type="number"
                  value={subOption.price} 
                  onChange={(e) => handleOptionChange(index, e, 'price', 'group', subIndex)} 
                  placeholder="Sub-Option Price" 
                />
                <input 
                  name="timeToCook" 
                  type="number"
                  value={subOption.timeToCook} 
                  onChange={(e) => handleOptionChange(index, e, 'timeToCook', 'group', subIndex)} 
                  placeholder="Sub-Option Time to Cook" 
                />
                <button type="button" onClick={() => deleteSubOption(index, subIndex)}>Delete Sub-Option</button>
              </div>
            ))}
            <button type="button" onClick={() => addOptionToGroup(index)}>Add Option to Group</button>
          </div>
        ) : (
          <div key={index}>
            <input name="title" value={option.title} onChange={(e) => handleOptionChange(index, e, 'title')} placeholder="Option Title" />
            <input name="price" type="text" value={option.price} onChange={(e) => handleOptionChange(index, e, 'price')} placeholder="Option Price" />
            <input name="timeToCook" type="text" value={option.timeToCook} onChange={(e) => handleOptionChange(index, e, 'timeToCook')} placeholder="Option Time to Cook" />
            <button type="button" onClick={() => deleteOption(index)}>Delete Option</button>
          </div>
        )
      ))}
     
      <label className={styles.toggleLabel}>
        Active:
        <input
          type="checkbox"
          checked={menuItem.isActive}
          onChange={handleToggleChange}
          className={styles.toggleInput}
        />
      </label>

      <button type="submit">Submit</button>
    </form>
  );
  
  
}

export default AddNewMenuItem
