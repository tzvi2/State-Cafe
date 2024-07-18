import React, { useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import { useCart } from '../../hooks/useCart'
import { Link } from 'react-router-dom'
import BackArrow from '../BackArrow'
import CartItem from './CartItem'
import styles from '../styles/cart styles/CartPage.module.css'

export default function CartPage() {
	const {cart, removeFromCart, updateItemQuantity} = useCart()

	// useEffect(() => {
	// 	console.log('cart items ', cart.items)
	// }, [cart])

	return (
		<>
		<h2 className={styles.cartHeader}>My Cart</h2>
		<div className={styles.cartPage}>
		{cart.items.length > 0 ? 
		<>
		{cart.items.map(item => 
				<CartItem key={item.cartItemId} item={item}/>
		)}	
		<p className={styles.totalRow}>
			<span>Total: </span>
			<span>${(cart.totalPrice / 100).toFixed(2)}</span>
		</p>
		<Link className={styles.btn} to="/checkout">Checkout</Link>

		</> 
		: 
		<>
		<p className={styles.font}>Your cart is empty 😶 </p>
			<Link className={styles.btn} to="/menu">
				Add something now
			</Link>
		
		</>}
		</div>
		</>
	)
}



