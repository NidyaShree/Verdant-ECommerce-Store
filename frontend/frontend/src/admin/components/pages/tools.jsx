import React, { useState, useEffect } from 'react';
import '../AdminInventory.css'; 

const AdminTools = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingToolId, setEditingToolId] = useState(null); 
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    current_price: '',
    stock: '',
    image_url: ''
  });

  // 1. FETCH ALL TOOLS
  const fetchTools = async () => {
    try {
      const res = await fetch('https://verdant-backend-usze.onrender.com//api/admin/tools');
      const data = await res.json();
      if (data.success) setTools(data.tools);
    } catch (err) {
      console.error("Error fetching tools:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  // 2. HANDLE FORM INPUTS
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. OPEN MODAL 
  const openModal = (tool = null) => {
    if (tool) {
      setEditingToolId(tool.id);
      setFormData({
        name: tool.name,
        current_price: tool.current_price,
        stock: tool.stock,
        image_url: tool.image_url
      });
    } else {
      setEditingToolId(null);
      setFormData({ name: '', current_price: '', stock: '', image_url: '' });
    }
    setIsModalOpen(true);
  };

  // 4. SUBMIT FORM
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const url = editingToolId 
      ? `https://verdant-backend-usze.onrender.com//api/admin/tools/${editingToolId}`
      : 'https://verdant-backend-usze.onrender.com//api/admin/tools';
      
    const method = editingToolId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        setIsModalOpen(false);
        fetchTools(); // Refresh table instantly
      } else {
        alert("Failed to save tool.");
      }
    } catch (err) {
      console.error("Error saving tool:", err);
    }
  };

  // 5. DELETE TOOL
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) {
      try {
        const res = await fetch(`https://verdant-backend-usze.onrender.com//api/admin/tools/${id}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        
        if (data.success) {
          setTools(tools.filter(tool => tool.id !== id));
        }
      } catch (err) {
        console.error("Error deleting tool:", err);
      }
    }
  };

  if (loading) return <div style={{ padding: '40px', color: '#0A192F' }}>Loading tools inventory...</div>;

  return (
    <div className="inventory-container">
      
      <div className="inventory-header">
        <div>
          <h1>Tools Inventory</h1>
          
        </div>
        <button className="add-btn" onClick={() => openModal()}>
          + Add New Tool
        </button>
      </div>

      <div className="recent-orders-section">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock Level</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tools.map((tool) => (
              <tr key={tool.id}>
                {/* Notice the TOL prefix for Tools! */}
                <td className="order-id">TOL-{tool.id}</td>
                <td className="product-image-cell">
                  <img src={tool.image_url.startsWith('http') ? tool.image_url : `https://verdant-backend-usze.onrender.com/${tool.image_url}`} alt={tool.name} />
                </td>
                <td style={{ fontWeight: 600, color: '#0A192F' }}>{tool.name}</td>
                <td className="amount-cell">₹{tool.current_price}</td>
                <td>
                  <span className={`status-badge ${tool.stock > 10 ? 'status-delivered' : 'status-processing'}`}>
                    {tool.stock} in stock
                  </span>
                </td>
                <td className="action-btns">
                  <button className="icon-btn edit-btn" title="Edit" onClick={() => openModal(tool)}>
                    ✏️
                  </button>
                  <button className="icon-btn delete-btn" title="Delete" onClick={() => handleDelete(tool.id, tool.name)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="crud-modal">
            <h2>{editingToolId ? 'Edit Tool Details' : 'Add New Tool'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tool Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Price (₹)</label>
                  <input 
                    type="number" 
                    name="current_price" 
                    value={formData.current_price} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Stock Quantity</label>
                  <input 
                    type="number" 
                    name="stock" 
                    value={formData.stock} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Image URL (e.g., /images/trowel.jpg)</label>
                <input 
                  type="text" 
                  name="image_url" 
                  value={formData.image_url} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {editingToolId ? 'Update Tool' : 'Save New Tool'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminTools;