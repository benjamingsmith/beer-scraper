const express = require('express');
const { getFathersOffice } = require('./components/FathersOffice');
const { getMonkish } = require('./components/Monkish');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/:website', async(req, res) => {
  const { website } = req.params;
  let url;
  switch (website) {
    case 'fo':
      try {
        const beerList = await getFathersOffice();
        res.send(beerList);
      } catch(err) {
        console.log(err)
        res.sendStatus(500); // Internal Server Error
      }
    break;
    case 'monkish':
      try {
        const beerList = await getMonkish();
        res.send(beerList);
      } catch(err) {
        console.log(err)
        res.sendStatus(500); // Internal Server Error
      }
    break;
    default:
      res.sendStatus(404); // Not Found
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});