import apollo from '../../../../apollo';
import aaveQueries from './aaveSubgraphQueryStrings';

async function getAaveReserveLiquidityRate(reserveId) {
  return await apollo.aaveClient.query(
    {
      query: aaveQueries.getAaveReserveLiquidityRate,
      variables: { reserveId }
    })
}

//TODO: add cache - getAaveBH only needs to be called once
async function getAaveBalanceHistory(userAccount) {
  return await apollo.aaveClient.query(
    {
      query: aaveQueries.getAaveBalanceHistory,
      variables: { userAccount }
    }
  )
}

export {
  getAaveReserveLiquidityRate,
  getAaveBalanceHistory
}