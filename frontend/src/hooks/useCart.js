import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

export default function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const storedCart = JSON.parse(localStorage.getItem('cartItems'));
    return storedCart || [];
  });

  const [totalPrice, setTotalPrice] = useState(() => {
    const storedTotal = parseInt(localStorage.getItem('totalPrice'), 10);
    return storedTotal || 0;
  });

  const [totalCount, setTotalCount] = useState(() => {
    const storedCount = parseInt(localStorage.getItem('totalCount'), 10);
    return storedCount || 0;
  });

  const [totalCookTime, setTotalCookTime] = useState(() => {
    const storedTime = parseInt(localStorage.getItem('totalCookTime'), 10);
    return storedTime || 0;
  });

  const updateLocalStorage = (cartItems, totalPrice, totalCount, totalCookTime) => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    localStorage.setItem('totalPrice', totalPrice.toString());
    localStorage.setItem('totalCount', totalCount.toString());
    localStorage.setItem('totalCookTime', totalCookTime.toString());
  };

  const calculateTotals = (items) => {
    console.log('calculating totals ', items)
    const newTotalPrice = items.reduce((total, item) => total + item.totalPrice, 0);


    const newTotalCount = items.reduce((count, item) => count + item.quantity, 0);

    const newTotalCookTime = items.reduce(
      (total, item) => total + item.totalTimeToCook,
      0
    );

    setTotalPrice(newTotalPrice);
    setTotalCount(newTotalCount);
    setTotalCookTime(newTotalCookTime);
    updateLocalStorage(items, newTotalPrice, newTotalCount, newTotalCookTime);
  };


  const generateCartItemId = () => Math.random().toString(36).substring(2, 11);

  const arraysAreTheSame = (arr1, arr2) =>
    Array.isArray(arr1) &&
    Array.isArray(arr2) &&
    arr1.length === arr2.length &&
    arr1.sort().every((element, i) => element === arr2.sort()[i]);


  const clearCart = () => {
    setCartItems([]);
    setTotalPrice(0);
    setTotalCount(0);
    setTotalCookTime(0);
    localStorage.removeItem('cartItems');
    localStorage.removeItem('totalPrice');
    localStorage.removeItem('totalCount');
    localStorage.removeItem('totalCookTime');
  };

  useEffect(() => {
    console.log('cart items', cartItems);
    calculateTotals(cartItems);
  }, [cartItems]);

  const calculateCartItemTotals = (basePrice, baseTimeToCook, options, quantity) => {
    const optionsPrice = options.reduce((total, option) => total + option.price, 0);
    const totalPrice = (basePrice + optionsPrice) * quantity;

    const optionsTimeToCook = options.reduce((total, option) => total + option.timeToCook, 0);
    const totalTimeToCook = (baseTimeToCook + optionsTimeToCook) * quantity;

    console.log(`Calculated totals for ${quantity} items:`, { totalPrice, totalTimeToCook });

    return { totalPrice, totalTimeToCook };
  };

  const updateItemQuantity = (cartItemId, newQuantity) => {
    console.log('Updating quantity of itemId', cartItemId, 'to', newQuantity);

    const updatedItems = cartItems.map((item) => {
      if (item.cartItemId === cartItemId) {
        // Recalculate totals for the updated item
        const { totalPrice, totalTimeToCook } = calculateCartItemTotals(
          item.basePrice,
          item.baseTimeToCook,
          item.options,
          newQuantity
        );

        return { ...item, quantity: newQuantity, totalPrice, totalTimeToCook };
      }
      return item;
    });

    console.log('Updated items:', updatedItems); // Debugging step to confirm new state
    setCartItems(updatedItems); // Update state with the modified cart
  };

  useEffect(() => {
    console.log('cart items updated', cartItems);
    calculateTotals(cartItems);
  }, [cartItems]);


  const addToCart = (newMenuItem) => {
    const existingItem = cartItems.find(
      (item) =>
        item.title === newMenuItem.title &&
        arraysAreTheSame(
          item.options.map((opt) => opt.title),
          newMenuItem.options.map((opt) => opt.title)
        )
    );

    if (existingItem) {
      const combinedQuantity = existingItem.quantity + newMenuItem.quantity;
      if (combinedQuantity > 10) {
        console.log("Combined quantity exceeds 10");
        return false;
      }
      updateItemQuantity(existingItem.cartItemId, combinedQuantity);
    } else {
      if (newMenuItem.quantity > 10) {
        alert("You cannot add more than 10 of the same item at once.");
        return false;
      }

      const { totalPrice, totalTimeToCook } = calculateCartItemTotals(
        newMenuItem.basePrice,
        newMenuItem.baseTimeToCook,
        newMenuItem.options,
        newMenuItem.quantity
      );

      const newItem = {
        ...newMenuItem,
        totalPrice,
        totalTimeToCook,
        cartItemId: generateCartItemId(),
      };

      setCartItems((prevItems) => [...prevItems, newItem]);
    }

    return true;
  };

  const removeFromCart = (cartItemId, product = false) => {
    let newCartItems = []
    if (!product) {
      newCartItems = cartItems.filter((item) => item.cartItemId !== cartItemId);
    } else {
      newCartItems = cartItems.filter((item) => item.id !== cartItemId)
    }
    setCartItems(newCartItems);
  };

  return (
    <CartContext.Provider value={{ cart: { items: cartItems, totalPrice, totalCount, totalCookTime }, addToCart, removeFromCart, updateItemQuantity, clearCart, setCartItems }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
