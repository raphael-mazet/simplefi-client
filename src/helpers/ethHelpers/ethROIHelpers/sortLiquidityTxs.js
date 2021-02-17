/**
 * 
 * @param {Object} tx - currently analysed tx (filtered from Etherscan fetch of user ERC20 transfer history)
 * @param {String} userAccount user Ethereum address
 * @param {Array} whitelist - list of seed token staking addresses to or from which
 *                            transactions don't change the user's underlying holding
 * @dev - the whitelist is essentially a list of related farming field addresses in which the user will either stake or unstake
 *        receipt tokens of the currently analysed earning field.
 *      - the directRelatedFarmReceiptTx flag indicates when the user was sent related farm field receipt tokens directly, without having 
 *        to stake or unstake the earning field's receipt token directly.
 *                            
 */
//FIXME: provide for txIn/Out and (un)Stake are done in the same tx
function sortLiquidityTxs (tx, userAccount, whitelist) {
  let txIn, txOut;
  let staked, unstaked;
  const txAmount = tx.value / Number(`1e${tx.tokenDecimal}`);

  if (!tx.directRelatedFarmReceiptTx) {
    if (tx.from === userAccount.toLowerCase()) {
      if (whitelist.includes(tx.to)) {
        staked = txAmount;
      } else {
        txOut = txAmount;
      }
    } else {
      if (whitelist.includes(tx.from)) {
        unstaked = txAmount;
      } else {
        txIn = txAmount;
      }
    }

  } else {
    if (tx.from === userAccount.toLowerCase()) {
      txOut = txAmount;
    } else if (tx.to === userAccount.toLowerCase()) {
      txIn = txAmount;
    } else {
      console.log('Error sorting liquidity transactions: farm receipt tx neither to or from user account');
    }
  }

  return {txIn, txOut, staked, unstaked}
}

export default sortLiquidityTxs;