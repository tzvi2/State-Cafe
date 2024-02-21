import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import Hamburger from 'hamburger-react';
import { ShoppingCart } from 'lucide-react';
import styles from '../styles/header styles/Header.module.css';
import { useCart } from '../../hooks/useCart';

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const wrapper = useRef(null);
  const { cart } = useCart(); 

  useEffect(() => {
    const handleClickOutside = e => {
      if (wrapper.current && !wrapper.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapper]);

  // Dynamically generate class name for NavLink
  const getNavLinkClass = (isActive, baseClass) => 
    isActive ? `${baseClass} ${styles.activeLink}` : baseClass;

  return (
    <>
      <nav className={styles.mobileHeader} ref={wrapper}>
        <div className={styles.topBar}>
          <Hamburger className={styles.hamburgerReact} toggled={isOpen} toggle={() => setIsOpen(!isOpen)}/>
          <NavLink onClick={() => setIsOpen(false)} className={styles.logo} to="/">State Cafe</NavLink>
          <NavLink to="cart" className={({ isActive }) => getNavLinkClass(isActive, styles.cart)}>
            <ShoppingCart onClick={() => setIsOpen(false)} className={styles.cartIcon}/>
            {cart.totalCount > 0 && <span className={styles.cartItemCount}>{cart.totalCount}</span>}
          </NavLink>
        </div>
        {isOpen && (
          <nav className={styles.menu}>
            <ul onClick={() => setIsOpen(false)}>
              <li><NavLink to={'/'} className={({ isActive }) => getNavLinkClass(isActive, styles.link)}>Home</NavLink></li>
              <li><NavLink to={'menu'} className={({ isActive }) => getNavLinkClass(isActive, styles.link)}>Order Online</NavLink></li>
              <li><NavLink to={'cart'} className={({ isActive }) => getNavLinkClass(isActive, styles.link)}>Cart</NavLink></li>
              <li><NavLink to={'about'} className={({ isActive }) => getNavLinkClass(isActive, styles.link)}>About</NavLink></li>
            </ul>
          </nav>
        )}
      </nav>

      <nav className={styles.desktopHeader}>
        <div className={styles.logoSection}>
          <NavLink className={styles.logo} to="/">State Cafe</NavLink>
        </div>
        <ul className={styles.links}>
          <li><NavLink to={'/'} className={({ isActive }) => getNavLinkClass(isActive, styles.link)}>Home</NavLink></li>
          <li><NavLink to={'menu'} className={({ isActive }) => getNavLinkClass(isActive, styles.link)}>Order Online</NavLink></li>
          <li><NavLink to={'cart'} className={({ isActive }) => getNavLinkClass(isActive, styles.link)}>Cart</NavLink></li>
          <li><NavLink to={'about'} className={({ isActive }) => getNavLinkClass(isActive, styles.link)}>About</NavLink></li>
        </ul>
      </nav>
    </>
  );
}

export default Header;
