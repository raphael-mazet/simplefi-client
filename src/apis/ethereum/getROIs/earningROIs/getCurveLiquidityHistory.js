import { getOneCurvePoolRawData } from '../../protocolQueries';
import { getHistoricalPrice } from '../../../coinGecko/getHistoricalPrice';
import helpers from '../../../../helpers';

/**
 * 
 * @param {Object} field - current Curve earning (liquidity pool) field
 * @param {Object} receiptToken - fields receipt token, used to track user holding changes
 * @param {Array} userReceiptTokenTxs - all transactions involving user's receipt token
 * @param {Array} relatedFarmReceiptTokenTxs - all transactions involving the receipt token of farming fields related to the currently analysed earning field
 * @param {String} userAccount - user's Ethereum account
 * @param {Array} whitelist - array of staking addresses, to avoid staking/unstaking receipt tokens being counted as a realised profit/loss or new investment
 * @dev - sortReceiptAndRelatedTxs() will merge and order userReceiptTokenTxs and relatedFarmReceiptTokenTxs by block/date number
 */
async function getCurveLiquidityHistory(field, receiptToken, userReceiptTokenTxs, relatedFarmReceiptTokenTxs, userAccount, whitelist) {
  
  // assumes that at least one of userReceiptTokenTxs or relatedFarmReceiptTokenTxs will have a length
  const sortedReceiptAndRelatedTxs = helpers.sortReceiptAndRelatedTxs (userReceiptTokenTxs, relatedFarmReceiptTokenTxs);
  const timeFormatter = new Intl.DateTimeFormat('en-GB');
  const historicalCurveStats = await getOneCurvePoolRawData(field.name);

    /* @dev: this await initialises the getHistoricalPrice cache and ensures only one
             call is made to Coingecko for each seed. It assumes that Etherscan always
             returns userReceiptTokenTxs ordered by ascending date (earliest at index [0])
             and that the sortedReceiptAndRelatedTxs are therefore properly ordered
    */
   if (sortedReceiptAndRelatedTxs.length) {
     for (let seed of field.seedTokens) {
      await getHistoricalPrice(seed.priceApi, sortedReceiptAndRelatedTxs[0].timeStamp)
     }
   }

  const liquidityHistory = sortedReceiptAndRelatedTxs.map(async tx => {
    const txDate = new Date(Number(tx.timeStamp) * 1000);
    //@dev: simplify date to just day/month/year (no time) to find corresponding day in curve snapshot data
    const compDate = timeFormatter.format(txDate);
    const historicalStat = historicalCurveStats.find(day => compDate === timeFormatter.format(new Date(Number(day.timestamp) * 1000)));

    let fieldHistReserveValue = 0;

    for (let seed of field.seedTokens) {
      const histSeedValue = await getHistoricalPrice(seed.priceApi, tx.timeStamp)
      const seedDecimalDivisor = Number(`1e${seed.decimals}`);
      const decimaledReserve = historicalStat.balances[seed.seedIndex]/seedDecimalDivisor;
      fieldHistReserveValue += histSeedValue * decimaledReserve;
    }
    //TODO: check impact of split admin fees and use of virtual price
    const pricePerToken = fieldHistReserveValue / (historicalStat.supply / Number(`1e${receiptToken.tokenContract.decimals}`));
    const {txIn, txOut, staked, unstaked} = helpers.sortLiquidityTxs(tx, userAccount, whitelist);

    return {tx, txDate, pricePerToken, txIn, txOut, staked, unstaked}
  })


  return liquidityHistory;
}

export default getCurveLiquidityHistory;