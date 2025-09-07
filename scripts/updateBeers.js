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
    
    // Mark all existing beers as off tap
    await Beers.updateMany({ location: 'fathers-office' }, { onTap: false });
    console.log('Marked existing Fathers Office beers as off tap');
    
    // Save new data or update existing beers to onTap: true
    for (const beer of beers) {
      if (beer.name && beer.type) {
        const normalizedName = beer.name.toLowerCase().trim();
        
        // Try to find existing beer with same name and location
        const existingBeer = await Beers.findOne({
          normalizedName,
          location: 'fathers-office'
        });
        
        if (existingBeer) {
          // Update existing beer to be on tap and refresh data
          await Beers.updateOne(
            { _id: existingBeer._id },
            { 
              ...beer,
              onTap: true,
              scrapedAt: new Date()
            }
          );
        } else {
          // Add new beer
          await Beers.addBeer({
            ...beer,
            location: 'fathers-office',
            onTap: true
          });
        }
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
    
    // Mark all existing beers as off tap
    await Beers.updateMany({ location: 'monkish' }, { onTap: false });
    console.log('Marked existing Monkish beers as off tap');
    
    // Save new data or update existing beers to onTap: true (getMonkish returns a flat array with location already set)
    for (const beer of beers) {
      if (beer.name && beer.type) {
        const normalizedName = beer.name.toLowerCase().trim();
        
        // Try to find existing beer with same name and location
        const existingBeer = await Beers.findOne({
          normalizedName,
          location: 'monkish'
        });
        
        if (existingBeer) {
          // Update existing beer to be on tap and refresh data
          await Beers.updateOne(
            { _id: existingBeer._id },
            { 
              ...beer,
              onTap: true,
              scrapedAt: new Date()
            }
          );
        } else {
          // Add new beer
          await Beers.addBeer({
            ...beer,
            onTap: true
          });
        }
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