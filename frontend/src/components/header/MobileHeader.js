import React, { useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import Hamburger from 'hamburger-react';
import { ShoppingCart } from 'lucide-react';
import styles from '../styles/header styles/Header.module.css';
import { useCart } from '../../hooks/useCart';
import { useClickOutside } from '../../hooks/useClickOutside';
import { menuLinks } from '../../constants/menuLinks'; // Import the menuLinks array
import { getNavLinkClass } from '../../utils/getNavLinkClass';
function MobileHeader() {
	const [isOpen, setIsOpen] = useState(false);
	const wrapper = useRef(null);
	const { cart } = useCart();

	// Close the menu when clicking outside
	useClickOutside(wrapper, () => setIsOpen(false));

	return (
		<div className={styles.mobileHeader} ref={wrapper}>
			<div className={styles.topBar}>
				{/* Hamburger Menu */}
				<Hamburger toggled={isOpen} toggle={setIsOpen} />
				{/* Logo */}
				<NavLink onClick={() => setIsOpen(false)} className={styles.logo} to="/">
					State Cafe
				</NavLink>
				{/* Cart Icon */}
				<NavLink
					to="cart"
					className={({ isActive }) => getNavLinkClass(isActive, styles.cart, styles.activeLink)}
				>
					<ShoppingCart onClick={() => setIsOpen(false)} className={styles.cartIcon} />
					{cart.totalCount > 0 && <span className={styles.cartItemCount}>{cart.totalCount}</span>}
				</NavLink>
			</div>
			{/* Mobile Menu */}
			{isOpen && (
				<nav className={styles.menu}>
					<ul onClick={() => setIsOpen(false)}>
						{menuLinks.map(({ name, path }) => (
							<li key={name}>
								<NavLink
									to={path}
									className={({ isActive }) =>
										getNavLinkClass(isActive, styles.link, styles.activeLink)
									}
								>
									{name}
								</NavLink>
							</li>
						))}
					</ul>
				</nav>
			)}
		</div>
	);
}

export default MobileHeader;
