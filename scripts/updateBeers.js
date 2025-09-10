const mongoose = require('mongoose');
const { getElSegundo } = require('../locations/ElSegundo');
const { getFathersOffice } = require('../locations/FathersOffice');
const { getMonkish } = require('../locations/Monkish');
const Beers = require('../models/Beer');
const { getUntappdRating } = require('../utils/untappd');
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

async function updateLocationBeers(scraperFunction, locationName, displayName) {
  try {
    console.log(`Scraping ${displayName}...`);
    const beers = await scraperFunction(true); // Skip ratings in scraper
    
    // Mark all existing beers as off tap
    await Beers.updateMany({ location: locationName }, { onTap: false });
    console.log(`Marked existing ${displayName} beers as off tap`);
    
    const newBeers = [];
    
    // Save new data or update existing beers to onTap: true
    for (const beer of beers) {
      if (beer.name && beer.type) {
        const normalizedName = beer.name.toLowerCase().trim();
        
        // Try to find existing beer with same name and location
        const existingBeer = await Beers.findOne({
          normalizedName,
          location: locationName
        });
        
        if (existingBeer) {
          // Update existing beer to be on tap and refresh data (keep existing rating)
          await Beers.updateOne(
            { _id: existingBeer._id },
            { 
              ...beer,
              rating: existingBeer.rating, // Preserve existing rating
              onTap: true,
              scrapedAt: new Date()
            }
          );
        } else {
          // Track new beer for rating fetch
          newBeers.push(beer);
        }
      }
    }
    
    // Fetch ratings only for new beers
    if (newBeers.length > 0) {
      console.log(`Fetching ratings for ${newBeers.length} new ${displayName} beers...`);
      
      for (let i = 0; i < newBeers.length; i++) {
        const beer = newBeers[i];
        console.log(`Getting rating for "${beer.name}" (${i + 1}/${newBeers.length})`);
        beer.rating = await getUntappdRating(beer.name);
        
        // Add new beer with rating
        await Beers.addBeer({
          ...beer,
          location: locationName,
          onTap: true
        });
      }
    }
    
    console.log(`Updated ${beers.length} ${displayName} beers (${newBeers.length} new, ${beers.length - newBeers.length} existing)`);
  } catch (error) {
    console.error(`Error updating ${displayName} beers:`, error);
  }
}



async function updateAllBeers() {
  console.log('Starting beer data update...');
  
  try {
    await connectToDatabase();
    
    await Promise.all([
      updateLocationBeers(getElSegundo, 'el-segundo', 'El Segundo'),
      updateLocationBeers(getFathersOffice, 'fathers-office', 'Fathers Office'),
      updateLocationBeers(getMonkish, 'monkish', 'Monkish')
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