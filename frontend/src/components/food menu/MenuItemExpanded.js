import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import RenderOptions from './RenderOptions';
import BackArrow from '../BackArrow';
import styles from '../styles/food menu styles/MenuItemExpanded.module.css';
import { useCart } from '../../hooks/useCart';
import { getMenuItemByItemId } from '../../api/menuRequests';
import { centsToFormattedPrice } from '../../utils/priceUtilities';
import { capitalizeFirstLetters } from '../../utils/stringUtilities';

function MenuItemExpanded() {
  const { itemId } = useParams();
  const { addToCart } = useCart();
  const [menuItem, setMenuItem] = useState({});
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [buttonLocked, setButtonLocked] = useState(false);
  const [quantity, setQuantity] = useState(1);

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
        text: "Add to Order ",
        amount: centsToFormattedPrice(totalItemPrice)
      };
      setButtonContent(newButtonContent);
    }
  }, [selectedOptions, quantity, menuItem]);

  const handleAddToCart = async () => {
    if (buttonLocked || !menuItem) return;

    const validationErrors = validateOptionSelections();
    if (validationErrors.length > 0) {
      alert(validationErrors.join("\n"));
      return;
    }

    setButtonLocked(true);

    const wasAdded = addToCart({
      ...menuItem,
      options: selectedOptions,
      quantity,
      total: totalItemPrice,
    });

    if (wasAdded) {
      timeoutId1Ref.current = setTimeout(() => {
        setButtonContent({ text: "Added.", amount: "" });
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
      <Link className={styles.checkoutButton} to={"/cart"}>Checkout</Link>
    </div>
  );
}

export default MenuItemExpanded;
