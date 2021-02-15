import { getUniswapBalanceHistory, getPairReserveUSDAtBlock } from "../../protocolQueries";

/**
 * @param {Object} blockNumber - block number at which the historical token price is sought
 * @param {String} userAccount
 * @dev - this assumes that the data from the Graph on the user's Uniswap balances will always match Etherscan's user ERC20 tx data
 *        for staking and unstaking transactions.
 *      - for reward claims, as these do not trigger an updated uniswap balance, a separate call is made to the Graph on a tx by tx basis
 *      - target token is not specified - assumes there will always only be one Uniswap tx per block 
 * @return {Object} - price of the uniswap receipt token and the date of the transaction at which it is sought
 */
async function getOneUniswapHistReceiptPrice (blockNumber, userAccount, poolAddress) {
  const rawData = await getUniswapBalanceHistory(userAccount);
  let targetBlock;
  targetBlock = rawData.data.liquidityPositionSnapshots.find(data => data.block === Number(blockNumber));

  
  // additional call in the case of reward claims
  if (!targetBlock) {
    const pairReserveData = await getPairReserveUSDAtBlock(Number(blockNumber), poolAddress);
    targetBlock = pairReserveData.data.pair;
  }
  // @dev: targetBlock will have a liquidityTokenTotalSupply property if fetched using getUniswapBalanceHistory and totalSupply if using etPairReserveUSDAtBlock
  const pricePerToken = Number(targetBlock.reserveUSD) / Number(targetBlock.liquidityTokenTotalSupply || targetBlock.totalSupply);
  const txDate = new Date(Number(targetBlock.timestamp) * 1000);
  
  return {pricePerToken, txDate};
}

export default getOneUniswapHistReceiptPrice;