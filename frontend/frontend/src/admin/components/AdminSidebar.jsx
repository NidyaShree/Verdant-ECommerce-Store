import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// It will automatically inherit the styles from Adminlayout.css!

const AdminSidebar = ({ onLogout }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname.includes(path) ? 'active' : '';
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">🌿 Verdant Admin</div>
      
      <nav className="admin-nav">
        <Link to="/admin/dashboard" className={`admin-link ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}>
          Dashboard
        </Link>
        <Link to="/admin/plants" className={`admin-link ${isActive('/admin/plants')}`}>
          Plants Inventory
        </Link>
        <Link to="/admin/seeds" className={`admin-link ${isActive('/admin/seeds')}`}>
          Seeds Inventory
        </Link>
        <Link to="/admin/tools" className={`admin-link ${isActive('/admin/tools')}`}>
          Tools Inventory
        </Link>
        <Link to="/admin/orders" className={`admin-link ${isActive('/admin/orders')}`}>
          Orders
        </Link>
        <Link to="/admin/customers" className={`admin-link ${isActive('/admin/customers')}`}>
          Customers
        </Link>
      </nav>

      <div className="admin-bottom">
        <button 
          onClick={onLogout} 
          className="back-to-store" 
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', width: '100%', marginBottom: '15px', color: '#d9534f' }}
        >
          🚪 Logout Admin
        </button>
        <Link to="/" className="back-to-store">← Back to Store</Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;