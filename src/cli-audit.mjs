#!/usr/bin/env node
/**
 * SolanaSentinel Terminal Clearinghouse CLI Auditor
 * Usage: node src/cli-audit.mjs "Swap 1.5 SOL to USDC via Jupiter v6"
 */
import { compileAndScanAiIntent, buildDeFiRoutesAndSolanaPay } from "./solana-engine.mjs";
import { evaluatePromptAgainstSignatures } from "./cpi-threat-signatures.mjs";
import { buildVerifiedAnchorCatalog } from "./anchor-idl-inspector.mjs";

const promptInput = process.argv.slice(2).join(" ") ||
  "Swap 1.5 SOL to USDC with max 35 bps slippage and log verifiable AI provenance hash on-chain";

const intentAudit = compileAndScanAiIntent(promptInput);
const sigMatch = evaluatePromptAgainstSignatures(promptInput);
const defi = buildDeFiRoutesAndSolanaPay();
const anchorCatalog = buildVerifiedAnchorCatalog();

const report = {
  cliVersion: "1.2.0",
  inspectedPrompt: promptInput,
  agentVault: intentAudit.agentWallet,
  ephemeralSessionSigner: intentAudit.ephemeralSessionSigner,
  provenanceSha256: intentAudit.onChainProvenanceSha256,
  firewallVerdict: intentAudit.securityFirewallAudit.verdict,
  riskScore: intentAudit.securityFirewallAudit.riskScore,
  signatureCatalogEvaluation: sigMatch,
  recommendedRoute: defi.dexRoutes.find((r) => r.recommended),
  solanaPayUri: defi.solanaPayCheckout.uri,
  verifiedAnchorDiscriminators: anchorCatalog.instructions.map((ix) => ({
    program: ix.programName,
    instruction: ix.instructionName,
    discriminatorHex: ix.discriminatorHex
  }))
};

console.log(JSON.stringify(report, null, 2));
