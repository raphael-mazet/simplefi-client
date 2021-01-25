function populateFieldTokensFromCache (fieldsWithBalance, trackedTokens) {
  fieldsWithBalance = fieldsWithBalance.map(field => {
    
    field.cropTokens = field.cropTokens.map(token => {
      const { unclaimedBalanceMethod } = token
      return {
        ...trackedTokens.find(trackedToken => token.tokenId === trackedToken.tokenId),
        unclaimedBalanceMethod
      }
    });
    
    field.seedTokens = field.seedTokens.map(token => {
      const { seedIndex } = token;
      return {
        ...trackedTokens.find(trackedToken => token.tokenId === trackedToken.tokenId),
        seedIndex
      }
    });
    
    return field;
  })

  return fieldsWithBalance;
}

export default populateFieldTokensFromCache;