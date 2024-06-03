import React from 'react';
import styles from '../styles/food menu styles/Menuitem.module.css';
import { Link } from 'react-router-dom';
import { centsToFormattedPrice } from '../../utils/priceUtilities';

const Menuitem = React.memo(function Menuitem({ item }) {
  const itemClass = item.active ? styles.activeItem : styles.inactiveItem;

  const getStockMessage = (quantity) => {
    if (quantity === 0) {
      return "Out of stock";
    } else if (quantity <= 3) {
      return `${quantity} left`;
    } else {
      return null;
    }
  };

  const getStockMessageClass = (quantity) => {
    if (quantity === 0) {
      return styles.outOfStock;
    } else if (quantity <= 3) {
      return styles.lowStock;
    } else {
      return '';
    }
  };

  return (
    <Link className={`${styles.menuItem} ${itemClass}`} to={`/menu/${item.itemId}`}>
      <img loading='lazy' className={styles.menuPhoto} src={item.img} alt={item.title} />
      <div className={styles.textBox}>
        <h2>{item.title}</h2>
        <h4>{centsToFormattedPrice(item.price)}</h4>
        {getStockMessage(item.quantity) && (
          <p className={`${styles.stockMessage} ${getStockMessageClass(item.quantity)}`}>
            {getStockMessage(item.quantity)}
          </p>
        )}
      </div>
    </Link>
  );
});

export default Menuitem;
