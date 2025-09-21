import React, { useState, useEffect } from 'react';
import './Controls.css';

const getLocations = async () => {
  try {
    const response = await fetch(`/api/get-locations`);
    return response.json();
  } catch(err) {
    console.error('Error fetching locations:', err);
    return [];
  }
};

const Controls = ({ location, sortBy, onLocationChange, onSortChange }) => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    // get locations then transform them to include the label and the value
    getLocations().then(locations => setLocations(locations.map(location => ({
      value: location.label.replace(/\s+/g, '-'),
      label: location.label
    }))));
  }, []);

  const locationOptions = [
    { value: 'all', label: 'All Locations' },
    { value: 'on-tap', label: 'On Tap Only' },
    ...locations
  ];

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'rating', label: 'Rating' },
    { value: 'recently-added', label: 'Recently Added' },
    { value: 'type', label: 'Type' }
  ];

  // Show location sort only for "all" and "on-tap"
  const showLocationSort = location === 'all' || location === 'on-tap';
  if (showLocationSort && !sortOptions.find(opt => opt.value === 'location')) {
    sortOptions.push({ value: 'location', label: 'Location' });
  }

  return (
    <div className="controls">
      <div className="filter-group">
        <div className="filter-group-item">
          <label htmlFor="filter-location">Location:</label>
          <select 
            className="location-select"
            id="filter-location"
            value={location || 'all'}
            onChange={(e) => onLocationChange(e.target.value)}
          >
            {locationOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group-item">
          <label htmlFor="filter-sort">Sort by:</label>
          <select 
            id="filter-sort" 
            value={sortBy || 'name'} 
            onChange={(e) => onSortChange(e.target.value)}
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Controls;