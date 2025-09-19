const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
const googleApiKey = process.env.GOOGLE_API_KEY;

// Rate limiting configuration
const RATE_LIMIT_DELAY = 1000; // 1 second delay between requests
let lastRequestTime = 0;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getUntappdRating = async (beerName) => {
  // Apply rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    const waitTime = RATE_LIMIT_DELAY - timeSinceLastRequest;
    await delay(waitTime);
  }
  
  lastRequestTime = Date.now();
  try {
    if (!googleApiKey || !searchEngineId) {
      throw new Error('Google API key and Search Engine ID are required');
    }

    const searchQuery = `${beerName} untappd rating`;
    const googleSearchApiUrl = `https://www.googleapis.com/customsearch/v1`;
    
    const response = await axios.get(googleSearchApiUrl, {
      params: {
        key: googleApiKey,
        cx: searchEngineId,
        q: searchQuery,
        num: 5 // Get top 5 results
      }
    });

    let rating = null;

    // Check if there are search results
    if (response.data.items && response.data.items.length > 0) {
      // Look through search results for Untappd ratings
      for (const item of response.data.items) {
        const snippet = item.snippet || '';
        const title = item.title || '';
        const searchText = `${title} ${snippet}`.toLowerCase();
        
        // Look for Untappd results
        if (searchText.includes('untappd')) {
          // Try different rating patterns that might appear in search results
          const patterns = [
            /(\d+\.\d+)\s*out of 5/i,
            /rating[:\s]+(\d+\.\d+)/i,
            /(\d+\.\d+)\s*\/\s*5/i,
            /(\d+\.\d+)\s*★/i,
            /has a rating of (\d+\.\d+)/i
          ];
          
          for (const pattern of patterns) {
            const match = `${title} ${snippet}`.match(pattern);
            if (match) {
              const foundRating = parseFloat(match[1]);
              // Validate rating is in reasonable range for beer ratings
              if (foundRating >= 0 && foundRating <= 5) {
                rating = foundRating;
                break;
              }
            }
          }
          
          if (rating) break;
        }
      }
    }

    return rating;
    
  } catch (error) {
    console.error('Error fetching Untappd rating:', error.message);
    return null;
  }
}

const rescanBeersWithoutRatings = async (Beer = null) => {
  if (!Beer) {
    throw new Error('Beer model is required for rescanBeersWithoutRatings');
  }
  try {
    const beersWithoutRatings = await Beer.find({
      $or: [
        { rating: { $exists: false } },
        { rating: null }
      ]
    });

    console.log(`Found ${beersWithoutRatings.length} beers without ratings`);

    let updatedCount = 0;

    for (const beer of beersWithoutRatings) {
      console.log(`Rescanning rating for: ${beer.name}`);
      const rating = await getUntappdRating(beer.name);

      if (rating !== null) {
        await Beer.findByIdAndUpdate(beer._id, {
          rating: rating,
          updatedAt: new Date()
        });
        console.log(`Updated ${beer.name} with rating: ${rating}`);
        updatedCount++;
      } else {
        console.log(`No rating found for: ${beer.name}`);
      }
    }

    return {
      processed: beersWithoutRatings.length,
      updated: updatedCount
    };
  } catch (error) {
    console.error('Error rescanning beers without ratings:', error.message);
    throw error;
  }
};

const rescanOutdatedBeers = async (Beer = null, daysOld = 10) => {
  if (!Beer) {
    throw new Error('Beer model is required for rescanOutdatedBeers');
  }
  try {
    const cutoffDate = new Date(Date.now() - (daysOld * 24 * 60 * 60 * 1000));

    const outdatedBeers = await Beer.find({
      updatedAt: { $lt: cutoffDate }
    });

    console.log(`Found ${outdatedBeers.length} beers older than ${daysOld} days`);

    let updatedCount = 0;

    for (const beer of outdatedBeers) {
      console.log(`Rescanning rating for outdated beer: ${beer.name}`);
      const rating = await getUntappdRating(beer.name);

      if (rating !== null) {
        await Beer.findByIdAndUpdate(beer._id, {
          rating: rating,
          updatedAt: new Date()
        });
        console.log(`Updated ${beer.name} with rating: ${rating}`);
        updatedCount++;
      } else {
        console.log(`No rating found for: ${beer.name}`);
      }
    }

    return {
      processed: outdatedBeers.length,
      updated: updatedCount
    };
  } catch (error) {
    console.error('Error rescanning outdated beers:', error.message);
    throw error;
  }
};

const rescanBeers = async (Beer = null, options = {}) => {
  if (!Beer) {
    throw new Error('Beer model is required for rescanBeers');
  }
  const {
    includeWithoutRatings = true,
    includeOutdated = true,
    daysOld = 10
  } = options;

  const results = {
    withoutRatings: { processed: 0, updated: 0 },
    outdated: { processed: 0, updated: 0 }
  };

  try {
    if (includeWithoutRatings) {
      console.log('Starting rescan of beers without ratings...');
      results.withoutRatings = await rescanBeersWithoutRatings(Beer);
    }

    if (includeOutdated) {
      console.log(`Starting rescan of beers older than ${daysOld} days...`);
      results.outdated = await rescanOutdatedBeers(Beer, daysOld);
    }

    console.log('Rescan complete:', results);
    return results;
  } catch (error) {
    console.error('Error in rescan process:', error.message);
    throw error;
  }
};

module.exports = {
  getUntappdRating,
  rescanBeersWithoutRatings,
  rescanOutdatedBeers,
  rescanBeers
};