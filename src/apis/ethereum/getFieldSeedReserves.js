import { ethers } from 'ethers';
import provider from './ethProvider';
import getTotalFieldSupply from './getTotalFieldSupply';
import helpers from '../../helpers'

//TODO: use The Graph to get reserves for fields belonging to the same protocol in bulk & reduce calls to the blockchain
/**
 * 
 * @param {Object} field - currently analysed field
 * @param {Object} token - currently analysed token
 * @param {Object} tokenContract - ethers.js contract used to query the blockchain
 * @param {Array} cache - list of the seed token reserves of each user field
 * @return {Integer} - returns the field's total reserve in the target token
 * @dev - this function has two objectives: 
 *          * return the field's token reserve
 *          * push the field's reserves to the main Rewinder() cache
 *      - the cache is then used by Rewinder to merge the field's total reserves
 *        and total supplies for downstream processing by the App 
 */
async function getFieldSeedReserves (field, token, tokenContract, cache, totalFieldSupplyCache) {
  
  //Check in cache if reserves already fetched
  const findFieldinCache = cache.filter(fieldWithReserves => fieldWithReserves.fieldName === field.name)[0];
  if (findFieldinCache) {
    const seedIndex = findFieldinCache.seedReserves.findIndex(seed => seed.tokenName === token.name);
    if (seedIndex !== -1) {
      return findFieldinCache.seedReserves[seedIndex].fieldReserve;
    }
  }

  const reserveAddress = helpers.findFieldAddressType(field, 'underlying');
  const { addressType, address, abi } = reserveAddress;

  const decimals = token.decimals;
  const tokenIndex = token.seedIndex;

  let fieldReserve;
  
  //FIXME: seems all Curve swap/pool addresses can use the CurveSwap function
  //CHECK: curveSNX is used when a second reward is provided
  switch (addressType) {

    case "curveSwap":
      
      //CHECK: this check is needed because of multiple calls to getFieldSeedReserves for the same fields
      if (!field.fieldContracts.underlyingContract) {
        field.fieldContracts.underlyingContract = new ethers.Contract(address, abi, provider);
      }
      fieldReserve = await field.fieldContracts.underlyingContract.balances(tokenIndex);
      fieldReserve = ethers.utils.formatUnits(fieldReserve, decimals)
      break;

    case "curveSNX":

      if (!field.fieldContracts.underlyingContract) {
        field.fieldContracts.underlyingContract = new ethers.Contract(address, abi, provider);
      }
      const fieldDepositContract = field.contractAddresses.find(contractAddress => contractAddress.addressTypes.includes('deposit'));
      fieldReserve = await field.fieldContracts.underlyingContract.balanceOf(fieldDepositContract.address);
      fieldReserve = ethers.utils.formatUnits(fieldReserve, decimals)
      break;

    case "uniswap":
      const uniReserveContract = field.fieldContracts.balanceContract.contract;
      const _fieldReserves = await uniReserveContract.getReserves();
      fieldReserve = Number(ethers.utils.formatUnits(_fieldReserves[tokenIndex], decimals));
      break;

    case "aave":
      //FIXME: unnecessarily convoluted, requires import of getTotalFieldSupply
      //FIXME: is the same as the total aToken supply as pegged 1:1 to underlying asset
      //FIXME: consider bulk subgraphQuery
      fieldReserve = await getTotalFieldSupply (field.name, field.fieldContracts.balanceContract, decimals, totalFieldSupplyCache);
      break;
    
      default:
      fieldReserve = await tokenContract.contract.balanceOf(address);
      fieldReserve = Number(ethers.utils.formatUnits(fieldReserve, decimals));
  }
  
  if (findFieldinCache) {
    findFieldinCache.seedReserves.push({
      tokenName: token.name,
      fieldReserve
    })
  } else {
    cache.push({
    fieldName: field.name, 
    seedReserves: [{tokenName: token.name, fieldReserve}]
    })
  }

  return fieldReserve;
}

export default getFieldSeedReserves