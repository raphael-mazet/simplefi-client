import { getAllCurvePoolRawAPY, curveEPs } from '../../protocolQueries'

const { indivPoolEPs } = curveEPs

async function getCurveEarningAPY (field) {
  const { name } = field;
  const latestAPYs = await getAllCurvePoolRawAPY();
  const epKey = indivPoolEPs[name];
  console.log(' ---> name', name);
  console.log(' ---> latestAPYs.apy.day[epKey]', latestAPYs.apy.day[epKey]);
  return latestAPYs.apy.day[epKey];
}

export default getCurveEarningAPY;