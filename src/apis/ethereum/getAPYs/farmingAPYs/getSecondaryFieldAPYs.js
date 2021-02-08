import getFarmingAPYs from './getFarmingAPYs';
import provider from '../../ethProvider';
import { ethers } from 'ethers';


/**
 *    
 * @param {Object} primaryField - user field currently analysed
 * @param {Array} userTokenPrices - list of current prices of user tokens
 * @param {Integer} primaryCropIndex position in the SimpleFi DB of the currently analysed crop token
 * @dev - this function triggers a recursive call to getFarmingAPYs, as
 *        it is called by field-specific sub-functions of getFarmingAPYs
 *      - the main aim of this function is simply to prep the secondary field for processing by getFarmingAPYs
 */
export default async function getSecondaryFieldAPYs(primaryField, userTokenPrices, primaryCropIndex) {
  const cropAPYs = [];
  let cropIndex = 0;

    for (let cropToken of primaryField.cropTokens) {
      if (cropIndex !== primaryCropIndex) {
        //identify which field the target secondary crop comes from
        const { secondaryField } = primaryField.secondaryFields.find(secondaryField => {
          return secondaryField.secondaryField.cropTokens.some(secondaryCropToken => {
            return secondaryCropToken.token.tokenId === cropToken.tokenId
          })
        })

        //reformat the secondary field to be processed by getFarmingAPY
        //@dev: lifts data up from the primaryField's secondaryField property
        secondaryField.cropTokens.forEach(targetCropToken => {
          targetCropToken.name = targetCropToken.token.name;
          targetCropToken.contractInterface = targetCropToken.token.contractInterface;
          targetCropToken.decimals = targetCropToken.token.decimals;
        });
        secondaryField.seedTokens.forEach(targetSeedToken => {
          targetSeedToken.name = targetSeedToken.token.name;
        });

        //add secondaryFieldTotalSupply for use in APY calculation
        //CHECK: worth checking from fieldSuppliesAndReserves cache in App.js?
        const {address, contractInterface} = secondaryField.contractAddresses.find(contractAddress => contractAddress.addressTypes.includes('balance'));
        const secondaryFieldBalanceContract = new ethers.Contract(address, contractInterface.abi, provider);
        const secondarySupplyBigInt = await secondaryFieldBalanceContract.totalSupply();

        secondaryField.totalSupply = Number(ethers.utils.formatUnits(secondarySupplyBigInt, cropToken.decimals));

        const cropAPY = await getFarmingAPYs(secondaryField, userTokenPrices);
        cropAPYs.push({cropAPY, cropToken, secondaryField});
      }
      cropIndex ++;
    }
  return cropAPYs;
}
