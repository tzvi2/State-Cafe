import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
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
    text: "",
    amount: ""
  })

  const timeoutId1Ref = useRef();
  const timeoutId2Ref = useRef();



  useEffect(() => {
    const fetchData = async () => {
      const data = await getMenuItemByItemId(itemId);
      setMenuItem(data);
    };
    fetchData();
  }, [itemId]);

  const handleOptionChange = (option, event, group = null) => {
    const isChecked = event.target.checked;
  
    if (group && group.selectionMax === 1 && group.selectionMin === 1) {
      // For groups that allow only one selection, deselect others in the group when a new selection is made
      if (isChecked) {
        setSelectedOptions(prev => 
          [...prev.filter(opt => opt.group !== group.group), { ...option, group: group.group }]);
      } else {
        // If somehow the checkbox is unchecked (which shouldn't happen in a single-selection scenario), remove the option
        setSelectedOptions(prev => prev.filter(item => item.title !== option.title || item.group !== group.group));
      }
    } else {
      // For individual options or groups that allow multiple selections
      if (isChecked) {
        setSelectedOptions(prev => [...prev, { ...option, group: group ? group.group : 'individual' }]);
      } else {
        setSelectedOptions(prev => prev.filter(item => !(item.title === option.title && (!group || item.group === group.group))));
      }
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
  
    const validationErrors = validateOptionSelections();
    if (validationErrors.length > 0) {
      alert(validationErrors.join("\n"));
      return; // Prevent adding to cart if validation fails
    }
    // Continue with adding the item to the cart if validation passes
    const optionsPrice = selectedOptions.reduce((acc, option) => acc + option.price, 0);
    const itemTotalPrice = (menuItem.price + optionsPrice) * quantity;
    
    const filteredOptions = selectedOptions; // Assuming selectedOptions already contains only the selected ones
  
    const itemDetails = {
      ...menuItem, 
      options: filteredOptions,
      quantity, 
      total: itemTotalPrice,
    };
  
    setButtonLocked(true);
    addToCart(itemDetails);
    setSelectedOptions([]);
  
    timeoutId1Ref.current = setTimeout(() => {
      setButtonContent({ text: "Added.", amount: "" });
    }, 100);
  
    timeoutId2Ref.current = setTimeout(() => {
      setButtonContent({
        text: "Add to Order ",
        amount: centsToFormattedPrice(menuItem.price * quantity),
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
  
  


  const totalItemPrice = useMemo(() => {
    if (!menuItem.options || menuItem.price === undefined) return 0;
    const optionsPrice = selectedOptions.reduce((acc, option) => acc + option.price, 0);
    return (menuItem.price + optionsPrice) * quantity;
  }, [selectedOptions, quantity, menuItem]);

  const validateOptionSelections = () => {
    const validationErrors = [];
  
    // Derive groupedOptions here for clarity within this example
    const groupedOptions = menuItem.options?.filter(option => option.group) || [];
  
    // Check grouped options
    groupedOptions.forEach(group => {
      const selectedInGroup = selectedOptions.filter(option => option.group === group.group).length;
      if (group.selectionMin && selectedInGroup < group.selectionMin) {
        validationErrors.push(`Please select at least ${group.selectionMin} option(s) for ${group.group}.`);
      }
      if (group.selectionMax && selectedInGroup > group.selectionMax) {
        validationErrors.push(`Please select no more than ${group.selectionMax} option(s) for ${group.group}.`);
      }
    });
  
    return validationErrors;
  };
  

  return (
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
  );
}

export default MenuItemExpanded;
