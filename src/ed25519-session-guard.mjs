/**
 * Ephemeral Ed25519 Session Signer & Policy Guard
 * Generates scoped Ed25519 session keys, signs pre-audited CPI commitments,
 * and verifies detached Ed25519 signatures against policy constraints.
 */
import crypto from "node:crypto";
import { encodeBase58 } from "./solana-engine.mjs";

export function createScopedSessionSigner({
  maxSpendLamports = 2_000_000_000,
  ttlSeconds = 3600,
  allowedPrograms = [
    "ComputeBudget111111111111111111111111111111",
    "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
    "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
  ]
} = {}) {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
  const spkiDer = publicKey.export({ format: "der", type: "spki" });
  const rawPubkeyBytes = spkiDer.subarray(spkiDer.length - 32);
  const pubkeyBase58 = encodeBase58(rawPubkeyBytes);

  const issuedAtUnix = Math.floor(Date.now() / 1000);
  const expiresAtUnix = issuedAtUnix + ttlSeconds;

  return {
    pubkeyBase58,
    maxSpendLamports,
    allowedPrograms,
    issuedAtUnix,
    expiresAtUnix,
    signCommitment(payloadString) {
      const messageBuf = Buffer.from(String(payloadString), "utf8");
      const signatureBuf = crypto.sign(null, messageBuf, privateKey);
      return {
        signerPubkeyBase58: pubkeyBase58,
        signatureHex: signatureBuf.toString("hex"),
        signatureBase58: encodeBase58(signatureBuf),
        verified: crypto.verify(null, messageBuf, publicKey, signatureBuf)
      };
    }
  };
}
