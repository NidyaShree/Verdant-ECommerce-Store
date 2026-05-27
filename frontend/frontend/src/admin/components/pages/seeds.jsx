import React, { useState, useEffect } from 'react';
import '../AdminInventory.css'; 

const AdminSeeds = () => {
  const [seeds, setSeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeedId, setEditingSeedId] = useState(null); 
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    current_price: '',
    stock: '',
    image_url: ''
  });

  // 1. FETCH ALL SEEDS
  const fetchSeeds = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/seeds');
      const data = await res.json();
      if (data.success) setSeeds(data.seeds);
    } catch (err) {
      console.error("Error fetching seeds:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeeds();
  }, []);

  // 2. HANDLE FORM INPUTS
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. OPEN MODAL 
  const openModal = (seed = null) => {
    if (seed) {
      setEditingSeedId(seed.id);
      setFormData({
        name: seed.name,
        current_price: seed.current_price,
        stock: seed.stock,
        image_url: seed.image_url
      });
    } else {
      setEditingSeedId(null);
      setFormData({ name: '', current_price: '', stock: '', image_url: '' });
    }
    setIsModalOpen(true);
  };

  // 4. SUBMIT FORM
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const url = editingSeedId 
      ? `http://localhost:5000/api/admin/seeds/${editingSeedId}`
      : 'http://localhost:5000/api/admin/seeds';
      
    const method = editingSeedId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        setIsModalOpen(false);
        fetchSeeds(); // Refresh table
      } else {
        alert("Failed to save seed.");
      }
    } catch (err) {
      console.error("Error saving seed:", err);
    }
  };

  // 5. DELETE SEED
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) {
      try {
        const res = await fetch(`http://localhost:5000/api/admin/seeds/${id}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        
        if (data.success) {
          setSeeds(seeds.filter(seed => seed.id !== id));
        }
      } catch (err) {
        console.error("Error deleting seed:", err);
      }
    }
  };

  if (loading) return <div style={{ padding: '40px', color: '#0A192F' }}>Loading seeds inventory...</div>;

  return (
    <div className="inventory-container">
      
      <div className="inventory-header">
        <div>
          <h1>Seeds Inventory</h1>
       
        </div>
        <button className="add-btn" onClick={() => openModal()}>
          + Add New Seed
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
            {seeds.map((seed) => (
              <tr key={seed.id}>
                <td className="order-id">SED-{seed.id}</td>
                <td className="product-image-cell">
                  <img src={seed.image_url.startsWith('http') ? seed.image_url : `http://localhost:5000${seed.image_url}`} alt={seed.name} />
                </td>
                <td style={{ fontWeight: 600, color: '#0A192F' }}>{seed.name}</td>
                <td className="amount-cell">₹{seed.current_price}</td>
                <td>
                  <span className={`status-badge ${seed.stock > 10 ? 'status-delivered' : 'status-processing'}`}>
                    {seed.stock} in stock
                  </span>
                </td>
                <td className="action-btns">
                  <button className="icon-btn edit-btn" title="Edit" onClick={() => openModal(seed)}>
                    ✏️
                  </button>
                  <button className="icon-btn delete-btn" title="Delete" onClick={() => handleDelete(seed.id, seed.name)}>
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
            <h2>{editingSeedId ? 'Edit Seed Details' : 'Add New Seed'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Seed Name</label>
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
                <label>Image URL (e.g., /images/sunflower-seeds.jpg)</label>
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
                  {editingSeedId ? 'Update Seed' : 'Save New Seed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminSeeds;