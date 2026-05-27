import React, { useState, useEffect } from 'react';
import '../AdminInventory.css'; // FIXED: Added '../' to go up one folder level!

const AdminPlants = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlantId, setEditingPlantId] = useState(null); // null means we are Adding, not Editing
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    current_price: '',
    stock: '',
    image_url: ''
  });

  // 1. FETCH ALL PLANTS
  const fetchPlants = async () => {
    try {
      const res = await fetch('https://verdant-backend-usze.onrender.com//api/admin/plants');
      const data = await res.json();
      if (data.success) setPlants(data.plants);
    } catch (err) {
      console.error("Error fetching plants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  // 2. HANDLE FORM INPUTS
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. OPEN MODAL (For Add or Edit)
  const openModal = (plant = null) => {
    if (plant) {
      // Edit Mode
      setEditingPlantId(plant.id);
      setFormData({
        name: plant.name,
        current_price: plant.current_price,
        stock: plant.stock,
        image_url: plant.image_url
      });
    } else {
      // Add Mode
      setEditingPlantId(null);
      setFormData({ name: '', current_price: '', stock: '', image_url: '' });
    }
    setIsModalOpen(true);
  };

  // 4. SUBMIT FORM (Save or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Determine if we are hitting the POST (add) or PUT (edit) route
    const url = editingPlantId 
      ? `https://verdant-backend-usze.onrender.com//api/admin/plants/${editingPlantId}`
      : 'https://verdant-backend-usze.onrender.com//api/admin/plants';
      
    const method = editingPlantId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        setIsModalOpen(false);
        fetchPlants(); // Refresh the table
      } else {
        alert("Failed to save plant.");
      }
    } catch (err) {
      console.error("Error saving plant:", err);
    }
  };

  // 5. DELETE PLANT
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) {
      try {
        const res = await fetch(`https://verdant-backend-usze.onrender.com//api/admin/plants/${id}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        
        if (data.success) {
          // Remove it from the UI instantly
          setPlants(plants.filter(plant => plant.id !== id));
        }
      } catch (err) {
        console.error("Error deleting plant:", err);
      }
    }
  };

  if (loading) return <div style={{ padding: '40px', color: '#0A192F' }}>Loading inventory...</div>;

  return (
    <div className="inventory-container">
      
      <div className="inventory-header">
        <div>
          <h1>Plants Inventory</h1>
       
        </div>
        <button className="add-btn" onClick={() => openModal()}>
          + Add New Plant
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
            {plants.map((plant) => (
              <tr key={plant.id}>
                <td className="order-id">PLT-{plant.id}</td>
                <td className="product-image-cell">
                  <img src={plant.image_url.startsWith('http') ? plant.image_url : `https://verdant-backend-usze.onrender.com/${plant.image_url}`} alt={plant.name} />
                </td>
                <td style={{ fontWeight: 600, color: '#0A192F' }}>{plant.name}</td>
                <td className="amount-cell">₹{plant.current_price}</td>
                <td>
                  <span className={`status-badge ${plant.stock > 10 ? 'status-delivered' : 'status-processing'}`}>
                    {plant.stock} in stock
                  </span>
                </td>
                <td className="action-btns">
                  <button className="icon-btn edit-btn" title="Edit" onClick={() => openModal(plant)}>
                    ✏️
                  </button>
                  <button className="icon-btn delete-btn" title="Delete" onClick={() => handleDelete(plant.id, plant.name)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CRUD MODAL POPUP */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="crud-modal">
            <h2>{editingPlantId ? 'Edit Plant Details' : 'Add New Plant'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Plant Name</label>
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
                <label>Image URL (e.g., /images/monstera.jpg)</label>
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
                  {editingPlantId ? 'Update Plant' : 'Save New Plant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPlants;