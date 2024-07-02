import React, { useState, useEffect } from 'react';
import { getStockForDate, saveWeightData } from '../../api/stockRequests';
import { getCurrentDateString } from '../../utils/dateUtilities';
import styles from '../styles/dashboard/StockPage.module.css';
import { centsToFormattedPrice } from '../../utils/priceUtilities';

function StockPage() {
  const getLocalDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [stockData, setStockData] = useState({});
  const [selectedDate, setSelectedDate] = useState(getLocalDate());

  useEffect(() => {
    const getStockData = async () => {
      const data = await getStockForDate(selectedDate);
      setStockData(data);
    };
    getStockData();
  }, [selectedDate]);

  useEffect(() => {
    console.log('stock data ', stockData);
  }, [stockData]);

  return (
    <ul className={styles.itemsColumn}>
      <input 
        type='date' 
        value={selectedDate} 
        onChange={e => setSelectedDate(e.target.value)} 
      />
      {Object.entries(stockData).map(([menuItem, data]) => (
        <ItemQuantity key={menuItem} title={menuItem} data={data} selectedDate={selectedDate} />
      ))}
    </ul>
  );
}

const ItemQuantity = ({ title, data, selectedDate }) => {
  const [showNewWeight, setShowNewWeight] = useState(false);
  const [newWeightData, setNewWeightData] = useState({
    weight: '',
    price: 0,
    quantity: 0,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewWeightData({
      ...newWeightData,
      [name]: value,
    });
  };

  const handleAddNewWeight = async () => {
		const validatedWeightData = {
			weight: newWeightData.weight,
			price: Number(newWeightData.price),
			
		}

    await saveWeightData(selectedDate, title, validatedWeightData);
    // Add the new weight data to the existing data
    data.push(newWeightData);
    setNewWeightData({ weight: '', price: 0, quantity: 0 });
    setShowNewWeight(false);
  };

  return (
    <div>
      <li className={styles.flexRow}>
        <p>{title}</p>

        {/* not sold by weight */}
        {!Array.isArray(data) && <p>{data.quantity}</p>}
      </li>

      {/* sold by weight */}
      {Array.isArray(data) && (
        <ul className={styles.flexColumn}>
          {data.map((item, index) => (
            <li className={styles.flexRow} key={index}>
              <p>{item.weight}</p>
              <p>{centsToFormattedPrice(item.price)}</p>
              <p>{item.quantity}</p>
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

export default StockPage;
