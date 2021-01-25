import unclaimedBalanceInterfaceTypes from '../../data/fieldData/unclaimedBalanceTypes';

/**
 * 
 * @param {UUID} fieldId - id of the currently analysed field
 * @param {UUID} tokenId - id of the currently analysed token
 * @dev - this check is necessary due to the myriad different methods used by protocol smart contracts
 *        to check unclaimed reward balances, particularly when there are multiple crop tokens
 * @returns {String || null} - the specific type of the unclaimedBalance method
 */
function findUnclaimedBalanceType (fieldId, tokenId) {
  for (const type in unclaimedBalanceInterfaceTypes) {
    const targetInterface = unclaimedBalanceInterfaceTypes[type].find(contractInt => contractInt.tokenId === tokenId && contractInt.fieldId === fieldId)
    if (targetInterface) {
      return type;
    }
  }
  return null;
}

export default findUnclaimedBalanceType;