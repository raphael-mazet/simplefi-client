import { getAaveReserveLiquidityRate } from '../../protocolQueries';

const aavePoolV2Address = '0xb53c1a33016b2dc2ff3653530bff1848a515c8c5';
const rayDecimalsDivisor = 1e27;

async function getAaveEarningAPY (field) {
  // @dev: aave reserves only have one seed
  const reserveId = field.seedTokens[0].address.toLowerCase() + aavePoolV2Address;
  const rawQueryData = await getAaveReserveLiquidityRate(reserveId);
  const { liquidityRate } = rawQueryData.data.reserves[0]
  return liquidityRate/rayDecimalsDivisor
}

export default getAaveEarningAPY;