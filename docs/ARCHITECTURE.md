# SolanaSentinel Architecture Specification

## 1. System Overview

SolanaSentinel is a pre-signature Cross-Program Invocation (CPI) inspection firewall, multi-DEX order split simulator, Solana Pay checkout engine, and verifiable on-chain security arena built on Solana Devnet (`https://api.devnet.solana.com`).

## 2. Core Pipeline Stages

1. **Live Devnet RPC Telemetry Layer (`src/solana-engine.mjs`, `src/rpc-failover-pool.mjs`)**
   - Polls `getVersion`, `getSlot`, `getLatestBlockhash`, `getRecentPerformanceSamples`, and `getSupply` against Solana Devnet with automatic RPC failover.
2. **Natural-Language Intent Compiler & Pre-Signature CPI Firewall (`src/cpi-threat-signatures.mjs`, `src/anchor-idl-inspector.mjs`)**
   - Compiles plain-English prompts into ordered Solana instruction frames (`ComputeBudget`, `Jupiter v6 SharedAccountsRoute`, `SPL-Memo`).
   - Evaluates the instruction tree against 6 canonical CPI threat signatures (`TokenProgram::SetAuthority(AccountOwner)`, `TokenProgram::Approve(u64::MAX)`, `Token2022::PermanentDelegate`, `SystemProgram::Assign`, durable nonce replay, and spoofed aggregator IDs).
   - Computes Anchor 8-byte SHA-256 discriminators (`sha256("global:<ix_name>")[0..8]`) and anchors a 256-bit provenance hash into `MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`.
3. **Ephemeral Ed25519 Session Guard (`src/ed25519-session-guard.mjs`)**
   - Generates a scoped Ed25519 session keypair (`crypto.generateKeyPairSync("ed25519")`) bounded by a 2.0 SOL daily policy cap and program allowlist.
4. **Multi-DEX Order Split Router & Solana Pay Oracle (`src/jupiter-route-simulator.mjs`, `src/solana-pay-verifier.mjs`)**
   - Simulates concentrated liquidity price impact across Orca Whirlpools (65%) + Raydium CLMM (35%), Meteora DLMM, and Raydium Standard AMM v4.
   - Generates `solana:<recipient>?amount=0.05&reference=<pubkey>` machine-to-machine payment URIs.
5. **Solana Actions & Blinks v2.1.3 (`src/solana-actions-blink.mjs`)**
   - Serves `/actions.json` and `/api/actions/audit` with `X-Action-Version: 2.1.3` and `X-Blockchain-Ids: solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1` headers.
