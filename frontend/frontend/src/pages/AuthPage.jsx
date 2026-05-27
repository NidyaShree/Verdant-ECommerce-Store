import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  // Check if user is already logged in
  const [user, setUser] = useState({
    name: localStorage.getItem('verdant_username'),
    email: localStorage.getItem('verdant_email')
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/login' : '/api/register';
    
    const res = await fetch(`http://localhost:5000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (res.ok) {
      if (isLogin) {
        localStorage.setItem('verdant_token', data.token);
        localStorage.setItem('verdant_username', data.username);
        localStorage.setItem('verdant_email', data.email); // Store email
        setUser({ name: data.username, email: data.email });
        navigate('/'); 
      } else {
        alert("Account created! Please login.");
        setIsLogin(true);
      }
    } else {
      alert(data.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/');
  };

  // IF LOGGED IN: Show Profile View
  if (user.name) {
    return (
      <div className="auth-page">
        <div className="profile-card">
          <h2>My Profile</h2>
          <div className="profile-info">
            <p><strong>Username:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> +91 98765 43210</p>
          </div>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
    );
  }

  // IF NOT LOGGED IN: Show Login/Signup Form
  return (
    <div className="auth-page">
      <h2>{isLogin ? 'Welcome Back to Verdant' : 'Join the Verdant Community'}</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && <input type="text" placeholder="Username" onChange={e => setFormData({...formData, username: e.target.value})} required />}
        <input type="email" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} required />
        <input type="password" placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} required />
        <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
      </form>
      <p onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'New here? Create account' : 'Already have an account? Login'}
      </p>
    </div>
  );
};
export default AuthPage;