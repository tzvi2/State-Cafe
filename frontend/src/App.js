import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import StockPage from './components/dashboard/StockPage';
import HoursPage from './components/dashboard/HoursPage';
import MenuPage from './components/dashboard/MenuPage';
import OrdersPage from './components/dashboard/OrdersPage';
import NewDashboard from './components/dashboard/NewDashboard';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { AuthContextProvider } from './hooks/useAuth';

function App() {
  const [menuItemData, setMenuItemData] = useState(null);
  return (
    <BrowserRouter>
      <CartProvider>
        <DeliveryDetailsProvider>
          <AuthContextProvider>
            <Analytics />
            <SpeedInsights />
            <Header />
            <div className='App'>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="menu" element={<Menu />} />
                <Route path="menu/:itemId" element={<MenuItemExpanded />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<DeliveryPage />} />
                <Route path="payment" element={<Payment />} />
                <Route path="confirmation" element={<OrderConfirmation />} />
                <Route path="/dashboard" element={<Navigate to="/dashboard/stock" />} />
                <Route path="dashboard" element={<NewDashboard />}>
                  <Route path="stock" element={<StockPage />} />
                  <Route path="hours" element={<HoursPage />} />
                  <Route path="menu" element={<MenuPage />} />
                  <Route path="orders" element={<OrdersPage />} />
                </Route>
              </Routes>
            </div>
          </AuthContextProvider>
        </DeliveryDetailsProvider>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
