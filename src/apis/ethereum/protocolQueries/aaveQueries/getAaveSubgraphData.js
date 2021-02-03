import apollo from '../../../../apollo';
import aaveQueries from './aaveSubgraphQueryStrings';

async function getAaveReserveLiquidityRate(id) {
  return await apollo.aaveClient.query(
    {
      query: aaveQueries.getAaveReserveLiquidityRate,
      variables: { id }
    })
}

export {
  getAaveReserveLiquidityRate
}