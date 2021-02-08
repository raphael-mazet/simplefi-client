import { ethers } from 'ethers';
import provider from '../../ethProvider';
import { getTotalAnnualReward, getFieldRewardPercent } from '../../protocolQueries/curveQueries/getCurveGaugeConstants';
import getSecondaryFieldAPYs from './getSecondaryFieldAPYs';

/**
 * 
 * @param {Object} rewardRateAddress - contains properties for the Curve farming field's "rewardRate contract address
 *                                     { address (:String), addressTypes (:Array), contractInterface (:Object that incl. ABI) }
 * @param {Object} field - currently analysed Curve farming field
 * @param {Object} userTokenPrices - index of current user token prices
 * @dev - rewardRateContract will be used to extract the crop reward per second and multiply it to get annual rewards
 *      - the .inflation_rate() method produces the same result for all pool gauge contracts (it is the rate of total CRV distribution to gauges
 *        and is the same as the CRV token contract's .rate() method
 *      - see additional specific notes below and in helper methods for guidance
 * @returns {Float || Object} - either the primary reward APY or an object with the primary, secondary and combined APY
 */
//CHECK: newer Curve reward gauge contracts don't have a DURATION() method to check if farming timeperiod has ended. May be now handled by the master Curve gauge controller
//TODO: figure out the veCRV boost situation
async function getCurveFarmingAPY(rewardRateAddress, field, userTokenPrices) {

  const curveIndex = field.cropTokens.length === 1 ? 0 : field.cropTokens.findIndex(cropToken => cropToken.name === 'Curve');
  const curveDecimals = field.cropTokens[curveIndex].decimals;
  const rewardWeightAddress = field.contractAddresses.find(address => address.addressTypes.includes('rewardWeight'));
  const rewardRateContract = new ethers.Contract(rewardRateAddress.address, rewardRateAddress.contractInterface.abi, provider);
  const rewardWeightContract = new ethers.Contract(rewardWeightAddress.address, rewardWeightAddress.contractInterface.abi, provider);
  
  const totalAnnualReward = await getTotalAnnualReward(rewardRateContract, curveDecimals);
  const fieldRewardPercent = await getFieldRewardPercent(rewardWeightContract, rewardRateAddress.address, curveDecimals);

  const curveAnnualPayout = totalAnnualReward * fieldRewardPercent;
  const { totalSupply } = field;

  //@dev: this assumes there is just one seed
  const seedPrice = userTokenPrices[field.seedTokens[0].name].usd;

  //get primary Curve APY
  const cropPrice = userTokenPrices[field.cropTokens[curveIndex].name].usd;
  const curveCropAPY = (curveAnnualPayout * cropPrice) / (totalSupply * seedPrice);
  
  //additional crop token APYs
  if (field.cropTokens.length > 1) {
    //@dev - getSecondaryFieldAPYs will trigger a recursive call to getFarmingAPYs
    const additionalCropAPYs = await getSecondaryFieldAPYs(field, userTokenPrices, curveIndex);
    const secondaryAPY = additionalCropAPYs.reduce((acc, additionalAPY) => acc += additionalAPY.cropAPY, 0);
    return {
      combinedAPY: curveCropAPY + secondaryAPY,
      primaryAPY: {name: 'Curve', APY: curveCropAPY},
      secondaryAPYs: additionalCropAPYs //{cropAPY, cropToken, secondaryField}
    }
  } else {
    return curveCropAPY;
  }
}

  export default getCurveFarmingAPY;