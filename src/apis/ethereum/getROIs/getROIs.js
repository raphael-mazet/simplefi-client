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
//TODO: modularise
async function getROIs(userAccount, userFields, trackedFields, userTokenTransactions, userNormalTransactions, trackedTokens, userTokens, tokenPrices) {

  const fieldsWithROI = [...userFields];

  //NOTE: this will only work to a depth of 1 (i.e. assumes that no fields in the reserve feed into each other)
  //NOTE: need to change "isAlterable" condition to something more robust than looking if feeds into another earning field (e.g. DB marker)
  // @dev: this function is used to make sure "alterable" fields (that feed into a balancing field - e.g. Curve Pool of LP receipt tokens) are processed last
  const sortedFields = helpers.sortGetROIsFields(fieldsWithROI, trackedFields);
  console.log(' ---> sortedFields', sortedFields);

  for (let sortedFieldCategory of sortedFields) {

    for (let field of sortedFieldCategory) {
  
      let currInvestmentValue = 0;
      if (field.unstakedUserInvestmentValue) {
        currInvestmentValue += field.unstakedUserInvestmentValue;
      }
      if (field.stakedBalance) {
        currInvestmentValue += field.stakedBalance.reduce((acc, curr) => acc + curr.userInvestmentValue, 0);
      }
  
      if (field.isEarning) {
  
        //TODO: push these 2 lines to the getUserLiquidityHistory function for consistency & readbility
        const receiptToken = trackedTokens.find(trackedToken => trackedToken.tokenId === field.receiptToken);
  
        const userReceiptTokenTxs = userTokenTransactions.filter(tx => tx.contractAddress === receiptToken.address.toLowerCase());
        const userLiquidityHistoryPromises = await getUserLiquidityHistory(trackedFields, field, receiptToken, userReceiptTokenTxs, userAccount);
        if (userLiquidityHistoryPromises) {
          const userLiquidityHistory = await Promise.all(userLiquidityHistoryPromises);
          //TODO: rename variable to totalCurrInvValue
          field.investmentValue = currInvestmentValue;
          field.userTxHistory = userLiquidityHistory;
          //@dev: {allTimeROI, absReturnValue, histInvestmentValue}
          field.earningROI = helpers.calcEarningROI(currInvestmentValue, userLiquidityHistory);
        }
      }
  
      if (field.cropTokens.length) {
        //@dev: [{tx, [crop | receipt]Token, [priceApi,] [reward | staking | unstaking]Value, pricePerToken, txDate}]
        const userFarmingHistory = await getUserFarmingHistory(field, userTokenTransactions, userNormalTransactions, trackedFields, userAccount);
  
        field.investmentValue = currInvestmentValue;
        field.userFarmingTxHistory = userFarmingHistory;
        field.farmingROI = helpers.calcFarmingROI(userTokens, tokenPrices, field)
      }
    }

  }

  // NOTE: beware fields that are both earning and farming
  console.log(' ---> sortedFields[0].concat(sortedFields[1]);', sortedFields[0].concat(sortedFields[1]));
  return sortedFields[0].concat(sortedFields[1]);
}

export default getROIs;