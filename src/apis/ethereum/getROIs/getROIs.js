import getUserLiquidityHistory from './earningROIs/getUserLiquidityHistory';
import getUserFarmingHistory from './farmingROIs/getUserFarmingHistory';
import helpers from '../../../helpers';

/**
 * 
 * @param {String} userAccount user's Eth account
 * @param {Array} userFields user's earning and farming fields
 * @param {Array} trackedFields all tracked fields
 * @param {Array} userTokenTransactions all user ERC20 transactions (pulled from Etherscan)
 * @param {Array} trackedTokens all tracked tokens
 * @return {Array} userFields with added ROI, user transaction history and current value of investment
 */
//TODO: refactor tx sorters to show when (un)staking and txIn/Out are made in the same tx
async function getROIs(userAccount, userFields, trackedFields, userTokenTransactions, userNormalTransactions, trackedTokens, userTokens, tokenPrices) {

  const fieldsWithROI = [...userFields];
  
  for (let field of fieldsWithROI) {

    let currInvestmentValue = 0;
    if (field.unstakedUserInvestmentValue) {
      currInvestmentValue += field.unstakedUserInvestmentValue;
    }
    if (field.stakedBalance) {
      currInvestmentValue += field.stakedBalance.reduce((acc, curr) => acc + curr.userInvestmentValue, 0);
    }

    if (field.isEarning) {

      const userLiquidityHistoryPromises = await getUserLiquidityHistory(trackedFields, field, trackedTokens, userTokenTransactions, userAccount);
      if (userLiquidityHistoryPromises) {
        const userLiquidityHistory = await Promise.all(userLiquidityHistoryPromises);
        //TODO: rename variable to totalCurrInvValue
        field.investmentValue = currInvestmentValue;
        field.userTxHistory = userLiquidityHistory;
        //@dev: {allTimeROI, absReturnValue, histInvestmentValue}
        //NOTE: adding field is only relevant for Uniswap at the moment
        field.earningROI = helpers.calcEarningROI(currInvestmentValue, userLiquidityHistory, field, tokenPrices);
      }
    }

    if (field.cropTokens.length) {
      //@dev: [{tx, [crop | receipt]Token, [priceApi,] [reward | staking | unstaking]Value, pricePerToken, txDate, [userBalanceAfterTx]}]
      const userFarmingHistory = await getUserFarmingHistory(field, userTokenTransactions, userNormalTransactions, trackedFields, trackedTokens, userAccount);
      field.investmentValue = currInvestmentValue;
      field.userFarmingTxHistory = userFarmingHistory;
      field.farmingROI = helpers.calcFarmingROI(userTokens, tokenPrices, field)
    }
  }
  return fieldsWithROI;
}

export default getROIs;