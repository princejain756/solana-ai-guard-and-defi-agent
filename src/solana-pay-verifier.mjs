/**
 * Solana Pay Specification (v1.1) Transfer Request Builder & Reference Verifier
 * Generates and parses `solana:<recipient>?amount=...&reference=...` payment URIs
 * for machine-to-machine AI oracle micropayments on Solana Devnet.
 */
import crypto from "node:crypto";
import { encodeBase58 } from "./solana-engine.mjs";

export function createSolanaPayTransferRequest({
  merchantSeed = "prince-sh-solana-pay-merchant",
  orderId = "order-ref-ghw-solana-2026",
  amountSol = 0.05,
  label = "SolanaSentinel AI Oracle",
  message = "Per-Request AI Security Audit Micropayment"
} = {}) {
  const recipient = encodeBase58(crypto.createHash("sha256").update(merchantSeed).digest());
  const reference = encodeBase58(crypto.createHash("sha256").update(orderId).digest());
  const params = new URLSearchParams({
    amount: String(amountSol),
    reference,
    label,
    message
  });

  return {
    recipient,
    reference,
    amountSol: Number(amountSol),
    amountLamports: Math.round(Number(amountSol) * 1e9),
    label,
    message,
    uri: `solana:${recipient}?${params.toString().replace(/\+/g, "%20")}`
  };
}

export function parseSolanaPayUri(uriString) {
  if (typeof uriString !== "string" || !uriString.startsWith("solana:")) {
    throw new Error("Invalid Solana Pay URI scheme: expected 'solana:' prefix");
  }
  const withoutScheme = uriString.slice("solana:".length);
  const [recipient, rawQuery = ""] = withoutScheme.split("?");
  if (!recipient || recipient.length < 32 || recipient.length > 44) {
    throw new Error("Invalid Solana Pay recipient Base58 address");
  }
  const search = new URLSearchParams(rawQuery);
  const amountSol = Number(search.get("amount") || 0);
  const reference = search.get("reference") || null;

  return {
    valid: amountSol > 0 && Boolean(reference),
    recipient,
    amountSol,
    amountLamports: Math.round(amountSol * 1e9),
    reference,
    label: search.get("label") || null,
    message: search.get("message") || null
  };
}
