/**
 * 
 * @param {Array} userReceiptTokenTxs all user tx of the target earning field's receipt tokens
 * @param {Array} relatedFarmReceiptTokenTxs all user tx of related farm field receipt tokens
 * @dev this assumes that
 *        - at least one of the two input arrays will have a length
 *        - Etherscan will always return a properly date-ordered list of user ERC20 txs
 * @returns {Array} - a combined array of both token transactions ordered by date / blockNumber
 *                    where relatedFarmReceiptTokenTxs are flagged for processing by sortLiquidityTxs()
 */
export default function sortReceiptAndRelatedTxs (userReceiptTokenTxs, relatedFarmReceiptTokenTxs) {
  let sortedReceiptAndRelatedTxs = [];

  if (!relatedFarmReceiptTokenTxs.length) {
    sortedReceiptAndRelatedTxs = userReceiptTokenTxs;
  
  } else if (!userReceiptTokenTxs.length) {
    sortedReceiptAndRelatedTxs = relatedFarmReceiptTokenTxs.map(relatedTx => {
      relatedTx.directRelatedFarmReceiptTx = true;
      return relatedTx
    });

  } else {
    sortedReceiptAndRelatedTxs = [...userReceiptTokenTxs];
    relatedFarmReceiptTokenTxs.forEach(relatedTx => {
  
      for (let i = 0; i < sortedReceiptAndRelatedTxs.length; i++) {
  
        if (relatedTx.blockNumber !== sortedReceiptAndRelatedTxs[i].blockNumber) {
  
          if (
            Number(relatedTx.blockNumber) < Number(sortedReceiptAndRelatedTxs[i].blockNumber)
            && (i === 0 || Number(relatedTx.blockNumber) > (Number(sortedReceiptAndRelatedTxs[i -1 ].blockNumber)))
          ) {
            relatedTx.directRelatedFarmReceiptTx = true;
            sortedReceiptAndRelatedTxs = [...sortedReceiptAndRelatedTxs.slice(0, i), relatedTx, ...sortedReceiptAndRelatedTxs.slice(i)]
  
          } else if (
            Number(relatedTx.blockNumber) > Number(sortedReceiptAndRelatedTxs[i].blockNumber)
            && !sortedReceiptAndRelatedTxs[i + 1]
          ) {
            relatedTx.directRelatedFarmReceiptTx = true;
            sortedReceiptAndRelatedTxs = [...sortedReceiptAndRelatedTxs, relatedTx]
          }
        }
      }
    })
  }

  return sortedReceiptAndRelatedTxs;
}