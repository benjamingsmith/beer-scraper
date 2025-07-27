const axios = require('axios');
const cheerio = require('cheerio');

const getMonkish = async () => {
  const url = 'https://www.monkishbrewing.com/tastingroom';
  const $ = cheerio.load((await axios.get(url)).data);
  const pageH2s = $('h2');
  const finalList = {
    "here": {
      title: "At Taproom",
      list: []
    },
    "away": {
      title: "To Go",
      list: []
    }
  };

  pageH2s.each((index, element) => {
    const text = $(element).text();
    
    const location = text.includes('HERE') ? 'here' : 'away';
    const beerList = element.parent.parent.parent.nextSibling;

    beerList.children[0].children.forEach(async(c, i) => {
      let beerType, beerName, beerDescription;

      $(c).children().find('.menu-section-title').each(async (index, element) => {
        beerType = $(element).text().replace(/\b(\w)(\w*)\b/g, (match, p1, p2) => p1 + p2.toLowerCase());

        $(c).children().find('.menu-item-title').each(async (index, element) => {
          beerName = $(element).text();
          beerDescription = $(element).next().text();

          finalList[location].list.push({type: beerType, name: beerName, description: beerDescription});
        })
      })
    })
  })

  return finalList;
}

module.exports = { getMonkish };