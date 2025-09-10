const axios = require('axios');
const cheerio = require('cheerio');
const { getUntappdRating } = require('../utils/untappd');

const getElSegundo = async (skipRatings = false) => {
  const url = 'https://www.elsegundobrewing.com/visit/';
  const $ = cheerio.load((await axios.get(url)).data);
  const beerList = [];
  
  const menuItems = $('.sc-av_one_half').first();
  
  menuItems.find('p').each((_, element) => {
    let beerName = $(element).text().trim().split('\n')[0].trim();
    beerName = beerName.split(' ').map(w => w[0]?.toUpperCase() + w.substring(1)?.toLowerCase()).join(' ');
    const beerDescription = $(element).text().split('\n')[1].trim();

    if (beerName && element.children.length > 1) {
      beerList.push({
        type: null,
        name: beerName,
        description: beerDescription,
        rating: null,
        location: 'el-segundo'
      });
    }
  });

  // Second pass: fetch ratings with rate limiting (only if not skipped)
  if (!skipRatings) {
    console.log(`Fetching ratings for ${beerList.length} beers from El Segundo...`);
    
    for (let i = 0; i < beerList.length; i++) {
      if (beerList[i].name) {
        console.log(`Getting rating for "${beerList[i].name}" (${i + 1}/${beerList.length})`);
        beerList[i].rating = await getUntappdRating(beerList[i].name);
      }
    }
  }
  
  return beerList;
};

module.exports = { getElSegundo };