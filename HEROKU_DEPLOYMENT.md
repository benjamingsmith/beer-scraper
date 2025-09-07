# Heroku Deployment Guide for Beer Ratings System

## 1. Heroku Setup

### Environment Variables
Set these in Heroku Dashboard or via CLI:

```bash
heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/beer-scraper"
heroku config:set GOOGLE_API_KEY="your_google_api_key"
heroku config:set GOOGLE_SEARCH_ENGINE_ID="your_search_engine_id"
```

### Required Add-ons
```bash
# MongoDB Atlas (recommended) - Free tier available
heroku addons:create mongolab:sandbox

# OR use MongoDB Atlas directly (preferred)
# Just set MONGODB_URI to your Atlas connection string
```

## 2. Cron Job Setup on Heroku

Heroku doesn't support traditional cron jobs. Use **Heroku Scheduler** instead:

### Install Scheduler Add-on
```bash
heroku addons:create scheduler:standard
```

### Configure the Job
```bash
# Open scheduler dashboard
heroku addons:open scheduler

# Add a new job with:
# Command: node scripts/update-ratings-cron.js
# Frequency: Daily (or every 12 hours)
```

### Alternative: Custom Scheduler Route
Add to your main app:

```javascript
// In your main app.js or server.js
const express = require('express');
const app = express();

// Protected endpoint for manual updates
app.post('/update-ratings', async (req, res) => {
  // Add basic auth or API key protection
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    // Import and run the update function
    const updateFunction = require('./scripts/update-ratings-cron');
    await updateFunction();
    res.json({ success: true, message: 'Ratings updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 3. Manual Database Seeding

### One-time Setup
```bash
# Run once after deployment to seed initial data
heroku run node scripts/seed-database.js

# Check logs
heroku logs --tail
```

### Clear Database (if needed)
```bash
heroku run node scripts/seed-database.js clear
```

## 4. Monitoring & Logs

### View Scheduler Logs
```bash
# View recent logs
heroku logs --tail

# View scheduler-specific logs
heroku logs --source scheduler
```

### Check Database Status
```bash
# Connect to your app
heroku run bash

# Then run:
node -e "
const mongoose = require('mongoose');
const BeerRating = require('./models/BeerRating');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const count = await BeerRating.countDocuments();
  console.log('Beer ratings in database:', count);
  const recent = await BeerRating.find().sort({lastUpdated: -1}).limit(5);
  console.log('Recent ratings:', recent);
  process.exit(0);
});
"
```

## 5. Production Considerations

### Error Handling & Notifications
Consider adding:
- Slack/email notifications for failed updates
- Health check endpoints
- Retry logic for failed API calls

### Scaling
- Use Heroku's horizontal scaling for high traffic
- Consider Redis caching for frequently accessed ratings
- Monitor MongoDB Atlas performance metrics

## 6. Testing the Deployment

```bash
# Test the rating function
heroku run node -e "
const { getUntappdRating } = require('./utils/untappd.js');
getUntappdRating('Stone IPA').then(rating => {
  console.log('Rating:', rating);
  process.exit(0);
});
"

# Manually trigger update
heroku run node scripts/update-ratings-cron.js
```

## 7. Scheduler Configuration

**Recommended Schedule:**
- **Daily at 2 AM UTC**: `0 2 * * *` (for popular beers)
- **Every 12 hours**: `0 */12 * * *` (for more frequent updates)

**Heroku Scheduler Options:**
- Every 10 minutes
- Hourly
- Daily

Choose "Daily" and set your preferred time in UTC.