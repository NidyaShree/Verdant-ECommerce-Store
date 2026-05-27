import React, { useState, useEffect } from 'react';
import './dashboard.css'; // We reuse the dashboard CSS for the perfect table styles!

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FILTER STATES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState(''); 
  const [dateSort, setDateSort] = useState('newest');

  // 1. FETCH ALL ORDERS
  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/orders');
        const data = await response.json();
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error("Error fetching all orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllOrders();
  }, []);

  // --- UPDATE STATUS FUNCTION ---
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/update-order-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, newStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        alert("Failed to update status.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // --- FILTERING ENGINE ---
  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setDateFilter('');
    setDateSort('newest');
  };

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'All' || dateFilter !== '' || dateSort !== 'newest';

  const getFilteredOrders = () => {
    return orders.filter(order => {
      const safeProducts = order.products || '';
      
      const searchString = `${order.first_name} ${order.last_name} ${order.id} ${safeProducts}`.toLowerCase();
      const matchesSearch = searchString.includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;

      let matchesDate = true;
      if (dateFilter) {
        const orderDate = new Date(order.created_at);
        const orderDateString = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}-${String(orderDate.getDate()).padStart(2, '0')}`;
        matchesDate = orderDateString === dateFilter;
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    }).sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateSort === 'newest' ? dateB - dateA : dateA - dateB;
    });
  };

  const filteredOrders = getFilteredOrders();

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

  if (loading) return <div style={{ padding: '40px', color: '#0A192F' }}>Loading complete order history...</div>;

  return (
    <div className="dashboard-container">
      
      <div className="dashboard-header">
        <h1>Order Management</h1>
    
      </div>

      <div className="recent-orders-section">
        
        <div className="table-header-wrapper">
          <h2>All Orders ({filteredOrders.length})</h2>
          
          <div className="filter-bar">
            <input 
              type="text" 
              placeholder="Search customer, product, or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-search-input"
            />
            
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-dropdown"
            >
              <option value="All">All Statuses</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </select>

            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="filter-dropdown" 
            />

            <select 
              value={dateSort} 
              onChange={(e) => setDateSort(e.target.value)}
              className="filter-dropdown"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="reset-filters-btn">
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <p style={{ padding: '30px', color: '#64748b', textAlign: 'center' }}>No orders found matching your search.</p>
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
              {filteredOrders.map((order, index) => (
                <tr key={index}>
                  <td className="order-id">{order.id}</td>
                  <td>{order.first_name} {order.last_name}</td>
                  
                  <td className="items-cell" title={order.products || 'N/A'}>
                    {order.products 
                      ? (order.products.length > 35 ? order.products.substring(0, 35) + '...' : order.products) 
                      : 'N/A'
                    }
                  </td>
                  
                  <td>{formatDate(order.created_at)}</td>
                  <td className="amount-cell">₹{Number(order.total_amount).toLocaleString('en-IN')}</td>
                  
                  {/* Interactive Status Dropdown */}
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

export default AdminOrders;