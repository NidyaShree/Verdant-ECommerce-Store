import React, { useState } from 'react';
import './AdminLogin.css';

const AdminLogin = ({ onLoginSuccess }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('https://verdant-backend-usze.onrender.com//api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();

      if (data.success) {
        // Save the secure token to the browser's local storage
        localStorage.setItem('verdant_admin_token', data.token);
        // Tell the layout to unlock the door
        onLoginSuccess();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <h1>Verdant Admin</h1>
        <p>Secure Control Panel</p>

        {error && <div className="admin-error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label>Username</label>
            <input 
              type="text" 
              name="username" 
              value={credentials.username} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="admin-form-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              value={credentials.password} 
              onChange={handleChange} 
              required 
            />
          </div>
          <button type="submit" className="admin-login-btn" disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;