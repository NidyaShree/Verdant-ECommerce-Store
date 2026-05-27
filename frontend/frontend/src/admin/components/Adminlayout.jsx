import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import AdminSidebar from './AdminSidebar'; // Import your new component!
import './Adminlayout.css';

const Adminlayout = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('verdant_admin_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    navigate('/admin/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('verdant_admin_token');
    setIsAuthenticated(false);
  };

  if (isChecking) return <div style={{ background: '#0d1b2a', height: '100vh' }}></div>;

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  // Look how clean this is now! 
  return (
    <div className="admin-container">
      {/* Our modular sidebar component */}
      <AdminSidebar onLogout={handleLogout} />

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default Adminlayout;