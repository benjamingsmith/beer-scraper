# Beer Ratings Database Setup

This system uses MongoDB to store beer ratings locally, updated via cron job to avoid API rate limits.

## Quick Setup

1. **Install MongoDB** (if not already installed)
2. **Install dependencies**: `npm install mongoose`
3. **Set environment variables** in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/beer-scraper
   GOOGLE_API_KEY=your_api_key_here
   GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
   ```
4. **Seed the database**: `node scripts/seed-database.js`
5. **Setup cron job** (see crontab-setup.txt)

## Usage

```javascript
const { getUntappdRating } = require('./utils/untappd.js');

// Now queries MongoDB instead of API
const rating = await getUntappdRating('Stone IPA');
console.log(rating); // 3.7
```

## Database Schema

```javascript
{
  beerName: "Stone IPA",
  normalizedName: "stone ipa",
  untappdRating: 3.7,
  reviewCount: 452074,
  lastUpdated: Date,
  source: "google_search_api"
}
```

## Scripts

- **`scripts/seed-database.js`** - Initial database seeding
- **`scripts/update-ratings-cron.js`** - Cron job to update ratings
- **`scripts/seed-database.js clear`** - Clear all ratings

## Cron Job

The cron job updates:
- Popular beers daily
- Outdated ratings (>24h old)
- Respects API limits (1 request/second)

## Benefits

- ⚡ Fast queries (MongoDB vs API calls)
- 💰 Reduced API costs
- 🚫 No rate limiting for your app
- 📊 Historical data tracking
- 🔄 Automatic updates via cron