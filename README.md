# SimpleFi

SimpleFi makes it easy to manage your decentralised finance investment portfolio.

In production at [SimpleFi.finance](https://simplefi.finance)


## Getting started

1. Clone the repo

```
git https://github.com/raphael-mazet/simplefi-client.git
```

2. start the simplefi server

Refer to the [SimpleFi server](https://github.com/raphael-mazet/simplefi-server.git) documentation.


3. start the app in development

```
npm install
npm start
```
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

Note that this app has been optimised for deployment with Heroku. Procfile.js will instruct the development server to serve the app via a static Express server in server.js. To simulate this in development:
```
npm run build
node server.js
```

You can learn more in the documentation for [Create React App](https://facebook.github.io/create-react-app/docs/getting-started) and [React](https://facebook.github.io/create-react-app/docs).

## Supported protocols

SimpleFi is currently in pre-alpha. Protocol coverage is not yet comprehensive but growing. To send requests and/or bug reports, please join our [Telegram group](https://t.me/joinchat/H0UceruS5m_MZeB9) or DM us on [Twitter](https://twitter.com/simplefi_).

* Aave lending pools: USDC, USDT, Dai
* Uniswap pools: MKR, BAL, Dai, MTA, REN, wBTC, MLN, BNT
* Curve pools and reward gauges: sUSD, 3Pool, stEth, Aave, hBTC, sBTC
* Lido: Eth2 staking
* mStable: Earn pool 5 (MTA/wETH uniswap farm)
* 1Inch: governance staking

## Built with

* [React](https://reactjs.org/) - javaScript library for building user interfaces
* [ethers.js](https://docs.ethers.io/v5/) - lightweight javaScript library to interact with the Ethereum blockchain
* [Express](https://expressjs.com/) - fast, unopinionated, minimalist web framework for Node.js
* [Chart.js](https://www.chartjs.org/) - simple yet flexible JavaScript charting for designers & developers
