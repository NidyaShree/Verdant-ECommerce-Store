import React, { useState, useEffect, useRef } from "react";
import { Link } from 'react-router-dom'; // Link is imported here
import "./navbar.css";

const Navbar = ({ cartCount = 0 }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Focus input when drawer opens
  useEffect(() => {
    if (searchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  const handleCloseSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const showDropdown = searchQuery.trim().length > 0;

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          {/* REPLACED: a href -> Link to */}
          <Link to="/" className="navbar-logo">
            <span className="logo-icon">🌿</span>
            <span className="logo-text">Verdant</span>
          </Link>

          {/* REPLACED: a href -> Link to */}
          <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
            <li><Link to="/plants" className="nav-link">Plants</Link></li>
            <li><Link to="/seeds" className="nav-link">Seeds</Link></li>
            <li><Link to="/tools" className="nav-link">Plant Care</Link></li>
          </ul>

          <div className="nav-actions">
            <button
              className="nav-icon-btn search-btn"
              onClick={() => searchOpen ? handleCloseSearch() : setSearchOpen(true)}
              aria-label="Search"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {/* REPLACED: a href -> Link to */}
            <Link to="/auth" className="nav-icon-btn" aria-label="Profile">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>

            {/* REPLACED: a href -> Link to */}
            <Link to="/cart" className="nav-icon-btn cart-btn" aria-label="Cart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              <span className={menuOpen ? "bar open" : "bar"} />
              <span className={menuOpen ? "bar open" : "bar"} />
              <span className={menuOpen ? "bar open" : "bar"} />
            </button>
          </div>
        </div>

        {/* Search Drawer — only the input bar, no dropdown inside */}
        <div className={`search-drawer ${searchOpen ? "visible" : ""}`}>
          <div className="search-bar-container">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search for plants, seeds, tools..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-close" onClick={handleCloseSearch}>✕</button>
          </div>
        </div>
      </nav>

      {/* Dropdown rendered OUTSIDE <nav> entirely — as a sibling in the DOM.
        Uses position:fixed so nothing can clip it.
        Top: 126px = navbar height (68px) + drawer height (58px)
      */}
      {searchOpen && showDropdown && (
        <div style={{
          position: 'fixed',
          top: '126px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(800px, calc(100vw - 4rem))',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
          maxHeight: '420px',
          overflowY: 'auto',
          zIndex: 9999,
          animation: 'dropIn 0.15s ease',
        }}>

          {isLoading && (
            <div style={{ padding: '16px', textAlign: 'center', color: '#8fa3b1', fontSize: '0.9rem' }}>
              Searching...
            </div>
          )}

          {!isLoading && searchResults.length > 0 && searchResults.map((item, i) => (
            <Link
              key={`${item.type}-${item.id}`}
              to={`/${item.type}s/${item.id}`}
              onClick={handleCloseSearch}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 20px',
                textDecoration: 'none',
                color: '#0d1b2a',
                borderBottom: i < searchResults.length - 1 ? '1px solid #f0f0f0' : 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f5fbff'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <img
                src={`http://localhost:5000${item.image_url}`}
                alt={item.name}
                style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee', flexShrink: 0 }}
                onError={(e) => { e.target.src = 'https://placehold.co/52x52?text=?'; }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 4 }}>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.name}</span>
                <span style={{
                  fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.05em',
                  color: '#4a9eca', background: 'rgba(74,158,202,0.1)',
                  padding: '2px 8px', borderRadius: 20, width: 'fit-content'
                }}>
                  {item.type.toUpperCase()}
                </span>
              </div>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#2c7a4b', flexShrink: 0 }}>
                ₹{item.current_price}
              </span>
            </Link>
          ))}

          {!isLoading && searchResults.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: '#8fa3b1', fontSize: '0.9rem' }}>
              No products found for "{searchQuery}"
            </div>
          )}
        </div>
      )}

      {/* Backdrop — click outside to close */}
      {searchOpen && showDropdown && (
        <div
          onClick={handleCloseSearch}
          style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
        />
      )}

      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
};

export default Navbar;