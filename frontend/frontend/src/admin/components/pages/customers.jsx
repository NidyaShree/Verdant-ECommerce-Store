import React, { useState, useEffect } from 'react';
import './dashboard.css'; // Reusing your master table styles

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. FETCH ALL CUSTOMERS
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('https://verdant-backend-usze.onrender.com//api/admin/customers');
        const data = await response.json();
        if (data.success) {
          setCustomers(data.customers);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  // 2. SEARCH FILTER LOGIC
  const filteredCustomers = customers.filter(customer => {
    const searchString = `${customer.first_name} ${customer.last_name} ${customer.email} ${customer.phone}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // Helper function to format dates
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  if (loading) return <div style={{ padding: '40px', color: '#0A192F' }}>Loading customer database...</div>;

  return (
    <div className="dashboard-container">
      
      <div className="dashboard-header">
        <h1>Customers</h1>
        <p>View your customer base, their contact details, and their lifetime value to your store.</p>
      </div>

      <div className="recent-orders-section">
        
        <div className="table-header-wrapper">
          <h2>All Customers ({filteredCustomers.length})</h2>
          
          <div className="filter-bar">
            <input 
              type="text" 
              placeholder="Search by name, email, or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-search-input"
              style={{ width: '300px' }}
            />
            
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="reset-filters-btn">
                Clear Search
              </button>
            )}
          </div>
        </div>

        {filteredCustomers.length === 0 ? (
          <p style={{ padding: '30px', color: '#64748b', textAlign: 'center' }}>No customers found matching your search.</p>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>Total Orders</th>
                <th>Total Spent</th>
                <th>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: 600, color: '#0A192F' }}>
                    {customer.first_name} {customer.last_name}
                  </td>
                  <td style={{ color: '#64748b' }}>{customer.email}</td>
                  <td>{customer.phone || 'N/A'}</td>
                  
                  <td>
                    <span className="status-badge status-shipped" style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>
                      {customer.total_orders} order{customer.total_orders > 1 ? 's' : ''}
                    </span>
                  </td>
                  
                  <td className="amount-cell">₹{Number(customer.total_spent).toLocaleString('en-IN')}</td>
                  
                  <td>{formatDate(customer.last_order_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;