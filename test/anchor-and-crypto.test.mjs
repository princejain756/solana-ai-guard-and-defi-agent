import test from "node:test";
import assert from "node:assert/strict";
import { computeAnchorInstructionDiscriminator, buildVerifiedAnchorCatalog } from "../src/anchor-idl-inspector.mjs";
import { createSolanaPayTransferRequest, parseSolanaPayUri } from "../src/solana-pay-verifier.mjs";
import { createScopedSessionSigner } from "../src/ed25519-session-guard.mjs";
import { verifyQuestSubmission } from "../src/quest-verifier.mjs";

test("Anchor 8-byte SHA-256 instruction discriminator matches canonical global:<name> preimage", () => {
  const disc = computeAnchorInstructionDiscriminator("shared_accounts_route");
  assert.equal(disc.length, 16);
  const catalog = buildVerifiedAnchorCatalog();
  assert.equal(catalog.instructions.length, 5);
  assert.equal(catalog.instructions[0].discriminatorHex, disc);
});

test("Solana Pay URI builder and parser round-trip recipient, amount, and reference key", () => {
  const req = createSolanaPayTransferRequest({ amountSol: 0.05 });
  assert.ok(req.uri.startsWith("solana:"));
  const parsed = parseSolanaPayUri(req.uri);
  assert.equal(parsed.valid, true);
  assert.equal(parsed.recipient, req.recipient);
  assert.equal(parsed.reference, req.reference);
  assert.equal(parsed.amountSol, 0.05);
  assert.equal(parsed.amountLamports, 50_000_000);
});

test("Ephemeral Ed25519 session signer produces cryptographically valid detached signatures", () => {
  const signer = createScopedSessionSigner({ maxSpendLamports: 1_500_000_000 });
  const signed = signer.signCommitment("AI_PROVENANCE_SHA256:solana-sentinel-v1");
  assert.equal(signed.verified, true);
  assert.equal(signed.signatureHex.length, 128);
});

test("Bubblegum cNFT quest verifier computes deterministic Merkle leaf hash", () => {
  const proof1 = verifyQuestSubmission("QUEST-01");
  const proof2 = verifyQuestSubmission("QUEST-01");
  assert.equal(proof1.leafHashHex, proof2.leafHashHex);
  assert.equal(proof1.xpReward, 250);
});
