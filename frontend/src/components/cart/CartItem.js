import React from 'react'
import { useCart } from '../../hooks/useCart'
import { Trash2 } from 'lucide-react'
import styles from '../styles/cart styles/CartPage.module.css'

function CartItem({item}) {
	const {cart, removeFromCart, updateItemQuantity} = useCart()

	const handleDeleteItem = () => {
		removeFromCart(item.cartItemId)
	}

	const handleQuantityChange = (event) => {
		const newQuantity = parseInt(event.target.value, 10);
		if (!isNaN(newQuantity) && newQuantity >= 0) {
			const timePerItem = item.totalTimeToCook / item.quantity;
			updateItemQuantity(item.cartItemId, newQuantity);
		} else {
				return;
		}
};

return (
	<div className={styles.cartItem}>
		<div className={styles.col1}>
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
			<img className={styles.foodPic} src={item.img} alt={item.title} />
			<div className={styles.foodInfo}>
				<p className={styles.foodTitle}>{item.title}</p>
				<ul>
					{item.options?.map((option) => (
						<li className={styles.option} key={`${item.cartItemId} ${option.title}`}>+ {option.title}</li>
					))}
				</ul>
			</div>
		</div>
		<div className={styles.col2}>
			<Trash2 className={styles.deleteBtn} onClick={() => handleDeleteItem(item.cartItemId)} />
			<p className={styles.itemTotal}>${item.total / 100}</p>
		</div>
		
	</div>
);
}

export default CartItem