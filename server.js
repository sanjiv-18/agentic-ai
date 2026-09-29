// Setup: npm init -y && npm i express cors @anthropic-ai/sdk
// Run:   ANTHROPIC_API_KEY=sk-... node server.js
// Frontend: EventSource("http://localhost:3001/api/analyze?idea=...") and read "agent" / "result" events.
const express = require("express");
const cors = require("cors");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
app.use(cors());
const client = new Anthropic();
const MODEL = process.env.MODEL || "claude-sonnet-4-6";

const AGENTS = [
  { name: "Prior Art Search", system: "List the 3 closest kinds of prior art (patents or papers) for the idea. Return JSON: [{ref,overlap,relevance0to100}]. Only return references you can support; say 'unverified' otherwise." },
  { name: "Novelty Diff", system: "Split the idea into features and mark each Covered, Partial or New against the prior art. Return JSON: [{feature,status}]." },
  { name: "Claim Drafter", system: "Draft one independent and two dependent claims using only features marked New or Partial. Return plain text." },
  { name: "Examiner Simulator", system: "Act as a patent examiner. List the top objections (obviousness, clarity) with severity. Return JSON: [{issue,severity,fix}]." },
];

async function runAgent(agent, input) {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 1000,
    system: agent.system,
    messages: [{ role: "user", content: input }],
  });
  return res.content.map((b) => b.text || "").join("");
}

app.get("/api/analyze", async (req, res) => {
  const idea = String(req.query.idea || "").slice(0, 2000);
  if (!idea) return res.status(400).json({ error: "Missing 'idea' query parameter." });

  res.set({ "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  let context = `Idea: ${idea}`;
  const results = {};
  try {
    for (const agent of AGENTS) {
      send("agent", { name: agent.name, status: "running" });
      const out = await runAgent(agent, context);
      results[agent.name] = out;
      context += `\n\n${agent.name} output:\n${out}`;
      send("agent", { name: agent.name, status: "done" });
    }
    send("result", results);
  } catch (err) {
    send("error", { message: "Analysis failed. Check your API key and try again." });
  }
  res.end();
});

app.listen(3001, () => console.log("API on http://localhost:3001"));
