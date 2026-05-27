import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CartPage.css';

const CartPage = ({ cartItems, setCartItems }) => {
  const navigate = useNavigate();

  // Calculate the total price
  const cartTotal = cartItems.reduce((total, item) => total + (item.current_price * item.quantity), 0);

  // Function to remove an item
  const handleRemove = (indexToRemove) => {
    setCartItems(prevItems => prevItems.filter((_, index) => index !== indexToRemove));
  };

  // --- UPDATED: Pushes the entire bag's context forward onto the checkout route state ---
  const handleProceedToCheckout = () => {
    navigate('/checkout', {
      state: {
        isCartCheckout: true,     // Flags the checkout page to expect an array
        products: cartItems,      // Passes the full array of selected items
        totalAmount: cartTotal    // Passes final calculated cost
      }
    });
  };

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart-container">
        <h2>Your Bag is Empty</h2>
        <p>Looks like you haven't added any plants, seeds, or tools yet.</p>
        <Link to="/" className="continue-shopping-btn">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <h1>Your Shopping Bag</h1>
      
      <div className="cart-layout">
        <div className="cart-items-section">
          {cartItems.map((item, index) => (
            <div key={index} className="cart-item-card">
              <img src={`https://verdant-backend-usze.onrender.com/${item.image_url}`} alt={item.name} className="cart-item-image" />
              
              <div className="cart-item-details">
                <h3 className="cart-item-title">{item.name}</h3>
                <p className="cart-item-category">{item.category}</p>
                <div className="cart-item-qty-price">
                  <span className="cart-item-qty">Qty: {item.quantity}</span>
                  <span className="cart-item-price">₹{item.current_price}</span>
                </div>
              </div>
              
              <div className="cart-item-actions">
                <p className="item-total-price">₹{item.current_price * item.quantity}</p>
                <button className="remove-btn" onClick={() => handleRemove(index)}>
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary-section">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal ({cartItems.length} items)</span>
            <span>₹{cartTotal}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span className="free-shipping">FREE</span>
          </div>
          <hr />
          <div className="summary-row total-row">
            <span>Total</span>
            <span>₹{cartTotal}</span>
          </div>
          
          <p className="tax-note">Inclusive of all taxes</p>
          
          {/* UPDATED: Connected directly to our stateful navigation routine */}
          <button className="checkout-btn" onClick={handleProceedToCheckout}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;