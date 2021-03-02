import { gql } from '@apollo/client';

const getUniswapPoolVolume =
gql`
  query getUniswapPoolVolume ($pairAddress: String! $first: Int!) {
    pairDayDatas (
      where: {pairAddress: $pairAddress}
      orderBy: date
      orderDirection: desc
      first: $first
    ) {
      dailyVolumeUSD
    }
  }
`

const getUniswapBalanceHistory =
gql`
  query getUserBalanceHistory ($user: String!) {
    liquidityPositionSnapshots (
      first: 1000,
      where: {user: $user}
      orderBy: timestamp
      orderDirection: asc
    ) {
      timestamp
      pair {
        id
      }
      block
      liquidityTokenBalance
      liquidityTokenTotalSupply
      reserveUSD
      reserve0
      reserve1
    }
  }
`

const getPairReserveUSDAtBlock =
gql`
  query getPairReserveUSDAtBlock ($block: Int! $pairId: String!) {
    pair (
      id: $pairId
      block: {
        number: $block
      }
    ) {
      reserveUSD
      totalSupply
    }
  }
`

//eslint-disable-next-line import/no-anonymous-default-export
export default {
  getUniswapPoolVolume,
  getUniswapBalanceHistory,
  getPairReserveUSDAtBlock
}