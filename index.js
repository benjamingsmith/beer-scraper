const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Beer = require('./models/Beer');

if (process.env.NODE_ENV !== 'production') {
  // Only needed locally; Heroku uses config vars
  require('dotenv').config();
}

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from React build or public folder
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
} else {
  app.use(express.static('public'));
}

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/beer-scraper';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/api/get-locations', async(req, res) => {
  try {
    const locations = await Beer.distinct('location');
    const finalLocationsList = locations.map(location => ({ value: location, label: location.replace(/-/g, ' ') }));

    res.json(finalLocationsList);
  } catch(err) {
    console.error('Database error:', err);
    res.sendStatus(500);
  }
});

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
      case 'recently-added':
        beerList = await Beer.getRecentlyAddedBeers();
        break;
      default:
        beerList = await Beer.getByLocation(location);
    }

    // If recently-added sorting, sort the beerList before formatting
    if (sortBy === 'recently-added') {
      beerList.sort((a, b) => new Date(b.scrapedAt) - new Date(a.scrapedAt));
    }

    const formattedList = beerList.map(beer => ({
      name: beer.name,
      description: beer.description,
      type: beer.type || undefined,
      location: location === 'all' || location === 'on-tap' ? beer.location : undefined,
      onTap: location === 'all' ? beer.onTap : undefined,
      rating: beer.rating
    }));

    switch(sortBy) {
      case 'rating':
        formattedList.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'name':
        formattedList.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'type':
        formattedList.sort((a, b) => (a.type || '').localeCompare(b.type || ''));
        break;
      case 'location':
        formattedList.sort((a, b) => (a.location || '').localeCompare(b.location || ''));
        break;
      case 'recently-added':
        // Already sorted before formatting, no need to sort again
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

// Catch all handler: send back React's index.html file for non-API routes
app.get('*', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, 'build/index.html'));
  } else {
    res.sendFile(path.join(__dirname, 'public/index.html'));
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is listening on port ${PORT}`);
});