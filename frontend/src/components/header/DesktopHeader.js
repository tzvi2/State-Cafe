import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import styles from '../styles/header styles/Header.module.css';
import { useCart } from '../../hooks/useCart';
import { menuLinks } from '../../constants/menuLinks'; // Import the menuLinks array
import { getNavLinkClass } from '../../utils/getNavLinkClass'; // Import the utility function

function DesktopHeader() {
	const { cart } = useCart();

	return (
		<nav className={styles.desktopHeader}>
			{/* Logo */}
			<div className={styles.logoSection}>
				<NavLink className={styles.logo} to="/">
					State Cafe
				</NavLink>
			</div>
			{/* Navigation Links */}
			<ul className={styles.links}>
				{menuLinks.map(({ name, path }) => (
					<li key={name}>
						<NavLink
							to={path}
							className={({ isActive }) => getNavLinkClass(isActive, styles.link, styles.activeLink)}
						>
							{name}
						</NavLink>
					</li>
				))}
				{/* Cart Icon */}
				<NavLink
					to="cart"
					className={({ isActive }) => getNavLinkClass(isActive, styles.cart, styles.activeLink)}
				>
					<ShoppingCart className={styles.cartIcon} />
					{cart.totalCount > 0 && <span className={styles.cartItemCount}>{cart.totalCount}</span>}
				</NavLink>
			</ul>
		</nav>
	);
}

export default DesktopHeader;
