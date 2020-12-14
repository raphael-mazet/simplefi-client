function combineFieldBalances(field){
       
      let stakedBalance = 0;
      let combinedBalance = 0;
      let stakedPercent = 0;
      const formatter = new Intl.NumberFormat("en-US", {style: 'percent'});
      
      if (field.stakedBalance) {
        stakedBalance = field.stakedBalance.reduce((acc, curr) => acc + curr.balance, 0);
      }

      if (field.userBalance) {
        combinedBalance = field.userBalance + stakedBalance;
        stakedPercent = formatter.format(stakedBalance / combinedBalance);
      } else {
        combinedBalance = stakedBalance;
        stakedPercent = formatter.format(1);
      }
      
  return {
    combinedBalance: combinedBalance.toFixed(2),
    stakedPercent
  };
}


function fieldSeparator (userFields){
  const farmingFields = [];
  const earningFields = [];
  let totalInvested = 0;
  const formatter = new Intl.NumberFormat("en-US", {
    style: 'percent',
    minimumFractionDigits: 2
  });

  userFields.forEach(field => {

    const { combinedBalance, stakedPercent } = combineFieldBalances(field);
    const { name, userBalance, cropTokens, stakedBalance, isEarning, unstakedUserInvestmentValue } = field;

    //TODO: currently not adding combined balance to farming- must check
    //NOTE: on case by case if staking voids rewards on Curve in particular
    if (cropTokens.length) {
      let farming = '';
      cropTokens && cropTokens.forEach(token => farming += `${token.name}, `);
      farming = farming.slice(0, -2);

      const APY = field.farmingAPY?.combinedAPY ? formatter.format(field.farmingAPY.combinedAPY) : formatter.format(field.farmingAPY);

      farmingFields.push([name, userBalance.toFixed(2), farming, APY])
    }

    if (isEarning) {
      const APY = formatter.format(field.earningAPY)
      earningFields.push([name, combinedBalance, stakedPercent, APY])
    }

    if (unstakedUserInvestmentValue) {
      totalInvested += unstakedUserInvestmentValue;
    }
    if (stakedBalance) {
      stakedBalance.forEach(stakedBalance => totalInvested += stakedBalance.userInvestmentValue)
    }
  })

  return {farmingFields, earningFields, totalInvested: Number(totalInvested.toFixed())}
}

export {
  fieldSeparator
}
