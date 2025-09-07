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
  
  try {
    if (location === 'all') {
      const beerList = await Beer.getRecentBeers();
      const formattedList = beerList.map(beer => ({
        type: beer.type,
        name: beer.name,
        description: beer.description,
        rating: beer.rating
      }));
      res.json(formattedList);
    }
    else {
      let beerList;
      beerList = await Beer.getByLocation(location);
    
      // Transform database results to match API format
      const formattedList = beerList.map(beer => ({
        type: beer.type,
        name: beer.name,
        description: beer.description,
        rating: beer.rating
      }));
    
      res.json(formattedList);
    }
  } catch(err) {
    console.error('Database error:', err);
    res.sendStatus(500); // Internal Server Error
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is listening on port ${PORT}`);
});