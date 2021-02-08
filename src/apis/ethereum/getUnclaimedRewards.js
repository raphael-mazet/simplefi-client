import { ethers } from 'ethers';
import provider from './ethProvider';
import helpers from '../../helpers';


/**
 * 
 * @param {String} userAccount - currently analysed user account
 * @param {Array} trackedFields - all fields tracked by SimpleFi
 * @dev - we assume that the same contract address is used to check the balance of multiple
 *        crop tokens (albeit with different methods saved in the cropToken DB table)
 *      - most methods to check unclaimed balances will only require one argument (the userAccount)
 *        but others will require more (e.g. the token address), hence the necessity of the switch statement
 *      - note that the method name for checking balances varies from contract to contract
 *        (and/or token to token when multiple crops) and is stored in the SimpleFi DB
 * @returns {Array} - array of objects containing the field, tokenId, and unclaimedBalance
 */
async function getUnclaimedRewards(userAccount, trackedFields) {
  const unclaimedCropBalances = [];
  const farmFields = trackedFields.filter(field => field.cropTokens.length)

  for (let field of farmFields) {
    const { cropTokens, fieldId } = field;
    for (let cropToken of cropTokens) {
      const { tokenId } = cropToken;
      const balanceInterface = helpers.findUnclaimedBalanceType(fieldId, tokenId)

      //identify the contract used for checking unclaimed balances and create an ethers.js contract interface
      try {
        const targetAddress = field.contractAddresses.find(contract => contract.addressTypes.includes('unclaimedReward'));
        const unclaimedRewardContract = new ethers.Contract(targetAddress.address, targetAddress.contractInterface.abi, provider);
        let unclaimedBalance;
        
        switch (balanceInterface) {
          case 'altCurveRewardGauge':
            unclaimedBalance = await unclaimedRewardContract[cropToken.unclaimedBalanceMethod](userAccount, cropToken.token.address);
            break;

          default: 
            unclaimedBalance = await unclaimedRewardContract[cropToken.unclaimedBalanceMethod](userAccount);
        }

        unclaimedBalance = Number(ethers.utils.formatUnits(unclaimedBalance, targetAddress.decimals));
        if (unclaimedBalance) {
          unclaimedCropBalances.push({field, tokenId, unclaimedBalance});
        }
      } catch (err) {
        console.error('Unclaimed rewards error', err);
      }
    }
  }
  return unclaimedCropBalances;
}

export default getUnclaimedRewards;