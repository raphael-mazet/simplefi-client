function combineFieldSuppliesAndReserves (supplies, reserves) {
  let combinedBalances = [...supplies];

  for (let field of combinedBalances) {
    const findFieldReserves = reserves.filter(reserve => reserve.fieldName === field.fieldName)[0];
    field.seedReserves = findFieldReserves.seedReserves;
  }

  return combinedBalances;
}

export default combineFieldSuppliesAndReserves;