import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addMenuItem } from '../../api/menuRequests';
import uploadImage from '../../api/imageRequests';
import styles from '../styles/dashboard/AddMenuItem.module.css';

function AddNewMenuItem() {
  const navigate = useNavigate();
  const [menuItem, setMenuItem] = useState({
    title: '', 
    description: '',
    price: '',
    pieces: '', 
    category: '',
    tags: '',
    timeToCook: '', 
    options: [],
    optionGroups: [],
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

  const handleOptionChange = (groupIndex, e, field, isOptionGroup = false, subIndex = null) => {
    const { name, value } = e.target;
    
    setMenuItem(prevState => {
      if (isOptionGroup) {
        // Deep copy and update for option groups
        const updatedOptionGroups = prevState.optionGroups.map((group, idx) => {
          if (idx === groupIndex) {
            const updatedOptions = group.options.map((option, optIdx) => {
              if (optIdx === subIndex) {
                return { ...option, [name]: value }; // Update the specific sub-option
              }
              return option; // Leave other sub-options unchanged
            });
  
            return { ...group, options: updatedOptions }; // Update the group with the updated options array
          }
          return group; // Leave other groups unchanged
        });
  
        return { ...prevState, optionGroups: updatedOptionGroups };
      } else {
        // Update for individual options (if needed)
        const updatedOptions = prevState.options.map((option, idx) => {
          if (idx === groupIndex) {
            return { ...option, [name]: value }; // Update the specific option
          }
          return option; // Leave other options unchanged
        });
  
        return { ...prevState, options: updatedOptions };
      }
    });
  };

  const addOption = () => {
    const newOption = { title: '', timeToCook: '', price: '' };
    setMenuItem({ ...menuItem, options: [...menuItem.options, newOption] });
  };

  const addGroup = () => {
    const newGroup = { title: '', minSelection: 1, maxSelection: 3, options: [] };
    setMenuItem({ ...menuItem, optionGroups: [...menuItem.optionGroups, newGroup] });
  };

  const addOptionToGroup = (groupIndex) => {
    const newOptionGroups = [...menuItem.optionGroups];
    const newOption = { title: '', timeToCook: '', price: '' };
    newOptionGroups[groupIndex].options.push(newOption);
    setMenuItem({ ...menuItem, optionGroups: newOptionGroups });
  };

  const deleteOption = (index) => {
    const filteredOptions = menuItem.options.filter((_, i) => i !== index);
    setMenuItem({ ...menuItem, options: filteredOptions });
  };

  const deleteGroup = (index) => {
    const filteredOptionGroups = menuItem.optionGroups.filter((_, i) => i !== index);
    setMenuItem({ ...menuItem, optionGroups: filteredOptionGroups });
  };

  const deleteSubOption = (groupIndex, subOptionIndex) => {
    const newOptionGroups = [...menuItem.optionGroups];
    newOptionGroups[groupIndex].options = newOptionGroups[groupIndex].options.filter((_, i) => i !== subOptionIndex);
    setMenuItem({ ...menuItem, optionGroups: newOptionGroups });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert price to cents
    const priceInCents = Math.round(menuItem.price);
    // Convert minutes to seconds
    const timeToCookInSeconds = menuItem.timeToCook;
    // Convert tags from string to array
    const tagsArray = menuItem.tags.split(',').map(tag => tag.trim());
    
    const newMenuItem = {
      ...menuItem,
      itemId: menuItem.title,
      price: priceInCents,
      timeToCook: timeToCookInSeconds,
      tags: tagsArray,
    };

    // Log newMenuItem to check values
    console.log('new menu item: ', newMenuItem);

    // Convert all options' and sub-options' price and timeToCook fields to 0 if left blank on submission
    newMenuItem.options = menuItem.options.map(option => ({
      ...option,
      price: option.price ? parseFloat(option.price) : 0,
      timeToCook: option.timeToCook ? parseInt(option.timeToCook, 10) : 0,
    }));

    newMenuItem.optionGroups = menuItem.optionGroups.map(group => ({
      ...group,
      options: group.options.map(subOption => ({
        ...subOption,
        price: subOption.price ? parseFloat(subOption.price) : 0,
        timeToCook: subOption.timeToCook ? parseInt(subOption.timeToCook, 10) : 0,
      })),
    }));

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

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input name="title" value={menuItem.title} onChange={handleChange} placeholder="Title" />
      <input name="pieces" type="number" value={menuItem.pieces} onChange={handleChange} placeholder="Pieces" />
      <textarea name="description" value={menuItem.description} onChange={handleChange} placeholder="Description" />
      <input name="price" type="text" value={menuItem.price} onChange={handleChange} placeholder="Price (in cents)" />
      <input name="category" value={menuItem.category} onChange={handleChange} placeholder="Category" />
      <input name="tags" value={menuItem.tags} onChange={handleChange} placeholder="Tags (comma-separated)" />
      <input name="timeToCook" type="text" value={menuItem.timeToCook} onChange={handleChange} placeholder="Time to Cook (in seconds)" />
      <label>Image: <input type="file" onChange={handleImageChange} /></label>
      <button type="button" onClick={addOption}>Add Individual Option</button>
      <button type="button" onClick={addGroup}>Add Option Group</button>

      <div>
        <h4>Individual Options</h4>
        {menuItem.options.map((option, index) => (
          <div key={index}>
            <input
              name="title"
              value={option.title}
              onChange={(e) => handleOptionChange(index, e, 'title')}
              placeholder="Option Title"
            />
            <input
              name="price"
              type="number"
              value={option.price}
              onChange={(e) => handleOptionChange(index, e, 'price')}
              placeholder="Option Price"
            />
            <input
              name="timeToCook"
              type="number"
              value={option.timeToCook}
              onChange={(e) => handleOptionChange(index, e, 'timeToCook')}
              placeholder="Time to Cook"
            />
            <button type="button" onClick={() => deleteOption(index)}>Delete Option</button>
          </div>
        ))}
        <button type="button" onClick={addOption}>Add New Option</button>
      </div>

      <div>
        <h4>Option Groups</h4>
        {menuItem.optionGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            <input
              name="title"
              value={group.title}
              onChange={(e) => handleOptionChange(groupIndex, e, 'title', true)}
              placeholder="Group Title"
            />
            <input
              name="minSelection"
              type="number"
              value={group.minSelection}
              onChange={(e) => handleOptionChange(groupIndex, e, 'minSelection', true)}
              placeholder="Minimum Selection"
            />
            <input
              name="maxSelection"
              type="number"
              value={group.maxSelection}
              onChange={(e) => handleOptionChange(groupIndex, e, 'maxSelection', true)}
              placeholder="Maximum Selection"
            />
            <h5>Options in this Group</h5>
            {group.options.map((subOption, subIndex) => (
              <div key={subIndex}>
                <input
                  name="title"
                  value={subOption.title}
                  onChange={(e) => handleOptionChange(groupIndex, e, 'title', true, subIndex)}
                  placeholder="Sub-Option Title"
                />
                <input
                  name="price"
                  type="number"
                  value={subOption.price}
                  onChange={(e) => handleOptionChange(groupIndex, e, 'price', true, subIndex)}
                  placeholder="Sub-Option Price"
                />
                <input
                  name="timeToCook"
                  type="number"
                  value={subOption.timeToCook}
                  onChange={(e) => handleOptionChange(groupIndex, e, 'timeToCook', true, subIndex)}
                  placeholder="Sub-Option Time to Cook"
                />
                <button type="button" onClick={() => deleteSubOption(groupIndex, subIndex)}>Delete Sub-Option</button>
              </div>
            ))}
            <button type="button" onClick={() => addOptionToGroup(groupIndex)}>Add Option to Group</button>
            <button type="button" onClick={() => deleteGroup(groupIndex)}>Delete Group</button>
          </div>
        ))}
        <button type="button" onClick={addGroup}>Add New Option Group</button>
      </div>

      <label className={styles.toggleLabel}>
        Active:
        <input
          type="checkbox"
          checked={menuItem.active}
          onChange={handleToggleChange}
          className={styles.toggleInput}
        />
      </label>

      <button type="submit">Submit</button>
    </form>
  );
}

export default AddNewMenuItem;
