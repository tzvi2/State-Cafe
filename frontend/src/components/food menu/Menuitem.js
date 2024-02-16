import React from 'react';
import styles from '../styles/food menu styles/Menuitem.module.css';
import { Link } from 'react-router-dom';

const Menuitem = React.memo(function Menuitem({ item }) {
    return (
        <Link className={styles.menuItem} to={`/menu/${item.itemId}`}>
            <img className={styles.menuPhoto} src={item.img} alt={item.title} />
            <div className={styles.textBox}>
                <h2>{item.title}</h2>
                <h4>${item.price / 100}</h4>
            </div>
        </Link>
    );
});




export default Menuitem;
