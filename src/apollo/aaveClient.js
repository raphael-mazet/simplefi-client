import { ApolloClient, InMemoryCache } from '@apollo/client';

const aaveClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v2',
  cache: new InMemoryCache()
});

export default aaveClient;