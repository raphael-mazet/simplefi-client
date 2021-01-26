import supportedCurrencies from './supportedCurrencies';

const baseUrl = 'https://api.coingecko.com/api/v3';
const priceEP = '/coins/';
const manyPriceEP = '/simple/price?ids=';
const currencyString = "&vs_currencies=" + supportedCurrencies.join('%2C');
const history = '/history?date=';
const historyRangeString = '/market_chart/range?vs_currency=usd&from='

export {
  baseUrl,
  priceEP,
  manyPriceEP,
  currencyString,
  history,
  historyRangeString
}