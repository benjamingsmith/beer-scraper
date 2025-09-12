const axios = require('axios');
const cheerio = require('cheerio');

const getElSegundo = async () => {
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
        type: undefined,
        name: beerName,
        description: beerDescription,
        rating: null,
        location: 'el-segundo'
      });
    }
  });

  
  return beerList;
};

module.exports = { getElSegundo };