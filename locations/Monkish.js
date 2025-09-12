const axios = require('axios');
const cheerio = require('cheerio');

const getMonkish = async () => {
  const url = 'https://www.monkishbrewing.com/tastingroom';
  const $ = cheerio.load((await axios.get(url)).data);
  const beerList = [];

  // Process each section and its associated beers
  $('.menu-section-title').each((i, sectionEl) => {
    const sectionName = $(sectionEl).text();
    
    // Skip CANS and BOTTLES sections - we want draft/taproom beers only
    if (sectionName === 'CANS' || sectionName === 'BOTTLES') return;
    
    // Format section name
    const beerType = sectionName.replace(/\b(\w)(\w*)\b/g, (match, p1, p2) => p1 + p2.toLowerCase());
    
    // Find items that follow this section
    let nextEl = $(sectionEl).parent().next();
    
    while (nextEl.length > 0) {
      const items = nextEl.find('.menu-item-title');
      if (items.length > 0) {
        items.each((j, item) => {
          const beerName = $(item).text();
          const beerDescription = $(item).next().text();
          
          if (beerName) {
            beerList.push({
              type: beerType,
              name: beerName,
              description: beerDescription,
              rating: null,
              location: 'monkish'
            });
          }
        });
        break;
      }
      nextEl = nextEl.next();
    }
  });


  return beerList;
}

module.exports = { getMonkish };