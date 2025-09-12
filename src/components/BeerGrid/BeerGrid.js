import React from 'react';
import BeerCard from '../BeerCard/BeerCard';

const BeerGrid = ({ beers, loading, error, onRetry }) => {
  if (loading) {
    return (
      <div className="loading">
        <h3>🍺 Loading beers...</h3>
        <p>Please wait while we fetch the latest beer data.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h3>🍺 Beer Scraper</h3>
        <h2>Oops! Something went wrong</h2>
        <p>Unable to fetch beer data. Please try again later.</p>
        <button onClick={onRetry}>Try Again</button>
      </div>
    );
  }

  if (!beers || beers.length === 0) {
    return (
      <div className="error">
        <h3>No beers found</h3>
        <p>Try adjusting your filters or check back later!</p>
      </div>
    );
  }

  return (
    <div className="beer-grid">
      {beers.map((beer, index) => (
        <BeerCard key={index} beer={beer} />
      ))}
    </div>
  );
};

export default BeerGrid;