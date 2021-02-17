/**
 * 
 * @param {Object} field currently analysed farming field
 * @param {Array} userTokenTransactions all user ERC20 transactions
 * @param {Array} userNormalTransactions all user "normal" transactions
 * @param {Array} trackedTokens all tokens tracked by SimpleFi
 * @param {String} userAccount currently analysed user's address
 * @return {Array} - user farming transactions sorted by type: staking, unstaking or claim
 *                   type is deduced from the [staking | unstaking | reward]Amount property
 * @dev - note that the farmSeedToken property is added to all transactions, even reward claims
 *        this is because for reward claims it will be used to get an accurate read of the historical 
 *        balance in the Farming details page transaction table
 */       

function sortFarmingTxs(field, userTokenTransactions, userNormalTransactions, trackedTokens, userAccount) {
  const rewardDepositContract = field.contractAddresses.find(contractAddress => contractAddress.addressTypes.includes('deposit'));
  const rewardWithdrawalContract = field.contractAddresses.find(contractAddress => contractAddress.addressTypes.includes('withdraw'));
  
  const cropTokenAddresses = {};
  field.cropTokens.forEach(cropToken => {
    cropTokenAddresses[cropToken.address.toLowerCase()] = cropToken;
  });

  //@dev: assumes only one seed token per staking/farming field
  const farmSeedToken = field.seedTokens[0];
  const farmReceiptToken = trackedTokens.find(trackedToken => trackedToken.tokenId === field.receiptToken);

  /*@dev: Etherscan often sends duplicate ERC20 tx records (same hash, different contract address) 
          when a user interacts with different contracts within the same transaction. This filters them.
  */
  function isDupe(acc, tx) {
    return acc.some(sortedTx => (sortedTx.tx.value === tx.value && sortedTx.tx.hash === tx.hash));
  }

  const sortedTxs = userTokenTransactions.reduce((acc, tx) => { //eslint-disable-line array-callback-return

    //identify rewards claimed
    if (cropTokenAddresses[tx.contractAddress]) {
      //Check if reward address is in input method rather than from address
      let addressInMethod = false;
      if (tx.from === '0x0000000000000000000000000000000000000000') {
        const referenceTx = userNormalTransactions.find(normalTx => normalTx.hash === tx.hash);
        if (referenceTx) {
          const methodInput = '0x' + referenceTx.input.slice(-40);
          if (methodInput === rewardWithdrawalContract.address.toLowerCase()) addressInMethod = true;
        }
      }

      //CHECK: should this rather be named unclaimedReward contract?
      if (tx.from === rewardWithdrawalContract.address.toLowerCase() || addressInMethod) {
        const cropToken = cropTokenAddresses[tx.contractAddress];
        //@dev: assumes all crop tokens are base tokens in DB
        const {priceApi, decimals} = cropToken
        const rewardAmount = tx.value / Number(`1e${decimals}`);
        return isDupe(acc, tx) ? acc : [...acc, {tx, cropToken, priceApi, rewardAmount, farmSeedToken}];
      } else {
        return acc;
      }

    //identify (un)staking tx
    } else if (tx.contractAddress === farmSeedToken.address.toLowerCase() || tx.contractAddress === farmReceiptToken?.address.toLowerCase()) {
      // transactions where the user has explicitly (un)staked
      if (tx.contractAddress === farmSeedToken.address.toLowerCase()) {
        //identify staking tx
        //@dev: assumes the correct deposit method was used
        if (tx.to === rewardDepositContract.address.toLowerCase()) {
          const stakingAmount = tx.value / Number(`1e${farmSeedToken.decimals}`);
          return isDupe(acc, tx) ? acc : [...acc, {tx, farmSeedToken, stakingAmount}];
          //identify unstaking tx
        } else if (tx.from === rewardWithdrawalContract.address.toLowerCase()) {
          const unstakingAmount = tx.value / Number(`1e${farmSeedToken.decimals}`);
          return isDupe(acc, tx) ? acc : [...acc, {tx, farmSeedToken, unstakingAmount}];
        } else {
          return acc;
        }

      /* transactions where the user was simply sent the farms receipt token (when it exists)
           - the "else if" should exclude duplicating transactions (i.e. the user received or
             burnt farm receipt tokens when performing an explicit (un)staking tx)
           - this function assumes that the amount of farmReceiptTokens minted/burnt is always
             pegged 1:1 with the seed farmSeedToken that is (un)staked 
      */
      } else if (tx.contractAddress === farmReceiptToken?.address.toLowerCase()) {

        if (tx.to === userAccount.toLowerCase()) {
          const stakingAmount = tx.value / Number(`1e${farmSeedToken.decimals}`);
          return isDupe(acc, tx) ? acc : [...acc, {tx, farmSeedToken, stakingAmount}];
        } else if (tx.from === userAccount.toLowerCase()) {
          const unstakingAmount = tx.value / Number(`1e${farmSeedToken.decimals}`);
          return isDupe(acc, tx) ? acc : [...acc, {tx, farmSeedToken, unstakingAmount}];
        } else {
          return acc;
        }
      }

    } else {
      return acc;
    }
  }, []);
  
  return sortedTxs;
}

export default sortFarmingTxs;