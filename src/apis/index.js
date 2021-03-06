import {
  getTokens,
  getUserFieldTokens,
  getFields,
  getUserTransactions
} from './simpleFi'
import getTokenPrices from './coinGecko/getTokenPrices';
import {
  getOneAccountBalance,
  getAllUserBalances,
  getUnclaimedRewards,
  createBalanceContracts,
  rewinder,
  getAPYs,
  getROIs,
  uniswapQueries
} from './ethereum/index';

//eslint-disable-next-line import/no-anonymous-default-export
export default {
  getTokens,
  getUserFieldTokens,
  getFields,
  getUserTransactions,
  getTokenPrices,
  createBalanceContracts,
  getOneAccountBalance,
  getAllUserBalances,
  getUnclaimedRewards,
  rewinder,
  getAPYs,
  getROIs,
  uniswapQueries
}