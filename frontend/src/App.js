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
import MenuItemForm from './components/dashboard/MenuItemForm';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { AuthContextProvider } from './hooks/useAuth';
import { OrderProvider } from './contexts/OrderContext'
import DashboardLayout from './components/dashboard/DashboardLayout';
import LoginPage from './components/LoginPage';
import UnauthorizedPage from './components/UnauthorizedPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {

  return (
    <BrowserRouter>
      <CartProvider>
        <DeliveryDetailsProvider>
          <AuthContextProvider>
            <OrderProvider>
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
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/unauthorized" element={<UnauthorizedPage />} />
                  <Route path="/dashboard" element={<ProtectedRoute element={<DashboardLayout />} />}>
                    <Route path="stock" element={<StockPage />} />
                    <Route path="hours" element={<HoursPage />} />
                    <Route path="menu" element={<MenuPage />} />
                    <Route path="menu/new" element={<MenuItemForm />} />
                    <Route path="menu/:itemId" element={<MenuItemForm />} />
                    <Route path="orders" element={<OrdersPage />} />
                  </Route>
                </Routes>
              </div>
            </OrderProvider>
          </AuthContextProvider>
        </DeliveryDetailsProvider>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
