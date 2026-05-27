import React from 'react';
import { Link } from 'react-router-dom';
import './SeedCard.css'; 

const SeedCard = ({ seed, onAddToCart }) => {
  // --- DIAGNOSTIC CHECK ---
  if (seed.stock === undefined) {
    console.error(`🚨 ALERT: Backend did not send 'stock' for ${seed.name}!`);
  }

  // Convert to Number safely, default to 1 (in stock) if undefined so it doesn't break
  const currentStock = seed.stock !== undefined ? Number(seed.stock) : 1;
  const isSoldOut = currentStock <= 0;

  return (
    <div className={`seed-card ${isSoldOut ? 'sold-out-card' : ''}`}>
      
      {/* 1. Conditionally Wrap Image in Link or Disabled Div */}
      {isSoldOut ? (
        <div className="seed-image-container out-of-stock-img">
          <span className="seed-badge-dark sold-out-badge">Sold Out</span>
          <img src={`http://localhost:5000${seed.image_url}`} alt={seed.name} className="seed-image" />
        </div>
      ) : (
        <Link to={`/seeds/${seed.id}`} style={{ textDecoration: 'none' }}>
          <div className="seed-image-container">
            {seed.badge && <span className="seed-badge-dark">{seed.badge}</span>}
            {seed.discount > 0 && <span className="seed-badge-discount">-{seed.discount}%</span>}
            <img 
              src={`http://localhost:5000${seed.image_url}`} 
              alt={seed.name} 
              className="seed-image" 
            />
          </div>
        </Link>
      )}

      <div className="seed-card-content">
        <p className="seed-category">{seed.category}</p>
        
        {/* 2. Conditionally Wrap Title in Link */}
        {isSoldOut ? (
          <h3 className="seed-title text-muted">{seed.name}</h3>
        ) : (
          <Link to={`/seeds/${seed.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3 className="seed-title">{seed.name}</h3>
          </Link>
        )}
        
        <div style={{ fontSize: '13px', color: '#666' }}>
          ★ {seed.rating} <span style={{ color: '#ccc', margin: '0 5px' }}>|</span> {seed.review_count} Reviews
        </div>

        <div className="seed-price-row">
          <div>
            <span className="seed-current-price">₹{Math.floor(seed.current_price)}</span>
            {seed.discount > 0 && (
              <span className="seed-original-price">₹{Math.floor(seed.original_price)}</span>
            )}
          </div>
          
          {/* 3. Conditional Add Button */}
          {isSoldOut ? (
            <button className="seed-add-btn sold-out-btn" disabled>
              Sold Out
            </button>
          ) : (
            <button className="seed-add-btn" onClick={() => onAddToCart(seed)}>
              + Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeedCard;