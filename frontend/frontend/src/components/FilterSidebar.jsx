import React from 'react';
import './FilterSidebar.css';

const FilterSidebar = ({ filters, setFilters, categories, showSowingPeriod }) => {
  
  const handleCategoryChange = (cat) => {
    const newCats = filters.categories?.includes(cat)
      ? filters.categories.filter(c => c !== cat)
      : [...(filters.categories || []), cat];
    setFilters({ ...filters, categories: newCats });
  };

  const handleSunlightChange = (light) => {
    const newLight = filters.sunlight?.includes(light)
      ? filters.sunlight.filter(l => l !== light)
      : [...(filters.sunlight || []), light];
    setFilters({ ...filters, sunlight: newLight });
  };

  const handleWaterChange = (waterOption) => {
    const newWater = filters.water?.includes(waterOption)
      ? filters.water.filter(w => w !== waterOption)
      : [...(filters.water || []), waterOption];
    setFilters({ ...filters, water: newWater });
  };

  const handleReset = () => {
    setFilters({
      maxPrice: showSowingPeriod ? 500 : 5000,
      categories: [],
      sunlight: [],
      water: [],
      sowing_period: []
    });
  };

  return (
    <aside className="filter-sidebar">
      {/* Price Filter */}
      <div className="filter-section">
        <span className="filter-title">Price Range</span>
        <div className="price-range-container">
          <input 
            type="range" 
            className="price-slider"
            min="0" 
            max={showSowingPeriod ? "500" : "5000"} 
            step="10"
            value={filters.maxPrice}
            onChange={(e) => setFilters({...filters, maxPrice: Number(e.target.value)})}
          />
          <div className="price-display">
            <span>₹0</span>
            <span>Up to ₹{filters.maxPrice}</span>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="filter-section">
        <span className="filter-title">Category</span>
        {categories.map(cat => (
          <label key={cat} className="filter-option">
            <input 
              type="checkbox" 
              checked={filters.categories?.includes(cat) || false}
              onChange={() => handleCategoryChange(cat)}
            />
            {cat}
          </label>
        ))}
      </div>

      {/* Sowing Period - ONLY FOR SEEDS */}
      {showSowingPeriod && (
        <div className="filter-section">
          <span className="filter-title">Sowing Period</span>
          {['Summer', 'Monsoon', 'Winter'].map(period => (
            <label key={period} className="filter-option">
              <input 
                type="checkbox" 
                checked={filters.sowing_period?.includes(period) || false}
                onChange={() => {
                  const newPeriod = filters.sowing_period?.includes(period)
                    ? filters.sowing_period.filter(p => p !== period)
                    : [...(filters.sowing_period || []), period];
                  setFilters({...filters, sowing_period: newPeriod});
                }}
              />
              {period}
            </label>
          ))}
        </div>
      )}

      {/* Sunlight Filter */}
      <div className="filter-section">
        <span className="filter-title">Sunlight</span>
        {['Low Light', 'Partial Shade', 'Bright Direct'].map(light => (
          <label key={light} className="filter-option">
            <input 
              type="checkbox" 
              checked={filters.sunlight?.includes(light) || false}
              onChange={() => handleSunlightChange(light)}
            />
            {light}
          </label>
        ))}
      </div>

      {/* Watering Filter */}
      <div className="filter-section">
        <span className="filter-title">Watering</span>
        {['Weekly', 'Bi-weekly', 'Daily'].map(waterOption => (
          <label key={waterOption} className="filter-option">
            <input 
              type="checkbox" 
              checked={filters.water?.includes(waterOption) || false}
              onChange={() => handleWaterChange(waterOption)}
            />
            {waterOption}
          </label>
        ))}
      </div>

      <button type="button" className="reset-filters" onClick={handleReset}>
        Clear All Filters
      </button>
    </aside>
  );
};

export default FilterSidebar;