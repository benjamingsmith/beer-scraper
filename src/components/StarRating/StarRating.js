import React from 'react';

const StarRating = ({ rating }) => {
  if (!rating) return null;
  
  const fullStars = Math.floor(rating);
  const decimal = rating % 1;
  const hasPartialStar = decimal > 0;
  const emptyStars = 5 - fullStars - (hasPartialStar ? 1 : 0);
  
  const stars = [];
  
  // Full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(<span key={`full-${i}`} className="star">★</span>);
  }
  
  // Partial star
  if (hasPartialStar) {
    const fillPercentage = Math.round(decimal * 100);
    stars.push(
      <span 
        key="partial" 
        className="star partial" 
        style={{'--fill': `${fillPercentage}%`}}
      >
        ★
      </span>
    );
  }
  
  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<span key={`empty-${i}`} className="star empty">★</span>);
  }
  
  return (
    <div className="rating">
      {stars}
      <span className="rating-text">{rating}/5</span>
    </div>
  );
};

export default StarRating;