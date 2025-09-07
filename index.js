const express = require('express');
const mongoose = require('mongoose');
const Beer = require('./models/Beer');

if (process.env.NODE_ENV !== 'production') {
  // Only needed locally; Heroku uses config vars
  require('dotenv').config();
}

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/beer-scraper';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));



app.get('/api/:location', async(req, res) => {
  const { location } = req.params;
  const { sortBy } = req.query;
  
  try {
    const beerList = location === 'all' 
      ? await Beer.getRecentBeers()
      : await Beer.getByLocation(location);
    
    const formattedList = beerList.map(beer => ({
      type: beer.type,
      name: beer.name,
      description: beer.description,
      rating: beer.rating
    }));
    
    if (sortBy === 'rating') {
      formattedList.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'name') {
      formattedList.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'type') {
      formattedList.sort((a, b) => a.type.localeCompare(b.type));
    }
    
    res.json(formattedList);
  } catch(err) {
    console.error('Database error:', err);
    res.sendStatus(500);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is listening on port ${PORT}`);
});