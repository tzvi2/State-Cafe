import React from 'react';
import styles from '../styles/food menu styles/Menuitem.module.css';
import { Link } from 'react-router-dom';
import { centsToFormattedPrice } from '../../utils/priceUtilities';

const Menuitem = React.memo(function Menuitem({ item }) {
    const itemClass = item.active ? styles.activeItem : styles.inactiveItem;
    return (
        <Link className={`${styles.menuItem} ${itemClass}`} to={`/menu/${item.itemId}`}>
            <img loading='lazy' className={styles.menuPhoto} src={item.img} alt={item.title} />
            <div className={styles.textBox}>
                <h2>{item.title}</h2>
                <h4>{centsToFormattedPrice(item.price)}</h4>
            </div>
        </Link>
    );
});




export default Menuitem;
