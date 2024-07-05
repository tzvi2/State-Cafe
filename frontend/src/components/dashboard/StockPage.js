import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getStockForDate, setAllStockToZero } from '../../api/stockRequests';
import styles from '../styles/dashboard/StockPage.module.css';
import ItemQuantity from './ItemQuantity';

function StockPage() {
  const [selectedDate] = useOutletContext();
  const [stockData, setStockData] = useState({});

  useEffect(() => {
    const fetchStockData = async () => {
      const response = await getStockForDate(selectedDate);
      setStockData(response.message ? {} : response);
    };
    fetchStockData();
  }, [selectedDate]);

  const handleInitializeStock = async () => {
    await setAllStockToZero(selectedDate);
    const updatedStockData = await getStockForDate(selectedDate);
    setStockData(updatedStockData);
  };

  const updateStockData = (updateFunction) => {
    setStockData((prevData) => updateFunction(prevData));
  };

  return (
    <div>
      <ul className={styles.itemsColumn}>
        {Object.entries(stockData).map(([menuItem, data]) => (
          <ItemQuantity 
            key={menuItem} 
            title={menuItem} 
            data={data} 
            selectedDate={selectedDate} 
            updateStockData={updateStockData} 
          />
        ))}
        {Object.keys(stockData).length === 0 && (
          <button onClick={handleInitializeStock}>Initialize Stock for {selectedDate}</button>
        )}
      </ul>
    </div>
  );
}

export default StockPage;
