import { getUniswapBalanceHistory, getPairReserveUSDAtBlock } from "../../protocolQueries";

/**
 * @param {Object} blockNumber - block number at which the historical token price is sought
 * @param {String} userAccount
 * @dev - this assumes that the data from the Graph on the user's Uniswap balances will always match Etherscan's user ERC20 tx data
 *        (it should as the Graph records balance changes on block within which user staked/unstaked the receipt token)
 *        note: target token is not specified - assumes there will always only be one Uniswap tx per block 
 * @return {Object} - price of the uniswap receipt token and the date of the transaction at which it is sought
 */
async function getOneUniswapHistReceiptPrice (blockNumber, userAccount, poolAddress) {
  const rawData = await getUniswapBalanceHistory(userAccount);
  console.log(' ---> rawData', rawData);
  let targetBlock;
  targetBlock = rawData.data.liquidityPositionSnapshots.find(data => data.block === Number(blockNumber));
  //FIXME: if no raw data, implement the pair uniswap query here!!!
  if (!targetBlock) {
    console.log(' ---> poolAddress', poolAddress);
    console.log(' ---> Number(blockNumber', Number(blockNumber));
    const pairReserveData = await getPairReserveUSDAtBlock(Number(blockNumber), poolAddress);
    console.log(' ---> pairReserveData', pairReserveData);
    targetBlock = pairReserveData.data.pair;
    console.log(' ---> targetBlock', targetBlock);
  }
  const pricePerToken = Number(targetBlock.reserveUSD) / Number(targetBlock.liquidityTokenTotalSupply);
  const txDate = new Date(Number(targetBlock.timestamp) * 1000);
  
  return {pricePerToken, txDate};
}

export default getOneUniswapHistReceiptPrice;