/**
 * Pre-Signature CPI Threat Signature Catalog for SolanaSentinel
 * Maps malicious instruction patterns, authority mutations, and account-drain vectors
 * to deterministic risk weights and human-readable clearinghouse remediation rules.
 */

export const CPI_THREAT_SIGNATURES = [
  {
    id: "SIG-SPL-001",
    name: "TokenProgram::SetAuthority(AccountOwner)",
    programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    instructionDiscriminatorHex: "0602",
    severity: "CRITICAL",
    riskWeight: 95,
    patternRegex: /setauthority|owner\s*transfer|authority\s*hijack|drain/i,
    description: "Reassigns ownership of an SPL token account to an external address, permanently revoking the wallet holder's control over the token balance.",
    remediation: "Block transaction immediately before Ed25519 signing; never permit AccountOwner authority mutation inside a swap or DeFi router bundle."
  },
  {
    id: "SIG-SPL-002",
    name: "TokenProgram::Approve(UnlimitedDelegate)",
    programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    instructionDiscriminatorHex: "04ffffffffffffffff",
    severity: "HIGH",
    riskWeight: 82,
    patternRegex: /unlimited\s*approve|u64::max|delegate\s*all|infinite\s*allowance/i,
    description: "Grants an external delegate authority to transfer up to u64::MAX tokens from the user's associated token account at any future slot.",
    remediation: "Scope token delegation strictly to the exact swap input amount and append a Revoke instruction in the same atomic transaction."
  },
  {
    id: "SIG-T22-003",
    name: "Token2022::PermanentDelegateExtension",
    programId: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
    instructionDiscriminatorHex: "2301",
    severity: "CRITICAL",
    riskWeight: 90,
    patternRegex: /permanent\s*delegate|seize\s*tokens|token2022\s*backdoor/i,
    description: "Initializes or interacts with a Token-2022 mint carrying an unrestricted PermanentDelegate extension capable of burning or transferring tokens from any holder.",
    remediation: "Reject unverified Token-2022 mints that declare a non-null PermanentDelegate authority."
  },
  {
    id: "SIG-SYS-004",
    name: "SystemProgram::Assign(ExternalProgram)",
    programId: "11111111111111111111111111111111",
    instructionDiscriminatorHex: "01000000",
    severity: "CRITICAL",
    riskWeight: 96,
    patternRegex: /systemprogram::assign|reassign\s*system\s*account|attacker/i,
    description: "Transfers ownership of a native SOL system account to an attacker-controlled program, enabling arbitrary lamport debits without wallet signatures.",
    remediation: "Forbid SystemProgram::Assign on the primary fee-payer or agent vault pubkey under all circumstances."
  },
  {
    id: "SIG-SYS-005",
    name: "SystemProgram::AdvanceNonceAccount(Phishing)",
    programId: "11111111111111111111111111111111",
    instructionDiscriminatorHex: "04000000",
    severity: "HIGH",
    riskWeight: 78,
    patternRegex: /durable\s*nonce\s*phish|offline\s*replay|nonce\s*hijack/i,
    description: "Uses a durable nonce instead of a recent blockhash so a signed payload can be withheld and replayed long after the user leaves the dApp.",
    remediation: "Require standard recentBlockhash lifetime (~60s / 150 blocks) for interactive DeFi swaps."
  },
  {
    id: "SIG-CPI-006",
    name: "SpoofedRouterProgram::UnverifiedJupiterClone",
    programId: "JUPFake111111111111111111111111111111111111",
    instructionDiscriminatorHex: "c1209b3341d69c81",
    severity: "CRITICAL",
    riskWeight: 94,
    patternRegex: /spoofed\s*router|fake\s*jupiter|unverified\s*cpi/i,
    description: "Invokes a lookalike aggregator program ID that mimics Jupiter v6 SharedAccountsRoute while routing input tokens to an unverified vault.",
    remediation: "Pin Jupiter v6 strictly to JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4."
  }
];

export function evaluatePromptAgainstSignatures(promptText = "") {
  const normalized = String(promptText || "");
  const matched = [];

  for (const sig of CPI_THREAT_SIGNATURES) {
    if (sig.patternRegex.test(normalized)) {
      matched.push({
        id: sig.id,
        name: sig.name,
        programId: sig.programId,
        severity: sig.severity,
        riskWeight: sig.riskWeight,
        remediation: sig.remediation
      });
    }
  }

  const aggregateRiskScore = matched.length === 0
    ? 6
    : Math.min(99, Math.max(...matched.map((m) => m.riskWeight)));

  return {
    inspectedSignaturesCount: CPI_THREAT_SIGNATURES.length,
    matchedThreatsCount: matched.length,
    matchedThreats: matched,
    aggregateRiskScore,
    passedPreSignatureCheck: matched.length === 0
  };
}
