export default function sortGetROIsFields (userFields, trackedFields) {
  const inalterableFields = [];
  const alterableBalanceEarningFields = [];

  userFields.forEach(field => {
    if (field.isEarning) {
      const isAlterableFeeder = trackedFields.some(trackedField => {
        if (trackedField.isEarning) {
          const receiptIsSeed = trackedField.seedTokens.some(seedToken => seedToken.tokenId === field.receiptToken);
          return receiptIsSeed ? true : false;
        } else {
          return false
        }
      });

      if (isAlterableFeeder) {
        alterableBalanceEarningFields.push(field)
      } else {
        inalterableFields.push(field);
      }

    } else {
        inalterableFields.push(field);
      }
  })

  return [inalterableFields, alterableBalanceEarningFields];
}