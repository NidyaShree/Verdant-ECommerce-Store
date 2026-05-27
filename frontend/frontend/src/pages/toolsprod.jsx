import React, { useState, useEffect } from 'react';
import ToolCard from '../components/ToolCard';
import FilterSidebar from '../components/FilterSidebar';

const ToolsProd = ({ onAddToCart }) => {
  const [tools, setTools] = useState([]);
  const [filteredTools, setFilteredTools] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    maxPrice: 2000, 
    categories: [],
    sunlight: [], // Kept for FilterSidebar compatibility
    water: []     // Kept for FilterSidebar compatibility
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/tools')
      .then(res => res.json())
      .then(data => {
        setTools(data);
        setFilteredTools(data);
        setLoading(false);
      })
      .catch(err => console.error("Error fetching tools:", err));
  }, []);

  useEffect(() => {
    let result = tools;

    // Price Filter
    result = result.filter(t => Number(t.current_price) <= filters.maxPrice);

    // Category Filter
    if (filters.categories?.length > 0) {
      result = result.filter(t => filters.categories.includes(t.category));
    }

    setFilteredTools(result);
  }, [filters, tools]);

  const uniqueCategories = [...new Set(tools.map(t => t.category))];

  if (loading) return <div style={{padding: '100px', textAlign: 'center'}}>Loading Verdant Essentials...</div>;

  return (
    <div style={{ display: 'flex' }}>
      <FilterSidebar 
        filters={filters} 
        setFilters={setFilters} 
        categories={uniqueCategories}
        showSowingPeriod={false} // Hidden for tools
      />

      <div style={{ flex: 1, padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', color: '#1a3c34' }}>Plant Care & Tools</h1>
          <p style={{ color: '#888' }}>Showing {filteredTools.length} items</p>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
          gap: '25px' 
        }}>
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onAddToCart={onAddToCart} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ToolsProd;