import { getAaveBalanceHistory } from '../../protocolQueries';
import helpers from '../../../../helpers';

//TODO: sort whitelist
//HERE!!!
async function getAaveLiquidityHistory (field, receiptToken, userReceiptTokenTxs, userAccount, whitelist) {
  const rawData = await getAaveBalanceHistory(userAccount);
  const fieldBalanceHistory = rawData.data.user.reserves.filter(reserve => reserve.reserve.aToken.id === receiptToken.address.toLowerCase());
  console.log(' ---> fieldBalanceHistory', fieldBalanceHistory);

  const liquidityHistory = userReceiptTokenTxs.map(tx => {
    const txDate = new Date(Number(tx.timeStamp) * 1000);
    const targetSnapshot = fieldBalanceHistory.find(snapshot => tx.blockNumber === snapshot.block.toString());
    const pricePerToken = Number(targetSnapshot.reserveUSD) / Number(targetSnapshot.liquidityTokenTotalSupply);
    const {txIn, txOut, staked, unstaked} = helpers.sortLiquidityTxs(tx, userAccount, whitelist);
    return {tx, txDate, pricePerToken, txIn, txOut, staked, unstaked}
  })

  return liquidityHistory;
}

export default getAaveLiquidityHistory;