This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Change Shopify Store

## Edit .env file

The .env file contains the two variables _REACT_APP_SHOPIFY_STOREFRONT_ACCESS_TOKEN_ and _REACT_APP_SHOPIFY_URI_ that need to be changed in order to use the correct Shopify store.

#### REACT_APP_SHOPIFY_STOREFRONT_ACCESS_TOKEN

Create a private app inside the shopify store to get the storefront access token for your store.<br />
[Getting started with Shopify Storefront API](https://shopify.dev/docs/storefront-api/getting-started) <br />
Afterwards change the variable _REACT_APP_SHOPIFY_STOREFRONT_ACCESS_TOKEN_ to your created access token.

#### REACT_APP_SHOPIFY_URI

Change the _REACT_APP_SHOPIFY_URI_ variable inside the .env file to _"https://{your-shopify-store}.myshopify.com/api/graphql"_

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.<br />
The lamps will not load because .env only loads in production builds. Use npm run build for this.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!<br />
Use serve -s build afterwards to run the build locally on Open [http://localhost:5000](http://localhost:5000)

### `npm run build-master`

Deploy the build version to the url _"[https://jaegerflorian.github.io/](https://jaegerflorian.github.io/)"_
