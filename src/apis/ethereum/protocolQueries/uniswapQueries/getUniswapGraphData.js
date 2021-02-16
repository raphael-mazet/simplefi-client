import apollo from '../../../../apollo';
import uniswapQueries from './uniswapGraphQueryStrings';

async function getUniswapPoolVolume(pairAddress, first) {
  return await apollo.uniswapClient.query(
    {
      query: uniswapQueries.getUniswapPoolVolume,
      variables: { pairAddress, first }
    })
}

//FIXME: redundant cache - Apollo already has one natively
const uniswapBalanceCache = {};
async function getUniswapBalanceHistory(userAccount) {
  if (uniswapBalanceCache[userAccount]) {
    return uniswapBalanceCache[userAccount];
  } else {
    uniswapBalanceCache[userAccount] = await apollo.uniswapClient.query(
      {
        query: uniswapQueries.getUniswapBalanceHistory,
        variables: { user: userAccount }
      })
    return uniswapBalanceCache[userAccount];
  }
}

async function getPairReserveUSDAtBlock(block, pairId) {
  return await apollo.uniswapClient.query(
    {
      query: uniswapQueries.getPairReserveUSDAtBlock,
      variables: { block, pairId }
    })
}




export {
  getUniswapPoolVolume,
  getUniswapBalanceHistory,
  getPairReserveUSDAtBlock
}
