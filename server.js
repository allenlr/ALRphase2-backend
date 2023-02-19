const jsonServer = require("json-server");
const cors = require("cors");
const path = require("path");
const https = require("https");
const { fstat } = require("fs");
const fs = require("fs")
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db", "db.json"));
const middlewares = jsonServer.defaults();

server.use(cors());
server.use(jsonServer.bodyParser);
server.use(middlewares);
server.use(router);

const maxRequestsPerMinute = 10;
const refillRate = maxRequestsPerMinute/60

let tokenBucket = maxRequestsPerMinute;

function refillTokens() {
  tokenBucket = Math.min(tokenBucket + maxRequestsPerMinute * refillRate, maxRequestsPerMinute);
}

function useToken(){
  if(tokenBucket >= 1) {
    tokenBucket--;
    return true;
  } else {
    return false;
  }
}

setInterval(refillTokens, 100);

const apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&t=${new Date().getTime()}`;

https.get(apiUrl, (res) => {
  if (useToken()) {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const coins = JSON.parse(data);
        fs.writeFile(path.join(__dirname, "db", "db.json"), JSON.stringify({coins}, null, 2), (err) => {
          if(err) throw err;
          console.log(coins)
          console.log('Data written to file');
        });
      } catch (err) {
        console.error(err.message);
      }
    });
  } else {
    console.log('Rate limit exceeded');
  }
}).on('error', (err) => {
  console.error(err.message);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`JSON Server is running on http://localhost:${PORT}`);
});
