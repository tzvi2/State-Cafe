import React, { useState, useEffect } from 'react';
import { useCart } from '../../hooks/useCart';
import { Trash2 } from 'lucide-react';
import styles from '../styles/cart styles/CartPage.module.css';
import { centsToFormattedPrice } from '../../utils/priceUtilities';
import { getItemStockLeft } from '../../api/stockRequests';
import { useDeliveryDetails } from '../../hooks/useDeliveryDetails';

function CartItem({ item }) {
  const { removeFromCart, updateItemQuantity, cart } = useCart();
  const { deliveryDate } = useDeliveryDetails();
  const [maxQuantity, setMaxQuantity] = useState(10);

  useEffect(() => {
    const fetchStock = async () => {
      if (deliveryDate) {
        try {
          console.log(`Fetching stock for ${item.title} on ${deliveryDate}`);
          const stockData = await getItemStockLeft(deliveryDate, item.title);

          if (!stockData || typeof stockData.quantity === 'undefined') {
            console.warn(`Stock data is invalid for ${item.title}:`, stockData);
            setMaxQuantity(0); // Set to zero if stock is not available
            return;
          }

          const stockLeft = stockData.quantity;
          const currentQuantityInCart = cart.items
            .filter(cartItem => cartItem.title === item.title)
            .reduce((total, cartItem) => total + cartItem.quantity, 0);

          setMaxQuantity(Math.max(stockLeft - currentQuantityInCart + item.quantity, 0));
        } catch (error) {
          console.error(`Error fetching stock for ${item.title}:`, error);
          setMaxQuantity(0); // Set to zero on error
        }
      }
    };


    fetchStock();
  }, [deliveryDate, item.id, cart.items, item.title, item.quantity]);

  const handleDeleteItem = () => {
    removeFromCart(item.cartItemId);
  };

  const handleQuantityChange = (event) => {
    const newQuantity = parseInt(event.target.value, 10);
    if (!isNaN(newQuantity) && newQuantity >= 0) {
      updateItemQuantity(item.cartItemId, newQuantity);
    }
  };

  return (
    <div className={styles.cartItem}>
      <div className={styles.col1}>
        <img className={styles.itemImage} src={item.img} alt={item.title} />
        <select
          className={styles.quantity}
          value={item.quantity}
          onChange={handleQuantityChange}
        >
          {[...Array(maxQuantity).keys()].map((value) => (
            <option key={value + 1} value={value + 1}>
              {value + 1}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.col2}>
        <p className={styles.itemTitle}>{item.title}</p>
        <ul className={styles.options}>
          {item.options?.map((option) => (
            <li className={styles.option} key={`${item.cartItemId} ${option.title}`}>+ {option.title}</li>
          ))}
        </ul>
      </div>
      <div className={styles.col3}>
        <Trash2 className={styles.delete} onClick={handleDeleteItem} />
        <p className={styles.itemPrice}>{centsToFormattedPrice(item.totalPrice)}</p>
      </div>
    </div>
  );
}

export default CartItem;
