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

app.get('/api/:website', async(req, res) => {
  const { website } = req.params;
  
  try {
    let beerList;
    
    let locationFilter;
    switch (website) {
      case 'fo':
        locationFilter = 'fathers-office';
        break;
      case 'monkish':
        locationFilter = 'monkish';
        break;
      default:
        return res.sendStatus(404); // Not Found
    }
    
    beerList = await Beer.getByLocation(locationFilter);
    
    // Transform database results to match API format
    const formattedList = beerList.map(beer => ({
      type: beer.type,
      name: beer.name,
      description: beer.description,
      rating: beer.rating
    }));
    
    res.json(formattedList);
  } catch(err) {
    console.error('Database error:', err);
    res.sendStatus(500); // Internal Server Error
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is listening on port ${PORT}`);
});