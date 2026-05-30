import "dotenv/config";  // remove if on Next.js
import { generateMatches } from "./index";
import { MatchAttendee, FormQuestion } from "@/lib/types";

// Mirror the questions your form would have produced for a fintech event.
const questions: FormQuestion[] = [
  { id: "q1", question: "What are you working on right now?", helperText: "" },
  { id: "q2", question: "What do you need most at this event?", helperText: "" },
  { id: "q3", question: "What can you offer other attendees?", helperText: "" },
];

// 12-person room. Planted pairs so you can check the AI finds them:
//  - Ada (needs seed funding) <-> Bisi (angel writing seed checks)  ← should match
//  - Chidi (needs a technical cofounder) <-> Dele (CTO seeking a founder to join) ← should match
//  - Bisi is a HUB: several founders should pick her, inflating her card.
const attendees: MatchAttendee[] = [
  { id: "a1", name: "Ada",   lookingFor: "Seed investors", answers: { q1: "Pre-seed fintech for informal savings groups", q2: "Raising a $300k seed round", q3: "Deep knowledge of African savings markets" } },
  { id: "a2", name: "Bisi",  lookingFor: "Promising pre-seed teams", answers: { q1: "Angel investing, ex-fintech operator", q2: "Deploying capital into 3-4 pre-seed startups", q3: "Seed checks up to $100k plus operator advice" } },
  { id: "a3", name: "Chidi", lookingFor: "A technical cofounder", answers: { q1: "Non-technical founder with a payments idea", q2: "A CTO-level cofounder", q3: "Market access and a sales background" } },
  { id: "a4", name: "Dele",  lookingFor: "A founder to join", answers: { q1: "Senior backend engineer, just left a fintech", q2: "An early-stage team to join as technical cofounder", q3: "10 years building payment systems" } },
  { id: "a5", name: "Efe",   lookingFor: "Customers", answers: { q1: "B2B compliance SaaS for banks", q2: "Pilot customers among banks", q3: "Automated KYC tooling" } },
  { id: "a6", name: "Femi",  lookingFor: "Compliance tooling", answers: { q1: "Running ops at a digital bank", q2: "A KYC/compliance vendor", q3: "A paying enterprise contract" } },
  { id: "a7", name: "Gozie", lookingFor: "Investors", answers: { q1: "Crypto remittance corridor", q2: "Seed funding", q3: "Cross-border payment rails" } },
  { id: "a8", name: "Hauwa", lookingFor: "Design talent", answers: { q1: "Lending app, just raised seed", q2: "A senior product designer", q3: "A funded team and equity" } },
  { id: "a9", name: "Ife",   lookingFor: "A product role", answers: { q1: "Senior product designer in fintech", q2: "A funded startup to join", q3: "End-to-end product design" } },
  { id: "a10", name: "Jide", lookingFor: "Co-marketing partners", answers: { q1: "Personal finance content brand", q2: "Fintech apps to partner with", q3: "An audience of 200k young savers" } },
  { id: "a11", name: "Kemi", lookingFor: "Mentorship", answers: { q1: "First-time founder, budgeting app", q2: "Advice from experienced operators", q3: "Energy and early traction" } },
  { id: "a12", name: "Lola", lookingFor: "Deal flow", answers: { q1: "VC associate at a seed fund", q2: "Strong seed-stage founders", q3: "Follow-on capital and intros" } },
];

async function main() {
  console.time("matching");
  const results = await generateMatches(questions, attendees, 3);
  console.timeEnd("matching");

  const nameOf = new Map(attendees.map((a) => [a.id, a.name]));

  for (const r of results) {
    console.log(`\n=== ${nameOf.get(r.attendeeId)} (${r.matches.length} matches) ===`);
    for (const m of r.matches) {
      const star = m.mutual ? " ⭐" : "";
      console.log(`  → ${m.matchedName}${star}: ${m.reason}`);
    }
  }

  // Reciprocity check: assert the union property actually holds.
  console.log("\n--- reciprocity check ---");
  const cardSet = new Map(
    results.map((r) => [r.attendeeId, new Set(r.matches.map((m) => m.matchedAttendeeId))])
  );
  let broken = 0;
  for (const [ownerId, set] of cardSet) {
    for (const targetId of set) {
      if (!cardSet.get(targetId)?.has(ownerId)) {
        broken++;
        console.log(`  BROKEN: ${nameOf.get(ownerId)} has ${nameOf.get(targetId)}, but not vice versa`);
      }
    }
  }
  console.log(broken === 0 ? "  ✓ all matches reciprocal" : `  ✗ ${broken} broken`);
}

main().catch(console.error);