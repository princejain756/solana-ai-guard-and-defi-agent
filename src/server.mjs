#!/usr/bin/env node
/**
 * SolanaSentinel: Swiss Clearinghouse & Pre-Signature CPI Inspection Ledger
 * Light-theme editorial & cryptographic workbench built for the MLH Solana Hackathon
 * (Top 3 Overall, AI Track, DeFi Track, Gaming Track, Best Beginner Hack)
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  fetchLiveSolanaDevnetTelemetry,
  compileAndScanAiIntent,
  buildDeFiRoutesAndSolanaPay,
  getOnChainGamingQuests
} from "./solana-engine.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, "..", "public");
const PORT = Number(process.env.PORT || 4585);

export async function buildFullPayload(customPrompt) {
  const telemetry = await fetchLiveSolanaDevnetTelemetry();
  const aiPlan = compileAndScanAiIntent(customPrompt);
  const defi = buildDeFiRoutesAndSolanaPay();
  const quests = getOnChainGamingQuests();
  return { telemetry, aiPlan, defi, quests };
}

if (process.argv.includes("--verify")) {
  const payload = await buildFullPayload();
  console.log(JSON.stringify(payload, null, 2));
  process.exit(0);
}

export async function requestHandler(req, res) {
  const urlObj = new URL(req.url, `http://localhost:${PORT}`);

  if (urlObj.pathname === "/hero-emblem.png") {
    const imgPath = path.join(PUBLIC_DIR, "hero-emblem.png");
    if (fs.existsSync(imgPath)) {
      const buf = fs.readFileSync(imgPath);
      res.writeHead(200, {
        "content-type": "image/png",
        "cache-control": "public, max-age=3600"
      });
      res.end(buf);
      return;
    }
  }

  if (urlObj.pathname === "/api/solana-live") {
    const prompt = urlObj.searchParams.get("prompt") || undefined;
    const payload = await buildFullPayload(prompt);
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(payload, null, 2));
    return;
  }

  const promptParam = urlObj.searchParams.get("prompt") || undefined;
  const data = await buildFullPayload(promptParam);
  const isBlocked = !data.aiPlan.securityFirewallAudit.withinAgentPolicyCap;

  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SolanaSentinel: Pre-Signature CPI Firewall &amp; DeFi Clearing Ledger</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    :root {
      --paper: #F7F6F2;
      --surface: #FFFFFF;
      --stone: #EFECE4;
      --rule: #D5D0C3;
      --rule-strong: #111315;
      --ink: #111315;
      --ink-secondary: #454A52;
      --ink-muted: #6E737B;
      --clearing-green: #0B5D46;
      --clearing-green-bg: #E6F2EE;
      --signal-vermilion: #C83E21;
      --signal-vermilion-bg: #FBEAE6;
      --ledger-navy: #1E3A5F;
      --ledger-navy-bg: #EBF0F6;
      --font-serif: "Instrument Serif", Georgia, serif;
      --font-sans: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif;
      --font-mono: "JetBrains Mono", monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background-color: var(--paper);
      color: var(--ink);
      font-family: var(--font-sans);
      font-size: 14px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      padding: 0;
    }

    /* Top Archival Ledger Strip */
    .telemetry-ribbon {
      background: var(--stone);
      border-bottom: 1px solid var(--rule);
      padding: 8px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: var(--font-mono);
      font-size: 11.5px;
      color: var(--ink-secondary);
      font-variant-numeric: tabular-nums;
    }

    .telemetry-group {
      display: flex;
      gap: 24px;
      align-items: center;
    }

    .status-dot {
      display: inline-block;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--clearing-green);
      margin-right: 6px;
    }

    .container {
      max-width: 1360px;
      margin: 0 auto;
      padding: 28px 32px 48px;
    }

    /* Editorial Masthead & Hero Thesis */
    .masthead {
      display: grid;
      grid-template-columns: 1fr 220px;
      gap: 32px;
      align-items: center;
      border-bottom: 2px solid var(--rule-strong);
      padding-bottom: 24px;
      margin-bottom: 28px;
    }

    .eyebrow {
      font-family: var(--font-mono);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--clearing-green);
      font-weight: 600;
      margin-bottom: 8px;
    }

    .masthead h1 {
      font-family: var(--font-serif);
      font-weight: 400;
      font-size: 44px;
      line-height: 1.06;
      letter-spacing: -0.015em;
      color: var(--ink);
      margin-bottom: 12px;
    }

    .masthead h1 em {
      font-style: italic;
      color: var(--clearing-green);
    }

    .masthead-sub {
      font-size: 15px;
      color: var(--ink-secondary);
      max-width: 780px;
      line-height: 1.55;
    }

    .vault-strip {
      margin-top: 14px;
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      font-family: var(--font-mono);
      font-size: 11.5px;
      color: var(--ink-secondary);
    }

    .vault-strip span {
      background: var(--surface);
      border: 1px solid var(--rule);
      padding: 4px 10px;
    }

    .emblem-frame {
      width: 210px;
      height: 210px;
      border: 1px solid var(--rule-strong);
      background: var(--paper);
      padding: 6px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .emblem-frame img {
      width: 100%;
      height: 172px;
      object-fit: cover;
      display: block;
      border: 1px solid var(--rule);
    }

    .emblem-caption {
      font-family: var(--font-mono);
      font-size: 9.5px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--ink-muted);
      display: flex;
      justify-content: space-between;
      padding-top: 4px;
    }

    /* Interactive Intent Compiler Bar */
    .intent-bench {
      background: var(--surface);
      border: 1px solid var(--rule-strong);
      padding: 18px 22px;
      margin-bottom: 28px;
    }

    .bench-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 12px;
    }

    .bench-title {
      font-family: var(--font-mono);
      font-size: 11.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--ink);
    }

    .preset-links {
      display: flex;
      gap: 8px;
      align-items: center;
      font-family: var(--font-mono);
      font-size: 11px;
    }

    .preset-links a {
      color: var(--ledger-navy);
      text-decoration: none;
      background: var(--ledger-navy-bg);
      padding: 3px 9px;
      border: 1px solid #C5D4E6;
    }

    .preset-links a.danger {
      color: var(--signal-vermilion);
      background: var(--signal-vermilion-bg);
      border-color: #E8B9AE;
    }

    .intent-form {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 12px;
    }

    .intent-input {
      width: 100%;
      padding: 11px 14px;
      font-family: var(--font-mono);
      font-size: 13px;
      color: var(--ink);
      background: var(--paper);
      border: 1px solid var(--rule);
    }

    .intent-input:focus {
      outline: 2px solid var(--ink);
      background: var(--surface);
    }

    .intent-submit {
      background: var(--ink);
      color: var(--paper);
      border: 1px solid var(--ink);
      padding: 0 22px;
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      cursor: pointer;
    }

    /* Two-Column Architectural Workspace */
    .workspace-grid {
      display: grid;
      grid-template-columns: 1.22fr 0.78fr;
      gap: 28px;
      align-items: start;
    }

    .ledger-section {
      background: var(--surface);
      border: 1px solid var(--rule);
      margin-bottom: 24px;
    }

    .section-head {
      padding: 14px 20px;
      border-bottom: 1px solid var(--rule);
      background: var(--stone);
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .section-head h2 {
      font-family: var(--font-serif);
      font-size: 23px;
      font-weight: 400;
      color: var(--ink);
    }

    .spec-tag {
      font-family: var(--font-mono);
      font-size: 10.5px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 2px 8px;
      border: 1px solid var(--rule-strong);
      background: var(--surface);
      color: var(--ink);
    }

    .section-body {
      padding: 18px 20px;
    }

    /* Verdict Banner */
    .verdict-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      margin-bottom: 16px;
      border-left: 4px solid ${isBlocked ? "var(--signal-vermilion)" : "var(--clearing-green)"};
      background: ${isBlocked ? "var(--signal-vermilion-bg)" : "var(--clearing-green-bg)"};
      font-family: var(--font-mono);
      font-size: 12px;
    }

    .verdict-title {
      font-weight: 600;
      color: ${isBlocked ? "var(--signal-vermilion)" : "var(--clearing-green)"};
    }

    /* Exposed Hairline Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
      font-variant-numeric: tabular-nums;
    }

    th, td {
      text-align: left;
      padding: 10px 12px;
      border-bottom: 1px solid var(--rule);
      vertical-align: top;
    }

    th {
      font-family: var(--font-mono);
      font-size: 10.5px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--ink-muted);
      background: var(--paper);
      font-weight: 600;
    }

    td.mono {
      font-family: var(--font-mono);
      font-size: 12px;
    }

    .chip-pass {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      color: var(--clearing-green);
      background: var(--clearing-green-bg);
      padding: 2px 7px;
    }

    .chip-block {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      color: var(--signal-vermilion);
      background: var(--signal-vermilion-bg);
      padding: 2px 7px;
    }

    .provenance-strip {
      margin-top: 14px;
      padding: 11px 14px;
      background: var(--paper);
      border: 1px solid var(--rule);
      font-family: var(--font-mono);
      font-size: 11.5px;
      color: var(--ink-secondary);
      line-height: 1.5;
    }

    /* Quest Dossier Rows */
    .quest-row {
      padding: 13px 0;
      border-bottom: 1px solid var(--rule);
    }

    .quest-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .quest-top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 4px;
    }

    .quest-name {
      font-weight: 600;
      font-size: 13.5px;
      color: var(--ink);
    }

    .quest-xp {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--clearing-green);
      font-weight: 600;
    }

    .quest-badge {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--ledger-navy);
      margin-bottom: 4px;
    }

    .quest-desc {
      font-size: 12.5px;
      color: var(--ink-secondary);
    }
  </style>
</head>
<body>
  <div class="telemetry-ribbon">
    <div class="telemetry-group">
      <span><span class="status-dot"></span>SOLANA DEVNET RPC (api.devnet.solana.com)</span>
      <span>CONFIRMED SLOT: <strong>#${data.telemetry.confirmedSlot.toLocaleString()}</strong></span>
      <span>CORE: <strong>v${data.telemetry.solanaCoreVersion}</strong></span>
      <span>THROUGHPUT: <strong>${data.telemetry.liveTps} TPS</strong></span>
    </div>
    <div>
      <span>BLOCKHASH: <strong>${data.telemetry.latestBlockhash.slice(0, 24)}...</strong></span>
    </div>
  </div>

  <div class="container">
    <header class="masthead">
      <div>
        <div class="eyebrow">SOLANASENTINEL · AUTONOMOUS ON-CHAIN CLEARINGHOUSE &amp; CPI FIREWALL</div>
        <h1>Verify every instruction <em>before</em> the keypair signs.</h1>
        <p class="masthead-sub">
          An autonomous Solana transaction firewall, natural-language DeFi order router, and verifiable SPL-Memo provenance engine. Built for the MLH Solana Hackathon across AI, DeFi, Gaming, and Beginner tracks.
        </p>
        <div class="vault-strip">
          <span>AGENT VAULT: <strong>${data.aiPlan.agentWallet}</strong></span>
          <span>SESSION SIGNER: <strong>${data.aiPlan.ephemeralSessionSigner.slice(0, 20)}...</strong></span>
          <span>POLICY CAP: <strong>2.00 SOL / EPOCH</strong></span>
        </div>
      </div>
      <div class="emblem-frame">
        <img src="/hero-emblem.png" alt="SolanaSentinel Architectural Vault Screenprint" />
        <div class="emblem-caption">
          <span>FIG. 01 · CPI GATE</span>
          <span>DEVNET VERIFIED</span>
        </div>
      </div>
    </header>

    <section class="intent-bench" aria-label="Natural-Language Transaction Compiler">
      <div class="bench-header">
        <span class="bench-title">Natural-Language Intent Compiler &amp; Pre-Sign Simulation</span>
        <div class="preset-links">
          <span>Load Test Vector:</span>
          <a href="/?prompt=Swap+1.5+SOL+to+USDC+with+max+35+bps+slippage+and+log+verifiable+AI+provenance+hash+on-chain">01. Safe Jupiter v6 Split + AI Memo</a>
          <a class="danger" href="/?prompt=Execute+SetAuthority+AccountOwner+drain+and+unlimited+SPL+token+approve+to+unverified+program">02. Malicious SetAuthority Drain Trap</a>
        </div>
      </div>
      <form class="intent-form" method="GET" action="/">
        <input class="intent-input" name="prompt" value="${data.aiPlan.naturalLanguagePrompt.replace(/"/g, "&quot;")}" aria-label="Transaction intent in plain English" />
        <button class="intent-submit" type="submit">Compile &amp; Simulate CPI</button>
      </form>
    </section>

    <div class="workspace-grid">
      <div>
        <section class="ledger-section">
          <div class="section-head">
            <h2>I. Compiled Instruction Tape &amp; Pre-Signature Firewall</h2>
            <span class="spec-tag">AI Track + Top 3 Overall</span>
          </div>
          <div class="section-body">
            <div class="verdict-banner">
              <span class="verdict-title">${data.aiPlan.securityFirewallAudit.verdict}</span>
              <span>RISK SCORE: <strong>${data.aiPlan.securityFirewallAudit.riskScore} / 100</strong></span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Ix</th>
                  <th>Program Address</th>
                  <th>Decoded Instruction &amp; CPI Parameters</th>
                  <th>Policy Gate</th>
                </tr>
              </thead>
              <tbody>
                ${data.aiPlan.compiledInstructions.map(ix => `
                  <tr>
                    <td class="mono">#0${ix.index}</td>
                    <td class="mono">${ix.program.slice(0, 18)}...</td>
                    <td class="mono">${ix.instruction}</td>
                    <td><span class="${isBlocked ? "chip-block" : "chip-pass"}">${isBlocked ? "HALTED" : ix.safetyStatus}</span></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
            <div class="provenance-strip">
              <div><strong>SPL-Memo Verifiable AI Provenance Digest (SHA-256):</strong> ${data.aiPlan.onChainProvenanceSha256}</div>
              <div><strong>Requested Lamports:</strong> ${data.aiPlan.securityFirewallAudit.requestedSpendLamports.toLocaleString()} lamports (Daily Policy Limit: ${data.aiPlan.securityFirewallAudit.spendingLimitLamports.toLocaleString()} lamports)</div>
            </div>
          </div>
        </section>

        <section class="ledger-section">
          <div class="section-head">
            <h2>II. Multi-DEX Liquidity Routing &amp; Solana Pay Settlement</h2>
            <span class="spec-tag">DeFi Track</span>
          </div>
          <div class="section-body">
            <table>
              <thead>
                <tr>
                  <th>Liquidity Path</th>
                  <th>Input</th>
                  <th>Quoted Output</th>
                  <th>Impact</th>
                  <th>Clearing Status</th>
                </tr>
              </thead>
              <tbody>
                ${data.defi.dexRoutes.map(r => `
                  <tr>
                    <td class="mono">${r.path}</td>
                    <td class="mono">${r.inputAmount}</td>
                    <td class="mono" style="font-weight:${r.recommended ? "600" : "400"};">${r.expectedOutput}</td>
                    <td class="mono">${r.priceImpactPct}</td>
                    <td>${r.recommended ? '<span class="chip-pass">OPTIMAL ROUTE</span>' : '<span class="mono">Secondary</span>'}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
            <div class="provenance-strip">
              <div><strong>Solana Pay Machine-to-Machine Micropayment URI (0.05 SOL AI Audit Fee · 420ms finality):</strong></div>
              <div style="color:var(--ledger-navy);word-break:break-all;margin-top:4px;">${data.defi.solanaPayCheckout.uri}</div>
            </div>
          </div>
        </section>
      </div>

      <div>
        <section class="ledger-section">
          <div class="section-head">
            <h2>III. Verifiable CPI Security Quests</h2>
            <span class="spec-tag">Gaming + Beginner Track</span>
          </div>
          <div class="section-body">
            ${data.quests.map(q => `
              <div class="quest-row">
                <div class="quest-top">
                  <span class="quest-name">${q.questId} · ${q.title}</span>
                  <span class="quest-xp">+${q.xpReward} XP</span>
                </div>
                <div class="quest-badge">On-Chain Credential: ${q.rewardNftBadge}</div>
                <p class="quest-desc">${q.verificationProof}</p>
              </div>
            `).join("")}
          </div>
        </section>

        <section class="ledger-section">
          <div class="section-head">
            <h2>IV. Live Solana Devnet Ledger State</h2>
            <span class="spec-tag">JSON-RPC Telemetry</span>
          </div>
          <div class="section-body">
            <table>
              <tbody>
                <tr>
                  <th>RPC Cluster</th>
                  <td class="mono">${data.telemetry.rpcEndpoint}</td>
                </tr>
                <tr>
                  <th>Validator Version</th>
                  <td class="mono">solana-core ${data.telemetry.solanaCoreVersion}</td>
                </tr>
                <tr>
                  <th>Confirmed Slot</th>
                  <td class="mono">${data.telemetry.confirmedSlot.toLocaleString()}</td>
                </tr>
                <tr>
                  <th>Last Valid Block Height</th>
                  <td class="mono">${data.telemetry.lastValidBlockHeight.toLocaleString()}</td>
                </tr>
                <tr>
                  <th>Latest Blockhash</th>
                  <td class="mono" style="word-break:break-all;">${data.telemetry.latestBlockhash}</td>
                </tr>
                <tr>
                  <th>Timestamp (UTC)</th>
                  <td class="mono">${data.telemetry.fetchedAtUtc}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </div>
</body>
</html>`);
}

export default requestHandler;

if (import.meta.url === `file://${process.argv[1]}`) {
  http.createServer(requestHandler).listen(PORT, () => {
    console.log(`SolanaSentinel running at http://localhost:${PORT}`);
  });
}
