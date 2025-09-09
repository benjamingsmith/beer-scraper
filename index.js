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
    switch (location) {
      case 'all':
        beerList = await Beer.getAllBeers();
        break;
      case 'on-tap':
        beerList = await Beer.getAllBeers(true);
        break;
      default:
        beerList = await Beer.getByLocation(location);
    }
    
    const formattedList = beerList.map(beer => ({
      name: beer.name,
      description: beer.description,
      type: beer.type,
      location: location === 'all' || location === 'on-tap' ? beer.location : undefined,
      onTap: location === 'all' ? beer.onTap : undefined,
      rating: beer.rating
    }));

    switch(sortBy) {
      case 'rating':
        formattedList.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        formattedList.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'type':
        formattedList.sort((a, b) => a.type.localeCompare(b.type));
        break;
      case 'location':
        formattedList.sort((a, b) => a.location.localeCompare(b.location));
        break;
      default:
        formattedList.sort((a, b) => a.name.localeCompare(b.name));
        break;
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