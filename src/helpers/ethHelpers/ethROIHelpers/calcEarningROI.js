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
  //NOTE: histFieldReserves, feeData and feeValueRealised only valid for Uniswap for now
  let feeValueRealised = 0;
  let userReceiptBalanceAfterLastTx = 0;
  let reservesAdded = [0,0];
  
  txHistory.forEach(tx => {
    const { txIn, txOut, pricePerToken, histFieldReserves } = tx;
    if (txIn || txOut) {
      txIn ? valueInvested += txIn * pricePerToken : valueRealised += txOut * pricePerToken;

      if (histFieldReserves) {
        calcRelativeProfit(tx);
      }
    }
    //NOTE: valid for Uniswap - assumes just 2 reserve tokens
  })
  const absReturnValue = currInvestmentValue + valueRealised - valueInvested;
  const allTimeROI = ((currInvestmentValue + valueRealised) / valueInvested) - 1;
  console.log(' ---> feeValueRealised', feeValueRealised);
  console.log(' ---> reservesAdded', reservesAdded);
  console.log(' ---> field', field);
  
  
  return {allTimeROI, absReturnValue, histInvestmentValue: valueInvested};


  function calcRelativeProfit (tx) {
    const { txIn, txOut, pricePerToken, histFieldReserves } = tx;
    const {receiptTokenTotalSupply, reserves} = histFieldReserves;
    if (txIn) {
      const additionalUserReceiptPercent = txIn / receiptTokenTotalSupply;
      reservesAdded = reserves.map(reserve => reserve * additionalUserReceiptPercent);
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
        const netReserveProfits = userReserveBalancesB4Withdraw.map((userReserveBalance, i) => (userReserveBalance - reservesAdded[i]) * percentOfUserBalanceWithdrawn);
        reservesAdded = reservesAdded.map(reserve => reserve *= 1 - percentOfUserBalanceWithdrawn);
        userReceiptBalanceAfterLastTx -= txOut;
        const pricesPerReserveToken = reserves.map(reserve => ((receiptTokenTotalSupply * pricePerToken) / 2) / reserve);
        feeValueRealised += netReserveProfits[0] * pricesPerReserveToken[0] + netReserveProfits[1] * pricesPerReserveToken[1];
        
        //NOTE: case 2: the user is simply transferring the token to another address
        //NOTE: fees are still considered realised, but no impact on field supplies/reserves after the tx
      } else {
        const userPercentageofTotalSupplyB4Tx = userReceiptBalanceAfterLastTx / receiptTokenTotalSupply;
        const percentOfUserBalanceExited = txOut / userReceiptBalanceAfterLastTx;
        
        const userReserveBalancesB4Tx = reserves.map(reserve => reserve * userPercentageofTotalSupplyB4Tx);
        const netReserveProfits = userReserveBalancesB4Tx.map((userReserveBalance, i) => (userReserveBalance - reservesAdded[i]) * percentOfUserBalanceExited);
        reservesAdded = reservesAdded.map(reserve => reserve *= 1 - percentOfUserBalanceExited);
        
        userReceiptBalanceAfterLastTx -= txOut;
        const pricesPerReserveToken = reserves.map(reserve => ((receiptTokenTotalSupply * pricePerToken) / 2) / reserve);
        feeValueRealised += netReserveProfits.reduce((acc, curr, i) => acc + (curr * pricesPerReserveToken[i]), 0);
      }
    }
  }
}

export default calcEarningROI;