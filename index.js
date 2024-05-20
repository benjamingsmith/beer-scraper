const axios = require('axios');
const cheerio = require('cheerio');
const { response } = require('express');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

const getFo =  async (response) => {
  const $ = cheerio.load(response.data);
  const drinkCategories = $('.drink .c-menu');
  const reallyGoodList = $('.menu_title_spacer')[$('.menu_title_spacer').length - 1];
  const finalList = [];

  drinkCategories.each(async (index, element) => {
    let beerType, beerName, beerDescription;

    element.children.forEach(async(c) => {
      c.attribs?.name && typeof c.attribs.name !== 'undefined' ? beerType = c.attribs.name : null

      if(typeof await beerType !== 'undefined' && await beerType !== 'White/Orange/Pink Wine' && await beerType !== 'Sparkling Wine' && await beerType !== 'Red Wine') {
        $(c).find('.c-dish__title').text() ? (
          beerName = $(c).find('.c-dish__title')?.text(),
          beerDescription = $(c).find('.c-dish__title')?.siblings().first().next().next()?.text(),

          finalList.push({type: beerType.replace(/\.\s*$/, '').replace(/\s+$/, ''), name: beerName.replace(/\.\s*$/, ''), description: beerDescription})
        ) : null
      }

      if($(c).text() === 'The Really Good Sh...') {
        beerType = $(c).text();
        const reallyGoodBeers = $(reallyGoodList).siblings().find('.c-dish');

        reallyGoodBeers.prevObject.each(async (index, element) => {
          const beerName = $(element).find('.c-dish__title')?.text();
          beerDescription = $(element).find('.c-dish__title')?.siblings().first().next().next()?.text(),

          finalList.push({type: beerType.replace(/\.\s*$/, '').replace(/\s+$/, ''), name: beerName.replace(/\.\s*$/, ''), description: beerDescription})
        })
      }
    });
  });

  return finalList;
}

const getMonkish = async (response) => {
  const $ = cheerio.load(response.data);
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
    if(text === ' MENU || ENJOY HERE' || text === ' MENU || ENJOY AWAY') {
      const location = text.includes('HERE') ? 'here' : 'away';
      const beerList = text.includes('HERE') ? element.parent.parent.parent.nextSibling : element.parent.parent.parent.nextSibling.nextSibling;

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
    }
  })
  return finalList;
}

app.get('/api/:website', async(req, res) => {
  const { website } = req.params;
  let url;
  switch (website) {
    case 'fo':
      url = 'https://fathersoffice.com/menus/santa-monica/';
      try {
        axios.get(url)
        .then(async(response) => getFo(response))
        .then(list => res.send(list))
      } catch(err) {
        console.log(err)
        res.sendStatus(500); // Internal Server Error
      }
    break;
    case 'monkish':
      url = 'https://www.monkishbrewing.com/tastingroom';
      try {
        const list = await axios.get(url);
        const beerList = await getMonkish(list);
        res.send(beerList);
      } catch(err) {
        console.log(err)
        res.sendStatus(500); // Internal Server Error
      }
    break;
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});