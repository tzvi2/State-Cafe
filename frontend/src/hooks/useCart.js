import React, {createContext, useContext, useEffect, useState} from 'react'

const CartContext = createContext(null)

export default function CartProvider({children}) {

	const [cartItems, setCartItems] = useState(() => {
    const storedCart = JSON.parse(localStorage.getItem('cartItems'));
    return storedCart || [];
	})

	const [totalPrice, setTotalPrice] = useState(() => {
		const storedTotal = parseInt(localStorage.getItem('totalPrice'))
		return storedTotal || 0
	})

	const [totalCount, setTotalCount] = useState(() => {
		const storedCount = parseInt(localStorage.getItem('totalCount'))
		return storedCount || 0
	})

	const [totalCookTime, setTotalCookTime] = useState(() => {
		const storedTime = parseInt(localStorage.getItem('totalCookTime'), 10);
		return storedTime || 0;
	});

	const generateCartItemId = () => {
		let id = []
		let str = ((Math.random() * 10).toString())
		return str.substring(2, 11)
	}

	const arraysAreTheSame = (arr1, arr2) => {
	
		if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
			console.warn('arraysAreTheSame called with non-array arguments', arr1, arr2);
			return false;
		}
		return arr1.length === arr2.length && arr1.every((element, i) => element === arr2[i]);
	};

	const clearCart = () => {
		setCartItems([])
		setTotalPrice(0)
		setTotalCount(0)
		localStorage.removeItem('cartItems')
		localStorage.removeItem('totalPrice')
		localStorage.removeItem('totalCount')
	}
	

	useEffect(() => {

		// Calculate new total price, total count, and total cook time
		const newTotalPrice = cartItems.reduce((total, item) => total + item.total, 0);
		const newTotalCount = cartItems.reduce((count, item) => count + item.quantity, 0);
		const newTotalCookTime = cartItems.reduce((total, item) => total + item.totalTimeToCook, 0);

		setTotalPrice(newTotalPrice);
		setTotalCount(newTotalCount);
		setTotalCookTime(newTotalCookTime);
	}, [cartItems]);

	useEffect(() => {
		
		localStorage.setItem('cartItems', JSON.stringify(cartItems));
		localStorage.setItem('totalPrice', totalPrice.toString());
		localStorage.setItem('totalCount', totalCount.toString());
		localStorage.setItem('totalCookTime', totalCookTime.toString()); 
	}, [cartItems, totalPrice, totalCount, totalCookTime]);


	const addToCart = (newMenuItem) => {
		// Finding if the item exists in the cart with the exact same options
		const existingItem = cartItems.find(item => 
			item.firestoreId === newMenuItem.firestoreId && 
			arraysAreTheSame(item.options.map(opt => opt.title), newMenuItem.options.map(opt => opt.title))
		);
	
		// Calculate the total time to cook considering the selected options
		const optionsTimeToCook = newMenuItem.options.reduce((total, option) => total + option.timeToCook, 0);
		const itemTotalTimeToCook = newMenuItem.timeToCook + optionsTimeToCook * newMenuItem.quantity;
	
		if (existingItem) {
			const combinedQuantity = existingItem.quantity + newMenuItem.quantity;
			if (combinedQuantity > 10) {
				// If combined quantity exceeds 10, do not add to cart
			
				return false
			}
	
			// If the item exists and combined quantity is 10 or less, update the item in the cart
			updateItemQuantity(existingItem.cartItemId, combinedQuantity)
			//setCartItems(updatedItems);
		} else {
			// If the total quantity being added is more than 10
			if (newMenuItem.quantity > 10) {
				alert("You cannot add more than 10 of the same item at once.");
				return false
			}
	
			// If the item does not exist and the desired quantity is 10 or less, add a new item to the cart
			const newItem = {
				...newMenuItem,
				totalTimeToCook: itemTotalTimeToCook,
				cartItemId: generateCartItemId()
			};
			setCartItems([...cartItems, newItem]);
		}
		return true
	};

	const removeFromCart = (cartItemId) => {
		let newCartItems = cartItems.filter(item => item.cartItemId !== cartItemId)
		setCartItems(newCartItems)
	}

	const updateItemQuantity = (cartItemId, newQuantity) => {
    const updatedItems = cartItems.map((item) => {
        if (item.cartItemId === cartItemId) {
            // Calculate the total price for the new quantity
            const optionsPrice = item.options.reduce((acc, option) => acc + option.price, 0); 
            const totalPrice = (item.price + optionsPrice) * newQuantity;

            // Update the item's quantity and total price
            return { ...item, quantity: newQuantity, total: totalPrice };
        }
        return item;
    });

    setCartItems(updatedItems);
};

	return (
	<CartContext.Provider value={{
		cart: { items: cartItems, totalPrice, totalCount, totalCookTime },
		addToCart,
		removeFromCart,
		updateItemQuantity,
		clearCart
	}}>
		{children}
	</CartContext.Provider>
	)
}

export const useCart = () => useContext(CartContext)