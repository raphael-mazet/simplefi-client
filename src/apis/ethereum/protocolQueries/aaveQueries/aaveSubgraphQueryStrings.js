import { gql } from '@apollo/client';

const getAaveReserveLiquidityRate =
gql`
  query getAaveReserveLiquidityRate ($id: String!) {
    reserves (
      where: {id: $id}
    ) {
      liquidityRate
    }
  }
`

//eslint-disable-next-line import/no-anonymous-default-export
export default {
  getAaveReserveLiquidityRate
}