import getSnxFarmingAPY from './getSnxFarmingAPY';
import getCurveFarmingAPY from './getCurveFarmingAPY';

/**
 * 
 * @param {Object} field - currently analysed field
 * @param {Array} userTokenPrices - current prices of the user's tokens
 * @dev - fields are sorted according to their contract interface names. Take this into account when adding fields to DB
 *      - formula for field APY: (yearlyReward * cropPrice) / (totalSupply * seedPrice)
 *      - user APY is determined based on their ownership % of the pool
 * @returns {Float || Object} - either a primary field APY, or in the case where a farming field has multiple reward tokens,
 *                              an object containing the primary APY, the secondary APYs and a combined APY
 */
//TODO: ¿refactor to add secondary Farming APY - already provided in sub functions (e.g. getCurveFarmingAPY)?
async function getFarmingAPYs (field, userTokenPrices) {
  const rewardRateAddress = field.contractAddresses.find(address => address.addressTypes.includes('rewardRate'));

  let APY;
  
  switch (rewardRateAddress.contractInterface.name) {
    
    case "synthetix susd farm":
    case "mstable farm":
    case "1inch governance rewards":
        //CHECK: rename function if used for more than one field?
        APY = await getSnxFarmingAPY(rewardRateAddress, field, userTokenPrices);
        break;
        
    case 'curve reward gauge':
    case 'alt curve reward gauge (2 claimable_reward args)':
      APY = await getCurveFarmingAPY(rewardRateAddress, field, userTokenPrices);
      break;

    default:
      APY = 'undefined';
  }
  return APY;
}

export default getFarmingAPYs;