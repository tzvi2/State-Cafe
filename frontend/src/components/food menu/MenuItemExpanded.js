import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import RenderOptions from './RenderOptions';
import BackArrow from '../BackArrow';
import styles from '../styles/food menu styles/MenuItemExpanded.module.css';
import { useCart } from '../../hooks/useCart';
import { getMenuItemByItemId } from '../../api/menuRequests';
import { getStockForDate } from '../../api/stockRequests'; 
import { centsToFormattedPrice } from '../../utils/priceUtilities';
import { capitalizeFirstLetters } from '../../utils/stringUtilities';
import { useDeliveryDetails } from '../../hooks/useDeliveryDetails';

function MenuItemExpanded() {
  const { itemId } = useParams();
  const { addToCart } = useCart();
  const { deliveryDate } = useDeliveryDetails(); 
  const [menuItem, setMenuItem] = useState({});
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [buttonLocked, setButtonLocked] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [quantityLeft, setQuantityLeft] = useState(0); 

  const [buttonContent, setButtonContent] = useState({
    text: "Add to Cart",
    amount: ""
  });

  const timeoutId1Ref = useRef();
  const timeoutId2Ref = useRef();

  useEffect(() => {
    console.log('item ', menuItem)
  }, [menuItem])

  useEffect(() => {
    const fetchData = async () => {
      const data = await getMenuItemByItemId(itemId);
      const stockData = await getStockForDate(deliveryDate); 

      const weightOptionsGroup = data.soldByWeight ? {
        title: 'Available Portions',
        options: stockData[itemId] || [],
        minSelection: 1
      } : null;

      data.optionGroups = weightOptionsGroup 
        ? [weightOptionsGroup, ...(data.optionGroups || [])] 
        : data.optionGroups;

      data.quantity = data.quantity || []; // Initialize quantity as an empty array if undefined
      setMenuItem(data);

      if (data.soldByWeight) {
        const totalQuantity = stockData[itemId]?.reduce((total, option) => total + option.quantity, 0) || 0;
        setQuantityLeft(totalQuantity);
      } else {
        setQuantityLeft(stockData[itemId]?.quantity || 0);
      }
    };
    fetchData();
  }, [itemId, deliveryDate]); // Depend on deliveryDate

  const totalItemPrice = useMemo(() => {
    if (menuItem.price === undefined) return 0;
    const optionsPrice = selectedOptions.reduce((acc, option) => acc + option.price, 0);
    return (menuItem.price + optionsPrice) * quantity;
  }, [selectedOptions, quantity, menuItem]);

  const handleOptionChange = (option, isChecked, groupTitle = null) => {
    setSelectedOptions(prev => {
      let updatedOptions = [...prev];

      if (groupTitle) {
        // Handle group options
        if (isChecked) {
          // Add the new option if within the limit
          const selectedInGroup = updatedOptions.filter(opt => opt.group === groupTitle);
          if (selectedInGroup.length < menuItem.optionGroups.find(group => group.title === groupTitle).maxSelection) {
            updatedOptions.push({ ...option, group: groupTitle });
          }
        } else {
          // Remove the option if unchecked
          updatedOptions = updatedOptions.filter(opt => !(opt.title === option.title && opt.group === groupTitle));
        }
      } else {
        // Handle individual options
        if (isChecked) {
          updatedOptions.push(option);
        } else {
          updatedOptions = updatedOptions.filter(opt => opt.title !== option.title);
        }
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
    if (menuItem.price !== undefined) {
      let newButtonContent = {
        text: quantityLeft === 0 ? "Out of Stock" : "Add to Cart ",
        amount: quantityLeft === 0 ? "" : centsToFormattedPrice(totalItemPrice)
      };
      setButtonContent(newButtonContent);
    }
  }, [selectedOptions, quantity, menuItem, quantityLeft]);

  const handleAddToCart = async () => {
    if (buttonLocked || !menuItem || quantityLeft === 0) {
      console.log('not adding')
      return;
    } 

    const validationErrors = validateOptionSelections();
    if (validationErrors.length > 0) {
      console.log('validation error')
      alert(validationErrors.join("\n"));
      return;
    }

    if (quantity > quantityLeft) {
      console.log('quantity selected exceeds quantity left')
      const userConfirmed = window.confirm(`Only ${quantityLeft} left in stock. Would you like to add the remaining ${quantityLeft} to your cart?`);
      if (!userConfirmed) {
        return;
      } else {
        setQuantity(quantityLeft); 
      }
    }

    setButtonLocked(true);

    console.log('menu item being added: ', 
      {...menuItem,
        options: selectedOptions,
        quantity: Math.min(quantity, quantityLeft), 
        total: totalItemPrice,
      }
    )

    const wasAdded = addToCart({
      
      ...menuItem,
      options: selectedOptions,
      quantity: Math.min(quantity, quantityLeft), 
      total: totalItemPrice,
    });

    if (wasAdded) {
      timeoutId1Ref.current = setTimeout(() => {
        setButtonContent({ text: "Added to cart", amount: "" });
      }, 100);

      timeoutId2Ref.current = setTimeout(() => {
        setButtonContent({
          text: "Add to Cart ",
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
    console.log(' menu item ', menuItem)
  }, [menuItem])

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
          optionGroups={menuItem.optionGroups} 
        />

        <div className={styles.footer}>
          {!menuItem.soldByWeight && <select 
            className={styles.quantity} 
            defaultValue={1} 
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            disabled={quantityLeft === 0} // Disable if out of stock
          >
            {[...Array(Math.min(10, quantityLeft)).keys()].map(n => (
              <option key={n} value={n + 1}>{n + 1}</option>
            ))}
          </select>}
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
