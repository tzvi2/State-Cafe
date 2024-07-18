import React from 'react'
import { useCart } from '../../hooks/useCart'
import { Trash2 } from 'lucide-react'
import styles from '../styles/cart styles/CartPage.module.css'
import { centsToFormattedPrice } from '../../utils/priceUtilities'

function CartItem({item}) {
	const {cart, removeFromCart, updateItemQuantity} = useCart()

	const handleDeleteItem = () => {
		removeFromCart(item.cartItemId)
	}

	const handleQuantityChange = (event) => {
		const newQuantity = parseInt(event.target.value, 10);
		if (!isNaN(newQuantity) && newQuantity >= 0) {
			updateItemQuantity(item.cartItemId, newQuantity);
		} else {
				return;
		}
};

return (
	<div className={styles.cartItem}>
		<div className={styles.top}>
			<select
				className={styles.quantity}
				value={item.quantity}
				onChange={handleQuantityChange}
			>
				{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
					<option key={value} value={value}>
						{value}
					</option>
				))}
			</select>
			<p>{item.title}</p>
			<Trash2 className={styles.delete} />
		</div>
		<div className={styles.bottom}>
			<img className={styles.itemImage} src={item.img}></img>
			<ul className={styles.options}>
				{item.options?.map((option) => (
					<li className={styles.option} key={`${item.cartItemId} ${option.title}`}>+ {option.title}</li>
				))}
			</ul>
			<p className={styles.itemPrice}>{centsToFormattedPrice(item.total)}</p>
		</div>
	</div>
);
}

export default CartItem