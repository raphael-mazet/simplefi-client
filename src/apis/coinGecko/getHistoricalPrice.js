import fetchRequest from '../fetchRequest';
import {baseUrl, priceEP, history, historyRangeString} from './geckoEndPoints';

/**
 * @param {uuid} tokenId - db Id of currently analysed token
 * @param {String} date - date formatted for a historical price query to coingecko
 * @dev same end point can be used for other historical market data provided by coinGecko
 * @return {Object} - token price on day specified
 */

const priceCache = [];
let apiCounter = 0;
let lastCall = Date.now()

//FIXME: all broken - get prices for date range instead to avoid coinGecko api limitations
function getHistoricalPrice (tokenId, date) {
  const preExisting = priceCache.find(cached => cached.tokenId === tokenId && cached.date === date);
  if (preExisting) {
    return preExisting.data;
  }
  return fetchRequest(baseUrl + priceEP + tokenId + history + date)
    .then(token => {
      console.log(' ---> token', token);
      const data = token.market_data.current_price.usd;
      priceCache.push({tokenId, date, data})
      return data;
    })
}

// {steth: [date, price]}
const histPriceCache = {};

//CHECK: only return the relevant segment or whole cached range?
function getHistoricalPriceRange (tokenApi, startDate, endDate) {

  //avoid coingecko rounding start and end date the wrong way by subtracting / adding a day respectively
  startDate = new Date(startDate * 1000).setHours(0,0,0,0)/1000;
  const unformattedEndDate = new Date(endDate * 1000);
  endDate = new Date(unformattedEndDate.setDate(unformattedEndDate.getDate() +1)).setHours(0,0,0,0)/1000;

  //check cache if requested range already fetched
  let cachedStartDate;
  let cachedEndDate;
  if (histPriceCache.tokenApi) {
    cachedStartDate = histPriceCache.tokenApi[0][0];
    cachedEndDate = histPriceCache.tokenApi[histPriceCache.tokenApi.length - 1][0];
  }

  if (!histPriceCache.tokenApi || (startDate < cachedStartDate && cachedEndDate < endDate)) {
    return fetchRequest(baseUrl + priceEP + tokenApi + historyRangeString + startDate + '&to=' + endDate)
      .then(histRange => {
        const priceHistRange = histRange.prices;
        histPriceCache.tokenApi = priceHistRange;
        return histPriceCache.tokenApi;
      })
  } else if (startDate < cachedStartDate && endDate < cachedEndDate) {
    return fetchRequest(baseUrl + priceEP + tokenApi + historyRangeString + startDate + '&to=' + cachedStartDate)
      .then(histRange => {
        const priceHistRange = histRange.prices;
        histPriceCache.tokenApi = priceHistRange.concat(histPriceCache.tokenApi.slice(1));
        return histPriceCache.tokenApi;
      })
  } else if (cachedStartDate < startDate && cachedEndDate < endDate) {
    return fetchRequest(baseUrl + priceEP + tokenApi + historyRangeString + cachedEndDate + '&to=' + endDate)
      .then(histRange => {
        const priceHistRange = histRange.prices;
        histPriceCache.tokenApi = histPriceCache.tokenApi.concat(priceHistRange.slice(1));
        return histPriceCache.tokenApi;
      })
  } else {
    return histPriceCache.tokenApi;
  }
}

export {
  getHistoricalPrice,
  getHistoricalPriceRange
}