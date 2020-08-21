import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import PictureCollage from './App';
import * as serviceWorker from './serviceWorker';
import { ApolloClient } from 'apollo-client';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { ApolloProvider } from '@apollo/react-hooks';

const cache = new InMemoryCache();

console.log(process.env.REACT_APP_SHOPIFY_GRAPHQL_URI);
const httpLink = new HttpLink({
  uri: process.env.REACT_APP_SHOPIFY_GRAPHQL_URI,
});

const middlewareLink = setContext(() => ({
  headers: {
    'X-Shopify-Storefront-Access-Token':
      process.env.REACT_APP_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  },
}));

const client = new ApolloClient({
  link: middlewareLink.concat(httpLink),
  cache,
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <PictureCollage />
  </ApolloProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
