//FIXME: documentation incorrect
/**
 * 
 * @param {Number} investmentValue - current value of investment in analysed field
 * @param {Array} txHistory - pre-sorted list of user interactions with analysed field
 * @return {Number} - user ROI to date with regards to the analysed field, defined as:
 *                    (current investment value + sum of realised exits [txOut]) / sum of historical investments [txIn]
 */
function calcFarmingROI (investmentValue, txHistory, userTokens, tokenPrices, fieldCropTokens) {
  let amountClaimed = 0;
  let amountUnclaimed = 0;
  let amountInvested = 0;
  let amountRealised = 0;
  //@dev: [{tx, [crop | receipt]Token, [priceApi,] [reward | staking | unstaking]Value, pricePerToken}]
  txHistory.forEach(userTx => {
    const { rewardValue, stakingValue, unstakingValue, pricePerToken} = userTx;
    if (rewardValue) {
      amountClaimed += rewardValue * pricePerToken;
    } else if (stakingValue) {
      amountInvested += stakingValue * pricePerToken;
    } else if (unstakingValue) {
      amountRealised += stakingValue * pricePerToken;
    }
  })

  const targetCropTokens = userTokens.filter(userToken => fieldCropTokens.includes(cropToken => userToken.tokenId === cropToken.tokenId));
  targetCropTokens.forEach(token => {
    amountUnclaimed += token.unclaimedBalance.reduce((acc, curr) => acc += curr.balance * tokenPrices[curr.priceApi].usd, 0)
  })

  return ((investmentValue + amountUnclaimed + amountClaimed + amountRealised) / amountInvested) - 1;    
}

export default calcFarmingROI;