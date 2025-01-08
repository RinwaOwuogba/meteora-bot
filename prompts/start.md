Assume that you are a senior software engineer with 10 years of experience.

summary
this is a typescript project for a bot that will automatically:

1. find good pools on the meteora DLMM on solana.
2. add liquidity
3. claim generated fees automatically and add them back to the pool
4. watch for and close position based on tp and sl

folder structure

- db folder for db ops
- telegram folder for telegram things
- service folder for pure business logic e.g processing logic
- lib folder for anything that doesn't quite belong in any of the above categories e.g connection logic

libraries

- node-telegram-bot-api
- kysely for db
- @solana/web3.js@next
- @meteora-ag/dlmm
- @coral-xyz/anchor
- axios

step by step

[x] setup project
[x] setup db
[x] setup solana connection
[x] setup meteora connection
[x] setup anchor connection
[x] open liquidity pool
[ ] close liquidity pool
[ ] claimFees from pool
[ ] add liquidity to existing pools
[ ] find pools on meteora
[ ] watch for and close position based on tp and sl
[ ] claim generated fees automatically and add them back to the pool
[ ] log data from db to console.
[ ] setup processing logic
