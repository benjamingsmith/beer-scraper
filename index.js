const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');

const foUrl = 'https://fathersoffice.com/menus/santa-monica/';

const app = express();
const PORT = process.env.PORT || 3000;

const getFoList =  async (response) => {
  const $ = cheerio.load(response.data);
  const drinkCategories = $('.drink .c-menu');
  const reallyGoodList = $('.menu_title_spacer')[$('.menu_title_spacer').length - 1];
  const finalList = [];

  drinkCategories.each(async (index, element) => {
    let beerType, beerName;

    element.children.forEach(async(c) => {
      c.attribs?.name && typeof c.attribs.name !== 'undefined' ? beerType = c.attribs.name : null

      if(typeof await beerType !== 'undefined' && await beerType !== 'White/Orange/Pink Wine' && await beerType !== 'Sparkling Wine' && await beerType !== 'Red Wine') {
        $(c).find('.c-dish__title').text() ? (
          beerName = $(c).find('.c-dish__title')?.text(),
          // console.log(`${beerType} - ${beerName}`)
          finalList.push({type: beerType.replace(/\.\s*$/, '').replace(/\s+$/, ''), name: beerName.replace(/\.\s*$/, '')})
        ) : null
      }

      if($(c).text() === 'The Really Good Sh...') {
        beerType = $(c).text();
        const reallyGoodBeers = $(reallyGoodList).siblings().find('.c-dish');

        reallyGoodBeers.prevObject.each(async (index, element) => {
          const beerName = $(element).find('.c-dish__title')?.text();

          // console.log(`${beerType} - ${beerName}`)
          finalList.push({type: beerType.replace(/\.\s*$/, '').replace(/\s+$/, ''), name: beerName.replace(/\.\s*$/, '')})
        })
      }
    });
  });

  return await finalList;
}

app.get('/api/:website', async(req, res) => {
  const { website } = req.params;
  switch (website) {
    case 'fo':
      try {
        axios.get(foUrl)
        .then(async(response) => getFoList(response))
        .then(list => res.send(list))
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