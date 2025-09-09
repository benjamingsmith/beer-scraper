const mongoose = require('mongoose');

const beerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  normalizedName: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  location: {
    type: String,
    required: true,
    enum: ['fathers-office', 'monkish'],
    index: true
  },
  onTap: {
    type: Boolean,
    required: true,
    default: true,
    index: true
  },
  scrapedAt: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Create compound indexes for efficient queries
beerSchema.index({ location: 1, onTap: -1, scrapedAt: -1 });
beerSchema.index({ normalizedName: 1, location: 1, onTap: -1, scrapedAt: -1 });
beerSchema.index({ onTap: -1, scrapedAt: -1 });

// Pre-save middleware to normalize beer name
beerSchema.pre('save', function(next) {
  if (this.name) {
    this.normalizedName = this.name.toLowerCase().trim();
  }
  next();
});

// Static method to get all beers from a specific location (only on tap)
beerSchema.statics.getByLocation = function(location) {
  return this.find({ location, onTap: true }).sort({ scrapedAt: -1 });
};

// Static method to get all beers from a specific location (including off tap)
beerSchema.statics.getAllByLocation = function(location) {
  return this.find({ location }).sort({ onTap: -1, scrapedAt: -1 });
};

// Static method to get beer history by name
beerSchema.statics.getBeerHistory = function(beerName) {
  const normalizedName = beerName.toLowerCase().trim();
  return this.find({ normalizedName }).sort({ scrapedAt: -1 });
};

// Static method to get all beers across all locations (including off tap)
beerSchema.statics.getAllBeers = function(onTap = false) {
  return this.find({ onTap: onTap }).sort({ onTap: -1, scrapedAt: -1 });
};

// Static method to add beer entry
beerSchema.statics.addBeer = function(beerData) {
  const beer = new this({
    ...beerData,
    normalizedName: beerData.name.toLowerCase().trim(),
    onTap: beerData.onTap !== undefined ? beerData.onTap : true,
    scrapedAt: new Date()
  });
  return beer.save();
};

module.exports = mongoose.model('Beers', beerSchema, 'beer_list');