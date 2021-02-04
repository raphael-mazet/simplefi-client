import { getAaveBalanceHistory } from '../../protocolQueries';
import { getHistoricalPrice } from '../../../coinGecko/getHistoricalPrice';
import helpers from '../../../../helpers';

//TODO: sort whitelist
//HERE!!!
async function getAaveLiquidityHistory (field, receiptToken, userReceiptTokenTxs, userAccount, whitelist) {
  const rawData = await getAaveBalanceHistory(userAccount);
  const fieldBalanceHistory = rawData.data.user.reserves
    .filter(reserve => reserve.reserve.aToken.id === receiptToken.address.toLowerCase())
      [0].aTokenBalanceHistory;

  /*@dev: this await is meant to ensure only one call is made to Coingecko
          it assumes that Etherscan always returns the earliest user transaction first
          without this, userReceiptTokenTxs are mapped before the price cache can be initialised
  */
  await getHistoricalPrice(receiptToken.priceApi, userReceiptTokenTxs[0].timeStamp);

  const liquidityHistory = userReceiptTokenTxs.map(async tx => {
    const targetSnapshot = fieldBalanceHistory.find(snapshot => Number(tx.timeStamp) === snapshot.timestamp)
    const pricePerToken = await getHistoricalPrice(receiptToken.priceApi, tx.timeStamp);

    const txDate = new Date(Number(tx.timeStamp) * 1000);
    const {txIn, txOut, staked, unstaked} = helpers.sortLiquidityTxs(tx, userAccount, whitelist);
    return {tx, txDate, pricePerToken, txIn, txOut, staked, unstaked}
  })

  return liquidityHistory;
}

export default getAaveLiquidityHistory;