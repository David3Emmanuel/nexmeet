import { generateFormQuestions } from "./index";
import { EventInfo } from "./types";

const testEvent: EventInfo = {
  title: "FinTech Founders & Funders Night",
  about:
    "An evening connecting early-stage fintech startup founders with " +
    "angel investors and VCs. Founders are looking for seed funding and " +
    "advice; investors are scouting for promising teams to back.",
};

async function main() {
  console.log("Generating questions...\n");
  const questions = await generateFormQuestions(testEvent);

  console.log(`Got ${questions.length} questions:\n`);
  console.log(JSON.stringify(questions, null, 2));
}

main().catch(console.error);