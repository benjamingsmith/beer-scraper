import React from 'react';
import StarRating from '../StarRating/StarRating';

const BeerCard = ({ beer }) => {
  const getLocationDisplayName = (location) => {
    switch(location) {
      case 'el-segundo': return 'El Segundo';
      case 'fathers-office': return "Father's Office";
      case 'monkish': return 'Monkish';
      default: return location;
    }
  };

  return (
    <div className="beer-card">
      <div className="beer-name">{beer.name || 'Unnamed Beer'}</div>
      <div className="beer-type">{beer.type || 'Unknown Type'}</div>
      {beer.description && <div className="beer-description">{beer.description}</div>}
      <div className="beer-meta">
        <div>
          {beer.location && (
            <span className="location-badge">
              📍 {getLocationDisplayName(beer.location)}
            </span>
          )}
          {beer.onTap !== undefined && (
            <span className={beer.onTap ? 'on-tap' : 'off-tap'}>
              {beer.onTap ? '🍺 On Tap' : '❌ Off Tap'}
            </span>
          )}
          <StarRating rating={beer.rating} />
        </div>
      </div>
    </div>
  );
};

export default BeerCard;