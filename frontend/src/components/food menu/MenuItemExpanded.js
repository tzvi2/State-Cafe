import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import RenderOptions from './RenderOptions';
import BackArrow from '../BackArrow';
import styles from '../styles/food menu styles/MenuItemExpanded.module.css';
import { useCart } from '../../hooks/useCart';
import { getMenuItemByItemId } from '../../api/menuRequests';
import { getStockForDate } from '../../api/stockRequests'; // Import stock request
import { centsToFormattedPrice } from '../../utils/priceUtilities';
import { capitalizeFirstLetters } from '../../utils/stringUtilities';

function MenuItemExpanded() {
  const { itemId } = useParams();
  const { addToCart } = useCart();
  const [menuItem, setMenuItem] = useState({});
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [buttonLocked, setButtonLocked] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [quantityLeft, setQuantityLeft] = useState(0); // State to track quantity left

  const [buttonContent, setButtonContent] = useState({
    text: "Add to Order",
    amount: ""
  });

  const timeoutId1Ref = useRef();
  const timeoutId2Ref = useRef();

  useEffect(() => {
    const fetchData = async () => {
      const data = await getMenuItemByItemId(itemId);
      setMenuItem(data);

      const dateString = getLocalDate();
      const stockData = await getStockForDate(dateString);
      setQuantityLeft(stockData[itemId]?.quantity || 0); // Set quantity left from stock data
    };
    fetchData();
  }, [itemId]);

  const totalItemPrice = useMemo(() => {
    if (menuItem.price === undefined) return 0;
    const optionsPrice = selectedOptions.reduce((acc, option) => acc + option.price, 0);
    return (menuItem.price + optionsPrice) * quantity;
  }, [selectedOptions, quantity, menuItem]);

  const handleOptionChange = (option, isChecked, groupTitle = null) => {
    setSelectedOptions(prev => {
      let updatedOptions = prev.filter(opt => !(opt.group === groupTitle));

      if (isChecked) {
        updatedOptions.push({ ...option, group: groupTitle });
      }

      return updatedOptions;
    });
  };

  const validateOptionSelections = () => {
    const validationErrors = [];

    if (menuItem.optionGroups) {
      menuItem.optionGroups.forEach(group => {
        const selectedInGroup = selectedOptions.filter(option => option.group === group.title);
        if (selectedInGroup.length < group.minSelection) {
          validationErrors.push(`Please select at least ${group.minSelection} option(s) for the group "${group.title}".`);
        }
        if (selectedInGroup.length > group.maxSelection) {
          validationErrors.push(`Please select no more than ${group.maxSelection} option(s) for the group "${group.title}".`);
        }
      });
    }

    return validationErrors;
  };

  useEffect(() => {
    console.log('menu item ', menuItem);
  }, [menuItem]);

  useEffect(() => {
    if (menuItem.price !== undefined) {
      let newButtonContent = {
        text: quantityLeft === 0 ? "Out of Stock" : "Add to Order ",
        amount: quantityLeft === 0 ? "" : centsToFormattedPrice(totalItemPrice)
      };
      setButtonContent(newButtonContent);
    }
  }, [selectedOptions, quantity, menuItem, quantityLeft]);

  const handleAddToCart = async () => {
    if (buttonLocked || !menuItem || quantityLeft === 0) return;

    const validationErrors = validateOptionSelections();
    if (validationErrors.length > 0) {
      alert(validationErrors.join("\n"));
      return;
    }

    if (quantity > quantityLeft) {
      const userConfirmed = window.confirm(`Only ${quantityLeft} left in stock. Would you like to add the remaining ${quantityLeft} to your cart?`);
      if (!userConfirmed) {
        return;
      } else {
        setQuantity(quantityLeft); // Set quantity to the remaining quantity
      }
    }

    setButtonLocked(true);

    const wasAdded = addToCart({
      ...menuItem,
      options: selectedOptions,
      quantity: Math.min(quantity, quantityLeft), // Add the minimum of desired quantity and quantity left
      total: totalItemPrice,
    });

    if (wasAdded) {
      timeoutId1Ref.current = setTimeout(() => {
        setButtonContent({ text: "Added to cart", amount: "" });
      }, 100);

      timeoutId2Ref.current = setTimeout(() => {
        setButtonContent({
          text: "Add to Order ",
          amount: centsToFormattedPrice(totalItemPrice),
        });
        setButtonLocked(false);
      }, 2000);
    } else {
      alert("We are currently accepting a maximum of 10 of any item.");
      setButtonLocked(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutId1Ref.current) clearTimeout(timeoutId1Ref.current);
      if (timeoutId2Ref.current) clearTimeout(timeoutId2Ref.current);
    };
  }, []);

  return (
    <div className={styles.expandedContainer}>
      <div className={styles.menuItemExpanded}>
        <BackArrow className={styles.arrow} />
        <h2 className={styles.title}>{menuItem.title}</h2>
        <img src={menuItem.img} alt={menuItem.title} className={styles.menuItemImage}></img>
        <p className={styles.description}>{menuItem.description}</p>

        <RenderOptions 
          menuItem={menuItem} 
          selectedOptions={selectedOptions} 
          handleOptionChange={handleOptionChange} 
        />

        <div className={styles.footer}>
          <select 
            className={styles.quantity} 
            defaultValue={1} 
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            disabled={quantityLeft === 0} // Disable if out of stock
          >
            {[...Array(Math.min(10, quantityLeft)).keys()].map(n => (
              <option key={n} value={n + 1}>{n + 1}</option>
            ))}
          </select>
          <button 
            className={`${styles.addToCart} ${buttonContent.amount ? '' : styles.centerText} ${quantityLeft === 0 ? styles.outOfStock : ''}`} 
            disabled={buttonLocked || quantityLeft === 0} // Disable if out of stock
            onClick={handleAddToCart}
          >
            <span>{buttonContent.text}</span>
            {buttonContent.amount && <span>{buttonContent.amount}</span>}
          </button>
        </div>
      </div>
      <Link className={styles.checkoutButton} to={"/cart"}>Go to Cart</Link>
    </div>
  );
}

export default MenuItemExpanded;

function getLocalDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
