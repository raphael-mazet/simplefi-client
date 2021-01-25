/**
 * @dev - add here contract interfaces that diverge from the default
 *        balance check in getUnclaimedRewards for its switch statement
 */
const unclaimedBalanceInterfaceTypes ={
  altCurveRewardGauge: [
    {
      name: 'stEth Curve gauge - secondary Lido reward',
      fieldId: 'fc757340-3b2d-47ec-b68c-0d5d6b381ce9',
      tokenId: '5c1a3179-34f2-4a1d-8bad-8105e59abe40'
    }
  ]
}

export default unclaimedBalanceInterfaceTypes;