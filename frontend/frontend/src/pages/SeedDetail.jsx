import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './ProductDetail.css';
import ReviewSection from '../components/ReviewSection';

const SeedDetail = ({ onAddToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate(); 
  const [seed, setSeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // --- NEW: Pincode States ---
  const [pincode, setPincode] = useState('641042');
  const [deliveryInfo, setDeliveryInfo] = useState('');
  const [deliveryError, setDeliveryError] = useState('');
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`https://verdant-backend-usze.onrender.com//api/seeds/${id}`)
      .then(res => res.json())
      .then(data => {
        setSeed(data);
        setLoading(false);
      })
      .catch(err => console.error("Error fetching seed details:", err));
  }, [id]);

  const handleBuyNow = () => {
    navigate('/checkout', {
      state: {
        product: seed,
        quantity: quantity,
        type: 'seed' 
      }
    });
  };

  const handleAddToCartClick = () => {
    if (seed) onAddToCart(seed, quantity);
  };

  // --- NEW: Pincode API Call ---
  const handlePincodeCheck = async () => {
    if (!pincode) return;
    setIsCheckingPincode(true);
    setDeliveryError('');
    setDeliveryInfo('');

    try {
      const response = await fetch(`https://verdant-backend-usze.onrender.com//api/check-pincode/${pincode}`);
      const data = await response.json();

      if (data.success) {
        setDeliveryInfo(data.estimatedDate);
      } else {
        setDeliveryError('Please enter a valid 6-digit pincode.');
      }
    } catch (err) {
      setDeliveryError('Could not verify pincode right now.');
    } finally {
      setIsCheckingPincode(false);
    }
  };

  if (loading) return <div className="loading-state">Gathering seed information...</div>;
  if (!seed) return <div className="error-state">Seed packet not found!</div>;

  return (
    <div className="product-detail-container">
      <nav className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/seeds">Seeds</Link> / {seed.name}
      </nav>

      <div className="product-layout">
        <div className="product-image-section">
          <img src={`https://verdant-backend-usze.onrender.com/${seed.image_url}`} alt={seed.name} className="main-product-image" />
        </div>

        <div className="product-info-section">
          <h1 className="product-name">{seed.name}</h1>
          
          <div className="rating-row">
            <span className="stars">★ {seed.rating}</span>
            <span className="review-count">| {seed.review_count} Reviews</span>
          </div>

          <div className="price-box">
            <span className="current-price">₹{seed.current_price}</span>
            {seed.discount > 0 && (
              <span className="original-price">₹{seed.original_price}</span>
            )}
            <p className="tax-info">(Incl. of all taxes)</p>
          </div>

          {/* UPDATED: Dynamic Delivery Check Area */}
          <div className="delivery-check">
            <p>Check Delivery</p>
            <div className="pincode-input">
              <input 
                type="text" 
                placeholder="Enter Pincode" 
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                maxLength="6"
              />
              <button onClick={handlePincodeCheck} disabled={isCheckingPincode}>
                {isCheckingPincode ? '...' : 'Check'}
              </button>
            </div>
            {deliveryInfo && (
              <p className="delivery-date" style={{ color: '#2C5E3B', marginTop: '10px' }}>
                Estimated Delivery By: <strong>{deliveryInfo}</strong>
              </p>
            )}
            {deliveryError && (
              <p className="delivery-error" style={{ color: '#d9534f', fontSize: '0.9rem', marginTop: '5px' }}>
                {deliveryError}
              </p>
            )}
          </div>

          <div className="action-buttons">
            <div className="quantity-selector">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>
           
            <button className="add-to-cart-btn" onClick={handleAddToCartClick}>
              ADD TO CART
            </button>
            
            <button className="buy-now-btn" onClick={handleBuyNow}>
              BUY IT NOW
            </button>
          </div>

          <div className="product-description">
            <h3>About The Seeds</h3>
            <p>{seed.description}</p>
            <div className="plant-specs">
              <p><strong>Sunlight:</strong> {seed.sunlight}</p>
              <p><strong>Watering:</strong> {seed.water}</p>
              {seed.sowing_period && <p><strong>Sowing Period:</strong> {seed.sowing_period}</p>}
            </div>
          </div>
        </div>
      </div>
      
      <ReviewSection productId={id} productType="seed" />
    </div>
  );
};

export default SeedDetail;