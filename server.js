import fetch from 'node-fetch';
import fs from 'fs';

const apiUrl = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&t=";

fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    const coinsData = { coins: data };
    fs.writeFileSync('./db/db.json', JSON.stringify(coinsData, null, 2));
    console.log('Data written to db.json');
  })
  .catch(err => console.error(err));