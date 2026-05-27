import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Components
import Navbar from "./components/Navbar";
import HeroSlider from "./components/HeroSlider";
import BestSellers from "./components/BestSellers";

// Pages
import PlantsProd from "./pages/plantsprod";
import SeedsProd from "./pages/seedsprod";
import ToolsProd from "./pages/toolsprod";
import ProductDetail from './pages/ProductDetail';
import ToolDetail from './pages/ToolDetail';
import SeedDetail from './pages/SeedDetail';
import AuthPage from './pages/AuthPage';
import Checkout from './pages/Checkout';
import CartPage from './pages/CartPage';

// --- ADMIN PAGES IMPORTS ---
import Adminlayout from './admin/components/Adminlayout';
import AdminDashboard from './admin/components/pages/dashboard';
import AdminPlants from './admin/components/pages/plants';
import AdminSeeds from './admin/components/pages/seeds';
import AdminTools from './admin/components/pages/tools';
import AdminOrders from './admin/components/pages/orders';
import AdminCustomers from './admin/components/pages/customers';
import "./App.css";

const Home = () => {
  return (
    <>
      <HeroSlider />
      <BestSellers />
    </>
  );
};

function App() {
  const [cartItems, setCartItems] = useState([]);

  const handleAddToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        item => item.id === product.id && item.name === product.name
      );
      
      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      } else {
        return [...prevItems, { ...product, quantity }];
      }
    });
    alert(`${product.name} added to your cart!`);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <Router>
      <div className="app-container">
        
        <Routes>
          {/* ========================================= */}
          {/* ADMIN ROUTES (No Store Navbar here)       */}
          {/* ========================================= */}
          {/* ========================================= */}
          {/* ADMIN ROUTES (No Store Navbar here)       */}
         
          {/* ========================================= */}
          {/* ADMIN ROUTES (No Store Navbar here)       */}
          {/* ========================================= */}
          <Route path="/admin" element={<Adminlayout />}>
            {/* Replaced the <div> placeholders with your actual imported files */}
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="plants" element={<AdminPlants />} />
            <Route path="seeds" element={<AdminSeeds />} />
            <Route path="tools" element={<AdminTools />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            
            {/* Default redirect when just typing /admin */}
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* ========================================= */}
          {/* CUSTOMER STORE ROUTES (With Store Navbar) */}
          {/* ========================================= */}
          <Route path="/*" element={
            <>
              <Navbar cartCount={cartCount} />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/plants" element={<PlantsProd onAddToCart={handleAddToCart} />} />
                  <Route path="/seeds" element={<SeedsProd onAddToCart={handleAddToCart} />} />
                  <Route path="/tools" element={<ToolsProd onAddToCart={handleAddToCart} />} />
                  <Route path="/plants/:id" element={<ProductDetail onAddToCart={handleAddToCart} />} />
                  <Route path="/seeds/:id" element={<SeedDetail onAddToCart={handleAddToCart} />} />
                  <Route path="/tools/:id" element={<ToolDetail onAddToCart={handleAddToCart} />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/cart" element={<CartPage cartItems={cartItems} setCartItems={setCartItems} />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;