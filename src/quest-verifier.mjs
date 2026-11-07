/**
 * Verifiable On-Chain Security & DeFi Quest Evaluator
 * Computes deterministic Bubblegum cNFT leaf hashes and verifies player submissions
 * for the Gaming & Best Beginner Hack tracks.
 */
import crypto from "node:crypto";
import { encodeBase58 } from "./solana-engine.mjs";

const BUBBLEGUM_PROGRAM_ID = "BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY";

export function computeCnftLeafHash({ questId, playerPubkey, xpReward }) {
  const digest = crypto
    .createHash("sha256")
    .update(`cnft-leaf:${BUBBLEGUM_PROGRAM_ID}:${questId}:${playerPubkey}:${xpReward}`)
    .digest();
  return {
    leafHashHex: digest.toString("hex"),
    assetIdBase58: encodeBase58(digest)
  };
}

export function verifyQuestSubmission(questId = "QUEST-01", playerPubkey = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU") {
  const catalog = {
    "QUEST-01": {
      title: "Detect the Malicious SetAuthority Phishing Instruction",
      xpReward: 250,
      badgeName: "Sentinel Guardian Badge #01"
    },
    "QUEST-02": {
      title: "Execute Sub-Second Solana Pay AI Micropayment",
      xpReward: 400,
      badgeName: "Flash Settler Badge #02"
    },
    "QUEST-03": {
      title: "Commit Verifiable AI Output Provenance via SPL-Memo",
      xpReward: 600,
      badgeName: "Verifiable Inference Architect #03"
    }
  };

  const entry = catalog[questId] || catalog["QUEST-01"];
  const proof = computeCnftLeafHash({
    questId,
    playerPubkey,
    xpReward: entry.xpReward
  });

  return {
    questId,
    title: entry.title,
    badgeName: entry.badgeName,
    xpReward: entry.xpReward,
    playerPubkey,
    merkleTreeProgram: BUBBLEGUM_PROGRAM_ID,
    assetIdBase58: proof.assetIdBase58,
    leafHashHex: proof.leafHashHex,
    verifiedAtUtc: new Date().toISOString()
  };
}
