import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import BackArrow from '../BackArrow';
import styles from '../styles/food menu styles/MenuItemExpanded.module.css'
import { useCart } from '../../hooks/useCart';
import { getMenuItemByItemId } from '../../api/menuRequests'; 
import { centsToFormattedPrice } from '../../utils/priceUtilities';
import {capitalizeFirstLetters} from '../../utils/stringUtilities'
import { animateScroll as scroll } from 'react-scroll';

function MenuItemExpanded() {
  const { itemId } = useParams();
  const { addToCart } = useCart();

  // State for the fetched menu item
  const [menuItem, setMenuItem] = useState({})

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [buttonContent, setButtonContent] = useState({
    text: "",
    amount: ""
  })
  const [buttonLocked, setButtonLocked] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const timeoutId1Ref = useRef();
  const timeoutId2Ref = useRef();


  const totalItemPrice = useMemo(() => {
    if (!menuItem.options || menuItem.price === undefined) return 0;
    const optionsPrice = selectedOptions.reduce((acc, option) => acc + option.price, 0);
    return (menuItem.price + optionsPrice) * quantity;
  }, [selectedOptions, quantity, menuItem]);
  

  const scrollToTop = () => {
    scroll.scrollToTop({duration: 400});
  };

  useEffect(() => {
    scrollToTop()
    const fetchData = async () => {
      const data = await getMenuItemByItemId(itemId);
      setMenuItem(data);
    };
    fetchData();
  }, [itemId]);

const handleChange = (optionObject, event) => {
  const isChecked = event.target.checked;
  if (isChecked) {
    setSelectedOptions(prev => [...prev, optionObject]); 
  } else {
    setSelectedOptions(prev => prev.filter(item => item.title !== optionObject.title));
  }
};

useEffect(() => {
  if (menuItem.options && menuItem.price !== undefined) {
    const optionsPrice = selectedOptions.reduce((acc, option) => acc + option.price, 0);
    const basePrice = menuItem.price;
    const totalPrice = (basePrice + optionsPrice) * quantity;
    let newButtonContent = {
      text: "Add to Order ",
      amount: centsToFormattedPrice(totalItemPrice)
    }
    setButtonContent(newButtonContent)
  }
  
}, [selectedOptions, quantity, menuItem]);

const handleAddToCart = () => {
  if (buttonLocked || !menuItem) return;
  
  const optionsPrice = selectedOptions.reduce((acc, option) => acc + option.price, 0);
  
  const itemTotalPrice = (menuItem.price + optionsPrice) * quantity;

  const filteredOptions = menuItem.options.filter(option => 
    selectedOptions.some(selectedOption => selectedOption.title === option.title)
  );
  
  const itemDetails = {
    ...menuItem, 
    options: filteredOptions, // Overwrite options with only the selected ones
    quantity, 
    total: itemTotalPrice, 
  };

  setButtonLocked(true);
  addToCart(itemDetails); 
  setSelectedOptions([])

  timeoutId1Ref.current = setTimeout(() => {
    setButtonContent({
      text: "Added.",
      amount: ""
    });
  }, 150);
  
  timeoutId2Ref.current = setTimeout(() => {
    setButtonContent({
      text: "Add to Order ",
      amount: centsToFormattedPrice(itemTotalPrice)
    });
    setButtonLocked(false);
  }, 2000);
};

useEffect(() => {
  return () => {
    if (timeoutId1Ref.current) clearTimeout(timeoutId1Ref.current);
    if (timeoutId2Ref.current) clearTimeout(timeoutId2Ref.current);
  };
}, []); 

  

  if (!menuItem) {
    return <div>Loading...</div>;
  }

  const { title, img, options, price, pieces, description } = menuItem;

  return (
    <>
    <div className={styles.menuItemExpanded}>
      <BackArrow className={styles.arrow}/>
      <h2 className={styles.title}>{title}</h2>
      <img src={img} alt={title}></img>
      <p className={styles.description}>{description}</p>
        <ul className={styles.optionsList}>
          {options && options.map((optionObject, i) => (
            <li className={styles.optionRow} key={optionObject.title}>
              <div className={styles.checkbox_and_option}>
                <input
                  type="checkbox"
                  checked={selectedOptions.some(option => option.title === optionObject.title)}
                  onChange={(e) => handleChange(optionObject, e)}
                />
                <label>{capitalizeFirstLetters(optionObject.title)}</label>
              </div>
              <p className={styles.optionPrice}>
                + {centsToFormattedPrice(optionObject.price)}
              </p>
            </li>
          ))}
        </ul>
        <div className={styles.footer}>
            <select className={styles.quantity} defaultValue={1} onChange={(e) => setQuantity(parseInt(e.target.value))}>
              {[...Array(10).keys()].map(n => (
                <option key={n} value={n + 1}>{n + 1}</option>
              ))}
            </select>
            <button className={styles.addToCart} disabled={buttonLocked} onClick={handleAddToCart}>
              <span>{buttonContent.text}</span>
              <span>{buttonContent.amount}</span>
            </button>
          </div>
      </div>
    </>
  );
}

export default MenuItemExpanded;
