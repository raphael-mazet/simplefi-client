import { getOneCurveHistReceiptPrice } from './getCurveFarmingPriceHistory';
import getOneUniswapHistReceiptPrice from './getUniswapFarmingPriceHistory';
import { getHistoricalPrice } from '../../../coinGecko/getHistoricalPrice';
import helpers from '../../../../helpers';

/**
 * 
 * @param {Object} field - currently analysed farming field
 * @param {Array} userTokenTransactions - all user ERC20 transactions
 * @param {Array} userNormalTransactions - all other user transactions
 * @param {Array} trackedFields - all fields tracked by SimpleFi
 * @param {Array} trackedTokens - all tokens tracked by SimpleFi
 * @param {String} userAccount - currently analysed user account
 * @return {Array} - an array of objects containing :{tx, [crop | receipt]Token, [priceApi,] [reward | staking | unstaking]Amount, pricePerToken}
 * @dev - in sortFarmingTxs():
 *          Presence of a cropToken means that the user claimed a reward and corresponds to the presence of a rewardAmount property)
 *          receiptToken is present in all tx types ((un)staking and reward claims)
 *      - in getHistoricalPrice(): assumes all crop tokens are base (and have a coinGecko price api code)
 */
async function getUserFarmingHistory(field, userTokenTransactions, userNormalTransactions, trackedFields, trackedTokens, userAccount) {

  //@dev: farmingTxs = [{tx, receiptToken, [cropToken,] [priceApi,] [reward | staking | unstaking]Amount}]
  const farmingTxs = helpers.sortFarmingTxs(field, userTokenTransactions, userNormalTransactions, trackedTokens, userAccount);
  
  
  /* add historical prices of (un)staking transactions based on field issuing the receipt token used as this farming field's seed
     and price of the token in case of a rewards claim for use in the Farming Field Details page
  */
  //TODO: initialise coingecko calls
  for (let tx of farmingTxs) {
    
    let farmSeedTokenPriceAndDate;
    const { farmSeedToken } = tx;
    const txTimestamp = tx.tx.timeStamp;

    switch (field.seedTokens[0].protocol.name) {
      case 'Curve':
        farmSeedTokenPriceAndDate = await getOneCurveHistReceiptPrice(farmSeedToken, txTimestamp, trackedFields);
        break;
          
      case 'Uniswap':
        const poolAddress = field.seedTokens[0].address;
        const txBlockNumber = tx.tx.blockNumber;
        farmSeedTokenPriceAndDate = await getOneUniswapHistReceiptPrice(txBlockNumber, userAccount, poolAddress);
        break;
  
      // default is for cases when the farm seed token is a simple base token (e.g. 1inch)
      default: 
        const pricePerToken = await getHistoricalPrice(farmSeedToken.priceApi, txTimestamp);
        const txDate = new Date(Number(txTimestamp) * 1000);
        farmSeedTokenPriceAndDate = {pricePerToken, txDate}
    }

    /* add hist. price of the crop token in case the tx is a reward claim (would also satisfy a "if(tx.rewardAmount)"
       condition), and differentiate from receipt token price for proper calc of historical balances in fieldDetails page
    */
    if (tx.cropToken) {
      const histTokenPrice = await getHistoricalPrice (tx.priceApi, tx.tx.timeStamp);
      tx.txDate = new Date(Number(tx.tx.timeStamp) * 1000);
      tx.pricePerToken = histTokenPrice;
      tx.pricePerFarmSeedToken = farmSeedTokenPriceAndDate.pricePerToken;
    } else {
      tx.pricePerToken = farmSeedTokenPriceAndDate.pricePerToken;
      tx.txDate = farmSeedTokenPriceAndDate.txDate;
    }
  }

  //@dev: [{tx, receiptToken, [cropToken,] txDate, [reward | staking | unstaking]Amount, pricePerToken, [pricePerFarmSeedToken,] [priceApi]}]
  return farmingTxs;
}

export default getUserFarmingHistory;