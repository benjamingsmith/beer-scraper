import React, { useState, useEffect } from 'react';
import Header from './components/Header/Header';
import Controls from './components/Controls/Controls';
import BeerGrid from './components/BeerGrid/BeerGrid';
import useUrlParams from './hooks/useUrlParams';

function App() {
  const [beers, setBeers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { location, sortBy, updateLocation, updateSortBy } = useUrlParams();

  const loadBeers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/${location}?sortBy=${sortBy}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch beers');
      }
      
      const data = await response.json();
      setBeers(data);
    } catch (err) {
      console.error('Error loading beers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (newLocation) => {
    updateLocation(newLocation);
  };

  const handleSortChange = (newSortBy) => {
    updateSortBy(newSortBy);
  };

  const handleUpdate = () => {
    loadBeers();
  };

  const handleRetry = () => {
    loadBeers();
  };

  // Load beers on component mount and when location/sortBy changes
  useEffect(() => {
    if (location && sortBy) {
      loadBeers();
    }
  }, [location, sortBy]);

  return (
    <div className="App">
      <div className="header-container">
        <Header location={location}
          sortBy={sortBy}
          onLocationChange={handleLocationChange}
          onSortChange={handleSortChange}
          onUpdate={handleUpdate} />
        <Controls
          location={location}
          sortBy={sortBy}
          onLocationChange={handleLocationChange}
          onSortChange={handleSortChange}
          onUpdate={handleUpdate}
        />
      </div>
      <BeerGrid
        beers={beers}
        loading={loading}
        error={error}
        onRetry={handleRetry}
      />
    </div>
  );
}

export default App;