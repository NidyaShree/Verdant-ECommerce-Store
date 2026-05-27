import React, { useState, useEffect } from 'react';
import './dashboard.css'; 

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, recentOrders: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('https://verdant-backend-usze.onrender.com//api/admin/dashboard-stats');
        const data = await response.json();
        if (data.success) {
          setStats({
            totalOrders: data.totalOrders,
            totalRevenue: data.totalRevenue,
            recentOrders: data.recentOrders
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  // --- UPDATE STATUS FUNCTION (Kept so you can still update from the dashboard!) ---
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch('https://verdant-backend-usze.onrender.com//api/admin/update-order-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, newStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStats(prevStats => ({
          ...prevStats,
          recentOrders: prevStats.recentOrders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        }));
      } else {
        alert("Failed to update status.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Delivered': return 'status-delivered';
      case 'Processing': return 'status-processing';
      case 'Shipped': return 'status-shipped';
      default: return 'status-processing';
    }
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  if (loading) return <div style={{ padding: '40px', color: '#0A192F' }}>Loading live store data...</div>;

  return (
    <div className="dashboard-container">
      
      <div className="dashboard-header">
        <h1>Store Overview</h1>
       
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-title">Total Orders</div>
          <h2 className="metric-value">{stats.totalOrders.toLocaleString()}</h2>
        </div>
        <div className="metric-card accent">
          <div className="metric-title">Total Revenue</div>
          <h2 className="metric-value">₹{stats.totalRevenue.toLocaleString('en-IN')}</h2>
        </div>
      </div>

      <div className="recent-orders-section">
        
        <div className="table-header-wrapper">
          <h2>Recent Orders</h2>
          {/* The entire filter bar has been completely removed from here! */}
        </div>

        {stats.recentOrders.length === 0 ? (
          <p style={{ padding: '24px', color: '#64748b' }}>No orders have been placed yet.</p>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items Bought</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {/* We now map directly over stats.recentOrders instead of filteredOrders */}
              {stats.recentOrders.map((order, index) => (
                <tr key={index}>
                  <td className="order-id">{order.id}</td>
                  <td>{order.first_name} {order.last_name}</td>
                  
                  <td className="items-cell" title={order.products || 'N/A'}>
                    {order.products 
                      ? (order.products.length > 30 ? order.products.substring(0, 30) + '...' : order.products) 
                      : 'N/A'
                    }
                  </td>
                  
                  <td>{formatDate(order.created_at)}</td>
                  <td className="amount-cell">₹{Number(order.total_amount).toLocaleString('en-IN')}</td>
                  
                  <td>
                    <select 
                      className={`status-badge ${getStatusClass(order.status)}`}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      style={{ border: 'none', cursor: 'pointer', outline: 'none', appearance: 'none', textAlign: 'center', background: 'inherit' }}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;