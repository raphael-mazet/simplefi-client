import { getAaveBalanceHistory } from '../../protocolQueries';
import { getHistoricalPrice } from '../../../coinGecko/getHistoricalPrice';
import helpers from '../../../../helpers';

async function getAaveLiquidityHistory (receiptToken, userReceiptTokenTxs, userAccount, whitelist) {
  const rawData = await getAaveBalanceHistory(userAccount);
  const rawDataFilteredByReceiptToken = rawData.data.user.reserves.filter(reserve => reserve.reserve.aToken.id === receiptToken.address.toLowerCase());
  
  let liquidityHistory = [];
  /* @dev: - this if statement is necessary because aTokens can be used in other earning fields (e.g. Curve aave pool)
           that have multiple seed tokens, but only need to provide one. This means that the user owns a % of an
           underlying field (e.g. Aave Dai deposit) with which they may have never interacted directly
           (i.e. no record of receipt token transactions)
           - Note: this check is currently unnecessary due to the excludeFeeder flag created by Rewinder()
             & processed upstream to this function
  */
  if (rawDataFilteredByReceiptToken.length) {
    const fieldBalanceHistory = rawDataFilteredByReceiptToken[0].aTokenBalanceHistory;
    
    /*@dev: this await initialises the getHistoricalPrice cache and ensures only
          one call is made to Coingecko. It assumes that Etherscan always returns
          userReceiptTokenTxs ordered by ascending date (earliest at index [0])
    */
    await getHistoricalPrice(receiptToken.priceApi, userReceiptTokenTxs[0].timeStamp);
  
    liquidityHistory = userReceiptTokenTxs.map(async tx => {
      const targetSnapshot = fieldBalanceHistory.find(snapshot => Number(tx.timeStamp) === snapshot.timestamp);
      const userBalanceAfterTx = Number(targetSnapshot.currentATokenBalance)/Number(`1e${receiptToken.decimals}`);
      const pricePerToken = await getHistoricalPrice(receiptToken.priceApi, tx.timeStamp);
  
      const txDate = new Date(Number(tx.timeStamp) * 1000);
      const {txIn, txOut, staked, unstaked} = helpers.sortLiquidityTxs(tx, userAccount, whitelist);
      return {tx, txDate, pricePerToken, txIn, txOut, staked, unstaked, userBalanceAfterTx}
    })
  }

  return liquidityHistory;
}

export default getAaveLiquidityHistory;