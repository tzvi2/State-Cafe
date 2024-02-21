import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Menu from './components/food menu/Menu';
import About from './components/pages/About';
import Header from './components/header/Header';
import MenuItemExpanded from './components/food menu/MenuItemExpanded';
import CartPage from './components/cart/CartPage';
import CartProvider from './hooks/useCart';
import DeliveryDetailsProvider from './hooks/useDeliveryDetails'; 
import Payment from './components/checkout process/Payment';
import Home from './components/Home';
import OrderConfirmation from './components/checkout process/OrderConfirmation';
import DeliveryPage from './components/checkout process/DeliveryPage';
import OrdersDashboard from './components/dashboard/OrdersDashboard';
import AddNewMenuItem from './components/dashboard/AddNewMenuItem';
import MenuDashboard from './components/dashboard/MenuDashboard';
import EditMenuItem from './components/dashboard/EditMenuItem'
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react'

function App() {
  return (
    <>
      <BrowserRouter>
        <CartProvider>
          <DeliveryDetailsProvider> 
            <Analytics />
            <SpeedInsights />
            <Header />
            <div className='App'>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path='menu' element={<Menu />} />
                <Route path="menu/:itemId" element={<MenuItemExpanded />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<DeliveryPage />} />
                <Route path="payment" element={<Payment />} />
                <Route path="confirmation" element={<OrderConfirmation />} />
                <Route path="/order-dashboard" element={<OrdersDashboard />} />
                <Route path="/menu-dashboard" element={<MenuDashboard />} />
                <Route path="/menu-dashboard/add-menu-item" element={<AddNewMenuItem />} />
                <Route path="/menu-dashboard/edit-item/:itemId" element={<EditMenuItem />} />
              </Routes>
            </div>
          </DeliveryDetailsProvider>
        </CartProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
