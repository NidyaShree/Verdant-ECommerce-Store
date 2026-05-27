import React from 'react';
import { Link } from 'react-router-dom';
import './PlantCard.css';

const PlantCard = ({ plant, onAddToCart }) => {
  // --- DEBUGGING LINE ---
  console.log(`Stock for ${plant.name}:`, plant.stock);

  // Check if out of stock (Forcing it to a Number just in case it arrives as a string)
  const isSoldOut = Number(plant.stock) <= 0;

  return (
    <div className={`product-card ${isSoldOut ? 'sold-out-card' : ''}`}>
      
      {/* Conditionally render Link or a simple div if sold out */}
      {isSoldOut ? (
        <div className="image-container out-of-stock-img">
          <span className="badge-bestseller" style={{ backgroundColor: '#3f2626' }}>Sold Out</span>
          <img src={`https://verdant-backend-usze.onrender.com/${plant.image_url}`} alt={plant.name} className="product-img" style={{ opacity: 0.6, filter: 'grayscale(60%)' }} />
        </div>
      ) : (
        <Link to={`/plants/${plant.id}`} style={{ textDecoration: 'none' }}>
          <div className="image-container">
            {plant.badge && <span className="badge-bestseller">{plant.badge}</span>}
            
            {/* Optional: Kept your discount logic. Inline styles used so it doesn't break the new CSS */}
            {plant.discount > 0 && (
              <span style={{ position: 'absolute', top: '14px', right: '14px', background: '#fff', color: '#c0392b', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', zIndex: 2 }}>
                -{plant.discount}%
              </span>
            )}
            
            <img src={`https://verdant-backend-usze.onrender.com/${plant.image_url}`} alt={plant.name} className="product-img" />
          </div>
        </Link>
      )}

      <div className="card-content">
        <span className="category">{plant.category}</span>
        
        {isSoldOut ? (
           <h3 className="title text-muted" style={{ opacity: 0.7 }}>{plant.name}</h3>
        ) : (
          <Link to={`/plants/${plant.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3 className="title">{plant.name}</h3>
          </Link>
        )}
        
        {/* Updated Rating Row to match the single star and pipe divider from the CSS */}
        <div className="rating-row">
          <span className="star">★</span>
          <span className="score">{plant.rating}</span>
          <span className="divider">|</span>
          <span className="reviews">{plant.review_count} Reviews</span>
        </div>

        <div className="purchase-row">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="price">₹{plant.current_price}</span>
            {plant.discount > 0 && (
              <span style={{ fontSize: '14px', textDecoration: 'line-through', color: '#8da1b5' }}>
                ₹{plant.original_price}
              </span>
            )}
          </div>

          {/* Conditional Button Render */}
          {isSoldOut ? (
            <button className="add-button" disabled style={{ opacity: 0.5, cursor: 'not-allowed', backgroundColor: '#f4f6f8' }}>
              Sold Out
            </button>
          ) : (
            <button className="add-button" onClick={() => onAddToCart(plant)}>
              + Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlantCard;