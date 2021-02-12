import {
  getUniswapPoolVolume,
  getUniswapBalanceHistory,
  getPairReserveUSDAtBlock
} from './uniswapQueries/getUniswapGraphData';
import uniswapQueries from './uniswapQueries/uniswapGraphQueryStrings';
import {
  getAaveReserveLiquidityRate,
  getAaveBalanceHistory
} from './aaveQueries/getAaveSubgraphData';
import aaveQueries from './aaveQueries/aaveSubgraphQueryStrings';
import {
  getOneCurvePoolRawData,
  getAllCurvePoolRawAPY
} from './curveQueries/getRawCurvePoolData';
import curveEPs from './curveQueries/curveRawStatsEPs'

//eslint-disable-next-line import/no-anonymous-default-export
export {
  getUniswapPoolVolume,
  getUniswapBalanceHistory,
  getPairReserveUSDAtBlock,
  uniswapQueries,
  getAaveReserveLiquidityRate,
  getAaveBalanceHistory,
  aaveQueries,
  getOneCurvePoolRawData,
  getAllCurvePoolRawAPY,
  curveEPs
}