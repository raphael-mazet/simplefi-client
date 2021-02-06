import getCurveEarningAPY from './getCurveEarningAPY';
import getUniswapEarningAPY from './getUniswapEarningAPY';
import getAaveEarningAPY from './getAaveEarningAPY';
 
 async function getEarningAPYs (field, userTokens, userTokenPrices) {

  //get pair address
  const earningAddress = field.contractAddresses.find(address => address.addressTypes.includes('earning'));
  
  let APY;

  switch (earningAddress.contractInterface.name) {
    case "uniswap V2 earn":
      APY = await getUniswapEarningAPY(field, userTokens, userTokenPrices, earningAddress);
      break;

    case "curve swap 4 (sUSD)":
    case "curve swap 3 (sBTC)":
    case "curve swap 3 (3Pool)":
    case "curve swap 2 (hBTC)":
    case "curve swap 2 (stEth)":
    case "curve swap 3 (aave)":
      //FIXME: simplify this case condition
      APY = await getCurveEarningAPY(field);
      break;

    case "aave v2 lending pool":
      APY = await getAaveEarningAPY(field);
      break;
      
      default:
        
      }
      
  return APY;
}

 export default getEarningAPYs;
