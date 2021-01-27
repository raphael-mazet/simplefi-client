import fetchRequest from '../fetchRequest';
import {baseUrl, priceEP, history, historyDaysString} from './geckoEndPoints';

/**
 * @param {uuid} tokenId - db Id of currently analysed token
 * @param {String} date - date formatted for a historical price query to coingecko
 * @dev same end point can be used for other historical market data provided by coinGecko
 * @return {Object} - token price on day specified
 */
//NOTE: this function is not in use, replaced by getHistoryFromFirstTx + findPriceAtDate helper
const priceCache = [];

function getHistoricalPrice (tokenId, date) {
  const preExisting = priceCache.find(cached => cached.tokenId === tokenId && cached.date === date);
  if (preExisting) {
    return preExisting.data;
  }
  return fetchRequest(baseUrl + priceEP + tokenId + history + date)
    .then(token => {
      const data = token.market_data.current_price.usd;
      priceCache.push({tokenId, date, data})
      return data;
    })
}

const dayRangePriceCache = {}

function getHistoryFromFirstTx (tokenApi, firstTxTimestamp) {
  
  const startDate = new Date(firstTxTimestamp * 1000).setHours(0,0,0,0);
  
  let cachedStartDate;
  if (dayRangePriceCache[tokenApi]) {
    cachedStartDate = dayRangePriceCache[tokenApi][0][0];    
  }

  if (!cachedStartDate || startDate < cachedStartDate) {
    const daysAgo = Math.ceil((Date.now() - startDate) / 86400000);
    return fetchRequest(baseUrl + priceEP + tokenApi + historyDaysString + daysAgo + '&interval=daily')
      .then(histData => {
        const tokenPriceHist = histData.prices;
        dayRangePriceCache[tokenApi] = tokenPriceHist;
        return dayRangePriceCache[tokenApi];
      })
  } else {
    return dayRangePriceCache[tokenApi];
  }
}

export {
  getHistoricalPrice,
  getHistoryFromFirstTx
}