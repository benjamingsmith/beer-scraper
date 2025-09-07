const mongoose = require('mongoose');
const { getFathersOffice } = require('../locations/FathersOffice');
const { getMonkish } = require('../locations/Monkish');
const Beers = require('../models/Beer');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/beer-scraper';

async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

async function updateFathersOfficeBeers() {
  try {
    console.log('Scraping Fathers Office...');
    const beers = await getFathersOffice();
    
    // Clear existing data for this location
    await Beers.deleteMany({ location: 'fathers-office' });
    console.log('Cleared existing Fathers Office data');
    
    // Save new data
    for (const beer of beers) {
      if (beer.name && beer.type) {
        await Beers.addBeer({
          ...beer,
          location: 'fathers-office'
        });
      }
    }
    
    console.log(`Updated ${beers.length} Fathers Office beers`);
  } catch (error) {
    console.error('Error updating Fathers Office beers:', error);
  }
}

async function updateMonkishBeers() {
  try {
    console.log('Scraping Monkish...');
    const beers = await getMonkish();
    
    // Clear existing data for this location
    await Beers.deleteMany({ location: 'monkish' });
    console.log('Cleared existing Monkish data');
    
    // Save new data (getMonkish now returns a flat array with location already set)
    for (const beer of beers) {
      if (beer.name && beer.type) {
        await Beers.addBeer(beer);
      }
    }
    
    console.log(`Updated ${beers.length} Monkish beers`);
  } catch (error) {
    console.error('Error updating Monkish beers:', error);
  }
}

async function updateAllBeers() {
  console.log('Starting beer data update...');
  
  try {
    await connectToDatabase();
    
    await Promise.all([
      updateFathersOfficeBeers(),
      updateMonkishBeers()
    ]);
    
    console.log('Beer data update completed successfully');
  } catch (error) {
    console.error('Error during beer data update:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the update if this file is executed directly
if (require.main === module) {
  updateAllBeers();
}

module.exports = { updateAllBeers };