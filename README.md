# NFT Marketplace


This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) and Hardhat is used for solidity development environment whereas tailwind is used for styling.

User can create NFT by uploading image and it will be listed in the marketplace.

Try this at : [NFT Marketplace](https://summer-breeze-5006.on.fleek.co/)

## Getting Started

First run :
```bash
yarn
# or
npm install
```

To run the project in local environment :

```bash
yarn hardhat node

yarn hardhat run scripts/deploy.js --network localhost

# or

npx hardhat node

npx hardhat run scripts/deploy.js --network localhost
```


Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.