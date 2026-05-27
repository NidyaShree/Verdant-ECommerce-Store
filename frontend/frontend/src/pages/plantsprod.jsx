import React, { useState, useEffect } from 'react';
import PlantCard from '../components/PlantCard';
import FilterSidebar from '../components/FilterSidebar';

const PlantsProd = ({ onAddToCart }) => {
  const [plants, setPlants] = useState([]);
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // FIXED: State now includes all filter arrays so they are never "undefined"
  const [filters, setFilters] = useState({
    maxPrice: 5000,
    categories: [],
    sunlight: [],
    water: []
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/plants')
      .then(res => res.json())
      .then(data => {
        setPlants(data);
        setFilteredPlants(data);
        setLoading(false);
      });
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = plants;

    // 1. Filter by Price
    result = result.filter(p => Number(p.current_price) <= filters.maxPrice);

    // 2. Filter by Category
    if (filters.categories?.length > 0) {
      result = result.filter(p => filters.categories.includes(p.category));
    }

    // 3. Filter by Sunlight (FIXED with ?.)
    if (filters.sunlight?.length > 0) {
      result = result.filter(p => filters.sunlight.includes(p.sunlight));
    }

    // 4. Filter by Water (FIXED with ?.)
    if (filters.water?.length > 0) {
      result = result.filter(p => filters.water.includes(p.water));
    }

    setFilteredPlants(result);
  }, [filters, plants]); 

  const uniqueCategories = [...new Set(plants.map(p => p.category))];

  if (loading) return <div style={{padding: '100px', textAlign: 'center'}}>Loading Verdant Collection...</div>;

  return (
    <div style={{ display: 'flex' }}>
      {/* 1. The Sidebar */}
      {/* No sowing period prop here, so it stays hidden! */}
      <FilterSidebar 
        filters={filters} 
        setFilters={setFilters} 
        categories={uniqueCategories}
      />

      {/* 2. The Main Content */}
      <div style={{ flex: 1, padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', color: '#1a3c34' }}>Verdant Collection</h1>
          <p style={{ color: '#888' }}>Showing {filteredPlants.length} products</p>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '25px' 
        }}>
          {filteredPlants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} onAddToCart={onAddToCart} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlantsProd;