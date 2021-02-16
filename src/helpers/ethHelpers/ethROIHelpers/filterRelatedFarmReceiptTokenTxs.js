/**
 * 
 * @param {Array} trackedFields all fields tracked by SimpleFi
 * @param {Array} trackedTokens all tokens tracked by SimpleFi
 * @param {Array} userTokenTransactions all ERC20 transactions made by the user
 * @param {Object} receiptToken the currently analysed earning field's receipt token
 * @returns {Array} - an array of all user transactions for the receipt tokens of any related farming field
 */
export default function filterRelatedFarmReceiptTokenTxs(trackedFields, trackedTokens, userTokenTransactions, receiptToken) {
  const relatedFarmsWithReceiptTokens = trackedFields.filter(trackedField => {
    if (trackedField.receiptToken && !trackedField.isEarning) {
      return trackedField.seedTokens.some(seedToken => seedToken.tokenId === receiptToken.tokenId);
    }
    return false;
  })

  const relatedFarmReceiptTokens = relatedFarmsWithReceiptTokens.map(relatedField => trackedTokens.find(trackedToken => trackedToken.tokenId === relatedField.receiptToken));
  const relatedFarmReceiptTokenTxs = relatedFarmReceiptTokens.reduce((acc, curr) => acc.concat(userTokenTransactions.filter(tx => tx.contractAddress === curr.address.toLowerCase())), []);
  
  return relatedFarmReceiptTokenTxs
}