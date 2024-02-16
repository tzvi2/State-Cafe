import React, { useEffect, useState } from 'react';
import styles from '../styles/dashboard/AddMenuItem.module.css'; 
import { addMenuItem }  from '../../api/menuRequests'
import { useNavigate } from 'react-router-dom';

function AddNewMenuItem() {
  const navigate = useNavigate()

  async function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
  
    try {
      const response = await fetch('https://state-cafe.vercel.app/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      console.log('Uploaded Image URL:', data.url);
      // You can now set the image URL in your state and use it as needed
    } catch (error) {
      console.error(error);
    }
  }
  
  const [image, setImage] = useState(null)
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
    active: true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMenuItem((prevMenuItem) => ({
      ...prevMenuItem,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
        setImage(e.target.files[0]);
    }
};

  const handleToggleChange = (e) => {
    setMenuItem((prevMenuItem) => ({
      ...prevMenuItem,
      active: e.target.checked,
    }));
  };

  const handleSubmit = async (e) => {
    console.log('description: ', menuItem.description)
    e.preventDefault();

    if (image) {
        const formData = new FormData();
        formData.append('image', image);

        try {
            // Send the image to your backend
            const uploadResponse = await fetch('https://state-cafe.vercel.app/upload', {
                method: 'POST',
                body: formData,
            });
            if (!uploadResponse.ok) throw new Error('Upload failed');
            
            const uploadData = await uploadResponse.json();
            const imageUrl = uploadData.url; // The URL returned from your backend

            // Now include this imageUrl in your menuItem data
            const updatedMenuItem = {
                ...menuItem,
                img: imageUrl,
            };

            // Finally, submit the updated menuItem, including the image URL
            const response = await addMenuItem(updatedMenuItem);
            console.log("Menu item added successfully", response);
            navigate("/menu-dashboard");
        } catch (error) {
            console.error("Error during the image upload or menu item addition", error);
        }
    } else {
        console.error("No image selected");
    }
};


  const addOption = () => {
    setMenuItem((prevMenuItem) => ({
      ...prevMenuItem,
      options: [...prevMenuItem.options, { title: '', price: '', timeToCook: '' }],
    }));
  };

  const handleOptionChange = (index, e) => {
    const updatedOptions = menuItem.options.map((option, idx) => {
      if (idx === index) {
        return { ...option, [e.target.name]: e.target.value };
      }
      return option;
    });

    setMenuItem((prevMenuItem) => ({
      ...prevMenuItem,
      options: updatedOptions,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className={styles.menuItemUploadForm}>
      <label>Title: <input type="text" name="title" value={menuItem.title} onChange={handleChange} /></label>
      <label>Item ID: <input type="text" name="itemId" value={menuItem.itemId} onChange={handleChange} /></label>
      <label>Pieces: <input type="number" name="pieces" value={menuItem.pieces} onChange={handleChange} /></label>      
      <label>Description: 
        <textarea 
          name="description" 
          value={menuItem.description} 
          onChange={handleChange}
          rows="4" // You can adjust the number of rows as needed
        />
      </label>
      <label>Price: <input type="number" name="price" value={menuItem.price} onChange={handleChange} /></label>
      <label>Category: <input type="text" name="category" value={menuItem.category} onChange={handleChange} /></label>
      <label>Tags: <input type="text" name="tags" value={menuItem.tags} onChange={handleChange} /></label>
      <label>Time to Cook: <input type="number" name="timeToCook" value={menuItem.timeToCook} onChange={handleChange} /></label>
      <label>Image: <input type="file" onChange={handleImageChange} /></label>
      
      <div className={styles.optionSection}>
        <h4>Add Option</h4>
        {menuItem.options.map((option, index) => (
          <div key={index}>
            <input
              type="text"
              name="title"
              value={option.title}
              onChange={(e) => handleOptionChange(index, e)}
              placeholder="Option title"
              className={styles.input}
            />
            <input
              type="number"
              name="price"
              value={option.price}
              onChange={(e) => handleOptionChange(index, e)}
              placeholder="Price"
              className={styles.input}
            />
            <input
              type="number"
              name="timeToCook"
              value={option.timeToCook}
              onChange={(e) => handleOptionChange(index, e)}
              placeholder="Time to cook"
              className={styles.input}
            />
          </div>
        ))}
        <button type="button" onClick={addOption} className={styles.addOptionButton}>Add Option</button>
      </div>
      <div className={styles.toggleContainer}>
        <label className={styles.toggleLabel}>
          Active:
          <input
            type="checkbox"
            checked={menuItem.isActive}
            onChange={handleToggleChange}
            className={styles.toggleInput}
          />
        </label>
      </div>
      <button type="submit" className={styles.submitButton}>Submit</button>
    </form>
  );
}

export default AddNewMenuItem;
