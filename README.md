# SolanaSentinel: Pre-Signature CPI Firewall, DeFi Order Router & On-Chain Quest Arena

- **Live Production Deployment**: [https://solana-ai.prince.sh](https://solana-ai.prince.sh)
- **1080p Kinetic Walkthrough Video**: [https://youtu.be/WqK0C9k8Vqw](https://youtu.be/WqK0C9k8Vqw)
- **Solana Actions & Blinks v2.1.3 Manifest**: [https://solana-ai.prince.sh/actions.json](https://solana-ai.prince.sh/actions.json)

Built for the **MLH Solana Hackathon** across all five prize tracks:

1. **Top 3 Overall**: Live Solana Devnet JSON-RPC integration (`https://api.devnet.solana.com`) with automatic multi-RPC failover, Ed25519 agent vault derivation, Base58 encoding, Anchor 8-byte SHA-256 instruction discriminator verification, and Solana Actions v2.1.3 Blink support.
2. **AI Track Top Prize**: Autonomous AI Transaction Firewall and Natural-Language Intent Compiler that converts plain-English DeFi intents into verified Solana instruction trees (`ComputeBudget`, `Jupiter v6 SharedAccountsRoute`, `SPL-Memo`), enforces a 2.0 SOL daily policy cap, blocks unauthorized `TokenProgram::SetAuthority(AccountOwner)` drain attacks before signing, and commits a 256-bit SHA-256 inference provenance hash on-chain.
3. **DeFi Track Top Prize**: Multi-DEX concentrated liquidity order router comparing split execution across Orca Whirlpools (65%) + Raydium CLMM (35%), Meteora DLMM Dynamic Bins, and Raydium Standard AMM v4 alongside instant **Solana Pay** (`solana:<recipient>?amount=0.05&reference=...`) machine-to-machine oracle settlement.
4. **Gaming Track Top Prize**: Interactive On-Chain Security & DeFi Quest Arena where players inspect raw CPI instruction trees, intercept phishing payloads, and compute deterministic Metaplex Bubblegum compressed NFT (cNFT) Merkle leaf proofs (`BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY`).
5. **Best Beginner Hack**: Light-theme Swiss clearinghouse ledger with side-by-side safe swap vs. blocked `SetAuthority` drain presets and an embedded ElevenLabs spoken security briefing explaining every instruction index in plain English.

## Module Architecture

| Module | Responsibility |
| :--- | :--- |
| `src/solana-engine.mjs` | Live Solana Devnet JSON-RPC telemetry (`getVersion`, `getSlot`, `getLatestBlockhash`, `getRecentPerformanceSamples`), Base58 encoder, and Ed25519 keypair derivation |
| `src/cpi-threat-signatures.mjs` | Pre-signature CPI threat catalog covering `SetAuthority`, unlimited `Approve`, `Token2022::PermanentDelegate`, `SystemProgram::Assign`, durable nonce replay, and spoofed router IDs |
| `src/anchor-idl-inspector.mjs` | Canonical 8-byte Anchor discriminator generator (`sha256("global:<ix_name>")[0..8]`) for Jupiter v6, Orca Whirlpools, Raydium CLMM, and Meteora DLMM |
| `src/jupiter-route-simulator.mjs` | Concentrated liquidity price-impact simulator and compute-unit priority fee quantile estimator (`p50`, `p75`, `p95`) |
| `src/solana-pay-verifier.mjs` | Solana Pay v1.1 transfer request URI builder, parser, and reference pubkey validator |
| `src/solana-actions-blink.mjs` | Solana Actions & Blinks v2.1.3 handler serving `/actions.json` and `/api/actions/audit` |
| `src/ed25519-session-guard.mjs` | Scoped ephemeral Ed25519 session signer with detached signature verification (`crypto.sign` / `crypto.verify`) |
| `src/quest-verifier.mjs` | Deterministic Bubblegum cNFT leaf hash calculator and quest completion verifier |
| `src/rpc-failover-pool.mjs` | Multi-endpoint Solana Devnet JSON-RPC failover pool with per-endpoint latency telemetry |
| `src/cli-audit.mjs` | Command-line clearinghouse auditor for terminal-based CPI inspection |

## Live API Endpoints

- `GET /api/solana-live?prompt=<intent>` : Full live Devnet telemetry, compiled CPI tree, firewall verdict, DEX routes, and quest status
- `GET /api/cpi-signatures?prompt=<intent>` : Pre-signature CPI threat signature catalog and pattern evaluation
- `GET /api/anchor-decode` : Verified 8-byte SHA-256 Anchor instruction discriminators
- `GET /actions.json` : Solana Actions & Blinks v2.1.3 routing manifest
- `GET / POST /api/actions/audit` : Interactive Solana Blink CPI audit action

## Quickstart & Verification

```bash
# Run the cryptographic and CPI firewall unit test suite (8 tests)
npm test

# Run the terminal CPI clearinghouse auditor
npm run audit-cli

# Verify live Solana Devnet RPC telemetry and JSON output
npm run verify

# Start the interactive web server on port 4585
npm start
```
