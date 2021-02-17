/**
 * 
 * @param {Object} currentField - currently analysed farming field
 * @param {Array} userFields - all user fields
 * @returns: - the field's seed token if it is base
 *           - the seed tokens of this farm's feeder field otherwise
 */
// NOTE: assumes a single seed token for farming fields
export default function findUnderlyingFarmingTokens (currentField, userFields) {
  if (currentField.seedTokens[0].isBase) {
    return currentField.seedTokens;
  } else {
    return userFields.find(userField => userField.receiptToken === currentField.seedTokens[0].tokenId).seedTokens;
  }
}