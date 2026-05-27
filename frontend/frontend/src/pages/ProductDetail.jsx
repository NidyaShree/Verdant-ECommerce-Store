import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './ProductDetail.css';
import ReviewSection from '../components/ReviewSection';

const ProductDetail = ({ onAddToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate(); 
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Add these for the Pincode logic
  const [pincode, setPincode] = useState('641042');
  const [deliveryInfo, setDeliveryInfo] = useState('');
  const [deliveryError, setDeliveryError] = useState('');
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`http://localhost:5000/api/plants/${id}`)
      .then(res => res.json())
      .then(data => {
        setPlant(data);
        setLoading(false);
      })
      .catch(err => console.error("Error fetching plant details:", err));
  }, [id]);

  // Function to call our backend API
  const handlePincodeCheck = async () => {
    if (!pincode) return;
    
    setIsCheckingPincode(true);
    setDeliveryError('');
    setDeliveryInfo('');

    try {
      const response = await fetch(`http://localhost:5000/api/check-pincode/${pincode}`);
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

  const handleBuyNow = () => {
    navigate('/checkout', {
      state: {
        product: plant,
        quantity: quantity,
        type: 'plant' 
      }
    });
  };

  // FIXED: Wraps the callback function cleanly so it passes the selected product and its exact quantity context cleanly to App.jsx
  const handleAddToCartClick = () => {
    if (plant) {
      onAddToCart(plant, quantity);
    }
  };

  if (loading) return <div className="loading-state">Finding your green companion...</div>;
  if (!plant) return <div className="error-state">Plant not found!</div>;

  return (
    <div className="product-detail-container">
      {/* Breadcrumbs */}
      <nav className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/plants">Plants</Link> / {plant.name}
      </nav>

      <div className="product-layout">
        {/* Left: Image Gallery */}
        <div className="product-image-section">
          <img src={`http://localhost:5000${plant.image_url}`} alt={plant.name} className="main-product-image" />
        </div>

        {/* Right: Info Section */}
        <div className="product-info-section">
          <h1 className="product-name">{plant.name}</h1>
          
          <div className="rating-row">
            <span className="stars">★ {plant.rating}</span>
            <span className="review-count">| {plant.review_count} Reviews</span>
          </div>

          <div className="price-box">
            <span className="current-price">₹{plant.current_price}</span>
            {plant.discount > 0 && (
              <span className="original-price">₹{plant.original_price}</span>
            )}
            <p className="tax-info">(Incl. of all taxes)</p>
          </div>

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
            
            {/* Dynamic Results Display */}
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
            
            {/* UPDATED: Connected to our safe click handler wrapper */}
            <button className="add-to-cart-btn" onClick={handleAddToCartClick}>
              ADD TO CART
            </button>
            
            <button className="buy-now-btn" onClick={handleBuyNow}>
              BUY IT NOW
            </button>
          </div>

          <div className="product-description">
            <h3>About The Product</h3>
            <p>{plant.description || `A beautiful ${plant.name} perfect for your home.`}</p>
            
            <div className="plant-specs">
              <p><strong>Sunlight:</strong> {plant.sunlight}</p>
              <p><strong>Watering:</strong> {plant.water}</p>
            </div>
          </div>
        </div>
      </div>
      
      <ReviewSection productId={id} productType="plant" />
    </div>
  );
};

export default ProductDetail;