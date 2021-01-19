import fetchRequest from '../fetchRequest';
import {baseUrl, userTxEP} from './simpleFiEPs';

async function getUserTransactions(address){
  const userTransactions = await fetchRequest(baseUrl + userTxEP + '/' + address);
  return userTransactions;
}

export {
  getUserTransactions,
}