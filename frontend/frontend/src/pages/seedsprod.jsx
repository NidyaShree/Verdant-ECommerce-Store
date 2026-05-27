import React, { useState, useEffect } from 'react';
import SeedCard from '../components/SeedCard';
import FilterSidebar from '../components/FilterSidebar';

const SeedsProd = ({ onAddToCart }) => {
  const [seeds, setSeeds] = useState([]);
  const [filteredSeeds, setFilteredSeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  
 const [filters, setFilters] = useState({
  maxPrice: 500,
  categories: [],
  sunlight: [],
  water: [],
  sowing_period: [] // Add this line
});

  useEffect(() => {
    fetch('http://localhost:5000/api/seeds')
      .then(res => res.json())
      .then(data => {
        setSeeds(data);
        setFilteredSeeds(data);
        setLoading(false);
      })
      .catch(err => console.error("Error fetching seeds:", err));
  }, []);

  useEffect(() => {
    let result = seeds;

    // Price Filter
    result = result.filter(s => Number(s.current_price) <= filters.maxPrice);

    // Category Filter
    if (filters.categories?.length > 0) {
      result = result.filter(s => filters.categories.includes(s.category));
    }

    // Sunlight Filter
    if (filters.sunlight?.length > 0) {
      result = result.filter(s => filters.sunlight.includes(s.sunlight));
    }

    // Water Filter
    if (filters.water?.length > 0) {
      result = result.filter(s => filters.water.includes(s.water));
    }

    if (filters.sowing_period?.length > 0) {
    result = result.filter(s => filters.sowing_period.includes(s.sowing_period));
  }

    setFilteredSeeds(result);
  }, [filters, seeds]);

  const uniqueCategories = [...new Set(seeds.map(s => s.category))];

  if (loading) return <div style={{padding: '100px', textAlign: 'center'}}>Gathering the finest seeds...</div>;

  return (
    <div style={{ display: 'flex' }}>
      {/* Pass showSowingPeriod={true} to turn it ON here */}
      <FilterSidebar 
        filters={filters} 
        setFilters={setFilters} 
        categories={uniqueCategories}
        showSowingPeriod={true} 
      />

      <div style={{ flex: 1, padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', color: '#1a3c34' }}>Seed Collection</h1>
          <p style={{ color: '#888' }}>Showing {filteredSeeds.length} varieties</p>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
          gap: '25px' 
        }}>
          {filteredSeeds.map((seed) => (
            <SeedCard key={seed.id} seed={seed} onAddToCart={onAddToCart} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeedsProd;