import React from 'react'
import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Hamburger from 'hamburger-react'
import { ShoppingCart } from 'lucide-react'
import '../styles/header styles/Header.css'
import { useCart } from '../../hooks/useCart'

function Header() {

  const [isOpen, setIsOpen] = useState(false)
  const wrapper = useRef(null)
  const { cart } = useCart(); 


  useEffect(() => {
    const handleClickOutside = e => {
      if (wrapper.current && !wrapper.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [wrapper])

  return (
    <>
    <nav className='mobileHeader' ref={wrapper}>
      <div className='topBar'>
        <Hamburger className="hamburgerReact" toggled={isOpen} toggle={() => setIsOpen(!isOpen)}/>
        <Link onClick={() => setIsOpen(false)} className='logo' to="/">State Cafe</Link>
        {/* CLOSE menu on cart icon click */}
        <Link to="cart" className='cart'>
          <ShoppingCart onClick={() => setIsOpen(false)} className="cartIcon"/>
          {cart.totalCount > 0 && <span className="cartItemCount">{cart.totalCount}</span>}
        </Link>
      </div>
      {isOpen && <>
        <nav className='menu'>
        <ul onClick={() => setIsOpen(false)}>
            <li>
                <Link to={'/'}>Home</Link>
            </li>
            <li>
                <Link to={'menu'}>Order Online</Link>
            </li>
            
            <li>
                <Link to={'cart'}>Cart</Link>
            </li>
            <li>
                <Link to={'about'}>About</Link>
            </li>
        </ul>
    </nav>
      </>}
    </nav>

    <nav className='desktopHeader'>
      <div className='logoSection'>
        <Link className='logo' to="/">State Cafe</Link>
      </div>
      <ul className='links'>
        <li>
            <Link to={'/'}>Home</Link>
        </li>
        <li>
            <Link to={'menu'}>Order Online</Link>
        </li>
        
        <li>
            <Link to={'cart'}>Cart</Link>
        </li>
        <li>
            <Link to={'about'}>About</Link>
        </li>
      </ul>
    </nav>
    </>
  )
}

export default Header