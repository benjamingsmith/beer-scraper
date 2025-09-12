import { useState, useEffect } from 'react';

const useUrlParams = () => {
  const [location, setLocation] = useState(null);
  const [sortBy, setSortBy] = useState(null);

  useEffect(() => {
    // Initialize from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlLocation = urlParams.get('location') || 'all';
    const urlSortBy = urlParams.get('sortBy') || 'name';

    setLocation(urlLocation);
    setSortBy(urlSortBy);
  }, []);

  const updateUrl = (newLocation, newSortBy) => {
    const url = new URL(window.location);
    url.searchParams.set('location', newLocation);
    url.searchParams.set('sortBy', newSortBy);
    window.history.replaceState({}, '', url);
  };

  const updateLocation = (newLocation) => {
    // If switching away from "all" or "on-tap" and currently sorting by location,
    // reset to name sorting
    let newSortBy = sortBy;
    if (newLocation !== 'all' && newLocation !== 'on-tap' && sortBy === 'location') {
      newSortBy = 'name';
      setSortBy(newSortBy);
    }
    
    setLocation(newLocation);
    updateUrl(newLocation, newSortBy);
  };

  const updateSortBy = (newSortBy) => {
    setSortBy(newSortBy);
    updateUrl(location, newSortBy);
  };

  return {
    location,
    sortBy,
    updateLocation,
    updateSortBy
  };
};

export default useUrlParams;