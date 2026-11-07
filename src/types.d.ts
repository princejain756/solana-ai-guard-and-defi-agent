/**
 * TypeScript Definitions for SolanaSentinel Pre-Signature CPI Firewall & DeFi Router
 */

export interface SolanaDevnetTelemetry {
  network: "solana-devnet";
  rpcEndpoint: string;
  liveRpcConnected: boolean;
  solanaCoreVersion: string;
  featureSet: number;
  confirmedSlot: number;
  latestBlockhash: string;
  lastValidBlockHeight: number;
  liveTps: number;
  nonVoteTps: number;
  circulatingSol: number;
  fetchedAtUtc: string;
  fallbackNote?: string;
}

export interface CompiledSolanaInstruction {
  index: number;
  program: string;
  instruction: string;
  estimatedFeeLamports: number;
  safetyStatus: "SAFE_PRIORITY_FEE" | "VERIFIED_JUPITER_V6_CPI" | "VERIFIABLE_AI_COMMITMENT" | "UNAUTHORIZED_AUTHORITY_MUTATION";
}

export interface SecurityFirewallAudit {
  checkedPrograms: number;
  authorityMutationDetected: boolean;
  unlimitedTokenApproveDetected: boolean;
  spendingLimitLamports: number;
  requestedSpendLamports: number;
  withinAgentPolicyCap: boolean;
  riskScore: number;
  verdict: string;
}

export interface AiIntentCompilationResult {
  naturalLanguagePrompt: string;
  agentWallet: string;
  ephemeralSessionSigner: string;
  onChainProvenanceSha256: string;
  compiledInstructions: CompiledSolanaInstruction[];
  securityFirewallAudit: SecurityFirewallAudit;
}

export interface SolanaPayCheckoutSpec {
  merchantRecipient: string;
  referencePubkey: string;
  amountSol: number;
  estimatedSettlementMs: number;
  networkFeeSol: number;
  uri: string;
}

export interface DexRouteOption {
  routeId: string;
  path: string;
  inputAmount: string;
  expectedOutput: string;
  priceImpactPct: string;
  priorityFeeLamports: number;
  recommended: boolean;
}

export interface SolanaActionParameter {
  name: string;
  label: string;
  required?: boolean;
}

export interface SolanaActionLink {
  label: string;
  href: string;
  parameters?: SolanaActionParameter[];
}

export interface SolanaActionGetResponse {
  type: "action";
  icon: string;
  title: string;
  description: string;
  label: string;
  links?: {
    actions: SolanaActionLink[];
  };
}
