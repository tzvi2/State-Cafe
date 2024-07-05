import React, { useState } from 'react';
import { saveWeightData, deleteWeightData, updateQuantityRemaining } from '../../api/stockRequests';
import styles from '../styles/dashboard/StockPage.module.css';
import { centsToFormattedPrice } from '../../utils/priceUtilities';

const ItemQuantity = ({ title, data, selectedDate, updateStockData }) => {
  const [showNewWeight, setShowNewWeight] = useState(false);
  const [newWeightData, setNewWeightData] = useState({
    weight: '',
    price: '',
    quantity: '',
  });

  const [newQuantity, setNewQuantity] = useState(data.quantity);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewWeightData({
      ...newWeightData,
      [name]: value,
    });
  };

  const handleQuantityChange = (e) => {
    setNewQuantity(e.target.value);
  };

  const handleAddNewWeight = async () => {
    const validatedWeightData = {
      weight: newWeightData.weight,
      price: Number(newWeightData.price),
      quantity: Number(newWeightData.quantity),
    };

    await saveWeightData(selectedDate, title, validatedWeightData);
    // Add the new weight data to the existing data
    updateStockData(prevData => ({
      ...prevData,
      [title]: [...prevData[title], validatedWeightData]
    }));
    setNewWeightData({ weight: '', price: '', quantity: '' });
    setShowNewWeight(false);
  };

  const handleDeleteWeight = async (item) => {
    await deleteWeightData(selectedDate, title, item);
    // Remove the deleted item from the local state
    updateStockData(prevData => ({
      ...prevData,
      [title]: prevData[title].filter(i => i !== item)
    }));
  };

  const handleUpdateQuantity = async () => {
    const updatedQuantity = Number(newQuantity);
    await updateQuantityRemaining(selectedDate, title, updatedQuantity);
    updateStockData(prevData => ({
      ...prevData,
      [title]: { ...prevData[title], quantity: updatedQuantity }
    }));
    setNewQuantity(updatedQuantity); // Reset newQuantity to hide the save button
  };

  return (
    <div>
      <li className={styles.flexRow}>
        <p className={styles.menuItemTitle}>{title}</p>

        {/* not sold by weight */}
        {!Array.isArray(data) && (
          <>
            <input 
              type="number"
              value={newQuantity}
              onChange={handleQuantityChange}
            />
            {newQuantity !== data.quantity && (
              <button onClick={handleUpdateQuantity}>Save</button>
            )}
          </>
        )}
      </li>

      {/* sold by weight */}
      {Array.isArray(data) && (
        <ul className={styles.list}>
          {data.map((item, index) => (
            <li className={styles.flexRow} key={index}>
              <p>{item.weight}</p>
              <p>{centsToFormattedPrice(item.price)}</p>
              <p className={styles.quantity}>{item.quantity}</p>
              <button onClick={() => handleDeleteWeight(item)}>Delete</button>
            </li>
          ))}
          <button onClick={() => setShowNewWeight(!showNewWeight)}>+</button>
          {showNewWeight && (
            <div>
              <input
                type="text"
                name="weight"
                value={newWeightData.weight}
                onChange={handleInputChange}
                placeholder="Weight"
              />
              <input
                type="number"
                name="price"
                value={newWeightData.price}
                onChange={handleInputChange}
                placeholder="Price"
              />
              <input
                type="number"
                name="quantity"
                value={newWeightData.quantity}
                onChange={handleInputChange}
                placeholder="Quantity"
              />
              <button onClick={handleAddNewWeight}>Save</button>
            </div>
          )}
        </ul>
      )}
    </div>
  );
};

export default ItemQuantity;
