import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./BestSellers.css";

const StarRating = ({ rating }) => (
  <span className="stars">
    {"★".repeat(Math.floor(rating))}
    {rating % 1 >= 0.5 ? "½" : ""}
  </span>
);

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  // 1. Map backend categories to display categories
  const displayCategory =
    product.category === "plant" ? "Indoor Plant" :
    product.category === "seed" ? "Seeds" : "Plant Care";

  // 2. Fake an original price for the UI
  const originalPrice = Math.round(product.current_price * 1.25);
  const discount = Math.round((1 - product.current_price / originalPrice) * 100);

  // 3. Format Image URL
  const imageUrl = product.image_url.startsWith('http')
    ? product.image_url
    : `https://verdant-backend-usze.onrender.com/${product.image_url}`;

  // ==========================================
  // 4. THE DYNAMIC TAG ENGINE
  // ==========================================
  const totalSold = Number(product.total_sold) || 0;
  let dynamicTag = "New Arrival"; // Default tag
  let badgeClass = "dark-badge";

  if (totalSold > 10) {
    dynamicTag = "Best Seller";
    badgeClass = "dark-badge"; 
  } else if (totalSold > 3) {
    dynamicTag = "Trending";
    badgeClass = "dark-badge";
  } else if (totalSold > 0) {
    dynamicTag = "Top Rated";
  }

  // ==========================================
  // 5. SMART RATING GENERATOR
  // ==========================================
  // Generate realistic ratings based on sales volume
  const generatedRating = totalSold > 0 ? (4.2 + (totalSold * 0.05)).toFixed(1) : 4.0;
  const cappedRating = Math.min(Number(generatedRating), 5.0); 
  const generatedReviewCount = totalSold > 0 ? (totalSold * 12) + 14 : 3;

  // 6. Handle "Add" button
  const handleAdd = (e) => {
    e.preventDefault();
    setAdded(true);
    
    setTimeout(() => {
      setAdded(false);
      navigate('/checkout', {
        state: {
          product: product,
          quantity: 1,
          type: product.category
        }
      });
    }, 600); 
  };

  return (
    <div className="product-card">
      <div className="product-image-wrap">
        <img src={imageUrl} alt={product.name} className="product-img" loading="lazy" />
        
        {/* DYNAMIC TAG INJECTED HERE */}
        <span className={`product-tag ${badgeClass}`}>{dynamicTag}</span>
        <span className="discount-tag">-{discount}%</span>
        
        <button className="wishlist-btn" aria-label="Wishlist">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

      <div className="product-info">
        <span className="product-category">{displayCategory.toUpperCase()}</span>
        <h3 className="product-name">{product.name}</h3>

        <div className="product-rating">
          {/* DYNAMIC RATINGS INJECTED HERE */}
          <StarRating rating={cappedRating} />
          <span className="rating-value">{cappedRating}</span>
          <span className="rating-count">({generatedReviewCount})</span>
        </div>

        <div className="product-footer">
          <div className="product-price">
            <span className="price-current">₹{product.current_price}</span>
            <span className="price-original">₹{originalPrice}</span>
          </div>
          
          <button
            className={`add-to-cart ${added ? "added" : ""}`}
            onClick={handleAdd}
            disabled={product.stock < 1}
          >
            {product.stock < 1 ? (
              <span style={{ fontSize: '0.85rem' }}>Out of Stock</span>
            ) : added ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Added
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const BestSellers = () => {
  const trackRef = useRef(null);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeFilter, setActiveFilter] = useState("All");
  const filters = ["All", "Plants", "Seeds", "Plant Care"];

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('https://verdant-backend-usze.onrender.com//api/featured-products');
        const data = await response.json();
        if (data.success) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Error fetching homepage products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  const filtered = products.filter((p) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Plants") return p.category === "plant";
    if (activeFilter === "Seeds") return p.category === "seed";
    if (activeFilter === "Plant Care") return p.category === "tool";
    return true;
  });

  const scroll = (dir) => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: dir * 320, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <section className="bestsellers-section" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h3 style={{ color: '#2c7a4b', fontFamily: 'DM Sans' }}>Loading latest collection...</h3>
      </section>
    );
  }

  return (
    <section className="bestsellers-section">
      <div className="bestsellers-container">
        <div className="section-header">
          <div className="section-label">
            <span className="label-line" />
            <span>Our Collection</span>
          </div>
          <div className="section-title-row">
            <h2 className="section-title">Best Selling Products</h2>
            <div className="scroll-btns">
              <button className="scroll-btn" onClick={() => scroll(-1)} aria-label="Previous">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button className="scroll-btn" onClick={() => scroll(1)} aria-label="Next">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>

          <div className="filter-tabs">
            {filters.map((f) => (
              <button
                key={f}
                className={`filter-tab ${activeFilter === f ? "active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="products-track" ref={trackRef}>
          {filtered.length === 0 ? (
            <p style={{ padding: '20px', color: '#666' }}>No products available in this category yet.</p>
          ) : (
            filtered.map((p) => (
              <ProductCard key={`${p.category}-${p.id}`} product={p} />
            ))
          )}
        </div>

        <div className="view-all-wrap">
          <a href="/plants" className="view-all-btn">
            View All Products
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default BestSellers;