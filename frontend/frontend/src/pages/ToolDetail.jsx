import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReviewSection from '../components/ReviewSection';
import './ProductDetail.css';

const ToolDetail = ({ onAddToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate(); 
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // --- NEW: Pincode States ---
  const [pincode, setPincode] = useState('641042');
  const [deliveryInfo, setDeliveryInfo] = useState('');
  const [deliveryError, setDeliveryError] = useState('');
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`http://localhost:5000/api/tools/${id}`)
      .then(res => res.json())
      .then(data => {
        setTool(data);
        setLoading(false);
      })
      .catch(err => console.error("Error fetching tool details:", err));
  }, [id]);

  const handleBuyNow = () => {
    navigate('/checkout', {
      state: {
        product: tool,
        quantity: quantity,
        type: 'tool' 
      }
    });
  };

  const handleAddToCartClick = () => {
    if (tool) onAddToCart(tool, quantity);
  };

  // --- NEW: Pincode API Call ---
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

  if (loading) return <div className="loading-state">Locating your gardening essential...</div>;
  if (!tool) return <div className="error-state">Tool not found!</div>;

  return (
    <div className="product-detail-container">
      <nav className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/tools">Plant Care & Tools</Link> / {tool.name}
      </nav>

      <div className="product-layout">
        <div className="product-image-section">
          <img src={`http://localhost:5000${tool.image_url}`} alt={tool.name} className="main-product-image" />
        </div>

        <div className="product-info-section">
          <h1 className="product-name">{tool.name}</h1>
          
          <div className="rating-row">
            <span className="stars">★ {tool.rating}</span>
            <span className="review-count">| {tool.review_count} Reviews</span>
          </div>

          <div className="price-box">
            <span className="current-price">₹{tool.current_price}</span>
            {tool.discount > 0 && (
              <span className="original-price">₹{tool.original_price}</span>
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
            
            {/* FIXED: Replaced "seed" with "handleAddToCartClick" */}
            <button className="add-to-cart-btn" onClick={handleAddToCartClick}>
              ADD TO CART
            </button>
            
            <button className="buy-now-btn" onClick={handleBuyNow}>
              BUY IT NOW
            </button>
          </div>

          <div className="product-description">
            <h3>About This Item</h3>
            <p>{tool.description}</p>
            <div className="plant-specs">
              {tool.material && <p><strong>Material:</strong> {tool.material}</p>}
              {tool.tool_type && <p><strong>Type:</strong> {tool.tool_type}</p>}
              <p><strong>Category:</strong> {tool.category}</p>
            </div>
          </div>
        </div>

      </div>
      <ReviewSection productId={id} productType="tool" />
    </div>
  );
};

export default ToolDetail;