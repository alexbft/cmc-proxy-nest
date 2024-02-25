## Description

A proxy service for CoinMarketCap API based on Nest.JS.

## Installation

```bash
$ npm install
```

## Configuration

Edit `src/env/.default.env` file. See the template in `src/env/.default.env.template`.

To generate client keys, use `npm keygen` or anything you like.

To use HTTPS, create a `cert` directory in the project root, and place `key.pem` and `cert.pem` files there.

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

When the service in running, sending a `GET` request in form of `/quotes?symbol=<comma-separated list>` will return the quotes data from CMC.

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
