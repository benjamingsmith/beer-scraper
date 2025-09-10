const axios = require('axios');
const cheerio = require('cheerio');

const getFathersOffice = async () => {
  const url = 'https://www.fathersoffice.com/menus/santa-monica';
  const finalList = [];

  const data = await axios.get(url);
  const $ = cheerio.load(data.data);
  const drinkCategories = $('.drink .c-menu');
  const reallyGoodList = $('.menu_title_spacer')[$('.menu_title_spacer').length - 1];

  // First pass: collect all beer data without ratings
  for (let element of drinkCategories) {
    let beerType, beerName, beerDescription;

    for (let c of element.children) {
      c.attribs?.name && typeof c.attribs.name !== 'undefined' ? beerType = c.attribs.name : null
      if(typeof beerType !== 'undefined' && beerType !== 'White/Orange/Pink Wine' && beerType !== 'Sparkling Wine' && beerType !== 'Red Wine') {
        $(c).find('.c-dish__title').text() ? (
          beerName = $(c).find('.c-dish__title')?.text().replace(/\.\s*$/, ''),
          beerDescription = $(c).find('.c-dish__title')?.siblings().first().next().next()?.text(),

          finalList.push({type: beerType.replace(/\.\s*$/, '').replace(/\s+$/, ''), name: beerName, description: beerDescription, rating: null})
        ) : null
      }

      if($(c).text() === 'The Really Good Sh...') {
        beerType = $(c).text();
        const reallyGoodBeers = $(reallyGoodList).siblings().find('.c-dish');

        for (let element of reallyGoodBeers.prevObject) {
          const beerName = $(element).find('.c-dish__title')?.text().replace(/\.\s*$/, '');
          beerDescription = $(element).find('.c-dish__title')?.siblings().first().next().next()?.text();

          finalList.push({type: beerType.replace(/\.\s*$/, '').replace(/\s+$/, ''), name: beerName, description: beerDescription, rating: null})
        }
      }
    }
  }


  return finalList;
}
module.exports = { getFathersOffice };