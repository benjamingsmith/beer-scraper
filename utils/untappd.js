const axios = require('axios');
const cheerio = require('cheerio');

/**
 * 
 * TODO: 
 * • throttle requests to 1 per second
 * • cache results
 * • investigate using the API instead of scraping
 * 
 */

const getUntappdRatings = async (beerName) => {
  if (beerName.endsWith(' ')) {
    beerName = beerName.slice(0, -1);
  }
    const beerNameLower = beerName.toLowerCase().replace(/\s+/g, '-').replace('.','');
    const response = await axios.get(`https://untappd.com/search?q=${beerNameLower}`);
    const $ = cheerio.load(response.data);
    const rating = $('.beer-item').first().find('.rating').text().replace(' ', '').replace('(', '').replace(')', '');
    return rating;
}

module.exports = { getUntappdRatings };