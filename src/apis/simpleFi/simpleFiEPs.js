const nodeEnv = process.env.NODE_ENV;
const baseUrl = nodeEnv === 'production' ? 'https://simplefi-server.herokuapp.com' : 'http://localhost:3020';
const fieldEP = '/fields';
const tokensEP = '/tokens';
const fieldTokensEP = '/userfieldtokens';
const userTxEP = '/userTransactions';

export {
  baseUrl,
  fieldEP,
  tokensEP,
  fieldTokensEP,
  userTxEP
}