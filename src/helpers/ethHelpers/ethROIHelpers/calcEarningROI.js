/**
 *
 * @param {Number} currInvestmentValue - current value of investment in analysed field
 * @param {Array} txHistory - pre-sorted list of user interactions with analysed field
 * @return {Number} - user ROI to date with regards to the analysed field, defined as:
 *                    (current investment value + sum of realised exits [txOut]) / sum of historical investments [txIn]
 */
function calcEarningROI (currInvestmentValue, txHistory, field, tokenPrices) {
  let valueInvested = 0;
  let valueRealised = 0;
  //NOTE: histFieldReserves, feeData and realisedRelativeProfitValue only valid for Uniswap for now
  let realisedRelativeProfitValue = 0;
  let unrealisedRelativeProfitValue = 0;
  let totalRelativeROI = 0;
  let userReceiptBalanceAfterLastTx = 0;
  let seedTokensInvested = [0,0];
  
  txHistory.forEach(tx => {
    const { txIn, txOut, pricePerToken, histFieldReserves } = tx;
    if (txIn || txOut) {
      txIn ? valueInvested += txIn * pricePerToken : valueRealised += txOut * pricePerToken;

      if (histFieldReserves) {
        calcRealisedRelativeProfit(tx);
      }
    }
    //NOTE: valid for Uniswap - assumes just 2 reserve tokens
  })
  const absReturnValue = currInvestmentValue + valueRealised - valueInvested;
  const allTimeROI = ((currInvestmentValue + valueRealised) / valueInvested) - 1;

  //TODO: clean this spaghetti up and add to parent instead
  if (field.contractAddresses[0].contractInterface.name === 'uniswap V2 earn') {
    calcUnrealisedRelativeProfit();
    totalRelativeROI = (realisedRelativeProfitValue + unrealisedRelativeProfitValue) / valueInvested;
  }
  
  return {allTimeROI, absReturnValue, histInvestmentValue: valueInvested, relativeProfit: {realisedProfitValue: realisedRelativeProfitValue, unrealisedProfitValue: unrealisedRelativeProfitValue, totalRelativeROI}};


  function calcRealisedRelativeProfit (tx) {
    const { txIn, txOut, pricePerToken, histFieldReserves } = tx;
    const {receiptTokenTotalSupply, reserves} = histFieldReserves;
    if (txIn) {
      const additionalUserReceiptPercent = txIn / receiptTokenTotalSupply;
      seedTokensInvested = seedTokensInvested.map((prevInvestment, i) => prevInvestment + reserves[i] * additionalUserReceiptPercent);
      userReceiptBalanceAfterLastTx += txIn;
  
    } else if (txOut) {
      // NOTE: case 1: the user is withdrawing liquidity - assumes that any receipt token transfer to the "withdraw" address is a withdrawal
      // NOTE: this obviously imperfect and needs to be improved
      const fieldWithdrawContract = field.contractAddresses.find(contractAddress => contractAddress.addressTypes.includes('withdraw'));
      if (tx.tx.to === fieldWithdrawContract.address.toLowerCase()) {
        const totalReceiptTokenSupplyB4Withdraw = receiptTokenTotalSupply + txOut;
        const userPercentageofTotalSupplyB4Withdraw = userReceiptBalanceAfterLastTx / totalReceiptTokenSupplyB4Withdraw;
        const poolPercentageWithdrawn = txOut / totalReceiptTokenSupplyB4Withdraw;
        const percentOfUserBalanceWithdrawn = txOut / userReceiptBalanceAfterLastTx;

        const totalReservesBeforeWithdraw = reserves.map(reserve => reserve / (1 - poolPercentageWithdrawn));
        const userReserveBalancesB4Withdraw = totalReservesBeforeWithdraw.map(totalReserve => totalReserve * userPercentageofTotalSupplyB4Withdraw);
        const netReserveProfits = userReserveBalancesB4Withdraw.map((userReserveBalance, i) => (userReserveBalance - seedTokensInvested[i]) * percentOfUserBalanceWithdrawn);
        seedTokensInvested = seedTokensInvested.map(reserve => reserve *= 1 - percentOfUserBalanceWithdrawn);
        userReceiptBalanceAfterLastTx -= txOut;
        const pricesPerReserveToken = reserves.map(reserve => ((receiptTokenTotalSupply * pricePerToken) / 2) / reserve);
        realisedRelativeProfitValue += netReserveProfits[0] * pricesPerReserveToken[0] + netReserveProfits[1] * pricesPerReserveToken[1];
        
        //NOTE: case 2: the user is simply transferring the token to another address
        //NOTE: fees are still considered realised, but no impact on field supplies/reserves after the tx
      } else {
        const userPercentageofTotalSupplyB4Tx = userReceiptBalanceAfterLastTx / receiptTokenTotalSupply;
        const percentOfUserBalanceExited = txOut / userReceiptBalanceAfterLastTx;
        
        const userReserveBalancesB4Tx = reserves.map(reserve => reserve * userPercentageofTotalSupplyB4Tx);
        const netReserveProfits = userReserveBalancesB4Tx.map((userReserveBalance, i) => (userReserveBalance - seedTokensInvested[i]) * percentOfUserBalanceExited);
        seedTokensInvested = seedTokensInvested.map(reserve => reserve *= 1 - percentOfUserBalanceExited);

        userReceiptBalanceAfterLastTx -= txOut;
        const pricesPerReserveToken = reserves.map(reserve => ((receiptTokenTotalSupply * pricePerToken) / 2) / reserve);
        realisedRelativeProfitValue += netReserveProfits.reduce((acc, curr, i) => acc + (curr * pricesPerReserveToken[i]), 0);
      }
    }
  }

  function calcUnrealisedRelativeProfit() {
    const currUnstakedUserBalance = field.userBalance ? field.userBalance : 0;
    const currStakedUserBalance = field.stakedBalance ? field.stakedBalance.reduce((acc, curr) => acc + curr.balance, 0) : 0;
    const totalCurrentUserBalance = currUnstakedUserBalance + currStakedUserBalance;
    const userPoolPercentage = totalCurrentUserBalance / field.totalSupply;
    const userFieldSeedHoldings = [];
    for (let i = 0; i < field.seedTokens.length; i++) {
      userFieldSeedHoldings.push(field.seedTokens.find(seedToken => seedToken.seedIndex === i).fieldReserve * userPoolPercentage);
    }
    const unrealisedProfitAmounts = userFieldSeedHoldings.map((userHolding, i) => userHolding - seedTokensInvested[i]);
    unrealisedRelativeProfitValue = unrealisedProfitAmounts.reduce((acc, curr, i) => {
      const targetSeed = field.seedTokens.find(seed => seed.seedIndex === i);
      const tokenPrice = tokenPrices[targetSeed.name].usd;
      return acc + curr * tokenPrice;
    }, 0);
  }
 }

export default calcEarningROI;