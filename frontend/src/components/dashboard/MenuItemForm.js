import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addMenuItem, getMenuItemByItemId, updateMenuItem } from '../../api/menuRequests';
import styles from '../styles/dashboard/MenuItemForm.module.css';
import IndividualOptions from './IndividualOptions';
import OptionGroups from './OptionGroups';

function MenuItemForm() {
  const navigate = useNavigate();
  const { itemId } = useParams(); // Get the itemId from URL parameters
  const [menuItem, setMenuItem] = useState(null); // Initialize as null
  const [initialMenuItem, setInitialMenuItem] = useState(null);
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // If itemId is present, fetch the existing menu item data
    if (itemId) {
      const fetchMenuItem = async () => {
        try {
          const item = await getMenuItemByItemId(itemId);
          setMenuItem(item);
          setInitialMenuItem(item); // Track the initial state
        } catch (error) {
          console.error("Error fetching menu item:", error);
        }
      };

      fetchMenuItem();
    } else {
      setMenuItem({
        title: '',
        description: '',
        price: '',
        pieces: '',
        category: '',
        tags: [],
        timeToCook: '',
        options: [],
        optionGroups: [],
        soldByWeight: false,
        weightOptions: [],
        active: true,
        img: null, // Add img property to hold the image URL
      });
    }
  }, [itemId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMenuItem((prevMenuItem) => ({ ...prevMenuItem, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMenuItem((prevMenuItem) => ({
          ...prevMenuItem,
          img: reader.result, // Base64 encoded image
        }));
      };
      reader.readAsDataURL(file);
    }
  };


  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleToggleChange = (e) => {
    setMenuItem((prevMenuItem) => ({
      ...prevMenuItem,
      active: e.target.checked,
    }));
  };

  const toggleSoldByWeight = (e) => {
    setMenuItem((prevMenuItem) => ({
      ...prevMenuItem,
      soldByWeight: e.target.checked,
    }));
  };

  const handleRemoveOption = (index) => {
    const newOptions = [...menuItem.options];
    newOptions.splice(index, 1);
    setMenuItem((prevMenuItem) => ({
      ...prevMenuItem,
      options: newOptions,
    }));
  };

  const handleOptionGroupsChange = (optionGroups) => {
    setMenuItem((prevMenuItem) => ({
      ...prevMenuItem,
      optionGroups: optionGroups,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare new menu item data
    const priceInCents = Math.round(menuItem.price);
    const timeToCookInSeconds = menuItem.timeToCook;
    const tagsArray = [];

    const newMenuItem = {
      ...menuItem,
      price: priceInCents,
      timeToCook: timeToCookInSeconds,
      tags: tagsArray,
    };

    // Ensure all numeric fields are properly parsed
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

    console.log('new menu item', newMenuItem)
    try {
      if (itemId) {
        // Update existing menu item
        await updateMenuItem({ itemId, newMenuItem });
        console.log("Menu item updated successfully");
      } else {
        // Add a new menu item
        await addMenuItem(newMenuItem);
        console.log("Menu item added successfully");
      }
      navigate("/dashboard/menu");
    } catch (error) {
      console.error("Error adding/updating menu item", error);
    }
  };

  const hasChanges = initialMenuItem && JSON.stringify(initialMenuItem) !== JSON.stringify(menuItem);

  if (!menuItem) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input name="title" value={menuItem.title} onChange={handleChange} placeholder="Title" />
      <textarea name="description" value={menuItem.description} onChange={handleChange} placeholder="Description" />
      <input name="price" type="text" value={menuItem.price} onChange={handleChange} placeholder="Price (in cents)" />
      <input name="category" value={menuItem.category} onChange={handleChange} placeholder="Category" />
      <input name="timeToCook" type="text" value={menuItem.timeToCook} onChange={handleChange} placeholder="Time to Cook (in seconds)" />

      <label>Image:</label>
      {menuItem.img && (
        <div onClick={handleImageClick} className={styles.imageContainer}>
          <img src={menuItem.img} alt="Menu Item" className={styles.imagePreview} />
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
      />

      <div>
        <h4>Options</h4>
        <IndividualOptions
          options={menuItem.options}
          setOptions={(newOptions) => setMenuItem((prevMenuItem) => ({ ...prevMenuItem, options: newOptions }))}
          removeOption={handleRemoveOption} // Pass remove function to IndividualOptions component
        />
        <OptionGroups
          optionGroups={menuItem.optionGroups}
          setOptionGroups={handleOptionGroupsChange}
        />
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

      <label className={styles.toggleLabel}>
        Sold by weight:
        <input
          type="checkbox"
          checked={menuItem.soldByWeight}
          onChange={toggleSoldByWeight}
          className={styles.toggleInput}
        />
      </label>

      <button type="submit">{hasChanges ? 'Save' : 'Submit'}</button>
    </form>
  );
}

export default MenuItemForm;
