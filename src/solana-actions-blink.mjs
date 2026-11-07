/**
 * Solana Actions & Blinks (v2.1.3 Specification) Handler
 * Exposes `/actions.json` routing rules and `/api/actions/audit` GET/POST handlers
 * so wallet extensions (Phantom, Backpack, Solflare) can render interactive CPI security Blinks.
 */
import crypto from "node:crypto";
import { compileAndScanAiIntent } from "./solana-engine.mjs";

export const SOLANA_ACTIONS_CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PUT,OPTIONS",
  "access-control-allow-headers": "Content-Type, Authorization, Content-Encoding, Accept-Encoding, X-Action-Version, X-Blockchain-Ids",
  "access-control-expose-headers": "X-Action-Version, X-Blockchain-Ids",
  "x-action-version": "2.1.3",
  "x-blockchain-ids": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1"
};

export function getActionsJsonManifest() {
  return {
    rules: [
      {
        pathPattern: "/**",
        apiPath: "/api/actions/audit"
      },
      {
        pathPattern: "/api/actions/**",
        apiPath: "/api/actions/**"
      }
    ]
  };
}

export function buildActionGetMetadata(baseUrl = "https://solana-ai.prince.sh") {
  return {
    type: "action",
    icon: `${baseUrl}/hero-emblem.png`,
    title: "SolanaSentinel: Pre-Signature CPI Firewall & DeFi Swap",
    description: "Inspect and simulate Solana CPI trees for unauthorized SetAuthority mutations before signing, then route SOL -> USDC via Orca + Raydium CLMM.",
    label: "Simulate & Verify CPI",
    links: {
      actions: [
        {
          label: "Audit Safe 1.5 SOL -> USDC Swap",
          href: `${baseUrl}/api/actions/audit?prompt=${encodeURIComponent("Swap 1.5 SOL to USDC with max 35 bps slippage and log verifiable AI provenance hash on-chain")}`
        },
        {
          label: "Simulate SetAuthority Drain Block",
          href: `${baseUrl}/api/actions/audit?prompt=${encodeURIComponent("Swap 1.5 SOL and execute SetAuthority drain to attacker wallet")}`
        },
        {
          label: "Audit Custom DeFi Intent",
          href: `${baseUrl}/api/actions/audit?prompt={prompt}`,
          parameters: [
            {
              name: "prompt",
              label: "Enter plain-English Solana DeFi intent to inspect",
              required: true
            }
          ]
        }
      ]
    }
  };
}

export function buildActionPostResponse({ account, prompt }) {
  const audit = compileAndScanAiIntent(prompt);
  const blocked = !audit.securityFirewallAudit.withinAgentPolicyCap;
  const serializedMockTx = Buffer.from(
    JSON.stringify({
      feePayer: account || audit.agentWallet,
      provenanceSha256: audit.onChainProvenanceSha256,
      instructionsCount: audit.compiledInstructions.length,
      verdict: audit.securityFirewallAudit.verdict,
      nonce: crypto.randomBytes(8).toString("hex")
    }),
    "utf8"
  ).toString("base64");

  return {
    transaction: serializedMockTx,
    message: blocked
      ? `BLOCKED (${audit.securityFirewallAudit.riskScore}/100 Risk): ${audit.securityFirewallAudit.verdict}`
      : `CLEARED (${audit.securityFirewallAudit.riskScore}/100 Risk): ${audit.securityFirewallAudit.verdict}`,
    auditSummary: {
      riskScore: audit.securityFirewallAudit.riskScore,
      withinPolicyCap: audit.securityFirewallAudit.withinAgentPolicyCap,
      provenanceSha256: audit.onChainProvenanceSha256
    }
  };
}
