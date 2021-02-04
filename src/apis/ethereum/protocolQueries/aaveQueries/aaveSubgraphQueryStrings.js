import { gql } from '@apollo/client';

const getAaveReserveLiquidityRate =
  gql`
    query getAaveReserveLiquidityRate ($reserveId: String!) {
      reserves (
        where: {id: $reserveId}
      ) {
        liquidityRate
      }
    }
  `

const getAaveBalanceHistory = 
    gql`
      query getUserBalanceHistory ($userAccount: String!) {
        user (id: $userAccount){
          reserves {
            aTokenBalanceHistory {
              id
              timestamp
              currentATokenBalance
            }
            reserve {
        	    aToken {
          	    id
        	    }
      	    }
          }
        }
      }
    `



//eslint-disable-next-line import/no-anonymous-default-export
export default {
  getAaveReserveLiquidityRate,
  getAaveBalanceHistory
}