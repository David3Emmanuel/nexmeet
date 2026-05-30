/* ===========================================================
   NexMeet — seed data + local "AI" matching engine
   Produces specific, human-sounding match reasons.
   =========================================================== */

const EVENT = {
  name: "BuildWithAI Lagos",
  edition: "2026",
  venue: "Zone Tech Park, Gbagada",
  date: "Sat, May 30 · 2026",
  organizer: "Team Dial",
  code: "NEXM-LAG-26",
};

// looking-for options
const GOALS = [
  { id: "cofounder", label: "A co-founder" },
  { id: "mentor", label: "A mentor" },
  { id: "clients", label: "Clients / customers" },
  { id: "collab", label: "Collaborators" },
  { id: "funding", label: "Investors / funding" },
  { id: "hire", label: "People to hire / a job" },
  { id: "connections", label: "Good people, generally" },
];

const SKILL_BANK = ["Product", "Design", "Frontend", "Backend", "ML / AI", "Growth", "Data", "Mobile", "DevOps", "Fundraising", "Sales", "Research", "Hardware", "Content"];

// avatar palette
const AV = ["#FF5A2C", "#3A2E58", "#1F5C45", "#2F6BFF", "#C0392B", "#0E7C86", "#B7791F", "#7A3E9D"];

// ---- seed attendees (the "room") ----
const SEED = [
  {
    id: "a01", name: "Ada Okafor", role: "Backend Engineer @ Paystack",
    skills: ["Backend", "DevOps", "Data"], focus: "Moonlighting on a fraud-detection API and itching to go full-time on it.",
    goal: "cofounder", offers: ["cofounder", "collab", "hire"],
    fun: "Can solve a Rubik's cube one-handed.", color: AV[1],
  },
  {
    id: "a02", name: "Tobi Adeyemi", role: "Founder @ Stealth (fintech)",
    skills: ["Product", "Growth", "Sales"], focus: "Building a credit-scoring layer for informal traders, looking for a technical partner.",
    goal: "cofounder", offers: ["cofounder", "funding", "collab"],
    fun: "Sold jollof at university to fund his first startup.", color: AV[0],
  },
  {
    id: "a03", name: "Zainab Bello", role: "Design Lead @ Flutterwave",
    skills: ["Design", "Product", "Research"], focus: "Mentoring junior designers and exploring AI-assisted design tooling.",
    goal: "connections", offers: ["mentor", "collab"],
    fun: "Has a side gig painting murals.", color: AV[2],
  },
  {
    id: "a04", name: "Emeka Nwosu", role: "ML Engineer @ Google",
    skills: ["ML / AI", "Backend", "Research"], focus: "Researching small language models that run on-device for low-bandwidth markets.",
    goal: "collab", offers: ["mentor", "collab"],
    fun: "Once trained a model to grade his own jollof recipes.", color: AV[3],
  },
  {
    id: "a05", name: "Chiamaka Eze", role: "CS Student @ UNILAG",
    skills: ["Frontend", "Mobile", "Design"], focus: "Final-year student shipping a campus marketplace app, hunting for an internship.",
    goal: "mentor", offers: ["collab"],
    fun: "Runs a 4k-member coding community on WhatsApp.", color: AV[4],
  },
  {
    id: "a06", name: "Daniel Mensah", role: "Angel Investor @ Ingressive Capital",
    skills: ["Fundraising", "Growth", "Product"], focus: "Writing first cheques into African AI startups this quarter.",
    goal: "connections", offers: ["funding", "mentor"],
    fun: "Reads one founder memoir every week.", color: AV[5],
  },
  {
    id: "a07", name: "Aisha Suleiman", role: "Growth Marketer (freelance)",
    skills: ["Growth", "Content", "Sales"], focus: "Helping early-stage startups hit their first 1,000 users; looking for new clients.",
    goal: "clients", offers: ["clients", "collab"],
    fun: "Grew a meme page to 200k followers.", color: AV[6],
  },
  {
    id: "a08", name: "Kelvin Obi", role: "Frontend Dev @ Andela",
    skills: ["Frontend", "Mobile", "Design"], focus: "Polishing a React component library and open to weekend collaborations.",
    goal: "collab", offers: ["collab", "hire"],
    fun: "Builds mechanical keyboards from scratch.", color: AV[7],
  },
  {
    id: "a09", name: "Fatima Lawal", role: "Data Scientist @ Kuda",
    skills: ["Data", "ML / AI", "Research"], focus: "Building recommendation systems and curious about AI for events.",
    goal: "connections", offers: ["collab", "mentor"],
    fun: "Competitive Scrabble player.", color: AV[0],
  },
  {
    id: "a10", name: "Seyi Akinwale", role: "Product Manager @ Moniepoint",
    skills: ["Product", "Data", "Growth"], focus: "Scaling a merchant lending product and scouting senior engineers to hire.",
    goal: "hire", offers: ["hire", "mentor"],
    fun: "Hiked Mount Cameroon last year.", color: AV[1],
  },
  {
    id: "a11", name: "Ngozi Udeh", role: "Co-founder & CTO @ AgriSense",
    skills: ["Hardware", "Backend", "ML / AI"], focus: "IoT sensors for smallholder farms; raising a pre-seed round.",
    goal: "funding", offers: ["funding", "collab", "cofounder"],
    fun: "Keeps bees on her balcony.", color: AV[2],
  },
  {
    id: "a12", name: "Ben Carter", role: "DevRel @ Vercel",
    skills: ["DevOps", "Frontend", "Content"], focus: "Running workshops on shipping AI apps fast; loves meeting student builders.",
    goal: "connections", offers: ["mentor", "collab"],
    fun: "Has visited 38 countries as a digital nomad.", color: AV[3],
  },
];

// pre-filled demo "you" (editable in the form)

// contact handles (matches are delivered with name + contact)
const CONTACTS = {
  a01: "@ada.builds · ada@paystack.com", a02: "@tobi_a · +234 803 555 0142", a03: "@zainab.designs",
  a04: "@emeka_ml · emeka@google.com", a05: "@chiamaka.codes · +234 701 555 0199", a06: "@danielmensah_vc",
  a07: "@aisha.grows · aisha@freelance.co", a08: "@kelvin.builds", a09: "@fatima.data · +234 802 555 0177",
  a10: "@seyi_pm · seyi@moniepoint.com", a11: "@ngozi.agrisense", a12: "@bencarter · ben@vercel.com",
};
SEED.forEach(p => { p.contact = CONTACTS[p.id] || ("@" + p.name.split(" ")[0].toLowerCase()); });

const DEMO_YOU = {
  name: "Moni Adeleke",
  role: "Solo founder building an AI study tool",
  skills: ["Product", "Frontend", "ML / AI"],
  focus: "I shipped an MVP that turns lecture notes into quizzes. Now I need someone technical to scale it.",
  goal: "cofounder",
  fun: "I've read every Murakami novel — twice.",
};

// ---------- matching ----------
function initials(name) {
  return name.split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

// human reason templates keyed by what YOU want
function reasonFor(you, p) {
  const yGoal = you.goal;
  const sharedSkills = (you.skills || []).filter(s => p.skills.includes(s));
  const skillStr = sharedSkills[0];
  const TECH = ["Backend", "Frontend", "ML / AI", "Mobile", "Data", "DevOps", "Hardware"];
  const pIsTech = p.skills.some(s => TECH.includes(s));
  const f = p.name.split(" ")[0];

  const cofounder = pIsTech
    ? [
        `You're hunting for a technical co-founder, and ${f} is exactly that — ${lower(p.focus)} The timing could not be better.`,
        `${f} has the engineering depth your idea is missing, and is openly looking for someone to build with right now.`,
      ]
    : [
        `You bring the build; ${f} brings the business muscle — and is openly looking for a technical partner, tonight.`,
        `${f} is a founder who needs exactly your technical skillset. Two halves of the same company, standing in one room.`,
      ];

  const lib = {
    cofounder,
    mentor: [
      `${p.name.split(" ")[0]} has walked the road you're on — ${lower(p.focus)} Exactly the person to learn from before you scale.`,
      `You wanted a mentor; ${p.name.split(" ")[0]}'s experience maps almost perfectly onto the problem you're stuck on.`,
    ],
    clients: [
      `${p.name.split(" ")[0]} is the kind of person who buys what you sell — and they're actively looking, today, in this room.`,
      `Your offering lines up with what ${p.name.split(" ")[0]} needs next. A 5-minute chat could turn into your next client.`,
    ],
    funding: [
      `${p.name.split(" ")[0]} writes cheques into exactly your space and is deploying capital this quarter. Don't leave without saying hi.`,
      `You're raising; ${p.name.split(" ")[0]} is investing in African AI right now. This is the conversation to have tonight.`,
    ],
    hire: [
      `${p.name.split(" ")[0]} is building a team and your skills are on their shortlist. This could be your next role.`,
      `You're looking to join something; ${p.name.split(" ")[0]} is hiring for precisely what you do best.`,
    ],
    collab: [
      `You both live in ${skillStr || "the same stack"} — ${p.name.split(" ")[0]} is ${lower(p.focus)} A weekend collab waiting to happen.`,
      `${p.name.split(" ")[0]} is working on something adjacent to you and is open to collaborating. Easy first conversation.`,
    ],
    connections: [
      `${p.name.split(" ")[0]} is one of the most interesting people in the room tonight — ${lower(p.focus)}`,
      `Different lane, same energy. ${p.name.split(" ")[0]} is worth knowing for where you're both headed.`,
    ],
  };
  const pool = lib[yGoal] || lib.connections;
  return pool[hashIdx(you.name + p.id, pool.length)];
}

function conversationStarter(you, p) {
  const f = p.name.split(" ")[0];
  const starters = [
    `\u201CHey ${f} — I heard you're ${lower(p.focus).replace(/\.$/, "")}. How did you get into that?\u201D`,
    `\u201C${f}? I'm Moni. ${p.fun} — I have to ask about that.\u201D`,
    `\u201CYou work in ${p.skills[0]} — I'm wrestling with that exact thing on my project. Got two minutes?\u201D`,
    `\u201CI think we should be working together. Can I tell you what I'm building?\u201D`,
  ];
  return starters[hashIdx(p.id + you.goal, starters.length)];
}

function score(you, p) {
  let s = 0;
  // complementary goal: they offer what you want
  if (p.offers.includes(you.goal)) s += 50;
  // overlapping skills (collab signal)
  const shared = (you.skills || []).filter(x => p.skills.includes(x)).length;
  s += shared * 9;
  // both seeking same → still some value
  if (p.goal === you.goal) s += 6;
  // mentor/funding/clients heavily favored when sought
  if (you.goal === "funding" && p.offers.includes("funding")) s += 20;
  if (you.goal === "cofounder" && p.offers.includes("cofounder")) s += 20;
  // tiny deterministic jitter so ties are stable but varied
  s += hashIdx(you.name + p.id, 7);
  return s;
}

function generateMatches(you, pool) {
  const ranked = pool
    .filter(p => p.id !== you.id)
    .map(p => ({ p, sc: score(you, p) }))
    .sort((a, b) => b.sc - a.sc);
  const max = ranked.length ? ranked[0].sc : 1;
  return ranked.slice(0, 3).map(({ p, sc }, i) => ({
    ...p,
    reason: reasonFor(you, p),
    starter: conversationStarter(you, p),
    strength: Math.max(3, Math.min(5, Math.round((sc / max) * 5))),
    accent: [getVar("--coral"), getVar("--plum"), getVar("--forest")][i] || getVar("--coral"),
  }));
}

// utils
function lower(s) { return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
function hashIdx(str, mod) { let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return h % mod; }
function getVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#FF5A2C"; }

Object.assign(window, { EVENT, GOALS, SKILL_BANK, SEED, DEMO_YOU, AV, initials, generateMatches, reasonFor, conversationStarter });
