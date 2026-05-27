import React from 'react';
import { Link } from 'react-router-dom';
import './ToolCard.css';

const ToolCard = ({ tool, onAddToCart }) => {
  return (
    <div className="tool-card">
      {/* 1. Wrap Image in Link */}
      <Link to={`/tools/${tool.id}`} style={{ textDecoration: 'none' }}>
        <div className="tool-image-container">
          {tool.badge && <span className="tool-badge-dark">{tool.badge}</span>}
          {tool.discount > 0 && <span className="tool-badge-discount">-{tool.discount}%</span>}
          
          <img 
            src={`https://verdant-backend-usze.onrender.com/${tool.image_url}`} 
            alt={tool.name} 
            className="tool-image" 
          />
        </div>
      </Link>

      <div className="tool-card-content">
        <p className="tool-category">{tool.category}</p>
        
        {/* 2. Wrap Title in Link */}
        <Link to={`/tools/${tool.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 className="tool-title">{tool.name}</h3>
        </Link>
        
        {tool.material && <p className="tool-material">Material: {tool.material}</p>}
        
        <div style={{ fontSize: '13px', color: '#666' }}>
          ★ {tool.rating} <span style={{ color: '#ccc', margin: '0 5px' }}>|</span> {tool.review_count} Reviews
        </div>

        <div className="tool-price-row">
          <div>
            <span className="tool-current-price">₹{Math.floor(tool.current_price)}</span>
            {tool.discount > 0 && (
              <span className="tool-original-price">₹{Math.floor(tool.original_price)}</span>
            )}
          </div>
          
          <button className="tool-add-btn" onClick={() => onAddToCart(tool)}>
            + Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToolCard;