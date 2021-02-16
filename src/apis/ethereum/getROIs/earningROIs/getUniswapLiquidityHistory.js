import { getUniswapBalanceHistory } from '../../protocolQueries';
import helpers from '../../../../helpers';

async function getUniswapLiquidityHistory (field, userReceiptTokenTxs, userAccount, whitelist) {

  const rawData = await getUniswapBalanceHistory(userAccount);
  const fieldBalanceHistory = rawData.data.liquidityPositionSnapshots.filter(snapshot => snapshot.pair.id === field.contractAddresses[0].address.toLowerCase());
  const liquidityHistory = userReceiptTokenTxs.map(tx => {
    const txDate = new Date(Number(tx.timeStamp) * 1000);
    const targetSnapshot = fieldBalanceHistory.find(snapshot => tx.blockNumber === snapshot.block.toString());
    const {reserveUSD, liquidityTokenTotalSupply, reserve0, reserve1} = targetSnapshot;
    const pricePerToken = Number(reserveUSD) / Number(liquidityTokenTotalSupply);
    const histFieldReserves = {receiptTokenTotalSupply: Number(liquidityTokenTotalSupply), reserves: [Number(reserve0), Number(reserve1)]};
    const {txIn, txOut, staked, unstaked} = helpers.sortLiquidityTxs(tx, userAccount, whitelist);
    //NOTE: adding field and histFieldReserves currently only valid for Uniswap
    return {tx, txDate, pricePerToken, txIn, txOut, staked, unstaked, histFieldReserves}
  })

  return liquidityHistory;
}

export default getUniswapLiquidityHistory;
