import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import RenderOptions from './RenderOptions';
import BackArrow from '../BackArrow';
import styles from '../styles/food menu styles/MenuItemExpanded.module.css';
import { useCart } from '../../hooks/useCart';
import { getMenuItemByItemId } from '../../api/menuRequests';
import { getStockForDate } from '../../api/stockRequests';
import { centsToFormattedPrice } from '../../utils/priceUtilities';
import { useDeliveryDetails } from '../../hooks/useDeliveryDetails';
import { useOrderContext } from '../../contexts/OrderContext';

const MenuItemExpanded = () => {
  const { itemId } = useParams();
  const { addToCart, cart } = useCart();
  const { deliveryDate } = useDeliveryDetails();
  const [menuItem, setMenuItem] = useState({});
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [buttonLocked, setButtonLocked] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [quantityLeft, setQuantityLeft] = useState(0);
  const { inOrderingWindow } = useOrderContext()

  const [buttonContent, setButtonContent] = useState({
    text: "Add to Cart",
    amount: ""
  });

  const timeoutId1Ref = useRef();
  const timeoutId2Ref = useRef();

  useEffect(() => {
    const fetchMenuItem = async () => {
      const data = await getMenuItemByItemId(itemId);
      setMenuItem(data);
    };

    fetchMenuItem();
  }, [itemId]);

  useEffect(() => {
    const fetchStockData = async () => {
      if (deliveryDate) {
        const stockData = await getStockForDate(deliveryDate);
        setQuantityLeft(stockData[itemId]?.quantity || 0);
      }
    };

    fetchStockData();
  }, [deliveryDate, itemId]);

  const totalItemPrice = useMemo(() => {
    if (!menuItem.price) return 0;
    const optionsPrice = selectedOptions.reduce((acc, option) => acc + option.price, 0);
    return (menuItem.price + optionsPrice) * quantity;
  }, [selectedOptions, quantity, menuItem.price]);

  const handleOptionChange = useCallback((option, isChecked, groupTitle = null) => {
    setSelectedOptions((prev) => {
      let updatedOptions = [...prev];
      if (groupTitle) {
        if (isChecked) {
          const selectedInGroup = updatedOptions.filter((opt) => opt.group === groupTitle);
          const group = menuItem.optionGroups.find((group) => group.title === groupTitle);
          if (selectedInGroup.length < group.maxSelection) {
            updatedOptions.push({ ...option, group: groupTitle });
          }
        } else {
          updatedOptions = updatedOptions.filter((opt) => !(opt.title === option.title && opt.group === groupTitle));
        }
      } else {
        if (isChecked) {
          updatedOptions.push(option);
        } else {
          updatedOptions = updatedOptions.filter((opt) => opt.title !== option.title);
        }
      }
      return updatedOptions;
    });
  }, [menuItem.optionGroups]);

  const validateOptionSelections = () => {
    const validationErrors = [];
    if (menuItem.optionGroups) {
      menuItem.optionGroups.forEach((group) => {
        const selectedInGroup = selectedOptions.filter((option) => option.group === group.title);
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

  const updateButtonContent = useCallback(() => {
    if (menuItem.price !== undefined) {
      const newButtonContent = {
        text: quantityLeft === 0 ? "Out of Stock" : "Add to Cart ",
        amount: quantityLeft === 0 ? "" : centsToFormattedPrice(totalItemPrice)
      };
      setButtonContent(newButtonContent);
    }
  }, [menuItem.price, quantityLeft, totalItemPrice]);

  useEffect(() => {
    updateButtonContent();
    //console.log('selected options: ', selectedOptions)
  }, [selectedOptions, quantity, updateButtonContent]);

  const handleAddToCart = async () => {
    if (buttonLocked || !menuItem || quantityLeft === 0) return;

    const validationErrors = validateOptionSelections();
    if (validationErrors.length > 0) {
      alert(validationErrors.join("\n"));
      return;
    }

    const userConfirmed = quantity > quantityLeft && window.confirm(
      `Only ${quantityLeft} left in stock. Would you like to add the remaining ${quantityLeft} to your cart?`
    );
    if (!userConfirmed && quantity > quantityLeft) return;
    setQuantity(Math.min(quantity, quantityLeft));

    setButtonLocked(true);

    const flattenedOptions = selectedOptions.map((option) => ({
      title: option.title,
      price: option.price || 0,
      timeToCook: option.timeToCook || 0,
    }));

    const cartItem = {
      id: menuItem.id,
      title: menuItem.title,
      img: menuItem.img,
      basePrice: menuItem.price,
      baseTimeToCook: menuItem.timeToCook,
      quantity,
      options: flattenedOptions,
    };

    const wasAdded = addToCart(cartItem);

    if (wasAdded) {
      timeoutId1Ref.current = setTimeout(() => setButtonContent({ text: "Added to cart", amount: "" }), 100);
      timeoutId2Ref.current = setTimeout(() => {
        setButtonContent({
          text: "Add to Cart ",
          amount: centsToFormattedPrice(totalItemPrice),
        });
        setButtonLocked(false);
      }, 2000);
    }
  };



  useEffect(() => {
    return () => {
      if (timeoutId1Ref.current) clearTimeout(timeoutId1Ref.current);
      if (timeoutId2Ref.current) clearTimeout(timeoutId2Ref.current);
    };
  }, []);

  const availableQuantity = useMemo(() => {
    const currentQuantityInCart = cart.items
      .filter((cartItem) => cartItem.title === menuItem.title)
      .reduce((total, cartItem) => total + cartItem.quantity, 0);
    return Math.max(quantityLeft - currentQuantityInCart, 0);
  }, [cart.items, menuItem.title, quantityLeft]);

  return (
    <div className={styles.expandedContainer}>
      <div className={styles.menuItemExpanded}>
        <BackArrow className={styles.arrow} />
        <h2 className={styles.title}>{menuItem.title}</h2>
        <img src={menuItem.img} alt={menuItem.title} className={styles.menuItemImage} />
        <p className={styles.description}>{menuItem.description}</p>

        <RenderOptions
          menuItem={menuItem}
          selectedOptions={selectedOptions}
          handleOptionChange={handleOptionChange}
          optionGroups={menuItem.optionGroups}
        />

        <div className={styles.footer}>
          {!menuItem.soldByWeight && availableQuantity > 0 && (
            <select
              className={styles.quantity}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              disabled={availableQuantity === 0}
            >
              {[...Array(Math.min(10, availableQuantity)).keys()].map((n) => (
                <option key={n} value={n + 1}>{n + 1}</option>
              ))}
            </select>
          )}
          <button
            className={`${styles.addToCart} ${buttonContent.amount ? '' : styles.centerText} ${availableQuantity === 0 ? styles.outOfStock : ''}`}
            // disabled={buttonLocked || availableQuantity === 0 || !inOrderingWindow}
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
};

export default MenuItemExpanded;
